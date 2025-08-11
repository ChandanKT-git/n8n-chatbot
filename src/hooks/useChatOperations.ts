import { useState, useCallback } from 'react'
import { useChats } from './useChats'
import { useMessages } from './useMessages'
import { useNavigation } from './useNavigation'

export function useChatOperations() {
    const [activeChat, setActiveChat] = useState<string | null>(null)
    const { navigateToSpecificChat } = useNavigation()

    const {
        chats,
        loading: chatsLoading,
        creating: chatCreating,
        createChat,
        createChatWithFirstMessage,
        deleteChat,
        updateChat,
    } = useChats()

    const {
        messages,
        loading: messagesLoading,
        sending: messageSending,
        sendMessage,
        updateMessage,
        deleteMessage,
    } = useMessages(activeChat || '')

    // Create a new chat and navigate to it
    const startNewChat = useCallback(async (firstMessage?: string) => {
        try {
            const result = firstMessage
                ? await createChatWithFirstMessage(firstMessage)
                : await createChat()

            if (result.success && result.chat) {
                setActiveChat(result.chat.id)
                navigateToSpecificChat(result.chat.id)
                return result.chat
            }
            return null
        } catch (error) {
            console.error('Error starting new chat:', error)
            return null
        }
    }, [createChat, createChatWithFirstMessage, navigateToSpecificChat])

    // Select an existing chat
    const selectChat = useCallback((chatId: string) => {
        setActiveChat(chatId)
        navigateToSpecificChat(chatId)
    }, [navigateToSpecificChat])

    // Send a message to the current chat
    const sendMessageToChat = useCallback(async (content: string) => {
        if (!activeChat) {
            // If no active chat, create one with this message
            const newChat = await startNewChat(content)
            if (newChat) {
                // Send the message to the new chat
                return sendMessage(content, false)
            }
            return { success: false, error: 'Failed to create chat' }
        }

        return sendMessage(content, false)
    }, [activeChat, startNewChat, sendMessage])

    // Send a bot message (for testing or manual bot responses)
    const sendBotMessage = useCallback(async (content: string) => {
        if (!activeChat) {
            return { success: false, error: 'No active chat' }
        }

        return sendMessage(content, true)
    }, [activeChat, sendMessage])

    // Delete a chat and handle navigation
    const deleteChatAndNavigate = useCallback(async (chatId: string) => {
        const result = await deleteChat(chatId)

        if (result.success) {
            // If we deleted the active chat, clear it
            if (activeChat === chatId) {
                setActiveChat(null)
                // Navigate to the first available chat or stay on chat page
                if (chats.length > 1) {
                    const remainingChats = chats.filter(chat => chat.id !== chatId)
                    if (remainingChats.length > 0) {
                        selectChat(remainingChats[0].id)
                    }
                }
            }
        }

        return result
    }, [deleteChat, activeChat, chats, selectChat])

    // Get current chat info
    const currentChat = chats.find(chat => chat.id === activeChat)

    return {
        // Current state
        activeChat,
        currentChat,
        chats,
        messages,

        // Loading states
        chatsLoading,
        messagesLoading,
        chatCreating,
        messageSending,

        // Chat operations
        startNewChat,
        selectChat,
        updateChat,
        deleteChatAndNavigate,

        // Message operations
        sendMessageToChat,
        sendBotMessage,
        updateMessage,
        deleteMessage,

        // Utilities
        setActiveChat,
    }
}