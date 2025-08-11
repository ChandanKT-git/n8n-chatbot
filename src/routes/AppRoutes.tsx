import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { AuthLayout, AuthGuard } from '../components/auth'
import { ROUTES } from '../constants/routes'

// Placeholder components - will be implemented in later tasks
const ChatPage = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Chatbot App!</h1>
            <p className="text-gray-600 mb-8">Your chat interface is being built. Stay tuned!</p>
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
                <h2 className="text-xl font-semibold mb-4">What's Working:</h2>
                <ul className="text-left space-y-2">
                    <li className="flex items-center">
                        <span className="text-green-500 mr-2">✅</span>
                        Authentication System
                    </li>
                    <li className="flex items-center">
                        <span className="text-green-500 mr-2">✅</span>
                        Database Schema
                    </li>
                    <li className="flex items-center">
                        <span className="text-green-500 mr-2">✅</span>
                        GraphQL Operations
                    </li>
                    <li className="flex items-center">
                        <span className="text-yellow-500 mr-2">🚧</span>
                        Chat Interface (In Progress)
                    </li>
                    <li className="flex items-center">
                        <span className="text-yellow-500 mr-2">🚧</span>
                        AI Integration (Coming Soon)
                    </li>
                </ul>
            </div>
        </div>
    </div>
)

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