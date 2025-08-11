-- Row Level Security (RLS) Policies
-- This file sets up security policies to ensure users can only access their own data

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on chats table
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Enable RLS on messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CHATS TABLE POLICIES
-- =============================================

-- Policy: Users can view their own chats
CREATE POLICY "Users can view own chats" ON public.chats
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own chats
CREATE POLICY "Users can insert own chats" ON public.chats
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own chats
CREATE POLICY "Users can update own chats" ON public.chats
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own chats
CREATE POLICY "Users can delete own chats" ON public.chats
    FOR DELETE 
    USING (auth.uid() = user_id);

-- =============================================
-- MESSAGES TABLE POLICIES
-- =============================================

-- Policy: Users can view messages from their own chats
CREATE POLICY "Users can view messages from own chats" ON public.messages
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.chats 
            WHERE chats.id = messages.chat_id 
            AND chats.user_id = auth.uid()
        )
    );

-- Policy: Users can insert messages to their own chats
CREATE POLICY "Users can insert messages to own chats" ON public.messages
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.chats 
            WHERE chats.id = messages.chat_id 
            AND chats.user_id = auth.uid()
        )
    );

-- Policy: Users can update messages in their own chats (optional - for editing)
CREATE POLICY "Users can update messages in own chats" ON public.messages
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.chats 
            WHERE chats.id = messages.chat_id 
            AND chats.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.chats 
            WHERE chats.id = messages.chat_id 
            AND chats.user_id = auth.uid()
        )
    );

-- Policy: Users can delete messages from their own chats (optional)
CREATE POLICY "Users can delete messages from own chats" ON public.messages
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.chats 
            WHERE chats.id = messages.chat_id 
            AND chats.user_id = auth.uid()
        )
    );

-- =============================================
-- ADDITIONAL SECURITY MEASURES
-- =============================================

-- Ensure only authenticated users can access these tables
-- (This is handled by the policies above, but we can add explicit checks)

-- Grant usage on schema to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant table permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chats TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;

-- Grant sequence permissions (for any sequences that might be created)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;