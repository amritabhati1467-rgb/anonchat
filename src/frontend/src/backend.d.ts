import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type UserId = bigint;
export type Timestamp = bigint;
export type MessageId = bigint;
export interface Message {
    id: MessageId;
    text: string;
    sentAt: Timestamp;
    conversationId: ConversationId;
    senderId: UserId;
}
export interface ConversationSummary {
    id: ConversationId;
    otherUserId: UserId;
    lastActivityAt: Timestamp;
    otherUserNickname?: string;
}
export interface UserInfo {
    id: UserId;
    nickname?: string;
    createdAt: Timestamp;
}
export type ConversationId = bigint;
export interface backendInterface {
    getMessages(token: string, conversationId: ConversationId): Promise<Array<Message>>;
    getMessagesSince(token: string, conversationId: ConversationId, since: Timestamp): Promise<Array<Message>>;
    getMyProfile(token: string): Promise<UserInfo | null>;
    getUserById(userId: UserId): Promise<UserInfo | null>;
    listConversations(token: string): Promise<Array<ConversationSummary>>;
    registerUser(token: string): Promise<UserId>;
    sendMessage(token: string, conversationId: ConversationId, text: string): Promise<MessageId | null>;
    setNickname(token: string, nickname: string | null): Promise<void>;
    startConversation(token: string, otherUserId: UserId): Promise<ConversationId | null>;
}
