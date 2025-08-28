#[cfg(not(feature = "library"))]
use cosmwasm_std::entry_point;
use cosmwasm_std::{
    to_json_binary, Binary, Deps, DepsMut, Env, MessageInfo, Order, Response, StdResult,
};
use cw2::set_contract_version;
use cw_storage_plus::Bound;

use crate::error::ContractError;
use crate::msg::{
    ExecuteMsg, InstantiateMsg, QueryMsg, MentorResponse, UserResponse, CommentResponse,
    MentorsResponse, CommentsResponse,
};
use crate::state::{
    State, Mentor, User, Comment, STATE, MENTORS, USERS, COMMENTS, USER_COMMENT_VOTES,
};

// version info for migration info
const CONTRACT_NAME: &str = "crates.io:mentor-x-contracts";
const CONTRACT_VERSION: &str = env!("CARGO_PKG_VERSION");

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    _msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    let state = State {
        owner: info.sender.clone(),
        comment_counter: 0,
    };
    set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;
    STATE.save(deps.storage, &state)?;

    Ok(Response::new()
        .add_attribute("method", "instantiate")
        .add_attribute("owner", info.sender))
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::CreateMentor {
            name,
            institution,
            department,
            avatar,
            links,
        } => execute::create_mentor(deps, env, info, name, institution, department, avatar, links),
        ExecuteMsg::CreateComment {
            mentor_id,
            rating,
            comment,
        } => execute::create_comment(deps, env, info, mentor_id, rating, comment),
        ExecuteMsg::VoteComment { comment_id, vote } => {
            execute::vote_comment(deps, info, comment_id, vote)
        }
        ExecuteMsg::UpdateMentor {
            name,
            institution,
            department,
            avatar,
            links,
        } => execute::update_mentor(deps, env, info, name, institution, department, avatar, links),
        ExecuteMsg::UpdateUserInstitution { institution } => {
            execute::update_user_institution(deps, info, institution)
        }
    }
}

pub mod execute {
    use super::*;

    pub fn create_mentor(
        deps: DepsMut,
        env: Env,
        info: MessageInfo,
        name: String,
        institution: String,
        department: String,
        avatar: Option<String>,
        links: Vec<String>,
    ) -> Result<Response, ContractError> {
        // Check if mentor already exists
        if MENTORS.has(deps.storage, &info.sender) {
            return Err(ContractError::MentorAlreadyExists {});
        }

        let mentor = Mentor {
            name: name.clone(),
            institution: institution.clone(),
            department: department.clone(),
            avatar: avatar.clone(),
            created_at: env.block.time,
            created_by: info.sender.clone(),
            links,
            updated_at: env.block.time,
            updated_by: info.sender.clone(),
            comments: vec![],
        };

        MENTORS.save(deps.storage, &info.sender, &mentor)?;

        Ok(Response::new()
            .add_attribute("action", "create_mentor")
            .add_attribute("mentor_id", info.sender.as_str())
            .add_attribute("name", name)
            .add_attribute("institution", institution))
    }

    pub fn create_comment(
        deps: DepsMut,
        env: Env,
        info: MessageInfo,
        mentor_id: cosmwasm_std::Addr,
        rating: u8,
        comment: String,
    ) -> Result<Response, ContractError> {
        // Validate rating
        if rating < 1 || rating > 10 {
            return Err(ContractError::InvalidRating {});
        }

        // Check if mentor exists
        let mut mentor = MENTORS
            .load(deps.storage, &mentor_id)
            .map_err(|_| ContractError::MentorNotFound {})?;

        // Get and increment comment counter
        let mut state = STATE.load(deps.storage)?;
        state.comment_counter += 1;
        let comment_id = format!("cid{}", state.comment_counter);
        STATE.save(deps.storage, &state)?;

        // Create the comment
        let new_comment = Comment {
            id: comment_id.clone(),
            created_at: env.block.time,
            created_by: info.sender.clone(),
            mentor_id: mentor_id.clone(),
            rating,
            comment: comment.clone(),
            likes: 0,
        };

        // Save the comment
        COMMENTS.save(deps.storage, &comment_id, &new_comment)?;

        // Add comment ID to mentor's comments list
        mentor.comments.push(comment_id.clone());
        mentor.updated_at = env.block.time;
        mentor.updated_by = info.sender.clone();
        MENTORS.save(deps.storage, &mentor_id, &mentor)?;

        // Update or create user record
        let mut user = USERS
            .may_load(deps.storage, &info.sender)?
            .unwrap_or(User {
                id: info.sender.clone(),
                institution: None,
                posted_comments: vec![],
            });
        user.posted_comments.push(comment_id.clone());
        USERS.save(deps.storage, &info.sender, &user)?;

        Ok(Response::new()
            .add_attribute("action", "create_comment")
            .add_attribute("comment_id", comment_id)
            .add_attribute("mentor_id", mentor_id.as_str())
            .add_attribute("rating", rating.to_string()))
    }

