# Database Schemas

## Messages

The foundation of data for our chat app. We save the message data in this schema below.

```sql
CREATE TABLE messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL, -- Foreign key to users table
  chat_id uuid NOT NULL, -- Foreign key to chats table
  message text NOT NULL, -- The message content
  created_at timestamptz DEFAULT now(), -- Timestamp when the message was created
);
```

## Chats

Messages are grouped into chats. We save the chat data in this schema below.

```sql
CREATE TABLE chats (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user uuid NOT NULL, -- Foreign key to users table
  name text NOT NULL, -- The name of the chat
  created_at timestamptz DEFAULT now(), -- Timestamp when the chat was created
  updated_at timestamptz DEFAULT now() -- Timestamp when the chat was last updated
);
```
Messages are associated with a chat using the `chat_id` column in the `messages` table. Messages can only be created. Chats can be updated. We pull the user id from the supabase auth table.
