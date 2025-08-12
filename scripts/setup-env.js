#!/usr/bin/env node

/**
 * Environment Setup Script
 * Helps set up environment variables for local development
 */

import { writeFileSync, existsSync } from 'fs';
import { createInterface } from 'readline';

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function setupEnvironment() {
    console.log('🚀 Nhost Chatbot App - Environment Setup\n');

    if (existsSync('.env.local')) {
        const overwrite = await question('⚠️  .env.local already exists. Overwrite? (y/N): ');
        if (overwrite.toLowerCase() !== 'y') {
            console.log('Setup cancelled.');
            rl.close();
            return;
        }
    }

    console.log('Please provide your Nhost project details:\n');

    const subdomain = await question('📝 Nhost Subdomain (e.g., abc123def): ');
    const region = await question('🌍 Nhost Region (e.g., eu-central-1): ');

    if (!subdomain || !region) {
        console.log('❌ Subdomain and region are required!');
        rl.close();
        return;
    }

    const graphqlUrl = `https://${subdomain}.hasura.${region}.nhost.run/v1/graphql`;

    console.log('\n📋 Generated configuration:');
    console.log(`   Subdomain: ${subdomain}`);
    console.log(`   Region: ${region}`);
    console.log(`   GraphQL URL: ${graphqlUrl}\n`);

    const confirm = await question('✅ Create .env.local with these settings? (Y/n): ');

    if (confirm.toLowerCase() === 'n') {
        console.log('Setup cancelled.');
        rl.close();
        return;
    }

    const envContent = `# Nhost Configuration
VITE_NHOST_SUBDOMAIN=${subdomain}
VITE_NHOST_REGION=${region}

# Hasura GraphQL Endpoint
VITE_HASURA_GRAPHQL_URL=${graphqlUrl}

# App Configuration
VITE_APP_NAME=Chatbot App
VITE_APP_VERSION=1.0.0

# Development
NODE_ENV=development
`;

    try {
        writeFileSync('.env.local', envContent);
        console.log('✅ .env.local created successfully!');
        console.log('\n🎯 Next steps:');
        console.log('   1. Run: npm run dev');
        console.log('   2. Open: http://localhost:5173');
        console.log('   3. Test authentication and chat functionality');
        console.log('\n📚 For deployment, see DEPLOYMENT.md');
    } catch (error) {
        console.error('❌ Failed to create .env.local:', error.message);
    }

    rl.close();
}

setupEnvironment().catch(console.error);