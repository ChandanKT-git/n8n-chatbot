import { gql } from '@apollo/client';

// ============================================================================
// QUERIES
// ============================================================================

export const GET_USER_CHATS = gql`
  query GetUserChats {
    chats(order_by: { updated_at: desc }) {
      id
      title
      created_at
      updated_at
      messages_aggregate {
        aggregate {
          count
        }
      }
      messages(limit: 1, order_by: { created_at: desc }) {
        content
        is_bot
        created_at
      }
    }
  }
`;

export const GET_CHAT_MESSAGES = gql`
  query GetChatMessages($chatId: uuid!) {
    messages(
      where: { chat_id: { _eq: $chatId } }
      order_by: { created_at: asc }
    ) {
      id
      content
      is_bot
      created_at
      chat_id
    }
  }
`;

export const GET_CHAT_WITH_MESSAGES = gql`
  query GetChatWithMessages($chatId: uuid!) {
    chats_by_pk(id: $chatId) {
      id
      title
      created_at
      updated_at
      messages(order_by: { created_at: asc }) {
        id
        content
        is_bot
        created_at
      }
    }
  }
`;

// ============================================================================
// MUTATIONS
// ============================================================================

export const CREATE_CHAT = gql`
  mutation CreateChat($title: String!) {
    insert_chats_one(object: { title: $title }) {
      id
      title
      created_at
      updated_at
    }
  }
`;

export const UPDATE_CHAT_TITLE = gql`
  mutation UpdateChatTitle($chatId: uuid!, $title: String!) {
    update_chats_by_pk(pk_columns: { id: $chatId }, _set: { title: $title }) {
      id
      title
      updated_at
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($chatId: uuid!, $content: String!, $isBot: Boolean = false) {
    insert_messages_one(
      object: { chat_id: $chatId, content: $content, is_bot: $isBot }
    ) {
      id
      content
      is_bot
      created_at
      chat_id
    }
  }
`;

export const UPDATE_CHAT_TIMESTAMP = gql`
  mutation UpdateChatTimestamp($chatId: uuid!) {
    update_chats_by_pk(
      pk_columns: { id: $chatId }
      _set: { updated_at: "now()" }
    ) {
      id
      updated_at
    }
  }
`;

export const SEND_MESSAGE_WITH_AI = gql`
  mutation SendMessageWithAI($chatId: uuid!, $message: String!) {
    sendMessage(chatId: $chatId, message: $message) {
      success
      message
      timestamp
    }
  }
`;

// ============================================================================
// SUBSCRIPTIONS
// ============================================================================

export const SUBSCRIBE_TO_CHAT_MESSAGES = gql`
  subscription SubscribeToChatMessages($chatId: uuid!) {
    messages(
      where: { chat_id: { _eq: $chatId } }
      order_by: { created_at: asc }
    ) {
      id
      content
      is_bot
      created_at
      chat_id
    }
  }
`;

export const SUBSCRIBE_TO_USER_CHATS = gql`
  subscription SubscribeToUserChats {
    chats(order_by: { updated_at: desc }) {
      id
      title
      created_at
      updated_at
      messages_aggregate {
        aggregate {
          count
        }
      }
      messages(limit: 1, order_by: { created_at: desc }) {
        content
        is_bot
        created_at
      }
    }
  }
`;

export const SUBSCRIBE_TO_NEW_MESSAGES = gql`
  subscription SubscribeToNewMessages($chatId: uuid!) {
    messages(
      where: { chat_id: { _eq: $chatId } }
      order_by: { created_at: desc }
      limit: 1
    ) {
      id
      content
      is_bot
      created_at
      chat_id
    }
  }
`;