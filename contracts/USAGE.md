# Mentor-X Contract Usage Guide

This is a comprehensive on-chain mentor comment system on Xion using CosmWasm. The contract allows users to create mentor profiles, post comments with ratings, and interact through a like/dislike system.

## Data Structures

### Mentor

A mentor profile contains:

- `name`: Mentor's name
- `institution`: Educational institution
- `department`: Academic department
- `avatar`: Optional profile picture URL
- `created_at`/`updated_at`: Timestamps
- `created_by`/`updated_by`: Creator/updater address
- `links`: Array of relevant URLs (e.g., GitHub, personal website)
- `comments`: Array of comment IDs

### User

A user profile contains:

- `id`: User's wallet address
- `institution`: Optional institution (for privacy/ZK)
- `posted_comments`: Array of comment IDs posted by this user

### Comment

A comment contains:

- `id`: Unique comment identifier (e.g., "cid1")
- `created_at`: Creation timestamp
- `created_by`: Commenter's address
- `mentor_id`: Target mentor's address
- `rating`: 1-10 rating score
- `comment`: Text content
- `likes`: Net likes (can be negative)

## Execute Messages

### 1. Create a Mentor Profile

```json
{
  "create_mentor": {
    "name": "Ivy",
    "institution": "野鸡大学",
    "department": "计算机学院",
    "avatar": "https://avatars.githubusercontent.com/u/103652334?v=4",
    "links": ["https://github.com/yuchangongzhu"]
  }
}
```

### 2. Create a Comment

```json
{
  "create_comment": {
    "mentor_id": "xion1...",
    "rating": 9,
    "comment": "Ivy老师是世界上最好的老师"
  }
}
```

### 3. Vote on a Comment

```json
{
  "vote_comment": {
    "comment_id": "cid1",
    "vote": 1  // 1 for like, -1 for dislike, 0 to remove vote
  }
}
```

### 4. Update Mentor Profile

```json
{
  "update_mentor": {
    "name": "New Name",  // Optional
    "institution": "New Institution",  // Optional
    "department": "New Department",  // Optional
    "avatar": "New Avatar URL",  // Optional
    "links": ["New Link"]  // Optional
  }
}
```

### 5. Update User Institution

```json
{
  "update_user_institution": {
    "institution": "My University"  // Optional for privacy
  }
}
```

## Query Messages

### 1. Get Mentor Profile with All Comments

```json
{
  "get_mentor": {
    "mentor_id": "xion1..."
  }
}
```

Response includes the mentor's full profile and all their comments.

### 2. Get User Profile with All Posted Comments

```json
{
  "get_user": {
    "user_id": "xion1..."
  }
}
```

Response includes the user's profile and all comments they've posted.

### 3. Get a Specific Comment

```json
{
  "get_comment": {
    "comment_id": "cid1"
  }
}
```

### 4. List All Mentors (Paginated)

```json
{
  "list_mentors": {
    "start_after": "xion1...",  // Optional for pagination
    "limit": 10  // Optional, default 10, max 30
  }
}
```

### 5. List Comments (Optionally Filtered by Mentor)

```json
{
  "list_comments": {
    "mentor_id": "xion1...",  // Optional filter
    "start_after": "cid10",  // Optional for pagination
    "limit": 20  // Optional, default 10, max 50
  }
}
```

## Key Features

1. **Full On-Chain Storage**: All data is stored on-chain for transparency and immutability
2. **Rating System**: 1-10 rating scale for mentors
3. **Like/Dislike System**: Comments can receive positive or negative feedback
4. **Privacy Support**: User institution is optional for privacy
5. **Comprehensive Queries**: Rich query capabilities for frontend integration
6. **Pagination**: Efficient listing with pagination support
7. **Update Capabilities**: Mentors can update their profiles

## Error Handling

The contract includes comprehensive error handling for:

- Invalid ratings (must be 1-10)
- Invalid votes (must be -1, 0, or 1)
- Non-existent mentors, users, or comments
- Duplicate mentor creation attempts
- Unauthorized operations

## Testing

Run the full test suite:

```bash
cargo test
```

Generate schemas:

```bash
cargo schema
```

## Deployment

To deploy on Xion:

1. Optimize the contract: `docker run --rm -v "$(pwd)":/code --mount type=volume,source="$(basename "$(pwd)")_cache",target=/target --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry cosmwasm/optimizer:0.16.0`
2. Deploy using xion CLI or frontend tools
3. Instantiate with an empty message: `{}`
