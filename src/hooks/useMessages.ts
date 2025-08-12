import { useState, useCallback, useRef, useEffect } from 'react';
import {
    useQuery,
    useMutation,
    useSubscription,
    ApolloError,
    FetchResult
} from '@apollo/client';
import {
    GET_CHAT_MESSAGES,
    SEND_MESSAGE,
    SEND_MESSAGE_WITH_AI,
    SUBSCRIBE_TO_CHAT_MESSAGES,
    UPDATE_CHAT_TIMESTAMP
} from '../lib/graphql';
import {
    GetChatMessagesResponse,
    GetChatMessagesVariables,
    SendMessageResponse,
    SendMessageVariables,
    SubscribeToChatMessagesResponse,
    SubscribeToChatMessagesVariables,
    UpdateChatTimestampVariables,
    Message
} from '../types/graphql';
import { getSubscriptionState, SubscriptionState } from '../lib/subscriptions';

// ============================================================================
// MESSAGE HOOKS
// ============================================================================

export interface UseMessagesResult {
    // Data
    messages: Message[];
    loading: boolean;
    error: ApolloError | undefined;
    subscriptionState: SubscriptionState;

    // Actions
    sendMessage: (content: string, isBot?: boolean) => Promise<boolean>;
    sendMessageWithAI: (content: string) => Promise<boolean>;
    sendMessageOptimistic: (content: string, isBot?: boolean) => string;
    refetch: () => Promise<any>;

    // States
    sending: boolean;
}

/**
 * Hook for managing messages in a specific chat with real-time updates
 */
export function useMessages(chatId: string | null): UseMessagesResult {
    const [sending, setSending] = useState(false);
    const optimisticMessagesRef = useRef<Map<string, Message>>(new Map());

    // Query for initial data
    const {
        data: queryData,
        loading: queryLoading,
        error: queryError,
        refetch
    } = useQuery<GetChatMessagesResponse, GetChatMessagesVariables>(
        GET_CHAT_MESSAGES,
        {
            variables: { chatId: chatId! },
            skip: !chatId,
            errorPolicy: 'all',
            notifyOnNetworkStatusChange: true,
        }
    );

    // Subscription for real-time updates
    const {
        data: subscriptionData,
        loading: subscriptionLoading,
        error: subscriptionError
    } = useSubscription<SubscribeToChatMessagesResponse, SubscribeToChatMessagesVariables>(
        SUBSCRIBE_TO_CHAT_MESSAGES,
        {
            variables: { chatId: chatId! },
            skip: !chatId,
            errorPolicy: 'all',
        }
    );

    // Mutations
    const [sendMessageMutation] = useMutation<SendMessageResponse, SendMessageVariables>(
        SEND_MESSAGE,
        {
            update: (cache, { data }) => {
                if (data?.insert_messages_one && chatId) {
                    // Remove optimistic message and add real message
                    const optimisticId = `optimistic-${data.insert_messages_one.content}-${data.insert_messages_one.created_at}`;
                    optimisticMessagesRef.current.delete(optimisticId);

                    // Update cache with real message
                    const existingMessages = cache.readQuery<GetChatMessagesResponse, GetChatMessagesVariables>({
                        query: GET_CHAT_MESSAGES,
                        variables: { chatId },
                    });

                    if (existingMessages) {
                        cache.writeQuery({
                            query: GET_CHAT_MESSAGES,
                            variables: { chatId },
                            data: {
                                messages: [...existingMessages.messages, data.insert_messages_one],
                            },
                        });
                    }
                }
            },
        }
    );

    const [updateChatTimestampMutation] = useMutation<any, UpdateChatTimestampVariables>(
        UPDATE_CHAT_TIMESTAMP
    );

    const [sendMessageWithAIMutation] = useMutation(SEND_MESSAGE_WITH_AI);

    // Determine which data to use (subscription takes precedence)
    const baseMessages = subscriptionData?.messages || queryData?.messages || [];
    const optimisticMessages = Array.from(optimisticMessagesRef.current.values());
    const messages = [...baseMessages, ...optimisticMessages].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const loading = queryLoading && !subscriptionData && !chatId;
    const error = subscriptionError || queryError;
    const subscriptionState = getSubscriptionState(subscriptionLoading, subscriptionError, subscriptionData);

    // Clean up optimistic messages when real messages arrive
    useEffect(() => {
        if (subscriptionData?.messages) {
            // Clear optimistic messages that match real messages
            const realMessageContents = new Set(subscriptionData.messages.map(m => m.content));
            const optimisticEntries = Array.from(optimisticMessagesRef.current.entries());

            optimisticEntries.forEach(([id, message]) => {
                if (realMessageContents.has(message.content)) {
                    optimisticMessagesRef.current.delete(id);
                }
            });
        }
    }, [subscriptionData]);

    // Actions
    const sendMessage = useCallback(async (content: string, isBot: boolean = false): Promise<boolean> => {
        if (!chatId) return false;

        setSending(true);
        try {
            const result: FetchResult<SendMessageResponse> = await sendMessageMutation({
                variables: { chatId, content, isBot },
            });

            if (result.data?.insert_messages_one) {
                // Update chat timestamp
                await updateChatTimestampMutation({
                    variables: { chatId },
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to send message:', error);
            return false;
        } finally {
            setSending(false);
        }
    }, [chatId, sendMessageMutation, updateChatTimestampMutation]);

    const sendMessageWithAI = useCallback(async (content: string): Promise<boolean> => {
        if (!chatId) return false;

        try {
            const result = await sendMessageWithAIMutation({
                variables: { chatId, message: content },
            });

            return result.data?.sendMessage?.success || false;
        } catch (error) {
            console.error('Failed to send message to AI:', error);
            return false;
        }
    }, [chatId, sendMessageWithAIMutation]);

    const sendMessageOptimistic = useCallback((content: string, isBot: boolean = false): string => {
        if (!chatId) return '';

        const optimisticId = `optimistic-${content}-${Date.now()}`;
        const optimisticMessage: Message = {
            id: optimisticId,
            chat_id: chatId,
            content,
            is_bot: isBot,
            created_at: new Date().toISOString(),
        };

        optimisticMessagesRef.current.set(optimisticId, optimisticMessage);

        // Trigger re-render by calling sendMessage in background
        sendMessage(content, isBot).then(success => {
            if (!success) {
                // Remove optimistic message if send failed
                optimisticMessagesRef.current.delete(optimisticId);
            }
        });

        return optimisticId;
    }, [chatId, sendMessage]);

    return {
        // Data
        messages,
        loading,
        error,
        subscriptionState,

        // Actions
        sendMessage,
        sendMessageWithAI,
        sendMessageOptimistic,
        refetch,

        // States
        sending,
    };
}

/**
 * Hook for getting the latest message in a chat
 */
export function useLatestMessage(chatId: string | null): Message | null {
    const { messages } = useMessages(chatId);

    return messages.length > 0 ? messages[messages.length - 1] : null;
}

/**
 * Hook for getting message count in a chat
 */
export function useMessageCount(chatId: string | null): number {
    const { messages } = useMessages(chatId);

    return messages.length;
}