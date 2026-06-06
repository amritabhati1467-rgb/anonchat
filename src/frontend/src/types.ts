import type { Principal } from "@icp-sdk/core/principal";

export type UserId = bigint;
export type Timestamp = bigint;
export type MessageId = bigint;
export type ConversationId = bigint;

export interface User {
  id: UserId;
  nickname?: string;
  createdAt: Timestamp;
}

export interface Message {
  id: MessageId;
  text: string;
  sentAt: Timestamp;
  conversationId: ConversationId;
  senderId: UserId;
}

export interface Conversation {
  id: ConversationId;
  otherUserId: UserId;
  lastActivityAt: Timestamp;
  otherUserNickname?: string;
  messages: Message[];
}

export interface ConversationSummary {
  id: ConversationId;
  otherUserId: UserId;
  lastActivityAt: Timestamp;
  otherUserNickname?: string;
}

// Re-export from backend types
export type { Principal };
