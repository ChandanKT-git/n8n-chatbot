import { useEffect, useRef } from 'react';
import { SubscriptionResult } from '@apollo/client';

// ============================================================================
// SUBSCRIPTION UTILITIES
// ============================================================================

/**
 * Custom hook to handle subscription cleanup
 */
export function useSubscriptionCleanup(
    subscription: SubscriptionResult | undefined
) {
    const subscriptionRef = useRef(subscription);

    useEffect(() => {
        subscriptionRef.current = subscription;
    }, [subscription]);

    useEffect(() => {
        return () => {
            // Apollo Client subscriptions cleanup automatically
            // No manual unsubscribe needed
        };
    }, []);
}

/**
 * Handle subscription errors with user-friendly messages
 */
export function handleSubscriptionError(error: any): string {
    if (error?.networkError) {
        return 'Connection lost. Trying to reconnect...';
    }

    if (error?.graphQLErrors?.length > 0) {
        const graphQLError = error.graphQLErrors[0];

        if (graphQLError.extensions?.code === 'validation-failed') {
            return 'Permission denied. Please refresh and try again.';
        }

        if (graphQLError.extensions?.code === 'parse-failed') {
            return 'Invalid request. Please refresh the page.';
        }

        return graphQLError.message || 'Something went wrong with real-time updates.';
    }

    return 'Real-time updates temporarily unavailable.';
}

/**
 * Subscription connection states
 */
export enum SubscriptionState {
    CONNECTING = 'connecting',
    CONNECTED = 'connected',
    RECONNECTING = 'reconnecting',
    DISCONNECTED = 'disconnected',
    ERROR = 'error'
}

/**
 * Get subscription state from Apollo subscription result
 */
export function getSubscriptionState(
    loading: boolean,
    error: any,
    data: any
): SubscriptionState {
    if (error) {
        return SubscriptionState.ERROR;
    }

    if (loading && !data) {
        return SubscriptionState.CONNECTING;
    }

    if (loading && data) {
        return SubscriptionState.RECONNECTING;
    }

    if (data) {
        return SubscriptionState.CONNECTED;
    }

    return SubscriptionState.DISCONNECTED;
}

/**
 * Retry configuration for subscriptions
 */
export const SUBSCRIPTION_RETRY_CONFIG = {
    maxRetries: 5,
    retryDelay: 1000, // 1 second
    backoffMultiplier: 2,
    maxRetryDelay: 30000, // 30 seconds
};

/**
 * Calculate retry delay with exponential backoff
 */
export function calculateRetryDelay(
    attempt: number,
    baseDelay: number = SUBSCRIPTION_RETRY_CONFIG.retryDelay,
    multiplier: number = SUBSCRIPTION_RETRY_CONFIG.backoffMultiplier,
    maxDelay: number = SUBSCRIPTION_RETRY_CONFIG.maxRetryDelay
): number {
    const delay = baseDelay * Math.pow(multiplier, attempt - 1);
    return Math.min(delay, maxDelay);
}