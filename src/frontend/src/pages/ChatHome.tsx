import NewChatDialog from "@/components/NewChatDialog";
import { useMyId } from "@/hooks/useMyId";
import { useGetMyProfile } from "@/hooks/useQueries";
import { Copy, MessageSquare, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ChatHome() {
  const { myId } = useMyId();
  const { data: myProfile } = useGetMyProfile();
  const [newChatOpen, setNewChatOpen] = useState(false);

  const displayId =
    myId !== null ? myId.toString().padStart(7, "0") : "-------";
  const nickname = myProfile?.nickname ?? null;

  function copyId() {
    if (!myId) return;
    navigator.clipboard.writeText(myId.toString()).then(() => {
      toast.success("Copied!");
    });
  }

  return (
    <>
      <NewChatDialog open={newChatOpen} onClose={() => setNewChatOpen(false)} />

      <div
        className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center bg-background"
        data-ocid="chathome.welcome_panel"
      >
        {/* Icon */}
        <div className="rounded-full bg-primary/10 p-6 ring-2 ring-primary/20">
          <MessageSquare className="h-12 w-12 text-primary" />
        </div>

        {/* Welcome text */}
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Welcome to AnoChat
          </h1>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            Your identity is anonymous and permanent — share your ID with anyone
            to start chatting.
          </p>
        </div>

        {/* ID card */}
        <div className="w-full max-w-xs rounded-2xl border border-border bg-card px-5 py-4 shadow-md">
          <p className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Your Anonymous ID
          </p>
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-2xl font-bold text-primary tracking-widest">
              #{displayId}
            </span>
            <button
              type="button"
              onClick={copyId}
              data-ocid="chathome.copy_id_button"
              className="flex-shrink-0 rounded-xl border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors flex items-center gap-1.5"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy
            </button>
          </div>
          {nickname && (
            <p className="mt-2 text-sm text-muted-foreground">
              Nickname:{" "}
              <span className="text-foreground font-medium">{nickname}</span>
            </p>
          )}
        </div>

        {/* Instructions */}
        <div className="w-full max-w-xs rounded-xl border border-border/60 bg-card/50 px-4 py-3 text-left space-y-2">
          <p className="text-xs font-semibold text-foreground">How it works</p>
          <ol className="space-y-1.5 text-xs text-muted-foreground list-decimal list-inside">
            <li>Share your ID with someone you want to chat with</li>
            <li>Ask for their ID</li>
            <li>Tap "New Chat" in the sidebar and enter their ID</li>
          </ol>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={() => setNewChatOpen(true)}
          data-ocid="chathome.welcome_new_chat_button"
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-md"
        >
          <Plus className="h-4 w-4" />
          Start a new chat
        </button>
      </div>
    </>
  );
}
