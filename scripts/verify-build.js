#!/usr/bin/env node

/**
 * Build Verification Script
 * Checks if the project is ready for deployment
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

function checkFile(path, description) {
    if (existsSync(path)) {
        console.log(`✅ ${description}`);
        return true;
    } else {
        console.log(`❌ ${description} - Missing: ${path}`);
        return false;
    }
}

function runCommand(command, description) {
    try {
        console.log(`🔄 ${description}...`);
        execSync(command, { stdio: 'pipe' });
        console.log(`✅ ${description}`);
        return true;
    } catch (error) {
        console.log(`❌ ${description} - Error: ${error.message}`);
        return false;
    }
}

function checkEnvironmentVariables() {
    const requiredVars = [
        'VITE_NHOST_SUBDOMAIN',
        'VITE_NHOST_REGION',
        'VITE_HASURA_GRAPHQL_URL'
    ];

    console.log('\n📋 Environment Variables Check:');

    if (existsSync('.env.local')) {
        const envContent = readFileSync('.env.local', 'utf8');
        let allPresent = true;

        requiredVars.forEach(varName => {
            if (envContent.includes(varName)) {
                console.log(`✅ ${varName} found in .env.local`);
            } else {
                console.log(`❌ ${varName} missing from .env.local`);
                allPresent = false;
            }
        });

        return allPresent;
    } else {
        console.log('⚠️  .env.local not found (OK for production, required for local dev)');
        console.log('   Make sure to set environment variables in Netlify dashboard');
        return true; // OK for production deployment
    }
}

async function verifyBuild() {
    console.log('🚀 Build Verification for Nhost Chatbot App\n');

    let allChecks = true;

    // Check essential files
    console.log('📁 File Structure Check:');
    allChecks &= checkFile('package.json', 'Package configuration');
    allChecks &= checkFile('netlify.toml', 'Netlify configuration');
    allChecks &= checkFile('src/App.tsx', 'Main App component');
    allChecks &= checkFile('src/lib/nhost.ts', 'Nhost configuration');
    allChecks &= checkFile('src/lib/apollo.ts', 'Apollo Client configuration');
    allChecks &= checkFile('index.html', 'HTML entry point');

    // Check environment variables
    allChecks &= checkEnvironmentVariables();

    // Check dependencies
    console.log('\n📦 Dependencies Check:');
    allChecks &= runCommand('npm list --depth=0', 'Dependencies installed');

    // TypeScript check
    console.log('\n🔍 TypeScript Check:');
    allChecks &= runCommand('npx tsc --noEmit', 'TypeScript compilation');

    // Build test
    console.log('\n🏗️  Build Test:');
    allChecks &= runCommand('npm run build', 'Production build');

    // Final result
    console.log('\n' + '='.repeat(50));
    if (allChecks) {
        console.log('🎉 All checks passed! Ready for deployment.');
        console.log('\n📋 Next steps:');
        console.log('   1. Push code to GitHub');
        console.log('   2. Connect repository to Netlify');
        console.log('   3. Set environment variables in Netlify');
        console.log('   4. Deploy!');
    } else {
        console.log('❌ Some checks failed. Please fix the issues above.');
        console.log('\n🔧 Common fixes:');
        console.log('   - Run: npm install');
        console.log('   - Fix TypeScript errors');
        console.log('   - Create .env.local with: npm run setup');
    }
    console.log('='.repeat(50));

    process.exit(allChecks ? 0 : 1);
}

verifyBuild().catch(console.error);