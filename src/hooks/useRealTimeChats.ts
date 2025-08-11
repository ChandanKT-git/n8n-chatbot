import { useEffect, useState } from 'react'
import { useSubscription } from '@apollo/client'
import { SUBSCRIBE_TO_USER_CHATS } from '../graphql/schema'
import { SubscribeToUserChatsSubscription, ChatWithLastMessage } from '../graphql/types'

export function useRealTimeChats() {
    const [chats, setChats] = useState<ChatWithLastMessage[]>([])
    const [isConnected, setIsConnected] = useState(false)

    const { data, loading, error } = useSubscription<SubscribeToUserChatsSubscription>(
        SUBSCRIBE_TO_USER_CHATS,
        {
            onSubscriptionData: ({ subscriptionData }) => {
                if (subscriptionData.data?.chats) {
                    setChats(subscriptionData.data.chats)
                    setIsConnected(true)
                }
            },
            onSubscriptionComplete: () => {
                console.log('Chat subscription completed')
                setIsConnected(false)
            },
            shouldResubscribe: true,
        }
    )

    useEffect(() => {
        if (data?.chats) {
            setChats(data.chats)
            setIsConnected(true)
        }
    }, [data])

    useEffect(() => {
        if (error) {
            console.error('Chat subscription error:', error)
            setIsConnected(false)
        }
    }, [error])

    return {
        chats,
        loading,
        error,
        isConnected,
    }
}

export function useRealTimeChatUpdates() {
    const [newChatNotifications, setNewChatNotifications] = useState<string[]>([])
    const [updatedChats, setUpdatedChats] = useState<Set<string>>(new Set())

    const { chats, loading, error, isConnected } = useRealTimeChats()

    useEffect(() => {
        // Track new chats
        const currentChatIds = new Set(chats.map(chat => chat.id))
        const previousChatIds = new Set(updatedChats)

        const newChats = chats.filter(chat => !previousChatIds.has(chat.id))

        if (newChats.length > 0) {
            setNewChatNotifications(prev => [
                ...prev,
                ...newChats.map(chat => chat.id)
            ])
        }

        setUpdatedChats(currentChatIds)
    }, [chats, updatedChats])

    const clearNotification = (chatId: string) => {
        setNewChatNotifications(prev => prev.filter(id => id !== chatId))
    }

    const clearAllNotifications = () => {
        setNewChatNotifications([])
    }

    return {
        chats,
        loading,
        error,
        isConnected,
        newChatNotifications,
        hasNewChats: newChatNotifications.length > 0,
        clearNotification,
        clearAllNotifications,
    }
}