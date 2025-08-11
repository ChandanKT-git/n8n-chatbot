// Generated GraphQL Types
// This file contains TypeScript types for GraphQL operations

// =============================================
// BASE TYPES
// =============================================

export interface Chat {
    id: string
    user_id: string
    title?: string | null
    created_at: string
    updated_at: string
}

export interface Message {
    id: string
    chat_id: string
    content: string
    is_bot: boolean
    created_at: string
}

export interface ChatWithMessages extends Chat {
    messages: Message[]
}

export interface ChatWithLastMessage extends Chat {
    messages: Message[]
    messages_aggregate: {
        aggregate: {
            count: number
        }
    }
}

// =============================================
// QUERY TYPES
// =============================================

export interface GetUserChatsQuery {
    chats: ChatWithLastMessage[]
}

export interface GetChatMessagesQuery {
    messages: Message[]
}

export interface GetChatMessagesQueryVariables {
    chatId: string
}

export interface GetChatWithMessagesQuery {
    chats_by_pk?: ChatWithMessages | null
}

export interface GetChatWithMessagesQueryVariables {
    chatId: string
}

// =============================================
// MUTATION TYPES
// =============================================

export interface CreateChatMutation {
    insert_chats_one?: Chat | null
}

export interface CreateChatMutationVariables {
    title?: string | null
}

export interface UpdateChatMutation {
    update_chats_by_pk?: Chat | null
}

export interface UpdateChatMutationVariables {
    chatId: string
    title: string
}

export interface DeleteChatMutation {
    delete_chats_by_pk?: { id: string } | null
}

export interface DeleteChatMutationVariables {
    chatId: string
}

export interface SendMessageMutation {
    insert_messages_one?: Message | null
}

export interface SendMessageMutationVariables {
    chatId: string
    content: string
    isBot?: boolean
}

export interface UpdateMessageMutation {
    update_messages_by_pk?: Message | null
}

export interface UpdateMessageMutationVariables {
    messageId: string
    content: string
}

export interface DeleteMessageMutation {
    delete_messages_by_pk?: { id: string } | null
}

export interface DeleteMessageMutationVariables {
    messageId: string
}

// =============================================
// SUBSCRIPTION TYPES
// =============================================

export interface SubscribeToChatMessagesSubscription {
    messages: Message[]
}

export interface SubscribeToChatMessagesSubscriptionVariables {
    chatId: string
}

export interface SubscribeToUserChatsSubscription {
    chats: ChatWithLastMessage[]
}

// =============================================
// ACTION TYPES
// =============================================

export interface SendMessageActionResponse {
    success: boolean
    message?: string | null
    bot_response?: string | null
}

export interface SendMessageActionMutation {
    sendMessage?: SendMessageActionResponse | null
}

export interface SendMessageActionMutationVariables {
    chatId: string
    content: string
}

// =============================================
// UTILITY TYPES
// =============================================

export type ChatSortField = 'created_at' | 'updated_at' | 'title'
export type MessageSortField = 'created_at'
export type SortDirection = 'asc' | 'desc'

export interface ChatFilters {
    title?: string
    created_after?: string
    created_before?: string
}

export interface MessageFilters {
    content?: string
    is_bot?: boolean
    created_after?: string
    created_before?: string
}

// =============================================
// ERROR TYPES
// =============================================

export interface GraphQLError {
    message: string
    locations?: Array<{
        line: number
        column: number
    }>
    path?: Array<string | number>
    extensions?: {
        code?: string
        path?: string
        [key: string]: any
    }
}

export interface GraphQLResponse<T> {
    data?: T
    errors?: GraphQLError[]
    extensions?: {
        [key: string]: any
    }
}

// =============================================
// APOLLO CLIENT TYPES
// =============================================

export interface QueryOptions<TVariables = {}> {
    variables?: TVariables
    fetchPolicy?: 'cache-first' | 'cache-and-network' | 'network-only' | 'cache-only' | 'no-cache' | 'standby'
    errorPolicy?: 'none' | 'ignore' | 'all'
    notifyOnNetworkStatusChange?: boolean
}

export interface MutationOptions<TData, TVariables = {}> {
    variables?: TVariables
    optimisticResponse?: TData
    update?: (cache: any, result: { data?: TData }) => void
    onCompleted?: (data: TData) => void
    onError?: (error: any) => void
}

export interface SubscriptionOptions<TVariables = {}> {
    variables?: TVariables
    onSubscriptionData?: (options: { subscriptionData: { data?: any } }) => void
    onSubscriptionComplete?: () => void
}