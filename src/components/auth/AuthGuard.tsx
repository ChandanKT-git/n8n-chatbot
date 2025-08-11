import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { ROUTES } from '../../constants/routes'

interface AuthGuardProps {
    children: ReactNode
    requireAuth?: boolean
    fallbackPath?: string
}

export function AuthGuard({
    children,
    requireAuth = true,
    fallbackPath
}: AuthGuardProps) {
    const { isLoading, isAuthenticated } = useAuth()
    const location = useLocation()

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
        const redirectTo = fallbackPath || ROUTES.AUTH
        return <Navigate to={redirectTo} state={{ from: location }} replace />
    }

    // If authentication is not required but user is authenticated (e.g., auth pages)
    if (!requireAuth && isAuthenticated) {
        // Check if there's a redirect location from previous navigation
        const from = location.state?.from?.pathname || ROUTES.CHAT
        return <Navigate to={from} replace />
    }

    return <>{children}</>
}