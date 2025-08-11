// Environment configuration
export const env = {
    // Nhost configuration
    nhost: {
        subdomain: import.meta.env.VITE_NHOST_SUBDOMAIN,
        region: import.meta.env.VITE_NHOST_REGION,
    },

    // Hasura configuration
    hasura: {
        graphqlUrl: import.meta.env.VITE_HASURA_GRAPHQL_URL,
    },

    // n8n configuration
    n8n: {
        webhookUrl: import.meta.env.VITE_N8N_WEBHOOK_URL,
    },

    // App configuration
    app: {
        name: import.meta.env.VITE_APP_NAME || 'Chatbot App',
        version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    },

    // Development flags
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
}

// Validate required environment variables
const requiredEnvVars = [
    'VITE_NHOST_SUBDOMAIN',
    'VITE_NHOST_REGION',
    'VITE_HASURA_GRAPHQL_URL',
]

export const validateEnv = () => {
    const missing = requiredEnvVars.filter(
        (envVar) => !import.meta.env[envVar]
    )

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}`
        )
    }
}