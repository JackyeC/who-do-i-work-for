import { usePageSEO } from "@/hooks/use-page-seo";

export default function FollowTheMoney() {
  usePageSEO({
    title: "Follow the Money — Corporate Political Influence Map",
    description:
      "Interactive investigation board showing corporate PAC donations, lobbying, dark money channels, and revolving door connections to Congress. Built from FEC filings, Senate LDA disclosures, and verified public records.",
    path: "/follow-the-money",
  });

  return (
    <div className="fixed inset-0 w-screen h-screen" style={{ top: "var(--nav-offset, 0px)" }}>
      <iframe
        src="/follow-the-money-app.html?embed=true"
        title="Follow the Money — Corporate Political Influence Map"
        className="w-full h-full border-0"
        style={{ height: "calc(100vh - var(--nav-offset, 0px))" }}
        allow="fullscreen"
      />
    </div>
  );
}
