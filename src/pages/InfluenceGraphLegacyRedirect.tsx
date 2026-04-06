import { Navigate, useSearchParams } from "react-router-dom";

/** Old deep links used `/influence-graph?company=slug` — canonical route is `/company/:slug/influence`. */
export default function InfluenceGraphLegacyRedirect() {
  const [params] = useSearchParams();
  const company = params.get("company")?.trim();
  if (company) {
    return <Navigate to={`/company/${encodeURIComponent(company)}/influence`} replace />;
  }
  return <Navigate to="/browse" replace />;
}
