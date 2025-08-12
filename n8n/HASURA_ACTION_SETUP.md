# 🔗 Hasura Action Setup for N8N Integration

This guide shows how to set up Hasura Actions to connect your chat app with the n8n AI workflow.

## 🎯 Overview

Hasura Actions allow you to extend your GraphQL API with custom business logic. We'll create a `sendMessage` action that:

1. Receives a message from the frontend
2. Calls the n8n webhook for AI processing
3. Returns the AI response to the frontend

## 📋 Setup Steps

### Step 1: Create the Action in Hasura Console

1. **Open Hasura Console**
   - Go to your Nhost project dashboard
   - Click "Hasura" → "Open Hasura Console"

2. **Navigate to Actions**
   - Click "Actions" in the left sidebar
   - Click "Create" button

### Step 2: Define the Action

**Action Name:** `sendMessage`

**Action Definition:**
```graphql
type Mutation {
  sendMessage(chatId: uuid!, message: String!): SendMessageResponse
}
```

**Type Definitions:**
```graphql
type SendMessageResponse {
  success: Boolean!
  message: Message
  error: String
}

type Message {
  id: uuid!
  content: String!
  is_bot: Boolean!
  created_at: timestamptz!
  chat_id: uuid!
}
```

### Step 3: Configure the Handler

**Handler URL:** `https://your-n8n-instance.app.n8n.cloud/webhook/chatbot-webhook`

**Request Transform:**
```json
{
  "version": 2,
  "template": {
    "method": "POST",
    "url": "{{$base_url}}",
    "body": {
      "chatId": "{{$body.input.chatId}}",
      "message": "{{$body.input.message}}",
      "userId": "{{$body.session_variables['x-hasura-user-id']}}"
    },
    "headers": {
      "Content-Type": "application/json"
    }
  }
}
```

**Response Transform:**
```json
{
  "version": 2,
  "template": {
    "success": "{{$body.success}}",
    "message": "{{$body.message}}",
    "error": "{{$body.error}}"
  }
}
```

### Step 4: Set Permissions

**Role:** `user`

**Permission:** Allow users to call this action

## 🧪 Testing the Action

### Test Query in Hasura Console
```graphql
mutation TestSendMessage {
  sendMessage(
    chatId: "your-test-chat-id"
    message: "Hello, how are you?"
  ) {
    success
    message {
      id
      content
      is_bot
      created_at
    }
    error
  }
}
```

### Expected Response
```json
{
  "data": {
    "sendMessage": {
      "success": true,
      "message": {
        "id": "generated-uuid",
        "content": "Hello! I'm doing well, thank you for asking. How can I help you today?",
        "is_bot": true,
        "created_at": "2024-01-01T12:00:00Z"
      },
      "error": null
    }
  }
}
```

## 🔧 Frontend Integration

### GraphQL Mutation
Add this to your `src/lib/graphql.ts`:

```typescript
export const SEND_MESSAGE_WITH_AI = gql`
  mutation SendMessageWithAI($chatId: uuid!, $message: String!) {
    sendMessage(chatId: $chatId, message: $message) {
      success
      message {
        id
        content
        is_bot
        created_at
        chat_id
      }
      error
    }
  }
`;
```

### Hook Usage
```typescript
import { useMutation } from '@apollo/client';
import { SEND_MESSAGE_WITH_AI } from '../lib/graphql';

function ChatComponent() {
  const [sendMessageWithAI] = useMutation(SEND_MESSAGE_WITH_AI);

  const handleSendMessage = async (message: string) => {
    try {
      const result = await sendMessageWithAI({
        variables: { chatId, message }
      });
      
      if (result.data?.sendMessage.success) {
        // Message sent and AI response received
        console.log('AI Response:', result.data.sendMessage.message);
      } else {
        // Handle error
        console.error('Error:', result.data?.sendMessage.error);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };
}
```

## 🔒 Security Configuration

### Environment Variables
Make sure these are set in your n8n workflow:

```bash
# In n8n credentials
HASURA_GRAPHQL_ENDPOINT=https://pafxhkjbnmhuloonsthd.hasura.ap-south-1.nhost.run/v1/graphql
HASURA_ADMIN_SECRET=your-hasura-admin-secret
OPENROUTER_API_KEY=your-openrouter-api-key
```

### Authentication
The action automatically passes:
- User ID from JWT token
- Session variables for authorization
- Request context for validation

## 🚨 Error Handling

### Common Errors

**Action not found:**
- Verify action name is exactly `sendMessage`
- Check action is saved and deployed

**Webhook timeout:**
- Check n8n workflow is active
- Verify webhook URL is correct
- Test webhook directly with curl

**Permission denied:**
- Ensure user role has permission for the action
- Check JWT token is valid
- Verify user owns the chat

**AI API errors:**
- Check OpenRouter API key is valid
- Verify API quota/limits
- Check request format in n8n

## 📈 Monitoring

### Hasura Console
- Check action execution logs
- Monitor success/failure rates
- Track response times

### N8N Dashboard
- Monitor workflow executions
- Check for failed runs
- Review error logs

## 🎯 Next Steps

After setting up the action:

1. **Test in Hasura Console** - Verify the action works
2. **Update Frontend** - Add the new mutation to your React app
3. **Test End-to-End** - Send messages and verify AI responses
4. **Deploy** - Update environment variables in production

---

**Ready to set up the Hasura Action?** Follow the steps above and let me know when it's configured! 🚀