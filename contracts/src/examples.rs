use cosmwasm_std::{to_json_binary, Addr};

use crate::msg::{ExecuteMsg, InstantiateMsg, QueryMsg};

// Example usage of the mentor contract

pub fn example_usage() {
    // 1. Instantiate the contract
    let instantiate_msg = InstantiateMsg {};

    // 2. Create a mentor profile
    let create_mentor_msg = ExecuteMsg::CreateMentor {
        name: "Dr. Ivy Zhang".to_string(),
        institution: "MIT".to_string(),
        department: "Computer Science".to_string(),
        avatar: Some("https://avatars.githubusercontent.com/u/103652334?v=4".to_string()),
        links: vec![
            "https://github.com/drzhang".to_string(),
            "https://scholar.google.com/citations?user=abc123".to_string(),
        ],
    };

    // 3. Create a comment/review for the mentor
    let create_comment_msg = ExecuteMsg::CreateComment {
        mentor_id: Addr::unchecked("xion1mentor123..."),
        rating: 9,
        comment: "Dr. Zhang is an excellent mentor! Very knowledgeable and patient with students."
            .to_string(),
    };

    // 4. Vote on a comment (like it)
    let vote_msg = ExecuteMsg::VoteComment {
        comment_id: "cid1".to_string(),
        vote: 1, // 1 for like, -1 for dislike, 0 to remove vote
    };

    // 5. Query mentor profile with all comments
    let query_mentor_msg = QueryMsg::GetMentor {
        mentor_id: Addr::unchecked("xion1mentor123..."),
    };

    // 6. Query user's posted comments
    let query_user_msg = QueryMsg::GetUser {
        user_id: Addr::unchecked("xion1user456..."),
    };

    // 7. List all mentors (paginated)
    let list_mentors_msg = QueryMsg::ListMentors {
        start_after: None,
        limit: Some(10),
    };

    // 8. List comments for a specific mentor
    let list_comments_msg = QueryMsg::ListComments {
        mentor_id: Some(Addr::unchecked("xion1mentor123...")),
        start_after: None,
        limit: Some(20),
    };

    // 9. Update mentor profile
    let update_mentor_msg = ExecuteMsg::UpdateMentor {
        name: Some("Dr. Ivy Zhang, PhD".to_string()),
        institution: None, // Keep existing
        department: None,  // Keep existing
        avatar: Some("https://newavatar.com/ivy.jpg".to_string()),
        links: Some(vec![
            "https://github.com/drzhang".to_string(),
            "https://scholar.google.com/citations?user=abc123".to_string(),
            "https://ivy-zhang.com".to_string(), // New personal website
        ]),
    };

    // 10. Update user's institution (for privacy)
    let update_user_msg = ExecuteMsg::UpdateUserInstitution {
        institution: Some("Stanford University".to_string()),
    };
}

#[cfg(test)]
mod example_tests {
    use super::*;
    use crate::contract::{execute, instantiate, query};
    use cosmwasm_std::coins;
    use cosmwasm_std::testing::{mock_dependencies, mock_env, mock_info};

    #[test]
    fn test_full_workflow() {
        let mut deps = mock_dependencies();
        let env = mock_env();

        // Instantiate contract
        let instantiate_msg = InstantiateMsg {};
        let info = mock_info("creator", &coins(1000, "token"));
        let _res = instantiate(deps.as_mut(), env.clone(), info, instantiate_msg).unwrap();

        // Create mentor
        let mentor_info = mock_info("mentor1", &coins(0, "token"));
        let create_mentor_msg = ExecuteMsg::CreateMentor {
            name: "Dr. Ivy".to_string(),
            institution: "MIT".to_string(),
            department: "CS".to_string(),
            avatar: None,
            links: vec![],
        };
        let _res = execute(deps.as_mut(), env.clone(), mentor_info, create_mentor_msg).unwrap();

        // Create comment
        let student_info = mock_info("student1", &coins(0, "token"));
        let create_comment_msg = ExecuteMsg::CreateComment {
            mentor_id: Addr::unchecked("mentor1"),
            rating: 8,
            comment: "Great teacher!".to_string(),
        };
        let _res = execute(deps.as_mut(), env.clone(), student_info, create_comment_msg).unwrap();

        // Vote on comment
        let voter_info = mock_info("voter1", &coins(0, "token"));
        let vote_msg = ExecuteMsg::VoteComment {
            comment_id: "cid1".to_string(),
            vote: 1,
        };
        let _res = execute(deps.as_mut(), env.clone(), voter_info, vote_msg).unwrap();

        // Query mentor
        let query_msg = QueryMsg::GetMentor {
            mentor_id: Addr::unchecked("mentor1"),
        };
        let _res = query(deps.as_ref(), env, query_msg).unwrap();
    }
}
