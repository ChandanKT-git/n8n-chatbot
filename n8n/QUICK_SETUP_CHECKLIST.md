# 🚀 N8N Quick Setup Checklist

Follow this checklist to get your AI chatbot working in 15 minutes!

## ✅ Step-by-Step Setup

### 1. Create N8N Account (2 minutes)
- [ ] Go to [n8n.cloud](https://n8n.cloud)
- [ ] Sign up for free account
- [ ] Verify email address

### 2. Import Workflow (3 minutes)
- [ ] Create new workflow in n8n
- [ ] Copy content from `n8n/chatbot-workflow.json`
- [ ] Import JSON into n8n
- [ ] Save workflow

### 3. Set Up Credentials (5 minutes)

#### OpenRouter API
- [ ] Go to [openrouter.ai](https://openrouter.ai)
- [ ] Sign up and get API key
- [ ] In n8n: Add "HTTP Header Auth" credential
- [ ] Name: "OpenRouter API"
- [ ] Header: "Authorization"
- [ ] Value: "Bearer YOUR_API_KEY"

#### Hasura GraphQL
- [ ] In n8n: Add "GraphQL" credential
- [ ] Name: "Hasura GraphQL"
- [ ] Endpoint: `https://pafxhkjbnmhuloonsthd.hasura.ap-south-1.nhost.run/v1/graphql`
- [ ] Headers: `{"x-hasura-admin-secret": "YOUR_ADMIN_SECRET"}`

### 4. Activate Workflow (1 minute)
- [ ] Click "Active" toggle in n8n
- [ ] Copy webhook URL from Webhook node
- [ ] Should look like: `https://your-instance.app.n8n.cloud/webhook/chatbot-webhook`

### 5. Update Environment Variables (2 minutes)
- [ ] Add to your `.env` file:
```bash
VITE_N8N_WEBHOOK_URL=https://your-instance.app.n8n.cloud/webhook/chatbot-webhook
```

### 6. Set Up Hasura Action (2 minutes)
- [ ] Open Hasura Console from Nhost
- [ ] Go to Actions → Create
- [ ] Follow steps in `n8n/HASURA_ACTION_SETUP.md`
- [ ] Set webhook URL to your n8n webhook
- [ ] Save action

## 🧪 Test Everything

### Test N8N Webhook
```bash
curl -X POST https://your-n8n-webhook-url \
  -H "Content-Type: application/json" \
  -d '{
    "body": {
      "input": {
        "chatId": "test-id",
        "message": "Hello!"
      },
      "session_variables": {
        "x-hasura-user-id": "test-user"
      }
    }
  }'
```

### Test Hasura Action
In Hasura Console GraphiQL:
```graphql
mutation {
  sendMessage(chatId: "your-chat-id", message: "Hello AI!") {
    success
    message {
      content
      is_bot
    }
    error
  }
}
```

## 🎯 Success Criteria

Your setup is complete when:
- ✅ N8N workflow is active and receiving requests
- ✅ OpenRouter API responds with AI messages
- ✅ Messages are saved to your database
- ✅ Hasura Action returns success response
- ✅ Frontend can send messages and receive AI replies

## 🚨 Common Issues

**Webhook not working:**
- Check workflow is active in n8n
- Verify webhook URL is correct
- Test with curl command above

**AI not responding:**
- Check OpenRouter API key is valid
- Verify you have API credits
- Check n8n execution logs

**Database errors:**
- Verify Hasura admin secret
- Check GraphQL endpoint URL
- Ensure tables exist with correct permissions

## 📞 Need Help?

If you get stuck:
1. Check n8n execution logs for errors
2. Test each step individually
3. Verify all credentials are set correctly
4. Check Hasura Action configuration

---

**Estimated Total Time: 15 minutes** ⏱️

**Ready to start?** Work through each step and check them off! 🚀