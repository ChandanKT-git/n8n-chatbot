// User types
export interface User {
    id: string
    email: string
    created_at: string
}

// Chat types
export interface Chat {
    id: string
    user_id: string
    title?: string
    created_at: string
    updated_at: string
    messages: Message[]
    user: User
}

// Message types
export interface Message {
    id: string
    chat_id: string
    content: string
    is_bot: boolean
    created_at: string
    chat: Chat
}

// API Response types
export interface SendMessageResponse {
    success: boolean
    message?: string
    bot_response?: string
    error?: string
}

// Form types
export interface LoginFormData {
    email: string
    password: string
}

export interface SignupFormData {
    email: string
    password: string
    confirmPassword: string
}

// UI State types
export interface AuthState {
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean
    error: string | null
}

export interface ChatState {
    chats: Chat[]
    activeChat: Chat | null
    messages: Message[]
    isLoading: boolean
    error: string | null
}

export interface MessageState {
    isSending: boolean
    error: string | null
    optimisticMessages: Message[]
}