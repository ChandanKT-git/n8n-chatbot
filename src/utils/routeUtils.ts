import { ROUTES, isProtectedRoute } from '../constants/routes'

/**
 * Determines the appropriate redirect path based on authentication status
 */
export const getRedirectPath = (
    isAuthenticated: boolean,
    currentPath: string,
    intendedPath?: string
): string => {
    // If user is authenticated
    if (isAuthenticated) {
        // If they're trying to access auth page, redirect to chat
        if (currentPath === ROUTES.AUTH) {
            return intendedPath || ROUTES.CHAT
        }
        // If they have an intended path and it's protected, go there
        if (intendedPath && isProtectedRoute(intendedPath)) {
            return intendedPath
        }
        // Default to chat for authenticated users
        return ROUTES.CHAT
    }

    // If user is not authenticated
    // Always redirect to auth page
    return ROUTES.AUTH
}

/**
 * Checks if a route transition is allowed
 */
export const isRouteTransitionAllowed = (
    isAuthenticated: boolean,
    fromPath: string,
    toPath: string
): boolean => {
    // Always allow transitions to auth page
    if (toPath === ROUTES.AUTH) {
        return true
    }

    // Protected routes require authentication
    if (isProtectedRoute(toPath)) {
        return isAuthenticated
    }

    // All other transitions are allowed
    return true
}

/**
 * Gets the default route for a user based on their authentication status
 */
export const getDefaultRoute = (isAuthenticated: boolean): string => {
    return isAuthenticated ? ROUTES.CHAT : ROUTES.AUTH
}