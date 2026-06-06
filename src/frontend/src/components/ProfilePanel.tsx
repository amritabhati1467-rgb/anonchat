import { useMyId } from "@/hooks/useMyId";
import { useSetNickname } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { Check, Copy, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ProfilePanelProps {
  nickname: string | null;
  onClose: () => void;
}

export default function ProfilePanel({ nickname, onClose }: ProfilePanelProps) {
  const { myId } = useMyId();
  const setNickname = useSetNickname();
  const [value, setValue] = useState(nickname ?? "");
  const [copied, setCopied] = useState(false);

  const displayId =
    myId !== null ? myId.toString().padStart(7, "0") : "-------";

  useEffect(() => {
    setValue(nickname ?? "");
  }, [nickname]);

  function copyId() {
    if (!myId) return;
    navigator.clipboard.writeText(myId.toString()).then(() => {
      setCopied(true);
      toast.success("ID copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    try {
      await setNickname.mutateAsync(trimmed || null);
      toast.success(
        trimmed ? `Nickname set to "${trimmed}"` : "Nickname cleared",
      );
      onClose();
    } catch {
      toast.error("Failed to save nickname");
    }
  }

  return (
    <div
      className="mx-2 mb-3 rounded-2xl border border-border bg-card shadow-lg"
      data-ocid="profile_panel.panel"
    >
      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="font-display text-sm font-semibold text-foreground">
          Your Profile
        </h3>
        <button
          type="button"
          onClick={onClose}
          data-ocid="profile_panel.close_button"
          className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Close profile"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-4 py-3 space-y-4">
        {/* Your ID (read-only) */}
        <div>
          <p className="mb-1 block text-xs font-medium text-muted-foreground">
            Your Anonymous ID
          </p>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
            <span className="flex-1 font-mono text-sm font-bold text-primary tracking-wider">
              #{displayId}
            </span>
            <button
              type="button"
              onClick={copyId}
              data-ocid="profile_panel.copy_id_button"
              className={cn(
                "flex-shrink-0 rounded p-1 transition-colors",
                copied
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/10",
              )}
              aria-label="Copy ID"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Share this ID so others can start a chat with you
          </p>
        </div>

        {/* Nickname */}
        <form onSubmit={handleSave}>
          <label
            htmlFor="profile-nickname"
            className="mb-1 block text-xs font-medium text-muted-foreground"
          >
            Nickname{" "}
            <span className="text-muted-foreground/60">(optional)</span>
          </label>
          <input
            id="profile-nickname"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. Alex, Ghost, Wanderer…"
            maxLength={32}
            data-ocid="profile_panel.nickname_input"
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={setNickname.isPending}
            data-ocid="profile_panel.save_button"
            className={cn(
              "mt-3 w-full rounded-xl py-2 text-sm font-semibold transition-colors",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            {setNickname.isPending ? "Saving…" : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}
