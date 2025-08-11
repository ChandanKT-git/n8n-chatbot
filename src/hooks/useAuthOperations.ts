import { useState } from 'react'
import { useSignInEmailPassword, useSignUpEmailPassword } from '@nhost/react'
import { LoginFormData, SignupFormData } from '../types'
import { getErrorMessage } from '../utils'

export function useAuthOperations() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { signInEmailPassword } = useSignInEmailPassword()
    const { signUpEmailPassword } = useSignUpEmailPassword()

    const login = async (data: LoginFormData) => {
        setIsLoading(true)
        setError(null)

        try {
            const result = await signInEmailPassword(data.email, data.password)

            if (result.error) {
                throw new Error(result.error.message)
            }

            // Navigation will be handled by AuthGuard after successful login
            return { success: true, user: result.user }
        } catch (err) {
            const errorMessage = getErrorMessage(err)
            setError(errorMessage)
            return { success: false, error: errorMessage }
        } finally {
            setIsLoading(false)
        }
    }

    const signup = async (data: SignupFormData) => {
        setIsLoading(true)
        setError(null)

        try {
            // Validate passwords match
            if (data.password !== data.confirmPassword) {
                throw new Error('Passwords do not match')
            }

            const result = await signUpEmailPassword(data.email, data.password)

            if (result.error) {
                throw new Error(result.error.message)
            }

            return { success: true, needsEmailVerification: !result.user }
        } catch (err) {
            const errorMessage = getErrorMessage(err)
            setError(errorMessage)
            return { success: false, error: errorMessage }
        } finally {
            setIsLoading(false)
        }
    }

    const clearError = () => setError(null)

    return {
        login,
        signup,
        isLoading,
        error,
        clearError,
    }
}