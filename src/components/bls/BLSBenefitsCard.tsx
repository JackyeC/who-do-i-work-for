import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, Heart } from "lucide-react";
import { useBenefitsBenchmarks, type BLSBenefitBenchmark } from "@/hooks/use-bls-data";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

export function BLSBenefitsCard({ className }: Props) {
  const { data: benefits, isLoading } = useBenefitsBenchmarks();

  if (isLoading) {
    return (
      <Card className={className}><CardContent className="p-5"><Skeleton className="h-24 w-full" /></CardContent></Card>
    );
  }

  if (!benefits?.length) return null;

  const latestYear = benefits[0]?.data_year;
  const latest = benefits.filter(b => b.data_year === latestYear && b.worker_type === "all");
  const byCategory: Record<string, BLSBenefitBenchmark[]> = {};
  for (const b of latest) {
    (byCategory[b.benefit_category] ??= []).push(b);
  }

  return (
    <Card className={cn("border-[hsl(var(--civic-gold))]/15", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className="w-4 h-4 text-[hsl(var(--civic-gold))]" />
          National Benefits Benchmark
          <Badge variant="outline" className="text-[10px] ml-auto">{latestYear}</Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">BLS National Compensation Survey — participation rates for all workers</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(byCategory).map(([cat, items]) => (
          <div key={cat}>
            <p className="text-xs font-medium text-foreground capitalize flex items-center gap-1.5 mb-2">
              {cat === "healthcare" ? <Heart className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
              {cat}
            </p>
            <div className="space-y-1.5">
              {items.map(item => (
                <div key={item.benefit_type} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">{item.benefit_type}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[hsl(var(--civic-gold))]/60 rounded-full"
                        style={{ width: `${item.participation_rate ?? 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-foreground w-10 text-right">
                      {item.participation_rate?.toFixed(0) ?? "—"}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <p className="text-[10px] text-muted-foreground border-t border-border pt-2">
          Source: BLS National Compensation Survey (NCS). Access rates for civilian workers.
        </p>
      </CardContent>
    </Card>
  );
}
