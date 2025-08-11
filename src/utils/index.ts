import { format, formatDistanceToNow } from 'date-fns'

// Date formatting utilities
export const formatDate = (date: string | Date) => {
    return format(new Date(date), 'MMM d, yyyy')
}

export const formatTime = (date: string | Date) => {
    return format(new Date(date), 'h:mm a')
}

export const formatRelativeTime = (date: string | Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
}

// String utilities
export const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
}

export const generateChatTitle = (firstMessage: string) => {
    return truncateText(firstMessage, 50) || 'New Chat'
}

// Validation utilities
export const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

export const isValidPassword = (password: string) => {
    return password.length >= 8
}

// Error handling utilities
export const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message
    }
    if (typeof error === 'string') {
        return error
    }
    return 'An unexpected error occurred'
}

// Local storage utilities
export const storage = {
    get: (key: string) => {
        try {
            const item = localStorage.getItem(key)
            return item ? JSON.parse(item) : null
        } catch {
            return null
        }
    },
    set: (key: string, value: any) => {
        try {
            localStorage.setItem(key, JSON.stringify(value))
        } catch {
            // Silently fail if localStorage is not available
        }
    },
    remove: (key: string) => {
        try {
            localStorage.removeItem(key)
        } catch {
            // Silently fail if localStorage is not available
        }
    },
}
// Route utilities
export * from './routeUtils'