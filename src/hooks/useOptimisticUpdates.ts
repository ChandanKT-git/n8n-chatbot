import { useState, useCallback } from 'react'
import { useCacheManager } from './useCacheManager'
import { Message } from '../graphql/types'

interface OptimisticMessage extends Message {
    isOptimistic: boolean
    tempId: string
}

export function useOptimisticUpdates(chatId: string) {
    const [optimisticMessages, setOptimisticMessages] = useState<Map<string, OptimisticMessage>>(new Map())
    const { addOptimisticMessage, removeOptimisticMessage } = useCacheManager()

    const addOptimisticMessageUpdate = useCallback((content: string) => {
        const tempId = `temp-${Date.now()}-${Math.random()}`

        const optimisticMessage: OptimisticMessage = {
            id: tempId,
            chat_id: chatId,
            content,
            is_bot: false,
            created_at: new Date().toISOString(),
            isOptimistic: true,
            tempId,
        }

        // Add to local state
        setOptimisticMessages(prev => new Map(prev).set(tempId, optimisticMessage))

        // Add to Apollo cache
        addOptimisticMessage(chatId, content, tempId)

        return tempId
    }, [chatId, addOptimisticMessage])

    const removeOptimisticMessageUpdate = useCallback((tempId: string) => {
        // Remove from local state
        setOptimisticMessages(prev => {
            const newMap = new Map(prev)
            newMap.delete(tempId)
            return newMap
        })

        // Remove from Apollo cache
        removeOptimisticMessage(chatId, tempId)
    }, [chatId, removeOptimisticMessage])

    const confirmOptimisticMessage = useCallback((tempId: string, realMessage: Message) => {
        // Remove the optimistic message
        removeOptimisticMessageUpdate(tempId)

        // The real message should already be in the cache from the mutation response
        return realMessage
    }, [removeOptimisticMessageUpdate])

    const clearAllOptimisticMessages = useCallback(() => {
        optimisticMessages.forEach((_, tempId) => {
            removeOptimisticMessage(chatId, tempId)
        })
        setOptimisticMessages(new Map())
    }, [optimisticMessages, chatId, removeOptimisticMessage])

    return {
        optimisticMessages: Array.from(optimisticMessages.values()),
        addOptimisticMessage: addOptimisticMessageUpdate,
        removeOptimisticMessage: removeOptimisticMessageUpdate,
        confirmOptimisticMessage,
        clearAllOptimisticMessages,
        hasOptimisticMessages: optimisticMessages.size > 0,
    }
}

export function useOptimisticMessageSending(chatId: string, sendMessage: (content: string) => Promise<any>) {
    const {
        addOptimisticMessage,
        removeOptimisticMessage,
        confirmOptimisticMessage
    } = useOptimisticUpdates(chatId)

    const sendMessageWithOptimisticUpdate = useCallback(async (content: string) => {
        // Add optimistic message immediately
        const tempId = addOptimisticMessage(content)

        try {
            // Send the actual message
            const result = await sendMessage(content)

            if (result.success && result.message) {
                // Confirm the optimistic message with the real one
                confirmOptimisticMessage(tempId, result.message)
                return result
            } else {
                // Remove optimistic message on failure
                removeOptimisticMessage(tempId)
                return result
            }
        } catch (error) {
            // Remove optimistic message on error
            removeOptimisticMessage(tempId)
            throw error
        }
    }, [addOptimisticMessage, removeOptimisticMessage, confirmOptimisticMessage, sendMessage])

    return {
        sendMessageWithOptimisticUpdate,
    }
}