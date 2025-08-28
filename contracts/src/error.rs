use cosmwasm_std::StdError;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ContractError {
    #[error("{0}")]
    Std(#[from] StdError),

    #[error("Unauthorized")]
    Unauthorized {},
    
    #[error("Mentor not found")]
    MentorNotFound {},
    
    #[error("User not found")]
    UserNotFound {},
    
    #[error("Comment not found")]
    CommentNotFound {},
    
    #[error("Invalid rating: must be between 1 and 10")]
    InvalidRating {},
    
    #[error("Invalid vote: must be -1, 0, or 1")]
    InvalidVote {},
    
    #[error("Mentor already exists for this address")]
    MentorAlreadyExists {},
}
