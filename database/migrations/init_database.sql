-- Initialize database schema for chatbot application
-- This file contains all the necessary tables and relationships

-- =============================================
-- CHATS TABLE
-- =============================================

-- Create chats table
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for chats table
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON public.chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_created_at ON public.chats(created_at);
CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON public.chats(updated_at);

-- Create trigger function for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for chats table
CREATE TRIGGER update_chats_updated_at 
    BEFORE UPDATE ON public.chats 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- MESSAGES TABLE
-- =============================================

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_bot BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for messages table
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id_created_at ON public.messages(chat_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_is_bot ON public.messages(is_bot);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on chats table
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Enable RLS on messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Chats table policies
CREATE POLICY "Users can view own chats" ON public.chats
    FOR SELECT USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

CREATE POLICY "Users can insert own chats" ON public.chats
    FOR INSERT WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

CREATE POLICY "Users can update own chats" ON public.chats
    FOR UPDATE USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid) 
    WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

CREATE POLICY "Users can delete own chats" ON public.chats
    FOR DELETE USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

-- Messages table policies
CREATE POLICY "Users can view messages from own chats" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chats 
            WHERE chats.id = messages.chat_id 
            AND chats.user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
        )
    );

CREATE POLICY "Users can insert messages to own chats" ON public.messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.chats 
            WHERE chats.id = messages.chat_id 
            AND chats.user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
        )
    );

CREATE POLICY "Users can update messages in own chats" ON public.messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.chats 
            WHERE chats.id = messages.chat_id 
            AND chats.user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.chats 
            WHERE chats.id = messages.chat_id 
            AND chats.user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
        )
    );

CREATE POLICY "Users can delete messages from own chats" ON public.messages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.chats 
            WHERE chats.id = messages.chat_id 
            AND chats.user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
        )
    );

-- Note: Permissions are handled by Hasura GraphQL Engine
-- No need to grant permissions to roles as Hasura manages this

-- =============================================
-- SAMPLE DATA (Optional - for development)
-- =============================================

-- Note: Sample data should only be inserted in development environment
-- Uncomment the following lines if you want to add sample data

/*
-- Insert sample chat (replace 'your-user-id' with actual user ID)
INSERT INTO public.chats (user_id, title) 
VALUES ('your-user-id', 'Welcome Chat')
ON CONFLICT DO NOTHING;

-- Insert sample messages
INSERT INTO public.messages (chat_id, content, is_bot) 
SELECT 
    c.id,
    'Hello! Welcome to the chatbot. How can I help you today?',
    true
FROM public.chats c 
WHERE c.title = 'Welcome Chat'
ON CONFLICT DO NOTHING;
*/