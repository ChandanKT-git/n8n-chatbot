// Application routes
export const ROUTES = {
    // Public routes
    AUTH: '/auth',

    // Protected routes
    CHAT: '/chat',
    CHAT_CONVERSATION: '/chat/:chatId',

    // Root
    ROOT: '/',
} as const

// Route helpers
export const getRoutes = () => ROUTES

export const getChatRoute = (chatId?: string) => {
    return chatId ? `/chat/${chatId}` : ROUTES.CHAT
}

export const isAuthRoute = (pathname: string) => {
    return pathname === ROUTES.AUTH
}

export const isChatRoute = (pathname: string) => {
    return pathname.startsWith(ROUTES.CHAT)
}

export const isProtectedRoute = (pathname: string) => {
    return isChatRoute(pathname)
}