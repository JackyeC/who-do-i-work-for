import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, AlertTriangle } from "lucide-react";

interface LevelsFyiEmbedProps {
  companyName: string;
}

export function LevelsFyiEmbed({ companyName }: LevelsFyiEmbedProps) {
  const [loadError, setLoadError] = useState(false);

  // Normalize company name for Levels.fyi URL (capitalize, remove special chars)
  const encodedName = encodeURIComponent(companyName.trim());
  const embedUrl = `https://www.levels.fyi/charts_embed.html?company=${encodedName}&track=Software%20Engineer`;

  if (loadError) {
    return (
      <Card className="border-border/40">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Compensation data is not available for this company yet.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Check back later or visit{" "}
            <a href={`https://www.levels.fyi/companies/${encodedName}/salaries`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Levels.fyi
            </a>{" "}
            directly.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="w-4.5 h-4.5 text-primary" />
          Compensation & Leveling
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Market compensation data powered by Levels.fyi
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <iframe
          src={embedUrl}
          title={`${companyName} compensation chart`}
          className="w-full border-0 rounded-b-lg"
          style={{ height: 420 }}
          onError={() => setLoadError(true)}
          sandbox="allow-scripts allow-same-origin"
        />
      </CardContent>
    </Card>
  );
}
