import { useQuery, useMutation, useSubscription } from '@apollo/client'
import {
    GET_USER_CHATS,
    CREATE_CHAT,
    UPDATE_CHAT,
    DELETE_CHAT,
    SUBSCRIBE_TO_USER_CHATS
} from '../graphql/schema'
import {
    GetUserChatsQuery,
    CreateChatMutation,
    CreateChatMutationVariables,
    UpdateChatMutation,
    UpdateChatMutationVariables,
    DeleteChatMutation,
    DeleteChatMutationVariables,
    SubscribeToUserChatsSubscription
} from '../graphql/types'
import { generateChatTitle } from '../utils'

export function useChats() {
    // Query for user's chats
    const {
        data,
        loading,
        error,
        refetch
    } = useQuery<GetUserChatsQuery>(GET_USER_CHATS, {
        errorPolicy: 'all',
        notifyOnNetworkStatusChange: true,
    })

    // Create chat mutation
    const [createChatMutation, { loading: creating }] = useMutation<
        CreateChatMutation,
        CreateChatMutationVariables
    >(CREATE_CHAT, {
        update(cache, { data }) {
            if (data?.insert_chats_one) {
                // Add the new chat to the cache
                const existingChats = cache.readQuery<GetUserChatsQuery>({
                    query: GET_USER_CHATS,
                })

                if (existingChats) {
                    cache.writeQuery({
                        query: GET_USER_CHATS,
                        data: {
                            chats: [
                                {
                                    ...data.insert_chats_one,
                                    messages: [],
                                    messages_aggregate: { aggregate: { count: 0 } }
                                },
                                ...existingChats.chats,
                            ],
                        },
                    })
                }
            }
        },
    })

    // Update chat mutation
    const [updateChatMutation, { loading: updating }] = useMutation<
        UpdateChatMutation,
        UpdateChatMutationVariables
    >(UPDATE_CHAT)

    // Delete chat mutation
    const [deleteChatMutation, { loading: deleting }] = useMutation<
        DeleteChatMutation,
        DeleteChatMutationVariables
    >(DELETE_CHAT, {
        update(cache, { data }, { variables }) {
            if (data?.delete_chats_by_pk && variables?.chatId) {
                // Remove the chat from the cache
                const existingChats = cache.readQuery<GetUserChatsQuery>({
                    query: GET_USER_CHATS,
                })

                if (existingChats) {
                    cache.writeQuery({
                        query: GET_USER_CHATS,
                        data: {
                            chats: existingChats.chats.filter(
                                chat => chat.id !== variables.chatId
                            ),
                        },
                    })
                }
            }
        },
    })

    // Helper functions
    const createChat = async (title?: string) => {
        try {
            const result = await createChatMutation({
                variables: { title },
            })
            return { success: true, chat: result.data?.insert_chats_one }
        } catch (error) {
            console.error('Error creating chat:', error)
            return { success: false, error }
        }
    }

    const updateChat = async (chatId: string, title: string) => {
        try {
            const result = await updateChatMutation({
                variables: { chatId, title },
            })
            return { success: true, chat: result.data?.update_chats_by_pk }
        } catch (error) {
            console.error('Error updating chat:', error)
            return { success: false, error }
        }
    }

    const deleteChat = async (chatId: string) => {
        try {
            const result = await deleteChatMutation({
                variables: { chatId },
            })
            return { success: true, deleted: !!result.data?.delete_chats_by_pk }
        } catch (error) {
            console.error('Error deleting chat:', error)
            return { success: false, error }
        }
    }

    const createChatWithFirstMessage = async (firstMessage: string) => {
        const title = generateChatTitle(firstMessage)
        return createChat(title)
    }

    return {
        // Data
        chats: data?.chats || [],

        // Loading states
        loading,
        creating,
        updating,
        deleting,

        // Error
        error,

        // Actions
        createChat,
        updateChat,
        deleteChat,
        createChatWithFirstMessage,
        refetch,
    }
}

export function useChatsSubscription() {
    const { data, loading, error } = useSubscription<SubscribeToUserChatsSubscription>(
        SUBSCRIBE_TO_USER_CHATS
    )

    return {
        chats: data?.chats || [],
        loading,
        error,
    }
}