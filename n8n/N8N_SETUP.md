# 🤖 N8N Setup Guide for AI Chatbot

This guide will help you set up n8n to handle AI responses for your chatbot.

## 🚀 Quick Setup

### 1. Create N8N Account
1. Go to [n8n.cloud](https://n8n.cloud)
2. Sign up for a free account
3. Create a new workflow

### 2. Import Workflow
1. Copy the workflow JSON from `n8n/chatbot-workflow.json`
2. In n8n, click "Import from JSON"
3. Paste the workflow and save

### 3. Configure Credentials
Set up these credentials in n8n:
- **OpenRouter API** (for AI responses)
- **Hasura GraphQL** (for database operations)

### 4. Get Webhook URL
1. Activate your workflow
2. Copy the webhook URL from the Webhook node
3. Update your `.env` file with this URL

## 📋 Detailed Setup Steps

### Step 1: N8N Account Setup

1. **Sign up at n8n.cloud**
   - Choose the free plan (sufficient for development)
   - Verify your email address

2. **Create New Workflow**
   - Click "New Workflow"
   - Name it "Chatbot AI Processor"

### Step 2: Workflow Configuration

The workflow consists of these nodes:

1. **Webhook Trigger** - Receives requests from Hasura Actions
2. **Validation Node** - Validates user authentication and chat ownership
3. **OpenRouter API Node** - Sends message to AI model
4. **Response Handler** - Formats AI response
5. **Database Update** - Saves AI response to database

### Step 3: Credential Setup

#### OpenRouter API Credentials
1. Go to [openrouter.ai](https://openrouter.ai)
2. Sign up and get your API key
3. In n8n: Settings → Credentials → Add Credential
4. Choose "HTTP Request Auth" → API Key
5. Name: "OpenRouter API"
6. Key: "Authorization"
7. Value: "Bearer YOUR_API_KEY"

#### Hasura GraphQL Credentials
1. In n8n: Settings → Credentials → Add Credential
2. Choose "GraphQL"
3. Name: "Hasura GraphQL"
4. Endpoint: `https://pafxhkjbnmhuloonsthd.hasura.ap-south-1.nhost.run/v1/graphql`
5. Headers: `{"x-hasura-admin-secret": "YOUR_ADMIN_SECRET"}`

### Step 4: Environment Variables

Add to your `.env` file:
```bash
# N8N Configuration
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.app.n8n.cloud/webhook/chatbot-webhook

# OpenRouter API (for n8n workflow)
OPENROUTER_API_KEY=your-openrouter-api-key
```

## 🔧 Workflow Details

### Webhook Node Configuration
```json
{
  "httpMethod": "POST",
  "path": "chatbot-webhook",
  "responseMode": "responseNode",
  "options": {}
}
```

### Validation Logic
The workflow validates:
- User is authenticated (JWT token)
- Chat belongs to the user
- Message content is valid
- Rate limiting (optional)

### AI Processing
- Uses OpenRouter API with GPT-4 or Claude
- Maintains conversation context
- Handles errors gracefully
- Returns formatted response

### Database Operations
- Saves AI response to messages table
- Updates chat timestamp
- Handles database errors

## 🧪 Testing

### Test the Webhook
```bash
curl -X POST https://your-n8n-webhook-url \
  -H "Content-Type: application/json" \
  -d '{
    "chatId": "test-chat-id",
    "message": "Hello, how are you?",
    "userId": "test-user-id"
  }'
```

### Expected Response
```json
{
  "success": true,
  "message": {
    "id": "generated-id",
    "content": "AI response here",
    "is_bot": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

## 🔒 Security

### Authentication
- Validates JWT tokens from Nhost
- Checks user permissions
- Verifies chat ownership

### Rate Limiting
- Implement rate limiting per user
- Prevent abuse and spam
- Monitor usage patterns

### Error Handling
- Graceful error responses
- Logging for debugging
- Fallback responses

## 📈 Monitoring

### Workflow Execution
- Monitor execution logs in n8n
- Track success/failure rates
- Set up alerts for errors

### Performance
- Monitor response times
- Track API usage
- Optimize for speed

## 🚀 Deployment

### Production Setup
1. **Upgrade n8n plan** if needed for production
2. **Set up custom domain** (optional)
3. **Configure monitoring** and alerts
4. **Set up backups** for workflow

### Environment Variables for Production
Make sure these are set in Netlify:
```bash
VITE_N8N_WEBHOOK_URL=https://your-production-n8n-url
```

## 🆘 Troubleshooting

### Common Issues

**Webhook not receiving requests:**
- Check Hasura Action configuration
- Verify webhook URL is correct
- Check n8n workflow is active

**Authentication errors:**
- Verify JWT token validation
- Check Hasura admin secret
- Ensure user permissions are correct

**AI API errors:**
- Check OpenRouter API key
- Verify API quota/limits
- Check request format

**Database errors:**
- Verify Hasura GraphQL endpoint
- Check database permissions
- Ensure table structure is correct

## 📞 Support

If you need help:
1. Check n8n execution logs
2. Test webhook with curl
3. Verify all credentials are set
4. Check Hasura Action configuration

---

**Ready to set up n8n?** Follow the steps above and let me know when you have your webhook URL! 🚀