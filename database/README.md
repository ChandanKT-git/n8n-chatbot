# Database Setup

This directory contains the database schema and migration files for the chatbot application.

## Files

- `migrations/init_database.sql` - Complete database initialization script
- `migrations/001_create_chats_table.sql` - Chats table creation
- `migrations/002_create_messages_table.sql` - Messages table creation

## Database Schema

### Tables

#### `public.chats`
- `id` (UUID, Primary Key) - Unique chat identifier
- `user_id` (UUID, Foreign Key) - References auth.users(id)
- `title` (TEXT, Optional) - Chat title/name
- `created_at` (TIMESTAMPTZ) - When the chat was created
- `updated_at` (TIMESTAMPTZ) - When the chat was last updated

#### `public.messages`
- `id` (UUID, Primary Key) - Unique message identifier
- `chat_id` (UUID, Foreign Key) - References public.chats(id)
- `content` (TEXT) - Message content
- `is_bot` (BOOLEAN) - Whether the message is from the bot
- `created_at` (TIMESTAMPTZ) - When the message was created

### Relationships

- `chats.user_id` → `auth.users.id` (Many-to-One)
- `messages.chat_id` → `chats.id` (Many-to-One)

### Indexes

- `idx_chats_user_id` - For efficient user chat queries
- `idx_chats_created_at` - For chronological ordering
- `idx_chats_updated_at` - For recent activity queries
- `idx_messages_chat_id` - For chat message queries
- `idx_messages_created_at` - For chronological message ordering
- `idx_messages_chat_id_created_at` - Composite index for efficient chat message retrieval
- `idx_messages_is_bot` - For filtering bot vs user messages

## Setup Instructions

### Using Nhost Console

1. Go to your Nhost project dashboard
2. Navigate to the "Database" section
3. Go to "SQL Editor"
4. Copy and paste the contents of `migrations/init_database.sql`
5. Execute the script

### Using Hasura Console

1. Open your Hasura Console
2. Go to the "Data" tab
3. Click on "SQL" in the sidebar
4. Copy and paste the contents of `migrations/init_database.sql`
5. Click "Run!"

### Using psql (if you have direct database access)

```bash
psql -h your-db-host -U your-username -d your-database -f database/migrations/init_database.sql
```

## Row Level Security (RLS)

RLS policies will be configured in the next step to ensure users can only access their own data.

## Notes

- All tables use UUID primary keys for better scalability
- Foreign key constraints ensure data integrity
- Indexes are optimized for common query patterns
- The `updated_at` trigger automatically updates timestamps
- Cascade deletes ensure cleanup when users or chats are deleted