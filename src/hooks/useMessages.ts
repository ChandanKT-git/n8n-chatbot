import { useQuery, useMutation, useSubscription } from '@apollo/client'
import {
    GET_CHAT_MESSAGES,
    SEND_MESSAGE,
    UPDATE_MESSAGE,
    DELETE_MESSAGE,
    SUBSCRIBE_TO_CHAT_MESSAGES,
    GET_USER_CHATS
} from '../graphql/schema'
import {
    GetChatMessagesQuery,
    GetChatMessagesQueryVariables,
    SendMessageMutation,
    SendMessageMutationVariables,
    UpdateMessageMutation,
    UpdateMessageMutationVariables,
    DeleteMessageMutation,
    DeleteMessageMutationVariables,
    SubscribeToChatMessagesSubscription,
    SubscribeToChatMessagesSubscriptionVariables,
    GetUserChatsQuery
} from '../graphql/types'

export function useMessages(chatId: string) {
    // Query for chat messages
    const {
        data,
        loading,
        error,
        refetch
    } = useQuery<GetChatMessagesQuery, GetChatMessagesQueryVariables>(
        GET_CHAT_MESSAGES,
        {
            variables: { chatId },
            skip: !chatId,
            errorPolicy: 'all',
            notifyOnNetworkStatusChange: true,
        }
    )

    // Send message mutation
    const [sendMessageMutation, { loading: sending }] = useMutation<
        SendMessageMutation,
        SendMessageMutationVariables
    >(SEND_MESSAGE, {
        update(cache, { data }, { variables }) {
            if (data?.insert_messages_one && variables?.chatId) {
                // Add the new message to the cache
                const existingMessages = cache.readQuery<
                    GetChatMessagesQuery,
                    GetChatMessagesQueryVariables
                >({
                    query: GET_CHAT_MESSAGES,
                    variables: { chatId: variables.chatId },
                })

                if (existingMessages) {
                    cache.writeQuery({
                        query: GET_CHAT_MESSAGES,
                        variables: { chatId: variables.chatId },
                        data: {
                            messages: [...existingMessages.messages, data.insert_messages_one],
                        },
                    })
                }

                // Update the chat's updated_at timestamp in the chats list
                const existingChats = cache.readQuery<GetUserChatsQuery>({
                    query: GET_USER_CHATS,
                })

                if (existingChats) {
                    const updatedChats = existingChats.chats.map(chat => {
                        if (chat.id === variables.chatId) {
                            return {
                                ...chat,
                                updated_at: data.insert_messages_one.created_at,
                                messages: [data.insert_messages_one],
                                messages_aggregate: {
                                    aggregate: {
                                        count: chat.messages_aggregate.aggregate.count + 1
                                    }
                                }
                            }
                        }
                        return chat
                    })

                    // Sort chats by updated_at
                    updatedChats.sort((a, b) =>
                        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
                    )

                    cache.writeQuery({
                        query: GET_USER_CHATS,
                        data: { chats: updatedChats },
                    })
                }
            }
        },
    })

    // Update message mutation
    const [updateMessageMutation, { loading: updating }] = useMutation<
        UpdateMessageMutation,
        UpdateMessageMutationVariables
    >(UPDATE_MESSAGE)

    // Delete message mutation
    const [deleteMessageMutation, { loading: deleting }] = useMutation<
        DeleteMessageMutation,
        DeleteMessageMutationVariables
    >(DELETE_MESSAGE, {
        update(cache, { data }, { variables }) {
            if (data?.delete_messages_by_pk && variables?.messageId) {
                // Remove the message from the cache
                const existingMessages = cache.readQuery<
                    GetChatMessagesQuery,
                    GetChatMessagesQueryVariables
                >({
                    query: GET_CHAT_MESSAGES,
                    variables: { chatId },
                })

                if (existingMessages) {
                    cache.writeQuery({
                        query: GET_CHAT_MESSAGES,
                        variables: { chatId },
                        data: {
                            messages: existingMessages.messages.filter(
                                message => message.id !== variables.messageId
                            ),
                        },
                    })
                }
            }
        },
    })

    // Helper functions
    const sendMessage = async (content: string, isBot: boolean = false) => {
        if (!chatId) {
            return { success: false, error: 'No chat ID provided' }
        }

        try {
            const result = await sendMessageMutation({
                variables: { chatId, content, isBot },
            })
            return { success: true, message: result.data?.insert_messages_one }
        } catch (error) {
            console.error('Error sending message:', error)
            return { success: false, error }
        }
    }

    const updateMessage = async (messageId: string, content: string) => {
        try {
            const result = await updateMessageMutation({
                variables: { messageId, content },
            })
            return { success: true, message: result.data?.update_messages_by_pk }
        } catch (error) {
            console.error('Error updating message:', error)
            return { success: false, error }
        }
    }

    const deleteMessage = async (messageId: string) => {
        try {
            const result = await deleteMessageMutation({
                variables: { messageId },
            })
            return { success: true, deleted: !!result.data?.delete_messages_by_pk }
        } catch (error) {
            console.error('Error deleting message:', error)
            return { success: false, error }
        }
    }

    return {
        // Data
        messages: data?.messages || [],

        // Loading states
        loading,
        sending,
        updating,
        deleting,

        // Error
        error,

        // Actions
        sendMessage,
        updateMessage,
        deleteMessage,
        refetch,
    }
}

export function useMessagesSubscription(chatId: string) {
    const { data, loading, error } = useSubscription<
        SubscribeToChatMessagesSubscription,
        SubscribeToChatMessagesSubscriptionVariables
    >(SUBSCRIBE_TO_CHAT_MESSAGES, {
        variables: { chatId },
        skip: !chatId,
    })

    return {
        messages: data?.messages || [],
        loading,
        error,
    }
}