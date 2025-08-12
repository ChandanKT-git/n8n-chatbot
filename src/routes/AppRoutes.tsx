import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { AuthLayout, AuthGuard } from '../components/auth'
import { ROUTES } from '../constants/routes'

import { ChatLayout } from '../components/chat'

const ChatPage = () => <ChatLayout />

export function AppRoutes() {
    const { isLoading, isAuthenticated } = useAuth()

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    return (
        <Routes>
            {/* Authentication Routes */}
            <Route
                path={ROUTES.AUTH}
                element={
                    <AuthGuard requireAuth={false}>
                        <AuthLayout />
                    </AuthGuard>
                }
            />

            {/* Protected Chat Routes */}
            <Route
                path={`${ROUTES.CHAT}/*`}
                element={
                    <AuthGuard requireAuth={true}>
                        <ChatPage />
                    </AuthGuard>
                }
            />

            {/* Root redirect */}
            <Route
                path={ROUTES.ROOT}
                element={
                    isAuthenticated ?
                        <Navigate to={ROUTES.CHAT} replace /> :
                        <Navigate to={ROUTES.AUTH} replace />
                }
            />

            {/* Catch all - redirect to appropriate page */}
            <Route
                path="*"
                element={
                    isAuthenticated ?
                        <Navigate to={ROUTES.CHAT} replace /> :
                        <Navigate to={ROUTES.AUTH} replace />
                }
            />
        </Routes>
    )
}