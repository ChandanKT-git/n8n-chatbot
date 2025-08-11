import { ApolloClient, createHttpLink, split } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'
import { nhost } from './nhost'
import { createApolloCache, CacheManager } from './apolloCache'

// HTTP link for queries and mutations
const httpLink = createHttpLink({
    uri: import.meta.env.VITE_HASURA_GRAPHQL_URL,
})

// WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(
    createClient({
        url: import.meta.env.VITE_HASURA_GRAPHQL_URL.replace('http', 'ws'),
        connectionParams: () => {
            const token = nhost.auth.getAccessToken()
            return {
                headers: {
                    Authorization: token ? `Bearer ${token}` : '',
                },
            }
        },
    })
)

// Auth link to add authentication headers
const authLink = setContext((_, { headers }) => {
    const token = nhost.auth.getAccessToken()

    return {
        headers: {
            ...headers,
            Authorization: token ? `Bearer ${token}` : '',
        },
    }
})

// Split link to route queries/mutations to HTTP and subscriptions to WebSocket
const splitLink = split(
    ({ query }) => {
        const definition = getMainDefinition(query)
        return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
        )
    },
    wsLink,
    authLink.concat(httpLink)
)

// Create optimized cache
const cache = createApolloCache()

// Apollo Client instance
export const apolloClient = new ApolloClient({
    link: splitLink,
    cache,
    defaultOptions: {
        watchQuery: {
            errorPolicy: 'all',
            notifyOnNetworkStatusChange: true,
        },
        query: {
            errorPolicy: 'all',
        },
        mutate: {
            errorPolicy: 'all',
        },
    },
})

// Export cache manager for direct cache operations
export const cacheManager = new CacheManager(cache)