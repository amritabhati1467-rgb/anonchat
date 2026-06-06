import { createActor } from "@/backend";
import type {
  ConversationId,
  ConversationSummary,
  Message,
  UserInfo,
} from "@/backend";
import { getOrCreateToken } from "@/lib/token";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useListConversations() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<ConversationSummary[]>({
    queryKey: ["conversations"],
    queryFn: async () => {
      if (!actor) return [];
      const token = getOrCreateToken();
      return actor.listConversations(token);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 3000,
  });
}

export function useMessages(conversationId: ConversationId | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Message[]>({
    queryKey: ["messages", conversationId?.toString()],
    queryFn: async () => {
      if (!actor || !conversationId) return [];
      const token = getOrCreateToken();
      return actor.getMessages(token, conversationId);
    },
    enabled: !!actor && !isFetching && conversationId !== null,
    refetchInterval: 2000,
  });
}

export function useGetMyProfile() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<UserInfo | null>({
    queryKey: ["myProfile"],
    queryFn: async () => {
      if (!actor) return null;
      const token = getOrCreateToken();
      return actor.getMyProfile(token);
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useGetConversation(conversationId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<ConversationSummary | null>({
    queryKey: ["conversation", conversationId?.toString()],
    queryFn: async () => {
      if (!actor || !conversationId) return null;
      const token = getOrCreateToken();
      const list = await actor.listConversations(token);
      return list.find((c) => c.id === conversationId) ?? null;
    },
    enabled: !!actor && !isFetching && conversationId !== null,
    staleTime: 10_000,
  });
}

export function useGetUser(userId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<UserInfo | null>({
    queryKey: ["user", userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getUserById(userId);
    },
    enabled: !!actor && !isFetching && userId !== null,
    staleTime: 60_000,
  });
}

export function useSendMessage() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      conversationId,
      text,
    }: { conversationId: ConversationId; text: string }) => {
      if (!actor) throw new Error("Not connected");
      const token = getOrCreateToken();
      return actor.sendMessage(token, conversationId, text);
    },
    onSuccess: (_data, { conversationId }) => {
      qc.invalidateQueries({
        queryKey: ["messages", conversationId.toString()],
      });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useStartConversation() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (otherUserId: bigint) => {
      if (!actor) throw new Error("Not connected");
      const token = getOrCreateToken();
      return actor.startConversation(token, otherUserId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useSetNickname() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (nickname: string | null) => {
      if (!actor) throw new Error("Not connected");
      const token = getOrCreateToken();
      return actor.setNickname(token, nickname);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myProfile"] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
