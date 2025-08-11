import { gql } from '@apollo/client'

// =============================================
// TYPE DEFINITIONS
// =============================================

export const CHAT_FRAGMENT = gql`
  fragment ChatFragment on chats {
    id
    user_id
    title
    created_at
    updated_at
  }
`

export const MESSAGE_FRAGMENT = gql`
  fragment MessageFragment on messages {
    id
    chat_id
    content
    is_bot
    created_at
  }
`

export const CHAT_WITH_MESSAGES_FRAGMENT = gql`
  fragment ChatWithMessagesFragment on chats {
    ...ChatFragment
    messages(order_by: {created_at: asc}) {
      ...MessageFragment
    }
  }
  ${CHAT_FRAGMENT}
  ${MESSAGE_FRAGMENT}
`

export const CHAT_WITH_LAST_MESSAGE_FRAGMENT = gql`
  fragment ChatWithLastMessageFragment on chats {
    ...ChatFragment
    messages(limit: 1, order_by: {created_at: desc}) {
      ...MessageFragment
    }
    messages_aggregate {
      aggregate {
        count
      }
    }
  }
  ${CHAT_FRAGMENT}
  ${MESSAGE_FRAGMENT}
`

// =============================================
// QUERIES
// =============================================

export const GET_USER_CHATS = gql`
  query GetUserChats {
    chats(order_by: {updated_at: desc}) {
      ...ChatWithLastMessageFragment
    }
  }
  ${CHAT_WITH_LAST_MESSAGE_FRAGMENT}
`

export const GET_CHAT_MESSAGES = gql`
  query GetChatMessages($chatId: uuid!) {
    messages(
      where: {chat_id: {_eq: $chatId}}
      order_by: {created_at: asc}
    ) {
      ...MessageFragment
    }
  }
  ${MESSAGE_FRAGMENT}
`

export const GET_CHAT_WITH_MESSAGES = gql`
  query GetChatWithMessages($chatId: uuid!) {
    chats_by_pk(id: $chatId) {
      ...ChatWithMessagesFragment
    }
  }
  ${CHAT_WITH_MESSAGES_FRAGMENT}
`

// =============================================
// MUTATIONS
// =============================================

export const CREATE_CHAT = gql`
  mutation CreateChat($title: String) {
    insert_chats_one(object: {title: $title}) {
      ...ChatFragment
    }
  }
  ${CHAT_FRAGMENT}
`

export const UPDATE_CHAT = gql`
  mutation UpdateChat($chatId: uuid!, $title: String!) {
    update_chats_by_pk(
      pk_columns: {id: $chatId}
      _set: {title: $title}
    ) {
      ...ChatFragment
    }
  }
  ${CHAT_FRAGMENT}
`

export const DELETE_CHAT = gql`
  mutation DeleteChat($chatId: uuid!) {
    delete_chats_by_pk(id: $chatId) {
      id
    }
  }
`

export const SEND_MESSAGE = gql`
  mutation SendMessage($chatId: uuid!, $content: String!, $isBot: Boolean = false) {
    insert_messages_one(object: {
      chat_id: $chatId
      content: $content
      is_bot: $isBot
    }) {
      ...MessageFragment
    }
  }
  ${MESSAGE_FRAGMENT}
`

export const UPDATE_MESSAGE = gql`
  mutation UpdateMessage($messageId: uuid!, $content: String!) {
    update_messages_by_pk(
      pk_columns: {id: $messageId}
      _set: {content: $content}
    ) {
      ...MessageFragment
    }
  }
  ${MESSAGE_FRAGMENT}
`

export const DELETE_MESSAGE = gql`
  mutation DeleteMessage($messageId: uuid!) {
    delete_messages_by_pk(id: $messageId) {
      id
    }
  }
`

// =============================================
// SUBSCRIPTIONS
// =============================================

export const SUBSCRIBE_TO_CHAT_MESSAGES = gql`
  subscription SubscribeToChatMessages($chatId: uuid!) {
    messages(
      where: {chat_id: {_eq: $chatId}}
      order_by: {created_at: asc}
    ) {
      ...MessageFragment
    }
  }
  ${MESSAGE_FRAGMENT}
`

export const SUBSCRIBE_TO_USER_CHATS = gql`
  subscription SubscribeToUserChats {
    chats(order_by: {updated_at: desc}) {
      ...ChatWithLastMessageFragment
    }
  }
  ${CHAT_WITH_LAST_MESSAGE_FRAGMENT}
`

// =============================================
// HASURA ACTIONS
// =============================================

export const SEND_MESSAGE_ACTION = gql`
  mutation SendMessageAction($chatId: uuid!, $content: String!) {
    sendMessage(chat_id: $chatId, content: $content) {
      success
      message
      bot_response
    }
  }
`