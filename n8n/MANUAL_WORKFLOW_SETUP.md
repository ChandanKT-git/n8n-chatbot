# 🔧 Manual N8N Workflow Setup

Since the JSON import is having issues, let's build the workflow manually. This is actually easier and more reliable!

## 🎯 Workflow Overview

We'll create 6 nodes in sequence:
1. **Webhook** → 2. **Code** → 3. **HTTP Request** → 4. **Code** → 5. **HTTP Request** → 6. **Respond to Webhook**

## 📋 Step-by-Step Setup

### Step 1: Create New Workflow
1. In n8n, click "New Workflow"
2. Name it "Chatbot AI Processor"

### Step 2: Add Webhook Node
1. **Add Node** → **Trigger** → **Webhook**
2. **Settings:**
   - HTTP Method: `POST`
   - Path: `chatbot-webhook`
   - Response Mode: `Using 'Respond to Webhook' Node`

### Step 3: Add Validation Code Node
1. **Add Node** → **Data** → **Code**
2. **Name:** "Validate & Extract Data"
3. **JavaScript Code:**
```javascript
// Extract data from Hasura Action request
const body = $input.first().json.body;
const chatId = body.input.chatId;
const message = body.input.message;
const userId = body.session_variables['x-hasura-user-id'];

// Validate required fields
if (!userId || !chatId || !message) {
  throw new Error('Missing required fields: userId, chatId, or message');
}

return {
  chatId: chatId,
  message: message,
  userId: userId,
  timestamp: new Date().toISOString()
};
```

### Step 4: Add OpenRouter API Node
1. **Add Node** → **Regular** → **HTTP Request**
2. **Name:** "OpenRouter AI API"
3. **Settings:**
   - Method: `POST`
   - URL: `https://openrouter.ai/api/v1/chat/completions`
   - Authentication: `Header Auth`
     - Name: `Authorization`
     - Value: `Bearer YOUR_OPENROUTER_API_KEY`
   - Headers:
     - `Content-Type`: `application/json`
   - Body (JSON):
```json
{
  "model": "openai/gpt-4o-mini",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful AI assistant. Provide concise, helpful responses."
    },
    {
      "role": "user",
      "content": "={{ $json.message }}"
    }
  ],
  "max_tokens": 500,
  "temperature": 0.7
}
```

### Step 5: Add Response Processing Code Node
1. **Add Node** → **Data** → **Code**
2. **Name:** "Process AI Response"
3. **JavaScript Code:**
```javascript
// Extract AI response
const aiResponse = $input.first().json;
const previousData = $('Validate & Extract Data').first().json;

if (!aiResponse.choices || !aiResponse.choices[0]) {
  throw new Error('Invalid AI response');
}

const aiMessage = aiResponse.choices[0].message.content;

return {
  chatId: previousData.chatId,
  userId: previousData.userId,
  userMessage: previousData.message,
  aiMessage: aiMessage,
  timestamp: new Date().toISOString()
};
```

### Step 6: Add Database Save Node
1. **Add Node** → **Regular** → **HTTP Request**
2. **Name:** "Save to Database"
3. **Settings:**
   - Method: `POST`
   - URL: `https://pafxhkjbnmhuloonsthd.hasura.ap-south-1.nhost.run/v1/graphql`
   - Headers:
     - `Content-Type`: `application/json`
     - `x-hasura-admin-secret`: `YOUR_HASURA_ADMIN_SECRET`
   - Body (JSON):
```json
{
  "query": "mutation SaveBotMessage($chatId: uuid!, $content: String!) { insert_messages_one(object: { chat_id: $chatId, content: $content, is_bot: true }) { id content is_bot created_at chat_id } update_chats_by_pk(pk_columns: { id: $chatId }, _set: { updated_at: \"now()\" }) { id updated_at } }",
  "variables": {
    "chatId": "={{ $json.chatId }}",
    "content": "={{ $json.aiMessage }}"
  }
}
```

### Step 7: Add Response Node
1. **Add Node** → **Flow** → **Respond to Webhook**
2. **Name:** "Success Response"
3. **Settings:**
   - Respond With: `JSON`
   - Response Body:
```json
{
  "success": true,
  "message": {
    "id": "={{ $('Save to Database').item.json.data.insert_messages_one.id }}",
    "content": "={{ $('Save to Database').item.json.data.insert_messages_one.content }}",
    "is_bot": true,
    "created_at": "={{ $('Save to Database').item.json.data.insert_messages_one.created_at }}",
    "chat_id": "={{ $('Save to Database').item.json.data.insert_messages_one.chat_id }}"
  }
}
```

## 🔗 Connect the Nodes

Connect them in this order:
1. **Webhook** → **Validate & Extract Data**
2. **Validate & Extract Data** → **OpenRouter AI API**
3. **OpenRouter AI API** → **Process AI Response**
4. **Process AI Response** → **Save to Database**
5. **Save to Database** → **Success Response**

## 🔑 Required Credentials

### OpenRouter API Key
1. Go to [openrouter.ai](https://openrouter.ai)
2. Sign up and get your API key
3. Replace `YOUR_OPENROUTER_API_KEY` in Step 4

### Hasura Admin Secret
1. Go to your Nhost project dashboard
2. Go to Hasura settings
3. Copy the admin secret
4. Replace `YOUR_HASURA_ADMIN_SECRET` in Step 6

## ✅ Activate Workflow

1. Click the **"Active"** toggle at the top
2. Copy the webhook URL from the Webhook node
3. It should look like: `https://your-instance.app.n8n.cloud/webhook/chatbot-webhook`

## 🧪 Test the Workflow

Test with this curl command:
```bash
curl -X POST https://chandankt.app.n8n.cloud/webhook/chatbot-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "body": {
      "input": {
        "chatId": "test-chat-id",
        "message": "Hello, how are you?"
      },
      "session_variables": {
        "x-hasura-user-id": "test-user-id"
      }
    }
  }'
```

Expected response:
```json
{
  "success": true,
  "message": {
    "id": "some-uuid",
    "content": "Hello! I'm doing well, thank you for asking...",
    "is_bot": true,
    "created_at": "2024-01-01T12:00:00Z",
    "chat_id": "test-chat-id"
  }
}
```

## 🎯 Next Steps

Once the workflow is working:
1. Update your `.env` with the webhook URL
2. Set up the Hasura Action (see `HASURA_ACTION_SETUP.md`)
3. Test the complete flow from your React app

---

**This manual setup is more reliable than JSON import!** 🚀