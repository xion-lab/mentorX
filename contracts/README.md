# Mentor-X Contracts

A fully on-chain mentor comment system built on Xion using CosmWasm. This system allows users to create mentor profiles, post comments with ratings, and interact through a comprehensive like/dislike system.

## Features

✅ **Mentor Profiles**: Create and manage detailed mentor profiles with institution, department, and links  
✅ **Rating System**: 1-10 rating scale for mentor evaluations  
✅ **Comment System**: Full comment functionality with text reviews  
✅ **Like/Dislike System**: Vote on comments with positive or negative feedback  
✅ **Privacy Support**: Optional institution field for user privacy  
✅ **Comprehensive Queries**: Rich API for fetching mentors, users, and comments  
✅ **Pagination**: Efficient listing with pagination support  
✅ **Update Capabilities**: Mentors can update their profiles  
✅ **Full On-Chain Storage**: All data stored on-chain for transparency and immutability  

## Data Structures

### Mentor

- Name, institution, department
- Optional avatar URL
- Social/professional links (GitHub, etc.)
- Creation and update timestamps
- List of comment IDs

### User  

- Wallet address as ID
- Optional institution (for privacy/ZK features)
- List of posted comment IDs

### Comment

- Unique ID (e.g., "cid1", "cid2")
- Rating (1-10)
- Text content
- Target mentor ID
- Like count (can be negative)
- Creation timestamp and author

## Quick Start

### Build and Test

```bash
cargo test
```

### Generate Schemas

```bash
cargo schema
```

### Deploy to Xion

1. Optimize the contract:

```bash
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/optimizer:0.16.0
```

2. Deploy using xion CLI or frontend tools
3. Instantiate with: `{}`

## API Examples

### Create a Mentor

```json
{
  "create_mentor": {
    "name": "Dr. Ivy Zhang",
    "institution": "MIT", 
    "department": "Computer Science",
    "avatar": "https://avatars.githubusercontent.com/u/103652334?v=4",
    "links": ["https://github.com/drzhang"]
  }
}
```

### Create a Comment

```json
{
  "create_comment": {
    "mentor_id": "xion1...",
    "rating": 9,
    "comment": "Excellent mentor! Very knowledgeable and helpful."
  }
}
```

### Vote on Comment

```json
{
  "vote_comment": {
    "comment_id": "cid1",
    "vote": 1  // 1=like, -1=dislike, 0=remove vote
  }
}
```

### Query Mentor with All Comments

```json
{
  "get_mentor": {
    "mentor_id": "xion1..."
  }
}
```

### List Mentors (Paginated)

```json
{
  "list_mentors": {
    "start_after": "xion1...",  // Optional
    "limit": 10                 // Optional, max 30
  }
}
```

## Implementation Details

- **Storage**: Uses `cw-storage-plus` Maps for efficient key-value storage
- **Error Handling**: Comprehensive error types for all failure cases  
- **Validation**: Input validation for ratings (1-10) and votes (-1,0,1)
- **Pagination**: Bounded queries to prevent gas issues
- **Vote Tracking**: Prevents double-voting and tracks user vote history

## Project Structure

```
src/
├── contract.rs        # Main contract logic (instantiate, execute, query)
├── state.rs           # Data structures and storage maps
├── msg.rs             # Message types and responses
├── error.rs           # Custom error types
├── helpers.rs         # Helper functions for contract interaction
├── examples.rs        # Usage examples and tests
└── integration_tests.rs # Integration tests
```

## Testing

The project includes comprehensive tests:

- Unit tests for all core functionality
- Integration tests using `cw-multi-test`
- Example usage demonstrations

Run tests with:

```bash
cargo test
```

## Schema Generation

JSON schemas are automatically generated for frontend integration:

```bash
cargo schema
```

Generated schemas include:

- Execute message schemas
- Query message schemas  
- Response type schemas
- Complete API documentation

## Error Handling

The contract includes robust error handling for:

- Invalid ratings (must be 1-10)
- Invalid votes (must be -1, 0, or 1)
- Non-existent mentors, users, or comments
- Duplicate mentor creation attempts
- Unauthorized operations

## Original Template

This project was built from the CosmWasm starter template. For more information about CosmWasm development, see [Developing](./Developing.md) and [Publishing](./Publishing.md).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

This project is licensed under the terms specified in the LICENSE file.
