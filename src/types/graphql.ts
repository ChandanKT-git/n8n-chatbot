// ============================================================================
// BASIC TYPES
// ============================================================================

export interface Chat {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
    user_id: string;
}

export interface Message {
    id: string;
    chat_id: string;
    content: string;
    is_bot: boolean;
    created_at: string;
}

// ============================================================================
// QUERY RESPONSE TYPES
// ============================================================================

export interface ChatWithPreview extends Chat {
    messages_aggregate: {
        aggregate: {
            count: number;
        };
    };
    messages: Array<{
        content: string;
        is_bot: boolean;
        created_at: string;
    }>;
}

export interface ChatWithMessages extends Chat {
    messages: Message[];
}

export interface GetUserChatsResponse {
    chats: ChatWithPreview[];
}

export interface GetChatMessagesResponse {
    messages: Message[];
}

export interface GetChatWithMessagesResponse {
    chats_by_pk: ChatWithMessages | null;
}

// ============================================================================
// MUTATION RESPONSE TYPES
// ============================================================================

export interface CreateChatResponse {
    insert_chats_one: Chat;
}

export interface UpdateChatTitleResponse {
    update_chats_by_pk: Chat;
}

export interface SendMessageResponse {
    insert_messages_one: Message;
}

export interface UpdateChatTimestampResponse {
    update_chats_by_pk: {
        id: string;
        updated_at: string;
    };
}

// ============================================================================
// MUTATION VARIABLES TYPES
// ============================================================================

export interface CreateChatVariables {
    title: string;
}

export interface UpdateChatTitleVariables {
    chatId: string;
    title: string;
}

export interface SendMessageVariables {
    chatId: string;
    content: string;
    isBot?: boolean;
}

export interface UpdateChatTimestampVariables {
    chatId: string;
}

export interface GetChatMessagesVariables {
    chatId: string;
}

export interface GetChatWithMessagesVariables {
    chatId: string;
}

// ============================================================================
// SUBSCRIPTION RESPONSE TYPES
// ============================================================================

export interface SubscribeToChatMessagesResponse {
    messages: Message[];
}

export interface SubscribeToUserChatsResponse {
    chats: ChatWithPreview[];
}

export interface SubscribeToNewMessagesResponse {
    messages: Message[];
}

// ============================================================================
// SUBSCRIPTION VARIABLES TYPES
// ============================================================================

export interface SubscribeToChatMessagesVariables {
    chatId: string;
}

export interface SubscribeToNewMessagesVariables {
    chatId: string;
}