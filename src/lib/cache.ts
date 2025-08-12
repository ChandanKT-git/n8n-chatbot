import { InMemoryCache, TypePolicies } from '@apollo/client';

// ============================================================================
// APOLLO CLIENT CACHE CONFIGURATION
// ============================================================================

/**
 * Type policies for Apollo Client cache
 */
const typePolicies: TypePolicies = {
    Query: {
        fields: {
            chats: {
                // Merge strategy for chats query
                merge(existing = [], incoming) {
                    return incoming;
                },
            },
            messages: {
                // Merge strategy for messages query
                merge(existing = [], incoming) {
                    return incoming;
                },
            },
        },
    },

    Chat: {
        fields: {
            messages: {
                // Merge messages in chronological order
                merge(existing = [], incoming) {
                    const existingIds = new Set(existing.map((msg: any) => msg.__ref || msg.id));
                    const newMessages = incoming.filter((msg: any) => {
                        const id = msg.__ref || msg.id;
                        return !existingIds.has(id);
                    });

                    return [...existing, ...newMessages].sort((a: any, b: any) => {
                        const aTime = new Date(a.created_at || 0).getTime();
                        const bTime = new Date(b.created_at || 0).getTime();
                        return aTime - bTime;
                    });
                },
            },
            messages_aggregate: {
                // Always use the latest aggregate data
                merge(existing, incoming) {
                    return incoming;
                },
            },
        },
    },

    Message: {
        fields: {
            // Message fields are immutable, so no special merge logic needed
        },
    },

    Subscription: {
        fields: {
            chats: {
                // For subscription data, always use the latest
                merge(existing, incoming) {
                    return incoming;
                },
            },
            messages: {
                // For subscription data, always use the latest
                merge(existing, incoming) {
                    return incoming;
                },
            },
        },
    },
};

/**
 * Create configured Apollo Client cache
 */
export function createApolloCache(): InMemoryCache {
    return new InMemoryCache({
        typePolicies,

        // Cache configuration
        addTypename: true,

        // Data ID from object function
        dataIdFromObject: (object: any) => {
            switch (object.__typename) {
                case 'chats':
                    return `Chat:${object.id}`;
                case 'messages':
                    return `Message:${object.id}`;
                default:
                    return object.id ? `${object.__typename}:${object.id}` : undefined;
            }
        },
    });
}

/**
 * Cache helper functions
 */
export const cacheHelpers = {
    /**
     * Evict a chat from cache
     */
    evictChat: (cache: InMemoryCache, chatId: string) => {
        cache.evict({
            id: cache.identify({ __typename: 'chats', id: chatId }),
        });
        cache.gc();
    },

    /**
     * Evict a message from cache
     */
    evictMessage: (cache: InMemoryCache, messageId: string) => {
        cache.evict({
            id: cache.identify({ __typename: 'messages', id: messageId }),
        });
        cache.gc();
    },

    /**
     * Clear all chat data from cache
     */
    clearChatData: (cache: InMemoryCache) => {
        cache.evict({ fieldName: 'chats' });
        cache.evict({ fieldName: 'messages' });
        cache.gc();
    },

    /**
     * Update chat in cache
     */
    updateChatInCache: (
        cache: InMemoryCache,
        chatId: string,
        updates: Partial<any>
    ) => {
        const chatRef = cache.identify({ __typename: 'chats', id: chatId });
        if (chatRef) {
            cache.modify({
                id: chatRef,
                fields: {
                    ...Object.keys(updates).reduce((acc, key) => {
                        acc[key] = () => updates[key];
                        return acc;
                    }, {} as any),
                },
            });
        }
    },

    /**
     * Add message to chat in cache
     */
    addMessageToCache: (
        cache: InMemoryCache,
        chatId: string,
        message: any
    ) => {
        const chatRef = cache.identify({ __typename: 'chats', id: chatId });
        if (chatRef) {
            cache.modify({
                id: chatRef,
                fields: {
                    messages: (existingMessages = []) => {
                        const messageRef = cache.writeFragment({
                            data: message,
                            fragment: gql`
                fragment NewMessage on messages {
                  id
                  content
                  is_bot
                  created_at
                  chat_id
                }
              `,
                        });
                        return [...existingMessages, messageRef];
                    },
                },
            });
        }
    },
};

// Re-export gql for fragment usage
import { gql } from '@apollo/client';