/**
 * Partner embed shell: minimal chrome for iframe inclusion on third-party sites.
 * Lists jobs from public.company_jobs (same source as /jobs), not a third-party widget.
 * Query: ?limit=50 (default 50, max 200), ?company=slug to scope to one employer.
 */
import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { usePageSEO } from "@/hooks/use-page-seo";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, Briefcase, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

export default function JobBoardEmbed() {
  const [searchParams] = useSearchParams();
  const rawLimit = parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10);
  const limit = Math.min(
    Math.max(Number.isFinite(rawLimit) ? rawLimit : DEFAULT_LIMIT, 1),
    MAX_LIMIT,
  );
  const companySlug = searchParams.get("company")?.trim() || null;

  usePageSEO({
    title: "Job Board — Who Do I Work For?",
    description:
      "Every company has values. Find one that shares yours. Browse jobs at companies verified by public records — lobbying, labor, and funding data included.",
    path: "/embed/jobs",
  });

  const {
    data: companyRow,
    isFetched: companyFetched,
    isLoading: companyLoading,
  } = useQuery({
    queryKey: ["embed-jobs-company", companySlug],
    queryFn: async () => {
      if (!companySlug) return null;
      const { data, error } = await supabase
        .from("companies")
        .select("id, name")
        .eq("slug", companySlug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!companySlug,
  });

  const companyNotFound = !!companySlug && companyFetched && companyRow === null;

  const { data: jobs, isLoading, error, isFetching } = useQuery({
    queryKey: ["embed-jobs", limit, companySlug ?? "__all__", companyRow?.id ?? ""],
    queryFn: async () => {
      if (companySlug && !companyRow?.id) {
        return [];
      }
      let q = supabase
        .from("company_jobs")
        .select(
          `id, title, url, location, work_mode, salary_range, scraped_at, company_id,
           companies:company_id (id, name, slug, industry, employer_clarity_score, state)`,
        )
        .eq("is_active", true)
        .order("scraped_at", { ascending: false })
        .limit(limit);

      if (companyRow?.id) {
        q = q.eq("company_id", companyRow.id);
      }

      const { data, error: qErr } = await q;
      if (qErr) throw qErr;
      return data || [];
    },
    enabled: !companySlug || (companyFetched && !!companyRow),
  });

  const list = useMemo(() => {
    if (companyNotFound) return [];
    return jobs || [];
  }, [jobs, companyNotFound]);

  const showLoading =
    companyLoading ||
    isLoading ||
    isFetching ||
    (!!companySlug && !companyFetched);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="w-full max-w-5xl mx-auto px-4 pt-24 pb-6 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Job Board</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
          Every company has values. Find one that shares yours. Listings are scraped from employer career sites
          and linked to public transparency data on Who Do I Work For.
        </p>
        {companySlug && companyRow?.name && (
          <p className="text-sm text-muted-foreground mt-2">
            Showing openings at <span className="font-medium text-foreground">{companyRow.name}</span>.
          </p>
        )}
        {companyNotFound && (
          <p className="text-sm text-amber-600 dark:text-amber-500 mt-2">
            No company matched slug &ldquo;{companySlug}&rdquo;. Check the slug or open the full job board.
          </p>
        )}
      </div>

      <div className="flex-1 w-full px-4 max-w-5xl mx-auto pb-12" id="wdiwf-jobs-embed">
        {error && (
          <p className="text-sm text-destructive text-center py-8">
            Could not load jobs. Please try again later.
          </p>
        )}

        {showLoading && !error && (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        )}

        {!showLoading && !error && list.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3" aria-hidden />
            <p className="text-sm font-medium text-foreground mb-2">No listings here yet</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              {companySlug
                ? "We have not scraped active roles for this company yet. If careers are hosted on a non-standard page, we may need a careers URL on file — see the full company profile or browse all jobs."
                : "Open roles appear as we scrape employer career sites. Browse the full job board for every company with listings, or check back soon."}
            </p>
            <Link
              to="/jobs"
              className="inline-block mt-4 text-sm font-medium text-primary hover:underline"
            >
              Open full job board
            </Link>
          </div>
        )}

        {!showLoading && !error && list.length > 0 && (
          <ul className="space-y-3">
            {list.map((job: any) => {
              const co = job.companies;
              const applyHref = job.url || "#";
              const dossierHref = co?.slug ? `/company/${co.slug}` : "/jobs";

              return (
                <li
                  key={job.id}
                  className="rounded-xl border border-border bg-card p-4 text-left hover:border-primary/25 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h2 className="font-semibold text-foreground text-sm sm:text-base truncate">
                          {job.title}
                        </h2>
                        {typeof co?.employer_clarity_score === "number" && (
                          <Badge variant="secondary" className="text-xs shrink-0">
                            Clarity {Math.round(co.employer_clarity_score)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {co?.name || "Employer"}
                        {co?.industry ? ` · ${co.industry}` : ""}
                      </p>
                      {(job.location || job.work_mode) && (
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
                          <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden />
                          {[job.location, job.work_mode].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      {job.salary_range && (
                        <p className="text-xs text-muted-foreground mt-1">{job.salary_range}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      {job.url && (
                        <a
                          href={applyHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs font-semibold hover:brightness-110 transition-all"
                        >
                          Apply
                          <ExternalLink className="w-3.5 h-3.5" aria-hidden />
                        </a>
                      )}
                      <Link
                        to={dossierHref}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors"
                      >
                        Employer intel
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {!showLoading && !error && list.length > 0 && (
          <p className="text-xs text-muted-foreground text-center mt-8">
            Postings are sourced from employer career pages. Verify details on the employer site before applying.
          </p>
        )}
      </div>
    </div>
  );
}
