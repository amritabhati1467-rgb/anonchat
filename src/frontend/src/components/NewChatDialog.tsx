import { useMyId } from "@/hooks/useMyId";
import { useStartConversation } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface NewChatDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function NewChatDialog({ open, onClose }: NewChatDialogProps) {
  const { myId } = useMyId();
  const startConversation = useStartConversation();
  const navigate = useNavigate();
  const [targetId, setTargetId] = useState("");
  const [validationError, setValidationError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTargetId("");
      setValidationError("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  function validate(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) return "Please enter an ID";
    if (!/^\d+$/.test(trimmed)) return "ID must be a number";
    if (myId !== null && BigInt(trimmed) === myId) return "That's your own ID";
    return "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate(targetId);
    if (err) {
      setValidationError(err);
      return;
    }
    const parsed = BigInt(targetId.trim());
    try {
      const result = await startConversation.mutateAsync(parsed);
      if (result === null || result === undefined) {
        toast.error("User not found. Check the ID and try again.");
        return;
      }
      onClose();
      toast.success("Conversation started!");
      await navigate({
        to: "/chat/$conversationId",
        params: { conversationId: result.toString() },
      });
    } catch {
      toast.error("Failed to start conversation");
    }
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        role="button"
        tabIndex={-1}
        aria-label="Close dialog"
        className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        data-ocid="new_chat_dialog.backdrop"
      />

      {/* Dialog */}
      <dialog
        open
        aria-label="Start a new chat"
        className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card shadow-2xl m-0 p-0"
        data-ocid="new_chat_dialog.dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-base font-semibold text-foreground">
            Start a new chat
          </h2>
          <button
            type="button"
            onClick={onClose}
            data-ocid="new_chat_dialog.close_button"
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div>
            <label
              htmlFor="new-chat-id"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Enter the person&apos;s ID
            </label>
            <input
              ref={inputRef}
              id="new-chat-id"
              type="text"
              inputMode="numeric"
              placeholder="e.g. 1234567"
              value={targetId}
              onChange={(e) => {
                setTargetId(e.target.value);
                if (validationError) setValidationError("");
              }}
              data-ocid="new_chat_dialog.target_id_input"
              className={cn(
                "w-full rounded-xl border bg-background px-3 py-2.5 text-sm text-foreground",
                "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                validationError ? "border-destructive" : "border-input",
              )}
            />
            {validationError && (
              <p
                className="mt-1.5 text-xs text-destructive"
                data-ocid="new_chat_dialog.field_error"
              >
                {validationError}
              </p>
            )}
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Ask the other person to share their ID from the sidebar. Once you
            connect, your chat stays private and anonymous.
          </p>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              data-ocid="new_chat_dialog.cancel_button"
              className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!targetId.trim() || startConversation.isPending}
              data-ocid="new_chat_dialog.submit_button"
              className={cn(
                "flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "disabled:opacity-40 disabled:cursor-not-allowed",
              )}
            >
              {startConversation.isPending ? "Connecting…" : "Start Chat"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
