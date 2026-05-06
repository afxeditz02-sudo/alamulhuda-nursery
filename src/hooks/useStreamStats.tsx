import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Tracks the current viewer (presence) count for a given stream and
 * increments the persistent total view counter exactly once per mount.
 */
export const useStreamStats = (streamId: string | null | undefined) => {
  const [viewers, setViewers] = useState(0);
  const incrementedRef = useRef(false);

  useEffect(() => {
    if (!streamId) return;

    // Increment total views once per session/mount
    if (!incrementedRef.current) {
      incrementedRef.current = true;
      supabase.rpc("increment_live_stream_views", { _stream_id: streamId }).then(({ error }) => {
        if (error) console.warn("view increment failed", error.message);
      });
    }

    const key = crypto.randomUUID();
    const channel = supabase.channel(`stream-presence:${streamId}`, {
      config: { presence: { key } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setViewers(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [streamId]);

  return { viewers };
};
