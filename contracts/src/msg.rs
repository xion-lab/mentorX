use crate::state::{Comment, Mentor, User};
use cosmwasm_schema::QueryResponses;
use cosmwasm_std::Addr;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
pub struct InstantiateMsg {}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
pub enum ExecuteMsg {
    CreateMentor {
        name: String,
        institution: String,
        department: String,
        avatar: Option<String>,
        links: Vec<String>,
    },
    CreateComment {
        mentor_id: Addr,
        rating: u8,
        comment: String,
    },
    VoteComment {
        comment_id: String,
        vote: i8, // -1 for dislike, 1 for like, 0 to remove vote
    },
    UpdateMentor {
        name: Option<String>,
        institution: Option<String>,
        department: Option<String>,
        avatar: Option<String>,
        links: Option<Vec<String>>,
    },
    UpdateUserInstitution {
        institution: Option<String>,
    },
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema, QueryResponses)]
pub enum QueryMsg {
    #[returns(MentorResponse)]
    GetMentor { mentor_id: Addr },

    #[returns(UserResponse)]
    GetUser { user_id: Addr },

    #[returns(CommentResponse)]
    GetComment { comment_id: String },

    #[returns(MentorsResponse)]
    ListMentors {
        start_after: Option<Addr>,
        limit: Option<u32>,
    },

    #[returns(CommentsResponse)]
    ListComments {
        mentor_id: Option<Addr>,
        start_after: Option<String>,
        limit: Option<u32>,
    },
}

// Response types
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
pub struct MentorResponse {
    pub mentor: Mentor,
    pub comments: Vec<Comment>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
pub struct UserResponse {
    pub user: User,
    pub comments: Vec<Comment>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
pub struct CommentResponse {
    pub comment: Comment,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
pub struct MentorsResponse {
    pub mentors: Vec<Mentor>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
pub struct CommentsResponse {
    pub comments: Vec<Comment>,
}
