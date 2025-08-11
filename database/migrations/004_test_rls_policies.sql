-- RLS Policy Testing Script
-- This file contains test queries to verify RLS policies are working correctly
-- Run these queries as different users to test the security policies

-- =============================================
-- TEST SETUP (Run as admin/superuser)
-- =============================================

-- Create test users (if they don't exist)
-- Note: In production, users are created through Nhost Auth
/*
INSERT INTO auth.users (id, email) 
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'user1@test.com'),
    ('22222222-2222-2222-2222-222222222222', 'user2@test.com')
ON CONFLICT (id) DO NOTHING;
*/

-- Create test chats for different users
/*
INSERT INTO public.chats (id, user_id, title) 
VALUES 
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'User 1 Chat'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'User 2 Chat')
ON CONFLICT (id) DO NOTHING;
*/

-- Create test messages
/*
INSERT INTO public.messages (chat_id, content, is_bot) 
VALUES 
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Hello from User 1', false),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Bot response to User 1', true),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Hello from User 2', false),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Bot response to User 2', true)
ON CONFLICT DO NOTHING;
*/

-- =============================================
-- TEST QUERIES
-- =============================================

-- Test 1: User should only see their own chats
-- Set the user context (this simulates being logged in as user1)
-- SELECT set_config('request.jwt.claims', '{"sub": "11111111-1111-1111-1111-111111111111"}', true);

-- This should return only User 1's chat
-- SELECT * FROM public.chats;

-- Test 2: User should only see messages from their own chats
-- This should return only messages from User 1's chat
-- SELECT * FROM public.messages;

-- Test 3: User should not be able to insert chat for another user
-- This should fail due to RLS policy
-- INSERT INTO public.chats (user_id, title) 
-- VALUES ('22222222-2222-2222-2222-222222222222', 'Unauthorized Chat');

-- Test 4: User should not be able to insert message to another user's chat
-- This should fail due to RLS policy
-- INSERT INTO public.messages (chat_id, content, is_bot) 
-- VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Unauthorized message', false);

-- =============================================
-- VERIFICATION QUERIES (Run as admin)
-- =============================================

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('chats', 'messages');

-- List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('chats', 'messages');

-- Check table permissions
SELECT grantee, table_schema, table_name, privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name IN ('chats', 'messages')
AND grantee = 'authenticated';

-- =============================================
-- CLEANUP (Optional)
-- =============================================

-- Remove test data (uncomment if needed)
/*
DELETE FROM public.messages WHERE chat_id IN (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
);

DELETE FROM public.chats WHERE id IN (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
);
*/