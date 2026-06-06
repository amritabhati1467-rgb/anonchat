import type { ConversationId, Message } from "@/backend";
import { useMyId } from "@/hooks/useMyId";
import {
  useGetConversation,
  useMessages,
  useSendMessage,
} from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function formatMsgTime(timestamp: bigint): string {
  const ms = Number(timestamp / 1_000_000n);
  return new Date(ms).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MessageBubble({
  msg,
  isMine,
  index,
}: { msg: Message; isMine: boolean; index: number }) {
  return (
    <div
      data-ocid={`chatroom.message.${index + 1}`}
      className={cn("flex w-full", isMine ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[72%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed break-words",
          isMine
            ? "rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-bl-sm bg-card text-card-foreground",
        )}
      >
        <p>{msg.text}</p>
        <p
          className={cn(
            "mt-0.5 text-right text-[10px]",
            isMine ? "text-primary-foreground/70" : "text-muted-foreground",
          )}
        >
          {formatMsgTime(msg.sentAt)}
        </p>
      </div>
    </div>
  );
}

export default function ChatRoom() {
  const { conversationId } = useParams({ from: "/chat/$conversationId" });
  const { myId } = useMyId();
  const convIdBig: ConversationId = BigInt(conversationId);

  // useMessages already has refetchInterval: 2000 set in useQueries.ts
  const { data: messages, isLoading } = useMessages(convIdBig);
  const { data: conversation } = useGetConversation(convIdBig);
  const sendMessage = useSendMessage();
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Display name: use nickname from conversation summary, else derive from messages
  const displayName = (() => {
    if (conversation) {
      const nick = conversation.otherUserNickname;
      const rawNick = Array.isArray(nick) ? nick[0] : (nick ?? undefined);
      if (rawNick) return rawNick;
      return `User-${conversation.otherUserId.toString().padStart(4, "0")}`;
    }
    const otherUserId = messages?.find((m) => m.senderId !== myId)?.senderId;
    if (otherUserId) return `User-${otherUserId.toString().padStart(4, "0")}`;
    return `Conversation #${conversationId}`;
  })();

  const initials = displayName.slice(0, 2).toUpperCase();
  const hues = [120, 200, 260, 40, 320, 180, 80];
  const avatarHue = conversation
    ? hues[Number(conversation.otherUserId) % hues.length]
    : 120;

  const messageCount = messages?.length ?? 0;

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally scroll only when message count changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageCount]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setText("");
    try {
      await sendMessage.mutateAsync({
        conversationId: convIdBig,
        text: trimmed,
      });
    } catch {
      setText(trimmed);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as unknown as React.FormEvent);
    }
  }

  return (
    <div
      className="flex h-full w-full flex-col bg-background"
      data-ocid="chatroom.page"
    >
      {/* Chat header */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 flex-shrink-0">
        <Link
          to="/"
          data-ocid="chatroom.back_link"
          className="flex-shrink-0 rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Back to conversations"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        {/* Colored avatar */}
        <div
          className="h-9 w-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
          style={{
            background: `oklch(0.35 0.12 ${avatarHue})`,
            color: `oklch(0.9 0.05 ${avatarHue})`,
          }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-base font-semibold text-foreground truncate">
            {displayName}
          </h1>
          <p className="text-xs text-muted-foreground">Anonymous chat</p>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-2"
        data-ocid="chatroom.messages_list"
      >
        {isLoading ? (
          <div
            className="flex flex-col gap-3"
            data-ocid="chatroom.loading_state"
          >
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  "flex",
                  i % 2 === 0 ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "h-10 rounded-2xl bg-card animate-pulse",
                    i % 2 === 0 ? "w-48" : "w-40",
                  )}
                />
              </div>
            ))}
          </div>
        ) : messages && messages.length > 0 ? (
          messages.map((msg, i) => (
            <MessageBubble
              key={msg.id.toString()}
              msg={msg}
              isMine={msg.senderId === myId}
              index={i}
            />
          ))
        ) : (
          <div
            className="flex flex-1 flex-col items-center justify-center py-16 text-center"
            data-ocid="chatroom.empty_state"
          >
            <div className="rounded-full bg-primary/10 p-4 mb-3">
              <Send className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              No messages yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Say hello to start the conversation!
            </p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSend}
        className="flex-shrink-0 border-t border-border bg-card px-4 py-3"
        data-ocid="chatroom.message_form"
      >
        <div className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message\u2026"
            rows={1}
            data-ocid="chatroom.message_input"
            className={cn(
              "flex-1 resize-none rounded-2xl border border-input bg-background px-4 py-2.5",
              "text-sm text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring",
              "max-h-32 overflow-y-auto leading-relaxed",
            )}
            style={{ fieldSizing: "content" } as React.CSSProperties}
          />
          <button
            type="submit"
            disabled={!text.trim() || sendMessage.isPending}
            data-ocid="chatroom.send_button"
            className={cn(
              "flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full transition-all",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "disabled:opacity-40 disabled:cursor-not-allowed",
            )}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
          Enter to send &middot; Shift+Enter for newline
        </p>
      </form>
    </div>
  );
}
