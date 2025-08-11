import { useAuth } from '../contexts/AuthContext'
import { useAuthOperations } from './useAuthOperations'

/**
 * Main authentication hook that combines auth context and operations
 * This is the primary hook components should use for authentication
 */
export function useAuthentication() {
    const authContext = useAuth()
    const authOperations = useAuthOperations()

    return {
        // Auth state from context
        ...authContext,

        // Auth operations
        ...authOperations,
    }
}