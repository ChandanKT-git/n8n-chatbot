import { createContext, useContext, ReactNode } from 'react'
import { useAuthenticationStatus, useUserData, useSignOut } from '@nhost/react'
import { User } from '../types'

interface AuthContextType {
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean
    error: string | null
    signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
    children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
    const { isLoading, isAuthenticated } = useAuthenticationStatus()
    const userData = useUserData()
    const { signOut } = useSignOut()

    // Transform Nhost user data to our User type
    const user: User | null = userData ? {
        id: userData.id,
        email: userData.email || '',
        created_at: userData.createdAt || new Date().toISOString(),
    } : null

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated,
        error: null, // We'll handle errors in individual auth operations
        signOut,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}