    pub fn vote_comment(
        deps: DepsMut,
        info: MessageInfo,
        comment_id: String,
        vote: i8,
    ) -> Result<Response, ContractError> {
        // Validate vote
        if vote < -1 || vote > 1 {
            return Err(ContractError::InvalidVote {});
        }

        // Check if comment exists
        let mut comment = COMMENTS
            .load(deps.storage, &comment_id)
            .map_err(|_| ContractError::CommentNotFound {})?;

        // Get previous vote
        let previous_vote = USER_COMMENT_VOTES
            .may_load(deps.storage, (&info.sender, &comment_id))?
            .unwrap_or(0);

        // Update likes count
        comment.likes = comment.likes - previous_vote as i32 + vote as i32;

        // Save updated comment
        COMMENTS.save(deps.storage, &comment_id, &comment)?;

        // Save user's vote
        if vote == 0 {
            USER_COMMENT_VOTES.remove(deps.storage, (&info.sender, &comment_id));
        } else {
            USER_COMMENT_VOTES.save(deps.storage, (&info.sender, &comment_id), &vote)?;
        }

        Ok(Response::new()
            .add_attribute("action", "vote_comment")
            .add_attribute("comment_id", comment_id)
            .add_attribute("vote", vote.to_string())
            .add_attribute("new_likes", comment.likes.to_string()))
    }

    pub fn update_mentor(
        deps: DepsMut,
        env: Env,
        info: MessageInfo,
        name: Option<String>,
        institution: Option<String>,
        department: Option<String>,
        avatar: Option<String>,
        links: Option<Vec<String>>,
    ) -> Result<Response, ContractError> {
        let mut mentor = MENTORS
            .load(deps.storage, &info.sender)
            .map_err(|_| ContractError::MentorNotFound {})?;

        // Update fields if provided
        if let Some(new_name) = name {
            mentor.name = new_name;
        }
        if let Some(new_institution) = institution {
            mentor.institution = new_institution;
        }
        if let Some(new_department) = department {
            mentor.department = new_department;
        }
        if let Some(new_avatar) = avatar {
            mentor.avatar = Some(new_avatar);
        }
        if let Some(new_links) = links {
            mentor.links = new_links;
        }

        mentor.updated_at = env.block.time;
        mentor.updated_by = info.sender.clone();

        MENTORS.save(deps.storage, &info.sender, &mentor)?;

        Ok(Response::new()
            .add_attribute("action", "update_mentor")
            .add_attribute("mentor_id", info.sender.as_str()))
    }

    pub fn update_user_institution(
        deps: DepsMut,
        info: MessageInfo,
        institution: Option<String>,
    ) -> Result<Response, ContractError> {
        let mut user = USERS
            .may_load(deps.storage, &info.sender)?
            .unwrap_or(User {
                id: info.sender.clone(),
                institution: None,
                posted_comments: vec![],
            });

        user.institution = institution;
        USERS.save(deps.storage, &info.sender, &user)?;

        Ok(Response::new()
            .add_attribute("action", "update_user_institution")
            .add_attribute("user_id", info.sender.as_str()))
    }
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetMentor { mentor_id } => to_json_binary(&query::get_mentor(deps, mentor_id)?),
        QueryMsg::GetUser { user_id } => to_json_binary(&query::get_user(deps, user_id)?),
        QueryMsg::GetComment { comment_id } => to_json_binary(&query::get_comment(deps, comment_id)?),
        QueryMsg::ListMentors { start_after, limit } => {
            to_json_binary(&query::list_mentors(deps, start_after, limit)?)
        }
        QueryMsg::ListComments {
            mentor_id,
            start_after,
            limit,
        } => to_json_binary(&query::list_comments(deps, mentor_id, start_after, limit)?),
    }
}

