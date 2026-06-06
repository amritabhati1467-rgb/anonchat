import type { ConversationSummary } from "@/backend";
import NewChatDialog from "@/components/NewChatDialog";
import ProfilePanel from "@/components/ProfilePanel";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMyId } from "@/hooks/useMyId";
import { useGetMyProfile, useListConversations } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { Outlet, useNavigate, useParams } from "@tanstack/react-router";
import { Copy, Hash, MessageSquare, Plus, Settings } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const AVATAR_HUES = [120, 200, 260, 40, 320, 180, 80];

function ConversationItem({
  conv,
  index,
  isActive,
  onClick,
}: {
  conv: ConversationSummary;
  index: number;
  isActive: boolean;
  onClick: () => void;
}) {
  const displayName = conv.otherUserNickname
    ? (conv.otherUserNickname[0] ??
      `User-${conv.otherUserId.toString().padStart(4, "0")}`)
    : `User-${conv.otherUserId.toString().padStart(4, "0")}`;
  const initials = displayName.slice(0, 2).toUpperCase();
  const hue = AVATAR_HUES[Number(conv.otherUserId) % AVATAR_HUES.length];
  const ms = Number(conv.lastActivityAt / 1_000_000n);
  const d = new Date(ms);
  const now = new Date();
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const timeLabel = isToday
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString([], { month: "short", day: "numeric" });

  return (
    <button
      type="button"
      onClick={onClick}
      data-ocid={`conversations.item.${index + 1}`}
      className={cn(
        "flex w-full items-center gap-3 px-3 py-3 mx-2 rounded-xl cursor-pointer text-left",
        "transition-colors duration-150",
        isActive
          ? "bg-primary/15 border border-primary/30"
          : "hover:bg-secondary/80",
      )}
    >
      <div
        className="h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
        style={{
          background: `oklch(0.35 0.12 ${hue})`,
          color: `oklch(0.9 0.05 ${hue})`,
        }}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-1">
          <span className="text-sm font-semibold text-foreground truncate">
            {displayName}
          </span>
          <span className="text-[10px] text-muted-foreground flex-shrink-0">
            {timeLabel}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          Tap to open
        </p>
      </div>
    </button>
  );
}

export default function Layout() {
  const isMobile = useIsMobile();
  const { myId } = useMyId();
  const { data: conversations, isLoading: convsLoading } =
    useListConversations();
  const { data: myProfile } = useGetMyProfile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const activeConvId =
    (params as Record<string, string>).conversationId ?? null;

  const displayId =
    myId !== null ? myId.toString().padStart(7, "0") : "-------";
  const nickname = myProfile?.nickname ?? null;

  function copyId() {
    if (!myId) return;
    navigator.clipboard.writeText(myId.toString()).then(() => {
      toast.success("Your ID copied to clipboard!");
    });
  }

  const sidebarContent = (
    <>
      {/* Sidebar header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-card flex-shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <span className="font-display text-lg font-semibold text-foreground">
            AnoChat
          </span>
        </div>
        <button
          type="button"
          onClick={() => setProfileOpen((v) => !v)}
          data-ocid="sidebar.profile_button"
          className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Edit profile"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      {/* Profile panel (inline, collapsible) */}
      {profileOpen && (
        <ProfilePanel
          nickname={nickname}
          onClose={() => setProfileOpen(false)}
        />
      )}

      {/* My ID Banner — hidden when profile panel is open */}
      {!profileOpen && (
        <div className="mx-3 my-2 flex flex-col rounded-xl bg-primary/10 border border-primary/20 px-3 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <Hash className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <span className="font-mono text-sm font-bold text-primary truncate">
                #{displayId}
              </span>
            </div>
            <button
              type="button"
              onClick={copyId}
              data-ocid="sidebar.copy_id_button"
              className="ml-2 flex-shrink-0 rounded p-1 text-primary/70 hover:text-primary hover:bg-primary/10 transition-colors"
              aria-label="Copy your ID"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
          {nickname && (
            <p className="mt-0.5 text-xs text-muted-foreground truncate pl-5">
              {nickname}
            </p>
          )}
        </div>
      )}

      {/* New Chat button */}
      <div className="px-3 pb-2 flex-shrink-0">
        <button
          type="button"
          onClick={() => setNewChatOpen(true)}
          data-ocid="sidebar.new_chat_button"
          className="flex w-full items-center gap-2 rounded-xl bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </button>
      </div>

      {/* Conversation list */}
      <div
        className="flex-1 overflow-y-auto"
        data-ocid="sidebar.conversation_list"
      >
        {convsLoading ? (
          <div
            className="space-y-1 px-3 py-1"
            data-ocid="sidebar.conversations_loading_state"
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl px-3 py-3"
              >
                <div className="h-10 w-10 rounded-full bg-secondary animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-24 rounded bg-secondary animate-pulse" />
                  <div className="h-2.5 w-32 rounded bg-secondary animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations && conversations.length > 0 ? (
          <div className="py-1 space-y-0.5">
            {conversations.map((conv, i) => (
              <ConversationItem
                key={conv.id.toString()}
                conv={conv}
                index={i}
                isActive={activeConvId === conv.id.toString()}
                onClick={() => {
                  navigate({
                    to: "/chat/$conversationId",
                    params: { conversationId: conv.id.toString() },
                  });
                  if (isMobile) setSidebarOpen(false);
                }}
              />
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center py-10 text-center px-4"
            data-ocid="sidebar.conversations_empty_state"
          >
            <MessageSquare className="h-7 w-7 text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">
              No conversations yet
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Tap "New Chat" to get started
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border px-4 py-3 text-center flex-shrink-0">
        <p className="text-[10px] text-muted-foreground">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* New Chat Dialog (global, portal-like overlay) */}
      <NewChatDialog open={newChatOpen} onClose={() => setNewChatOpen(false)} />

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
          className="fixed inset-0 z-20 bg-background/80 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setSidebarOpen(false);
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        data-ocid="sidebar.panel"
        className={cn(
          "flex flex-col border-r border-border",
          "bg-[oklch(var(--sidebar))]",
          "transition-transform duration-300 ease-in-out",
          isMobile
            ? cn(
                "fixed inset-y-0 left-0 z-30 w-80",
                sidebarOpen ? "translate-x-0" : "-translate-x-full",
              )
            : "relative w-80 flex-shrink-0",
        )}
      >
        {sidebarContent}
      </aside>

      {/* Main chat area */}
      <main
        data-ocid="main.chat_panel"
        className="flex flex-1 flex-col min-w-0 bg-background"
      >
        {/* Mobile top bar */}
        {isMobile && (
          <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              data-ocid="main.open_sidebar_button"
              className="flex flex-col gap-1 rounded p-1 text-foreground"
              aria-label="Open sidebar"
            >
              <span className="block h-0.5 w-5 bg-current rounded" />
              <span className="block h-0.5 w-5 bg-current rounded" />
              <span className="block h-0.5 w-5 bg-current rounded" />
            </button>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span className="font-display font-semibold">AnoChat</span>
            </div>
          </div>
        )}

        {/* Page content */}
        <div className="flex flex-1 overflow-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
