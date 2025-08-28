use cosmwasm_std::{Addr, Timestamp};
use cw_storage_plus::{Item, Map};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
pub struct State {
    pub owner: Addr,
    pub comment_counter: u64,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
pub struct Mentor {
    pub name: String,
    pub institution: String,
    pub department: String,
    pub avatar: Option<String>,
    pub created_at: Timestamp,
    pub created_by: Addr,
    pub links: Vec<String>,
    pub updated_at: Timestamp,
    pub updated_by: Addr,
    pub comments: Vec<String>, // comment IDs
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
pub struct User {
    pub id: Addr,
    pub institution: Option<String>,  // optional, ZK
    pub posted_comments: Vec<String>, // comment IDs
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
pub struct Comment {
    pub id: String,
    pub created_at: Timestamp,
    pub created_by: Addr,
    pub mentor_id: Addr,
    pub rating: u8, // 1-10 rating
    pub comment: String,
    pub likes: i32, // can be negative
}

pub const STATE: Item<State> = Item::new("state");
pub const MENTORS: Map<&Addr, Mentor> = Map::new("mentors");
pub const USERS: Map<&Addr, User> = Map::new("users");
pub const COMMENTS: Map<&str, Comment> = Map::new("comments");
pub const USER_COMMENT_VOTES: Map<(&Addr, &str), i8> = Map::new("user_comment_votes"); // -1, 0, 1