pub mod query {
    use super::*;

    pub fn get_mentor(deps: Deps, mentor_id: cosmwasm_std::Addr) -> StdResult<MentorResponse> {
        let mentor = MENTORS.load(deps.storage, &mentor_id)?;
        
        // Load all comments for this mentor
        let mut comments = Vec::new();
        for comment_id in &mentor.comments {
            if let Ok(comment) = COMMENTS.load(deps.storage, comment_id) {
                comments.push(comment);
            }
        }

        Ok(MentorResponse { mentor, comments })
    }

    pub fn get_user(deps: Deps, user_id: cosmwasm_std::Addr) -> StdResult<UserResponse> {
        let user = USERS.load(deps.storage, &user_id)?;
        
        // Load all comments posted by this user
        let mut comments = Vec::new();
        for comment_id in &user.posted_comments {
            if let Ok(comment) = COMMENTS.load(deps.storage, comment_id) {
                comments.push(comment);
            }
        }

        Ok(UserResponse { user, comments })
    }

    pub fn get_comment(deps: Deps, comment_id: String) -> StdResult<CommentResponse> {
        let comment = COMMENTS.load(deps.storage, &comment_id)?;
        Ok(CommentResponse { comment })
    }

    pub fn list_mentors(
        deps: Deps,
        start_after: Option<cosmwasm_std::Addr>,
        limit: Option<u32>,
    ) -> StdResult<MentorsResponse> {
        let limit = limit.unwrap_or(10).min(30) as usize;
        let start = start_after.as_ref().map(Bound::exclusive);

        let mentors: StdResult<Vec<_>> = MENTORS
            .range(deps.storage, start, None, Order::Ascending)
            .take(limit)
            .map(|item| item.map(|(_, mentor)| mentor))
            .collect();

        Ok(MentorsResponse {
            mentors: mentors?,
        })
    }

