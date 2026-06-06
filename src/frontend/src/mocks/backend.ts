import type { backendInterface } from "../backend";

const MY_USER_ID = BigInt(7392);
const OTHER_USER_ID = BigInt(7394);
const CONV_ID = BigInt(1);
const now = BigInt(Date.now()) * BigInt(1_000_000);

export const mockBackend: backendInterface = {
  registerUser: async () => MY_USER_ID,

  getMyProfile: async () => ({
    id: MY_USER_ID,
    nickname: undefined,
    createdAt: now - BigInt(3600_000_000_000),
  }),

  getUserById: async (userId) => ({
    id: userId,
    nickname: undefined,
    createdAt: now - BigInt(7200_000_000_000),
  }),

  listConversations: async () => [
    {
      id: CONV_ID,
      otherUserId: OTHER_USER_ID,
      lastActivityAt: now - BigInt(60_000_000_000),
      otherUserNickname: undefined,
    },
    {
      id: BigInt(2),
      otherUserId: BigInt(7383),
      lastActivityAt: now - BigInt(120_000_000_000),
      otherUserNickname: undefined,
    },
    {
      id: BigInt(3),
      otherUserId: BigInt(7395),
      lastActivityAt: now - BigInt(180_000_000_000),
      otherUserNickname: undefined,
    },
  ],

  startConversation: async (_otherUserId) => CONV_ID,

  sendMessage: async (_conversationId, _text) => BigInt(999),

  getMessages: async (_conversationId) => [
    {
      id: BigInt(1),
      conversationId: CONV_ID,
      senderId: MY_USER_ID,
      text: "Hey! How are you?",
      sentAt: now - BigInt(300_000_000_000),
    },
    {
      id: BigInt(2),
      conversationId: CONV_ID,
      senderId: OTHER_USER_ID,
      text: "I'm good, thanks! What's up?",
      sentAt: now - BigInt(240_000_000_000),
    },
    {
      id: BigInt(3),
      conversationId: CONV_ID,
      senderId: MY_USER_ID,
      text: "Just testing the new anonymous chat app.",
      sentAt: now - BigInt(180_000_000_000),
    },
    {
      id: BigInt(4),
      conversationId: CONV_ID,
      senderId: OTHER_USER_ID,
      text: "Looks great! Love the WhatsApp-style UI.",
      sentAt: now - BigInt(120_000_000_000),
    },
    {
      id: BigInt(5),
      conversationId: CONV_ID,
      senderId: MY_USER_ID,
      text: "Thanks! It's built on the Internet Computer.",
      sentAt: now - BigInt(60_000_000_000),
    },
  ],

  getMessagesSince: async (_conversationId, _since) => [],

  setNickname: async (_nickname) => undefined,
};
