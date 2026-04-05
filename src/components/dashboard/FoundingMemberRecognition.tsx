import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Award, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRecognitionBadges } from "@/hooks/use-recognition-badges";
import { FoundingMemberBadge } from "@/components/FoundingMemberBadge";
import { supabase } from "@/integrations/supabase/client";

const JACKYE_FOUNDING_EMAIL = "jackyeclayton@gmail.com";

const anim = (delay: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

type FmRpcResult =
  | { mode: "ok"; eligible: boolean; memberNumber: number }
  | { mode: "unavailable" };

function parseFmRpc(data: unknown): { eligible: boolean; memberNumber: number } {
  if (data && typeof data === "object" && "eligible" in data) {
    const o = data as { eligible?: boolean; member_number?: number };
    return {
      eligible: !!o.eligible,
      memberNumber: typeof o.member_number === "number" ? o.member_number : 1,
    };
  }
  return { eligible: false, memberNumber: 1 };
}

type FoundingMemberRecognitionProps = {
  /** Optional greeting name for banner context only */
  firstName?: string;
};

/**
 * Founding Member card on the dashboard feed + shareable badge modal.
 * Eligible if: RPC says so (badge row OR early_access_signups email), or legacy fallback (badge row / founder email).
 */
export function FoundingMemberRecognition(_props: FoundingMemberRecognitionProps) {
  const { user } = useAuth();
  const { data: badges, isLoading: badgesLoading } = useRecognitionBadges();
  const [showModal, setShowModal] = useState(false);

  const { data: fmRpc, isLoading: fmLoading } = useQuery({
    queryKey: ["founding-member-badge-info", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<FmRpcResult> => {
      const { data, error } = await supabase.rpc("get_founding_member_badge_info");
      if (error) {
        console.warn("[FoundingMemberRecognition] get_founding_member_badge_info:", error.message);
        return { mode: "unavailable" };
      }
      const parsed = parseFmRpc(data);
      return {
        mode: "ok",
        eligible: parsed.eligible,
        memberNumber: parsed.memberNumber,
      };
    },
  });

  const row = badges?.find((b) => b.badge_key === "founding_member");
  const email = user?.email?.trim().toLowerCase() ?? "";
  const jackyeFallback = email === JACKYE_FOUNDING_EMAIL;

  const legacyEligible = row != null || jackyeFallback;
  const legacyMemberNumber = row != null ? (row.member_number ?? 1) : jackyeFallback ? 1 : undefined;

  const showBanner =
    !!user &&
    !badgesLoading &&
    !fmLoading &&
    ((fmRpc?.mode === "ok" && fmRpc.eligible) || (fmRpc?.mode === "unavailable" && legacyEligible));

  const memberNumber =
    fmRpc?.mode === "ok" && fmRpc.eligible
      ? fmRpc.memberNumber
      : fmRpc?.mode === "unavailable"
        ? legacyMemberNumber
        : undefined;

  if (!showBanner || memberNumber == null) {
    return null;
  }

  const bannerTitle = row?.title ?? "Founding Member";
  const bannerSubtitle =
    row?.subtitle ??
    "Your numbered badge is yours to keep — open the card to download or share anytime.";

  /** Handle-style line on the PNG (matches classic founding card: e.g. jackyeclayton) */
  const badgeHandle = user?.email?.split("@")[0] ?? "member";

  return (
    <>
      <motion.div {...anim(0.03)}>
        <div
          className="rounded-2xl p-5 border cursor-pointer transition-all hover:scale-[1.005]"
          style={{
            background: "linear-gradient(135deg, rgba(240,192,64,0.06) 0%, rgba(240,192,64,0.02) 100%)",
            borderColor: "rgba(240,192,64,0.2)",
          }}
          onClick={() => setShowModal(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setShowModal(true);
            }
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: "radial-gradient(circle, rgba(240,192,64,0.15) 0%, transparent 70%)",
                border: "1.5px solid rgba(240,192,64,0.3)",
              }}
            >
              <Award className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-foreground">{bannerTitle}</h3>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30">
                  #{String(memberNumber).padStart(4, "0")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{bannerSubtitle}</p>
            </div>
            <span className="text-xs font-semibold text-primary whitespace-nowrap flex items-center gap-1 shrink-0">
              View badge <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </motion.div>

      {showModal && (
        <FoundingMemberBadge
          memberName={badgeHandle}
          memberNumber={memberNumber}
          joinedDate={user?.created_at}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
