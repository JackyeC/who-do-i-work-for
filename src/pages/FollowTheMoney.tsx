import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usePageSEO } from "@/hooks/use-page-seo";
import { useAuth } from "@/contexts/AuthContext";
import { SignupGate } from "@/components/SignupGate";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";

export default function FollowTheMoney() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const companySlug = searchParams.get("company")?.trim() || "";

  const { data: resolvedSearchQuery } = useQuery({
    queryKey: ["follow-the-money-company", companySlug],
    queryFn: async () => {
      const { data } = await supabase.from("companies").select("name").eq("slug", companySlug).maybeSingle();
      if (data?.name?.trim()) return data.name.trim();
      return null;
    },
    enabled: !!user && companySlug.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const iframeSrc = useMemo(() => {
    const base = "/follow-the-money-app.html?embed=true";
    const q =
      resolvedSearchQuery ||
      (companySlug ? companySlug.replace(/-/g, " ") : "");
    if (!q) return base;
    return `${base}&q=${encodeURIComponent(q)}`;
  }, [companySlug, resolvedSearchQuery]);

  usePageSEO({
    title: "Follow the Money — Corporate Political Influence Map",
    description:
      "Interactive investigation board showing corporate PAC donations, lobbying, dark money channels, and revolving door connections to Congress. Built from FEC filings, Senate LDA disclosures, and verified public records.",
    path: "/follow-the-money",
  });

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Follow the Money</h1>
            <p className="text-muted-foreground text-sm">Interactive investigation board: corporate PAC donations, lobbying, dark money channels, and revolving door connections to Congress.</p>
          </div>
          <SignupGate feature="the Follow the Money investigation board" blurPreview={false} />
        </main>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-screen h-screen" style={{ top: "var(--nav-offset, 0px)" }}>
      <iframe
        key={iframeSrc}
        src={iframeSrc}
        title="Follow the Money — Corporate Political Influence Map"
        className="w-full h-full border-0"
        style={{ height: "calc(100vh - var(--nav-offset, 0px))" }}
        allow="fullscreen"
      />
    </div>
  );
}
