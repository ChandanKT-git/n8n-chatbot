import { InMemoryCache, Reference } from '@apollo/client'
import { GET_USER_CHATS, GET_CHAT_MESSAGES } from '../graphql/schema'
import {
    GetUserChatsQuery,
    GetChatMessagesQuery,
    Chat,
    Message,
    ChatWithLastMessage
} from '../graphql/types'

// Cache configuration with optimized policies
export const createApolloCache = () => {
    return new InMemoryCache({
        typePolicies: {
            // Chat type policies
            chats: {
                fields: {
                    messages: {
                        merge(existing = [], incoming: any[]) {
                            return incoming
                        },
                    },
                    messages_aggregate: {
                        merge(existing, incoming) {
                            return incoming
                        },
                    },
                },
            },

            // Message type policies
            messages: {
                fields: {
                    // No special merge needed for messages as they're immutable
                },
            },

            // Query type policies
            Query: {
                fields: {
                    chats: {
                        merge(existing: any[] = [], incoming: any[]) {
                            // Always use incoming data for chats to ensure real-time updates
                            return incoming
                        },
                    },
                    messages: {
                        merge(existing: any[] = [], incoming: any[], { args }) {
                            // For messages, we want to merge based on chat_id
                            if (args?.where?.chat_id) {
                                return incoming
                            }
                            return [...existing, ...incoming]
                        },
                    },
                },
            },

            // Subscription type policies
            Subscription: {
                fields: {
                    chats: {
                        merge(existing, incoming) {
                            return incoming
                        },
                    },
                    messages: {
                        merge(existing, incoming) {
                            return incoming
                        },
                    },
                },
            },
        },
    })
}

// Cache utility functions
export class CacheManager {
    constructor(private cache: InMemoryCache) { }

    // Chat cache operations
    getCachedChats(): ChatWithLastMessage[] {
        try {
            const data = this.cache.readQuery<GetUserChatsQuery>({
                query: GET_USER_CHATS,
            })
            return data?.chats || []
        } catch {
            return []
        }
    }

    updateChatInCache(updatedChat: Chat) {
        const existingChats = this.getCachedChats()
        const updatedChats = existingChats.map(chat =>
            chat.id === updatedChat.id ? { ...chat, ...updatedChat } : chat
        )

        this.cache.writeQuery({
            query: GET_USER_CHATS,
            data: { chats: updatedChats },
        })
    }

    addChatToCache(newChat: ChatWithLastMessage) {
        const existingChats = this.getCachedChats()
        const updatedChats = [newChat, ...existingChats]

        this.cache.writeQuery({
            query: GET_USER_CHATS,
            data: { chats: updatedChats },
        })
    }

    removeChatFromCache(chatId: string) {
        const existingChats = this.getCachedChats()
        const updatedChats = existingChats.filter(chat => chat.id !== chatId)

        this.cache.writeQuery({
            query: GET_USER_CHATS,
            data: { chats: updatedChats },
        })

        // Also remove messages for this chat
        this.cache.evict({
            id: this.cache.identify({ __typename: 'messages', chat_id: chatId })
        })
    }

    // Message cache operations
    getCachedMessages(chatId: string): Message[] {
        try {
            const data = this.cache.readQuery<GetChatMessagesQuery>({
                query: GET_CHAT_MESSAGES,
                variables: { chatId },
            })
            return data?.messages || []
        } catch {
            return []
        }
    }

    addMessageToCache(chatId: string, newMessage: Message) {
        const existingMessages = this.getCachedMessages(chatId)
        const updatedMessages = [...existingMessages, newMessage]

        this.cache.writeQuery({
            query: GET_CHAT_MESSAGES,
            variables: { chatId },
            data: { messages: updatedMessages },
        })

        // Update the chat's last message and timestamp
        this.updateChatLastMessage(chatId, newMessage)
    }

    updateMessageInCache(chatId: string, updatedMessage: Message) {
        const existingMessages = this.getCachedMessages(chatId)
        const updatedMessages = existingMessages.map(message =>
            message.id === updatedMessage.id ? updatedMessage : message
        )

        this.cache.writeQuery({
            query: GET_CHAT_MESSAGES,
            variables: { chatId },
            data: { messages: updatedMessages },
        })
    }

    removeMessageFromCache(chatId: string, messageId: string) {
        const existingMessages = this.getCachedMessages(chatId)
        const updatedMessages = existingMessages.filter(message => message.id !== messageId)

        this.cache.writeQuery({
            query: GET_CHAT_MESSAGES,
            variables: { chatId },
            data: { messages: updatedMessages },
        })
    }

    private updateChatLastMessage(chatId: string, lastMessage: Message) {
        const existingChats = this.getCachedChats()
        const updatedChats = existingChats.map(chat => {
            if (chat.id === chatId) {
                return {
                    ...chat,
                    updated_at: lastMessage.created_at,
                    messages: [lastMessage],
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

        this.cache.writeQuery({
            query: GET_USER_CHATS,
            data: { chats: updatedChats },
        })
    }

    // Optimistic updates
    addOptimisticMessage(chatId: string, content: string, tempId: string): Message {
        const optimisticMessage: Message = {
            id: tempId,
            chat_id: chatId,
            content,
            is_bot: false,
            created_at: new Date().toISOString(),
        }

        this.addMessageToCache(chatId, optimisticMessage)
        return optimisticMessage
    }

    removeOptimisticMessage(chatId: string, tempId: string) {
        this.removeMessageFromCache(chatId, tempId)
    }

    // Cache cleanup
    clearChatCache() {
        this.cache.evict({ fieldName: 'chats' })
        this.cache.gc()
    }

    clearMessageCache(chatId?: string) {
        if (chatId) {
            this.cache.evict({
                id: this.cache.identify({ __typename: 'messages', chat_id: chatId })
            })
        } else {
            this.cache.evict({ fieldName: 'messages' })
        }
        this.cache.gc()
    }

    clearAllCache() {
        this.cache.clearStore()
    }

    // Cache inspection (for debugging)
    inspectCache() {
        return {
            chats: this.getCachedChats(),
            cacheSize: Object.keys(this.cache.extract()).length,
        }
    }
}