// Authentication hooks
export { useAuthentication } from './useAuthentication'
export { useAuthOperations } from './useAuthOperations'
export { useFormValidation, authValidationRules } from './useFormValidation'
export { useNavigation } from './useNavigation'

// GraphQL hooks
export { useChats, useChatsSubscription } from './useChats'
export { useMessages, useMessagesSubscription } from './useMessages'
export { useChatOperations } from './useChatOperations'

// Real-time hooks
export { useRealTimeChats, useRealTimeChatUpdates } from './useRealTimeChats'
export { useRealTimeMessages, useMessageNotifications, useAutoScroll } from './useRealTimeMessages'
export { useConnectionStatus, useReconnectStrategy } from './useConnectionStatus'

// Cache management hooks
export { useCacheManager } from './useCacheManager'
export { useOptimisticUpdates, useOptimisticMessageSending } from './useOptimisticUpdates'

// Context hooks
export { useAuth } from '../contexts/AuthContext'