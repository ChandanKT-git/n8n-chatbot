# Deployment Guide

This guide explains how to deploy the chatbot application to Netlify.

## Prerequisites

1. **Nhost Account**: Create an account at [nhost.io](https://nhost.io)
2. **Netlify Account**: Create an account at [netlify.com](https://netlify.com)
3. **GitHub Repository**: Push your code to a GitHub repository

## Step 1: Set up Nhost Backend

### 1.1 Create Nhost Project
1. Go to [Nhost Console](https://app.nhost.io)
2. Click "Create New Project"
3. Choose a project name (e.g., "chatbot-app")
4. Select a region (e.g., "us-east-1")
5. Wait for the project to be created

### 1.2 Configure Database
1. Go to your project dashboard
2. Click on "Database" in the sidebar
3. Go to "SQL Editor"
4. Copy and paste the contents of `database/migrations/init_database.sql`
5. Click "Run" to execute the script

### 1.3 Configure Hasura Permissions
1. Go to "Hasura" in the Nhost console
2. Click "Open Hasura Console"
3. Follow the instructions in `database/hasura/HASURA_SETUP.md`
4. Set up the table relationships and permissions as described

### 1.4 Get Environment Variables
From your Nhost project dashboard, note down:
- **Subdomain**: Your project subdomain (e.g., "your-project")
- **Region**: Your project region (e.g., "us-east-1")
- **GraphQL URL**: Usually `https://your-subdomain.hasura.your-region.nhost.run/v1/graphql`

## Step 2: Deploy to Netlify

### 2.1 Connect Repository
1. Go to [Netlify](https://netlify.com)
2. Click "New site from Git"
3. Choose "GitHub" and authorize Netlify
4. Select your repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

### 2.2 Set Environment Variables
In Netlify dashboard, go to Site settings → Environment variables and add:

```
VITE_NHOST_SUBDOMAIN=your-nhost-subdomain
VITE_NHOST_REGION=your-nhost-region
VITE_HASURA_GRAPHQL_URL=https://your-subdomain.hasura.your-region.nhost.run/v1/graphql
VITE_APP_NAME=Chatbot App
VITE_APP_VERSION=1.0.0
```

### 2.3 Deploy
1. Click "Deploy site"
2. Wait for the build to complete
3. Your site will be available at a Netlify URL (e.g., `https://amazing-name-123456.netlify.app`)

## Step 3: Test the Deployment

1. Visit your Netlify URL
2. You should see the authentication page
3. Try signing up with a test email
4. Check that the authentication flow works

## Step 4: Custom Domain (Optional)

1. In Netlify dashboard, go to Domain settings
2. Click "Add custom domain"
3. Follow the DNS configuration instructions

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_NHOST_SUBDOMAIN` | Your Nhost project subdomain | `my-chatbot-app` |
| `VITE_NHOST_REGION` | Your Nhost project region | `us-east-1` |
| `VITE_HASURA_GRAPHQL_URL` | Hasura GraphQL endpoint | `https://my-app.hasura.us-east-1.nhost.run/v1/graphql` |
| `VITE_APP_NAME` | Application name | `Chatbot App` |
| `VITE_APP_VERSION` | Application version | `1.0.0` |

## Troubleshooting

### Build Fails
- Check that all dependencies are installed
- Verify environment variables are set correctly
- Check the build logs in Netlify dashboard

### Authentication Not Working
- Verify Nhost subdomain and region are correct
- Check that the GraphQL URL is accessible
- Ensure Hasura permissions are set up correctly

### Database Connection Issues
- Verify the database schema is created
- Check that RLS policies are enabled
- Ensure Hasura permissions are configured

## Continuous Deployment

Once set up, Netlify will automatically deploy when you push to your main branch:

1. Make changes to your code
2. Commit and push to GitHub
3. Netlify will automatically build and deploy
4. Check the deploy logs if there are issues

## Next Steps

After successful deployment:
1. Set up n8n workflow for AI responses
2. Configure Hasura Actions
3. Test the complete chat functionality
4. Set up monitoring and analytics