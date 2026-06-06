import { createActor } from "@/backend";
import { getOrCreateToken } from "@/lib/token";
import { useActor } from "@caffeineai/core-infrastructure";
import { useEffect, useState } from "react";

export function useMyId() {
  const { actor, isFetching } = useActor(createActor);
  const [myId, setMyId] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run only when actor readiness changes
  useEffect(() => {
    if (!actor || isFetching) return;
    const token = getOrCreateToken();
    setLoading(true);
    actor
      .registerUser(token)
      .then((id) => {
        setMyId(id);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(String(err));
        setLoading(false);
      });
  }, [isFetching]);

  return { myId, loading, error };
}
