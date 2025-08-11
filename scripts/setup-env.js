#!/usr/bin/env node

/**
 * Environment Setup Script
 * This script helps set up environment variables for deployment
 */

import fs from 'fs'
import path from 'path'
import readline from 'readline'

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

function question(query) {
    return new Promise(resolve => rl.question(query, resolve))
}

async function setupEnvironment() {
    console.log('🚀 Chatbot App Environment Setup\n')

    console.log('Please provide your Nhost project details:')

    const subdomain = await question('Nhost Subdomain: ')
    const region = await question('Nhost Region (e.g., us-east-1): ')

    const graphqlUrl = `https://${subdomain}.hasura.${region}.nhost.run/v1/graphql`

    console.log(`\nGenerated GraphQL URL: ${graphqlUrl}`)
    const confirmUrl = await question('Is this correct? (y/n): ')

    let finalGraphqlUrl = graphqlUrl
    if (confirmUrl.toLowerCase() !== 'y') {
        finalGraphqlUrl = await question('Enter the correct GraphQL URL: ')
    }

    const envContent = `# Nhost Configuration
VITE_NHOST_SUBDOMAIN=${subdomain}
VITE_NHOST_REGION=${region}

# Hasura Configuration
VITE_HASURA_GRAPHQL_URL=${finalGraphqlUrl}

# Application Configuration
VITE_APP_NAME=Chatbot App
VITE_APP_VERSION=1.0.0

# n8n Configuration (will be set up later)
# VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/chatbot-webhook
`

    fs.writeFileSync('.env', envContent)
    console.log('\n✅ Environment file created successfully!')
    console.log('\nNext steps:')
    console.log('1. Set up your database using: database/migrations/init_database.sql')
    console.log('2. Configure Hasura permissions using: database/hasura/HASURA_SETUP.md')
    console.log('3. Deploy to Netlify using the environment variables above')
    console.log('\nFor detailed instructions, see DEPLOYMENT.md')

    rl.close()
}

setupEnvironment().catch(console.error)