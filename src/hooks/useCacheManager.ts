import { useCallback } from 'react'
import { cacheManager } from '../lib/apollo'
import { Chat, Message, ChatWithLastMessage } from '../graphql/types'

export function useCacheManager() {
    // Chat cache operations
    const getCachedChats = useCallback(() => {
        return cacheManager.getCachedChats()
    }, [])

    const updateChatInCache = useCallback((updatedChat: Chat) => {
        cacheManager.updateChatInCache(updatedChat)
    }, [])

    const addChatToCache = useCallback((newChat: ChatWithLastMessage) => {
        cacheManager.addChatToCache(newChat)
    }, [])

    const removeChatFromCache = useCallback((chatId: string) => {
        cacheManager.removeChatFromCache(chatId)
    }, [])

    // Message cache operations
    const getCachedMessages = useCallback((chatId: string) => {
        return cacheManager.getCachedMessages(chatId)
    }, [])

    const addMessageToCache = useCallback((chatId: string, newMessage: Message) => {
        cacheManager.addMessageToCache(chatId, newMessage)
    }, [])

    const updateMessageInCache = useCallback((chatId: string, updatedMessage: Message) => {
        cacheManager.updateMessageInCache(chatId, updatedMessage)
    }, [])

    const removeMessageFromCache = useCallback((chatId: string, messageId: string) => {
        cacheManager.removeMessageFromCache(chatId, messageId)
    }, [])

    // Optimistic updates
    const addOptimisticMessage = useCallback((chatId: string, content: string, tempId: string) => {
        return cacheManager.addOptimisticMessage(chatId, content, tempId)
    }, [])

    const removeOptimisticMessage = useCallback((chatId: string, tempId: string) => {
        cacheManager.removeOptimisticMessage(chatId, tempId)
    }, [])

    // Cache cleanup
    const clearChatCache = useCallback(() => {
        cacheManager.clearChatCache()
    }, [])

    const clearMessageCache = useCallback((chatId?: string) => {
        cacheManager.clearMessageCache(chatId)
    }, [])

    const clearAllCache = useCallback(() => {
        cacheManager.clearAllCache()
    }, [])

    // Cache inspection
    const inspectCache = useCallback(() => {
        return cacheManager.inspectCache()
    }, [])

    return {
        // Chat operations
        getCachedChats,
        updateChatInCache,
        addChatToCache,
        removeChatFromCache,

        // Message operations
        getCachedMessages,
        addMessageToCache,
        updateMessageInCache,
        removeMessageFromCache,

        // Optimistic updates
        addOptimisticMessage,
        removeOptimisticMessage,

        // Cache management
        clearChatCache,
        clearMessageCache,
        clearAllCache,
        inspectCache,
    }
}