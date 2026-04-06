import { useEffect, useRef, useCallback } from "react";
import { usePageSEO } from "@/hooks/use-page-seo";
import { useLinkedIn, type CertificateShareParams } from "@/hooks/use-linkedin";
import { useAuth } from "@/contexts/AuthContext";
import { SignupGate } from "@/components/SignupGate";
import { Header } from "@/components/Header";

const PeoplePuzzles = () => {
  const { user } = useAuth();

  usePageSEO({
    title: "PeoplePuzzles™ — Decision simulation for hiring intelligence | Who Do I Work For",
    description: "Decision training: combine elements, spot patterns, earn validations. Every combo ties to real WDIWF intelligence — receipts before you sign. By Jackye Clayton.",
    path: "/peoplepuzzles"
  });

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { isConnected, shareCertificate, connectLinkedIn } = useLinkedIn();

  // LinkedIn share requests from the PeoplePuzzles iframe
  const handleMessage = useCallback(async (event: MessageEvent) => {
    if (event.data?.type !== "WDIWF_LINKEDIN_SHARE") return;

    const p = event.data.payload as CertificateShareParams;
    const iframe = iframeRef.current?.contentWindow;

    if (!isConnected) {
      iframe?.postMessage({
        type: "WDIWF_LINKEDIN_RESULT",
        success: false,
        needsAuth: true,
        error: "Connect LinkedIn first to auto-share."
      }, "*");
      connectLinkedIn("/peoplepuzzles");
      return;
    }

    try {
      const result = await shareCertificate(p);
      iframe?.postMessage({
        type: "WDIWF_LINKEDIN_RESULT",
        success: true,
        postId: result.postId,
      }, "*");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to share on LinkedIn";
      if (message === "NEEDS_AUTH") {
        iframe?.postMessage({
          type: "WDIWF_LINKEDIN_RESULT",
          success: false,
          needsAuth: true,
          error: "LinkedIn session expired. Reconnecting..."
        }, "*");
        connectLinkedIn("/peoplepuzzles");
      } else {
        iframe?.postMessage({
          type: "WDIWF_LINKEDIN_RESULT",
          success: false,
          error: message
        }, "*");
      }
    }
  }, [isConnected, shareCertificate, connectLinkedIn]);

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">PeoplePuzzles™</h1>
            <p className="text-muted-foreground text-sm">Decision simulation for hiring intelligence. 72 combos. 6 tiers. 8 validations. Built on real recruiting intelligence by Jackye Clayton.</p>
          </div>
          <SignupGate feature="PeoplePuzzles™ decision simulation" blurPreview={false} />
        </main>
      </div>
    );
  }

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", background: "#0A0A0E" }}>
      <iframe
        ref={iframeRef}
        src="/peoplepuzzles-app.html"
        title="PeoplePuzzles™ decision simulation — Who Do I Work For"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          display: "block",
        }}
        allow="clipboard-write"
      />
    </div>
  );
};

export default PeoplePuzzles;
