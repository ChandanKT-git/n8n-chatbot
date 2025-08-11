import { useEffect, useState, useRef } from 'react'
import { useSubscription } from '@apollo/client'
import { SUBSCRIBE_TO_CHAT_MESSAGES } from '../graphql/schema'
import {
    SubscribeToChatMessagesSubscription,
    SubscribeToChatMessagesSubscriptionVariables,
    Message
} from '../graphql/types'

export function useRealTimeMessages(chatId: string) {
    const [messages, setMessages] = useState<Message[]>([])
    const [isConnected, setIsConnected] = useState(false)
    const [newMessageCount, setNewMessageCount] = useState(0)
    const previousMessagesRef = useRef<Message[]>([])

    const { data, loading, error } = useSubscription<
        SubscribeToChatMessagesSubscription,
        SubscribeToChatMessagesSubscriptionVariables
    >(SUBSCRIBE_TO_CHAT_MESSAGES, {
        variables: { chatId },
        skip: !chatId,
        onSubscriptionData: ({ subscriptionData }) => {
            if (subscriptionData.data?.messages) {
                const newMessages = subscriptionData.data.messages
                setMessages(newMessages)
                setIsConnected(true)

                // Count new messages
                const previousCount = previousMessagesRef.current.length
                const currentCount = newMessages.length
                if (currentCount > previousCount) {
                    setNewMessageCount(prev => prev + (currentCount - previousCount))
                }

                previousMessagesRef.current = newMessages
            }
        },
        onSubscriptionComplete: () => {
            console.log('Message subscription completed')
            setIsConnected(false)
        },
        shouldResubscribe: true,
    })

    useEffect(() => {
        if (data?.messages) {
            setMessages(data.messages)
            setIsConnected(true)
        }
    }, [data])

    useEffect(() => {
        if (error) {
            console.error('Message subscription error:', error)
            setIsConnected(false)
        }
    }, [error])

    // Reset when chat changes
    useEffect(() => {
        setMessages([])
        setNewMessageCount(0)
        previousMessagesRef.current = []
    }, [chatId])

    const markMessagesAsRead = () => {
        setNewMessageCount(0)
    }

    return {
        messages,
        loading,
        error,
        isConnected,
        newMessageCount,
        hasNewMessages: newMessageCount > 0,
        markMessagesAsRead,
    }
}

export function useMessageNotifications(chatId: string) {
    const { messages, newMessageCount, hasNewMessages, markMessagesAsRead } = useRealTimeMessages(chatId)
    const [lastBotMessage, setLastBotMessage] = useState<Message | null>(null)
    const [isTyping, setIsTyping] = useState(false)

    useEffect(() => {
        // Track the latest bot message
        const botMessages = messages.filter(msg => msg.is_bot)
        if (botMessages.length > 0) {
            const latest = botMessages[botMessages.length - 1]
            setLastBotMessage(latest)
        }
    }, [messages])

    useEffect(() => {
        // Simulate typing indicator for bot responses
        const userMessages = messages.filter(msg => !msg.is_bot)
        const botMessages = messages.filter(msg => msg.is_bot)

        // If there are more user messages than bot messages, show typing
        if (userMessages.length > botMessages.length) {
            setIsTyping(true)

            // Auto-hide typing after 30 seconds (in case bot doesn't respond)
            const timeout = setTimeout(() => {
                setIsTyping(false)
            }, 30000)

            return () => clearTimeout(timeout)
        } else {
            setIsTyping(false)
        }
    }, [messages])

    return {
        messages,
        newMessageCount,
        hasNewMessages,
        lastBotMessage,
        isTyping,
        markMessagesAsRead,
    }
}

export function useAutoScroll(messages: Message[], containerRef: React.RefObject<HTMLElement>) {
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
    const [isNearBottom, setIsNearBottom] = useState(true)

    useEffect(() => {
        if (shouldAutoScroll && containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight
        }
    }, [messages, shouldAutoScroll, containerRef])

    const handleScroll = () => {
        if (!containerRef.current) return

        const { scrollTop, scrollHeight, clientHeight } = containerRef.current
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight
        const nearBottom = distanceFromBottom < 100

        setIsNearBottom(nearBottom)
        setShouldAutoScroll(nearBottom)
    }

    const scrollToBottom = () => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight
            setShouldAutoScroll(true)
        }
    }

    return {
        shouldAutoScroll,
        isNearBottom,
        handleScroll,
        scrollToBottom,
    }
}