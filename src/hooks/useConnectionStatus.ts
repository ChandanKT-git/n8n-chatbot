import { useState, useEffect } from 'react'
import { useApolloClient } from '@apollo/client'

export function useConnectionStatus() {
    const [isOnline, setIsOnline] = useState(navigator.onLine)
    const [isConnected, setIsConnected] = useState(true)
    const [reconnectAttempts, setReconnectAttempts] = useState(0)
    const [lastConnected, setLastConnected] = useState<Date>(new Date())

    const client = useApolloClient()

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true)
            setReconnectAttempts(0)
        }

        const handleOffline = () => {
            setIsOnline(false)
            setIsConnected(false)
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    useEffect(() => {
        // Monitor Apollo Client network status
        const subscription = client.onResetStore(() => {
            setIsConnected(false)
            setReconnectAttempts(prev => prev + 1)
        })

        return () => subscription()
    }, [client])

    const reconnect = async () => {
        try {
            await client.resetStore()
            setIsConnected(true)
            setLastConnected(new Date())
            setReconnectAttempts(0)
        } catch (error) {
            console.error('Reconnection failed:', error)
            setReconnectAttempts(prev => prev + 1)
        }
    }

    return {
        isOnline,
        isConnected,
        reconnectAttempts,
        lastConnected,
        reconnect,
        status: isOnline && isConnected ? 'connected' : 'disconnected',
    }
}

export function useReconnectStrategy() {
    const { isOnline, isConnected, reconnectAttempts, reconnect } = useConnectionStatus()
    const [isReconnecting, setIsReconnecting] = useState(false)

    useEffect(() => {
        if (!isConnected && isOnline && reconnectAttempts < 5) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000) // Exponential backoff

            setIsReconnecting(true)
            const timeout = setTimeout(async () => {
                await reconnect()
                setIsReconnecting(false)
            }, delay)

            return () => {
                clearTimeout(timeout)
                setIsReconnecting(false)
            }
        }
    }, [isConnected, isOnline, reconnectAttempts, reconnect])

    return {
        isOnline,
        isConnected,
        isReconnecting,
        reconnectAttempts,
        manualReconnect: reconnect,
    }
}