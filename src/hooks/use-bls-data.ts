import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BLSWageBenchmark {
  occupation_code: string;
  occupation_title: string;
  area_title: string;
  hourly_mean: number | null;
  hourly_median: number | null;
  annual_mean: number | null;
  annual_median: number | null;
  annual_10th: number | null;
  annual_25th: number | null;
  annual_75th: number | null;
  annual_90th: number | null;
  total_employment: number | null;
  data_year: number;
}

export interface BLSECITrend {
  series_title: string;
  period: string;
  year: number;
  value: number;
  percent_change_12mo: number | null;
  compensation_type: string;
  industry_group: string | null;
}

export interface BLSDemographicEarning {
  demographic_group: string;
  demographic_value: string;
  median_weekly_earnings: number | null;
  median_annual_earnings: number | null;
  earnings_ratio: number | null;
  data_year: number;
}

export interface BLSBenefitBenchmark {
  benefit_type: string;
  benefit_category: string;
  participation_rate: number | null;
  employer_cost_per_hour: number | null;
  worker_type: string;
  data_year: number;
}

export function useWageBenchmark(occupationTitle?: string) {
  return useQuery({
    queryKey: ["bls-wages", occupationTitle],
    queryFn: async () => {
      if (!occupationTitle) return null;
      // Fuzzy match on occupation title
      const searchTerm = occupationTitle.split(" ").slice(0, 3).join(" & ");
      const { data, error } = await supabase
        .from("bls_wage_benchmarks")
        .select("*")
        .textSearch("occupation_title", searchTerm, { type: "websearch" })
        .order("data_year", { ascending: false })
        .limit(5);

      if (error) {
        // Fallback to ilike
        const { data: fallback } = await supabase
          .from("bls_wage_benchmarks")
          .select("*")
          .ilike("occupation_title", `%${occupationTitle.split(" ")[0]}%`)
          .order("data_year", { ascending: false })
          .limit(5);
        return (fallback as BLSWageBenchmark[] | null) ?? [];
      }
      return (data as BLSWageBenchmark[]) ?? [];
    },
    enabled: !!occupationTitle,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useECITrends() {
  return useQuery({
    queryKey: ["bls-eci"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bls_eci_trends")
        .select("*")
        .order("year", { ascending: false })
        .order("period", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data as BLSECITrend[]) ?? [];
    },
    staleTime: 1000 * 60 * 60,
  });
}

export function useDemographicEarnings(year?: number) {
  return useQuery({
    queryKey: ["bls-demographics", year],
    queryFn: async () => {
      let query = supabase
        .from("bls_demographic_earnings")
        .select("*")
        .order("data_year", { ascending: false });
      
      if (year) query = query.eq("data_year", year);
      
      const { data, error } = await query.limit(50);
      if (error) throw error;
      return (data as BLSDemographicEarning[]) ?? [];
    },
    staleTime: 1000 * 60 * 60,
  });
}

export function useBenefitsBenchmarks() {
  return useQuery({
    queryKey: ["bls-benefits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bls_benefits_benchmarks")
        .select("*")
        .order("data_year", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data as BLSBenefitBenchmark[]) ?? [];
    },
    staleTime: 1000 * 60 * 60,
  });
}

export function useSyncBLSData() {
  return async (modules?: string[]) => {
    const { data, error } = await supabase.functions.invoke("sync-bls-data", {
      body: { modules: modules || ["oes", "eci", "cps", "ncs"] },
    });
    if (error) throw error;
    return data;
  };
}
