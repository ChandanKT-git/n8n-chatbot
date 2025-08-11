import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ROUTES, getChatRoute, isAuthRoute, isChatRoute } from '../constants/routes'

export function useNavigation() {
    const navigate = useNavigate()
    const location = useLocation()
    const { isAuthenticated } = useAuth()

    const navigateToAuth = () => {
        navigate(ROUTES.AUTH, { replace: true })
    }

    const navigateToChat = (chatId?: string) => {
        // Check if there's a redirect location from AuthGuard
        const from = location.state?.from?.pathname || getChatRoute(chatId)
        navigate(from, { replace: true })
    }

    const navigateToHome = () => {
        if (isAuthenticated) {
            navigate(ROUTES.CHAT, { replace: true })
        } else {
            navigate(ROUTES.AUTH, { replace: true })
        }
    }

    const navigateToSpecificChat = (chatId: string) => {
        navigate(getChatRoute(chatId))
    }

    const navigateBack = () => {
        navigate(-1)
    }

    return {
        navigateToAuth,
        navigateToChat,
        navigateToHome,
        navigateBack,
        navigateToSpecificChat,
        currentPath: location.pathname,
        isOnAuthPage: isAuthRoute(location.pathname),
        isOnChatPage: isChatRoute(location.pathname),
    }
}