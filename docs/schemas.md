# Database Schemas

Note that the RLS policies allow users to delete, insert, and select their own data. This is to ensure that users can only see and interact with their own data. Cascading deletes should also be implemented to ensure that data is not accidentally deleted.

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

### Users can delete their own messages
```sql
CREATE POLICY "Users can delete their own messages"
ON messages
FOR DELETE
USING (auth.uid() = user_id);
```

### Users can insert their own messages
```sql
CREATE POLICY "Users can insert their own messages"
ON messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

### Users can select their own messages
```sql
CREATE POLICY "Users can select their own messages"
ON messages
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

## Chats

Messages are grouped into chats. We save the chat data in this schema below.

```sql
CREATE TABLE chats (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL, -- Foreign key to users table
  name text NOT NULL, -- The name of the chat
  created_at timestamptz DEFAULT now(), -- Timestamp when the chat was created
  updated_at timestamptz DEFAULT now() -- Timestamp when the chat was last updated
);
```
Messages are associated with a chat using the `chat_id` column in the `messages` table. Messages can only be created. Chats can be updated. We pull the user id from the supabase auth table.

### Users can delete their own chats
```sql
CREATE POLICY "Users can delete their own chats"
ON chats
FOR DELETE
USING (auth.uid() = user_id);
```

### Users can insert their own chats
```sql
CREATE POLICY "Users can insert their own chats"
ON chats
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

### Users can select their own chats
```sql
CREATE POLICY "Users can select their own chats"
ON chats
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```