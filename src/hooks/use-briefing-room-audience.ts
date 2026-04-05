import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  BRIEFING_ROOM_SIGNUP_AT_KEY,
  getBriefingRoomFoundingMonth,
  getBriefingRoomFoundingYear,
  isBriefingRoomLimitedAudience,
  isIsoInFoundingCampaignMonth,
} from "@/config/briefingRoom";

export type BriefingRoomAudienceGateState = {
  /** Eligible to see and purchase The Briefing Room */
  showBriefingRoom: boolean;
  /** Auth + optional RPC settled enough to decide (avoids flashing the block off then on) */
  ready: boolean;
};

/**
 * Founding Supporters: /join or /hire during the founding month (localStorage timestamp), account
 * created that month, or early_access_signups row that month (RPC + server checkout).
 */
export function useBriefingRoomAudienceGate(): BriefingRoomAudienceGateState {
  const { user, loading } = useAuth();
  const limited = isBriefingRoomLimitedAudience();
  const foundingYear = getBriefingRoomFoundingYear();
  const foundingMonth = getBriefingRoomFoundingMonth();

  const signedAtRaw =
    typeof window !== "undefined" ? localStorage.getItem(BRIEFING_ROOM_SIGNUP_AT_KEY) : null;
  const localFounding = isIsoInFoundingCampaignMonth(signedAtRaw);

  const accountFounding = user?.created_at ? isIsoInFoundingCampaignMonth(user.created_at) : false;

  const needRpc = limited && !!user && !localFounding && !accountFounding;

  const { data: joinListFounding, isLoading: rpcLoading } = useQuery({
    queryKey: ["briefing-room-founding-rpc", user?.id, foundingYear, foundingMonth],
    enabled: needRpc,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("is_briefing_room_founding_audience", {
        p_year: foundingYear,
        p_month: foundingMonth,
      });
      if (error) throw error;
      return !!data;
    },
  });

  if (!limited) {
    return { showBriefingRoom: true, ready: true };
  }

  if (localFounding) {
    return { showBriefingRoom: true, ready: true };
  }

  if (loading) {
    return { showBriefingRoom: false, ready: false };
  }

  if (!user) {
    return { showBriefingRoom: false, ready: true };
  }

  if (accountFounding) {
    return { showBriefingRoom: true, ready: true };
  }

  if (needRpc && rpcLoading) {
    return { showBriefingRoom: false, ready: false };
  }

  if (joinListFounding) {
    return { showBriefingRoom: true, ready: true };
  }

  return { showBriefingRoom: false, ready: true };
}
