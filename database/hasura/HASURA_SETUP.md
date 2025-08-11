# Hasura GraphQL Setup Guide

This guide explains how to configure Hasura GraphQL permissions for the chatbot application.

## Prerequisites

1. Database tables created (chats, messages)
2. Row-Level Security (RLS) policies applied
3. Hasura Console access
4. Nhost authentication configured

## Table Relationships

Before setting up permissions, ensure the following relationships are configured:

### Chats Table Relationships

1. **Object Relationship**: `user`
   - Type: Object Relationship
   - From: `chats.user_id`
   - To: `auth.users.id`

2. **Array Relationship**: `messages`
   - Type: Array Relationship
   - From: `chats.id`
   - To: `messages.chat_id`

### Messages Table Relationships

1. **Object Relationship**: `chat`
   - Type: Object Relationship
   - From: `messages.chat_id`
   - To: `chats.id`

## Permission Setup

### Step 1: Configure Chats Table Permissions

1. Go to Hasura Console → Data → chats → Permissions
2. Add permissions for the `user` role:

#### Select Permission
```json
{
  "columns": ["id", "user_id", "title", "created_at", "updated_at"],
  "filter": {
    "user_id": {"_eq": "X-Hasura-User-Id"}
  },
  "allow_aggregations": true
}
```

#### Insert Permission
```json
{
  "check": {
    "user_id": {"_eq": "X-Hasura-User-Id"}
  },
  "columns": ["user_id", "title"],
  "set": {
    "user_id": "X-Hasura-User-Id"
  }
}
```

#### Update Permission
```json
{
  "columns": ["title"],
  "filter": {
    "user_id": {"_eq": "X-Hasura-User-Id"}
  },
  "check": {
    "user_id": {"_eq": "X-Hasura-User-Id"}
  }
}
```

#### Delete Permission
```json
{
  "filter": {
    "user_id": {"_eq": "X-Hasura-User-Id"}
  }
}
```

### Step 2: Configure Messages Table Permissions

1. Go to Hasura Console → Data → messages → Permissions
2. Add permissions for the `user` role:

#### Select Permission
```json
{
  "columns": ["id", "chat_id", "content", "is_bot", "created_at"],
  "filter": {
    "chat": {
      "user_id": {"_eq": "X-Hasura-User-Id"}
    }
  },
  "allow_aggregations": true
}
```

#### Insert Permission
```json
{
  "check": {
    "chat": {
      "user_id": {"_eq": "X-Hasura-User-Id"}
    }
  },
  "columns": ["chat_id", "content", "is_bot"]
}
```

#### Update Permission (Optional)
```json
{
  "columns": ["content"],
  "filter": {
    "_and": [
      {
        "chat": {
          "user_id": {"_eq": "X-Hasura-User-Id"}
        }
      },
      {
        "is_bot": {"_eq": false}
      }
    ]
  },
  "check": {
    "chat": {
      "user_id": {"_eq": "X-Hasura-User-Id"}
    }
  }
}
```

#### Delete Permission (Optional)
```json
{
  "filter": {
    "_and": [
      {
        "chat": {
          "user_id": {"_eq": "X-Hasura-User-Id"}
        }
      },
      {
        "is_bot": {"_eq": false}
      }
    ]
  }
}
```

## Authentication Configuration

### Environment Variables

Ensure these environment variables are set in your Nhost/Hasura configuration:

```env
HASURA_GRAPHQL_JWT_SECRET={"type":"HS256","key":"your-jwt-secret"}
HASURA_GRAPHQL_UNAUTHORIZED_ROLE=anonymous
HASURA_GRAPHQL_DEFAULT_ROLE=user
```

### JWT Claims

The JWT token should include these claims:
```json
{
  "sub": "user-uuid",
  "iat": 1234567890,
  "exp": 1234567890,
  "https://hasura.io/jwt/claims": {
    "x-hasura-allowed-roles": ["user"],
    "x-hasura-default-role": "user",
    "x-hasura-user-id": "user-uuid"
  }
}
```

## Testing Permissions

### Test Queries

1. **Test Chat Access**:
```graphql
query GetUserChats {
  chats {
    id
    title
    created_at
    messages_aggregate {
      aggregate {
        count
      }
    }
  }
}
```

2. **Test Message Access**:
```graphql
query GetChatMessages($chatId: uuid!) {
  messages(where: {chat_id: {_eq: $chatId}}) {
    id
    content
    is_bot
    created_at
  }
}
```

3. **Test Insert Chat**:
```graphql
mutation CreateChat($title: String) {
  insert_chats_one(object: {title: $title}) {
    id
    title
    created_at
  }
}
```

4. **Test Insert Message**:
```graphql
mutation SendMessage($chatId: uuid!, $content: String!) {
  insert_messages_one(object: {
    chat_id: $chatId, 
    content: $content, 
    is_bot: false
  }) {
    id
    content
    created_at
  }
}
```

## Security Considerations

1. **User Isolation**: Users can only access their own chats and messages
2. **Bot Message Protection**: Users cannot edit or delete bot messages
3. **Automatic User Assignment**: User ID is automatically set from JWT claims
4. **Relationship Security**: Messages are secured through chat ownership
5. **Aggregation Control**: Users can only aggregate their own data

## Troubleshooting

### Common Issues

1. **Permission Denied**: Check JWT token and user ID claims
2. **Relationship Errors**: Ensure foreign key relationships are properly configured
3. **RLS Conflicts**: Verify RLS policies don't conflict with Hasura permissions
4. **Missing Columns**: Ensure all required columns are included in permissions

### Debug Queries

```sql
-- Check current user context
SELECT current_setting('request.jwt.claims', true);

-- Verify RLS policies
SELECT * FROM pg_policies WHERE tablename IN ('chats', 'messages');

-- Test direct database access
SELECT * FROM public.chats WHERE user_id = 'your-user-id';
```