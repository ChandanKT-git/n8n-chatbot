import { useState, useCallback, useEffect } from 'react';
import {
    useQuery,
    useMutation,
    useSubscription,
    ApolloError,
    FetchResult
} from '@apollo/client';
import {
    GET_USER_CHATS,
    CREATE_CHAT,
    UPDATE_CHAT_TITLE,
    UPDATE_CHAT_TIMESTAMP,
    SUBSCRIBE_TO_USER_CHATS
} from '../lib/graphql';
import {
    GetUserChatsResponse,
    CreateChatResponse,
    CreateChatVariables,
    UpdateChatTitleResponse,
    UpdateChatTitleVariables,
    UpdateChatTimestampResponse,
    UpdateChatTimestampVariables,
    SubscribeToUserChatsResponse,
    ChatWithPreview
} from '../types/graphql';
import { handleSubscriptionError, getSubscriptionState, SubscriptionState } from '../lib/subscriptions';

// ============================================================================
// CHAT HOOKS
// ============================================================================

export interface UseChatsResult {
    // Data
    chats: ChatWithPreview[];
    loading: boolean;
    error: ApolloError | undefined;
    subscriptionState: SubscriptionState;

    // Actions
    createChat: (title: string) => Promise<string | null>;
    updateChatTitle: (chatId: string, title: string) => Promise<boolean>;
    updateChatTimestamp: (chatId: string) => Promise<boolean>;
    refetch: () => Promise<any>;

    // States
    creating: boolean;
    updating: boolean;
}

/**
 * Hook for managing user's chats with real-time updates
 */
export function useChats(): UseChatsResult {
    const [creating, setCreating] = useState(false);
    const [updating, setUpdating] = useState(false);

    // Query for initial data
    const {
        data: queryData,
        loading: queryLoading,
        error: queryError,
        refetch
    } = useQuery<GetUserChatsResponse>(GET_USER_CHATS, {
        errorPolicy: 'all',
        notifyOnNetworkStatusChange: true,
    });

    // Subscription for real-time updates
    const {
        data: subscriptionData,
        loading: subscriptionLoading,
        error: subscriptionError
    } = useSubscription<SubscribeToUserChatsResponse>(SUBSCRIBE_TO_USER_CHATS, {
        errorPolicy: 'all',
    });

    // Mutations
    const [createChatMutation] = useMutation<CreateChatResponse, CreateChatVariables>(
        CREATE_CHAT,
        {
            update: (cache, { data }) => {
                if (data?.insert_chats_one) {
                    // Add new chat to cache
                    const existingChats = cache.readQuery<GetUserChatsResponse>({
                        query: GET_USER_CHATS,
                    });

                    if (existingChats) {
                        cache.writeQuery({
                            query: GET_USER_CHATS,
                            data: {
                                chats: [
                                    {
                                        ...data.insert_chats_one,
                                        messages_aggregate: { aggregate: { count: 0 } },
                                        messages: []
                                    },
                                    ...existingChats.chats,
                                ],
                            },
                        });
                    }
                }
            },
        }
    );

    const [updateChatTitleMutation] = useMutation<UpdateChatTitleResponse, UpdateChatTitleVariables>(
        UPDATE_CHAT_TITLE
    );

    const [updateChatTimestampMutation] = useMutation<UpdateChatTimestampResponse, UpdateChatTimestampVariables>(
        UPDATE_CHAT_TIMESTAMP
    );

    // Determine which data to use (subscription takes precedence)
    const chats = subscriptionData?.chats || queryData?.chats || [];
    const loading = queryLoading && !subscriptionData;
    const error = subscriptionError || queryError;
    const subscriptionState = getSubscriptionState(subscriptionLoading, subscriptionError, subscriptionData);

    // Actions
    const createChat = useCallback(async (title: string): Promise<string | null> => {
        setCreating(true);
        try {
            const result: FetchResult<CreateChatResponse> = await createChatMutation({
                variables: { title },
            });

            if (result.data?.insert_chats_one) {
                return result.data.insert_chats_one.id;
            }
            return null;
        } catch (error) {
            console.error('Failed to create chat:', error);
            return null;
        } finally {
            setCreating(false);
        }
    }, [createChatMutation]);

    const updateChatTitle = useCallback(async (chatId: string, title: string): Promise<boolean> => {
        setUpdating(true);
        try {
            const result = await updateChatTitleMutation({
                variables: { chatId, title },
            });
            return !!result.data?.update_chats_by_pk;
        } catch (error) {
            console.error('Failed to update chat title:', error);
            return false;
        } finally {
            setUpdating(false);
        }
    }, [updateChatTitleMutation]);

    const updateChatTimestamp = useCallback(async (chatId: string): Promise<boolean> => {
        try {
            const result = await updateChatTimestampMutation({
                variables: { chatId },
            });
            return !!result.data?.update_chats_by_pk;
        } catch (error) {
            console.error('Failed to update chat timestamp:', error);
            return false;
        }
    }, [updateChatTimestampMutation]);

    return {
        // Data
        chats,
        loading,
        error,
        subscriptionState,

        // Actions
        createChat,
        updateChatTitle,
        updateChatTimestamp,
        refetch,

        // States
        creating,
        updating,
    };
}

/**
 * Hook for getting a specific chat by ID
 */
export function useChat(chatId: string | null): ChatWithPreview | null {
    const { chats } = useChats();

    return chats.find(chat => chat.id === chatId) || null;
}