    pub fn list_comments(
        deps: Deps,
        mentor_id: Option<cosmwasm_std::Addr>,
        start_after: Option<String>,
        limit: Option<u32>,
    ) -> StdResult<CommentsResponse> {
        let limit = limit.unwrap_or(10).min(50) as usize;
        let start = start_after.as_ref().map(|s| Bound::exclusive(s.as_str()));

        let comments: StdResult<Vec<_>> = if let Some(mentor_addr) = mentor_id {
            // Filter comments by mentor_id
            COMMENTS
                .range(deps.storage, start, None, Order::Ascending)
                .take(limit * 3) // Take more to filter, then limit
                .map(|item| item.map(|(_, comment)| comment))
                .filter(|result| {
                    result
                        .as_ref()
                        .map(|comment| comment.mentor_id == mentor_addr)
                        .unwrap_or(false)
                })
                .take(limit)
                .collect()
        } else {
            // Return all comments
            COMMENTS
                .range(deps.storage, start, None, Order::Ascending)
                .take(limit)
                .map(|item| item.map(|(_, comment)| comment))
                .collect()
        };

        Ok(CommentsResponse {
            comments: comments?,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use cosmwasm_std::testing::{mock_dependencies, mock_env, mock_info};
    use cosmwasm_std::{coins, from_json, Addr};

    #[test]
    fn proper_initialization() {
        let mut deps = mock_dependencies();

        let msg = InstantiateMsg {};
        let info = mock_info("creator", &coins(1000, "earth"));

        // we can just call .unwrap() to assert this was a success
        let res = instantiate(deps.as_mut(), mock_env(), info, msg).unwrap();
        assert_eq!(0, res.messages.len());

        // Check state was initialized correctly
        let state = STATE.load(deps.as_ref().storage).unwrap();
        assert_eq!(state.comment_counter, 0);
        assert_eq!(state.owner, Addr::unchecked("creator"));
    }

    #[test]
    fn create_mentor() {
        let mut deps = mock_dependencies();

        let msg = InstantiateMsg {};
        let info = mock_info("creator", &coins(2, "token"));
        let _res = instantiate(deps.as_mut(), mock_env(), info, msg).unwrap();

        // Create a mentor
        let info = mock_info("mentor1", &coins(2, "token"));
        let msg = ExecuteMsg::CreateMentor {
            name: "Ivy".to_string(),
            institution: "野鸡大学".to_string(),
            department: "计算机学院".to_string(),
            avatar: Some("https://avatars.githubusercontent.com/u/103652334?v=4".to_string()),
            links: vec!["https://github.com/yuchangongzhu".to_string()],
        };
        let _res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();

        // Query the mentor
        let res = query(
            deps.as_ref(),
            mock_env(),
            QueryMsg::GetMentor {
                mentor_id: Addr::unchecked("mentor1"),
            },
        )
        .unwrap();
        let mentor_response: MentorResponse = from_json(&res).unwrap();
        assert_eq!(mentor_response.mentor.name, "Ivy");
        assert_eq!(mentor_response.mentor.institution, "野鸡大学");
        assert_eq!(mentor_response.comments.len(), 0);
    }

    #[test]
    fn create_comment() {
        let mut deps = mock_dependencies();

        let msg = InstantiateMsg {};
        let info = mock_info("creator", &coins(2, "token"));
        let _res = instantiate(deps.as_mut(), mock_env(), info, msg).unwrap();

        // Create a mentor first
        let info = mock_info("mentor1", &coins(2, "token"));
        let msg = ExecuteMsg::CreateMentor {
            name: "Ivy".to_string(),
            institution: "野鸡大学".to_string(),
            department: "计算机学院".to_string(),
            avatar: None,
            links: vec![],
        };
        let _res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();

        // Create a comment
        let info = mock_info("student1", &coins(2, "token"));
        let msg = ExecuteMsg::CreateComment {
            mentor_id: Addr::unchecked("mentor1"),
            rating: 9,
            comment: "Ivy老师是世界上最好的老师".to_string(),
        };
        let _res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();

        // Query the mentor to see the comment
        let res = query(
            deps.as_ref(),
            mock_env(),
            QueryMsg::GetMentor {
                mentor_id: Addr::unchecked("mentor1"),
            },
        )
        .unwrap();
        let mentor_response: MentorResponse = from_json(&res).unwrap();
        assert_eq!(mentor_response.comments.len(), 1);
        assert_eq!(mentor_response.comments[0].rating, 9);
        assert_eq!(mentor_response.comments[0].comment, "Ivy老师是世界上最好的老师");
    }

    #[test]
    fn vote_comment() {
        let mut deps = mock_dependencies();

        let msg = InstantiateMsg {};
        let info = mock_info("creator", &coins(2, "token"));
        let _res = instantiate(deps.as_mut(), mock_env(), info, msg).unwrap();

        // Create mentor and comment
        let info = mock_info("mentor1", &coins(2, "token"));
        let msg = ExecuteMsg::CreateMentor {
            name: "Ivy".to_string(),
            institution: "野鸡大学".to_string(),
            department: "计算机学院".to_string(),
            avatar: None,
            links: vec![],
        };
        let _res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();

        let info = mock_info("student1", &coins(2, "token"));
        let msg = ExecuteMsg::CreateComment {
            mentor_id: Addr::unchecked("mentor1"),
            rating: 9,
            comment: "Great teacher!".to_string(),
        };
        let _res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();

        // Vote on the comment
        let info = mock_info("voter1", &coins(2, "token"));
        let msg = ExecuteMsg::VoteComment {
            comment_id: "cid1".to_string(),
            vote: 1,
        };
        let _res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();

        // Check the comment has 1 like
        let res = query(
            deps.as_ref(),
            mock_env(),
            QueryMsg::GetComment {
                comment_id: "cid1".to_string(),
            },
        )
        .unwrap();
        let comment_response: CommentResponse = from_json(&res).unwrap();
        assert_eq!(comment_response.comment.likes, 1);
    }
}
