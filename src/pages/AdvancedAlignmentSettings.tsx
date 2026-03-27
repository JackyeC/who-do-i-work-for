import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { VALUES_LENSES, VALUES_GROUPS } from "@/lib/valuesLenses";
import type { ValuesLensKey } from "@/lib/valuesLenses";
import type { ValueWeight } from "@/lib/alignmentMapping";
import { computeConfidence, getTopPriorities } from "@/lib/alignmentMapping";
import { useAlignment } from "@/hooks/use-alignment";
import { ArrowLeft, Shield, Star, Info } from "lucide-react";

const WEIGHT_OPTIONS: ValueWeight[] = ["Dealbreaker", "Important", "Not important"];

function weightButtonStyle(
  weight: ValueWeight,
  isActive: boolean
): React.CSSProperties {
  if (!isActive) {
    return {
      background: "transparent",
      border: "1px solid rgba(255,255,255,0.07)",
      color: "#7a7590",
      cursor: "pointer",
    };
  }
  if (weight === "Dealbreaker") {
    return {
      background: "rgba(240,192,64,0.15)",
      border: "1px solid #f0c040",
      color: "#f0c040",
      cursor: "pointer",
      boxShadow: "0 0 12px rgba(240,192,64,0.15)",
    };
  }
  if (weight === "Important") {
    return {
      background: "rgba(240,235,224,0.08)",
      border: "1px solid rgba(240,235,224,0.3)",
      color: "#f0ebe0",
      cursor: "pointer",
    };
  }
  // Not important
  return {
    background: "rgba(122,117,144,0.1)",
    border: "1px solid rgba(122,117,144,0.3)",
    color: "#7a7590",
    cursor: "pointer",
  };
}

export default function AdvancedAlignmentSettings() {
  const navigate = useNavigate();
  const { userValues, alignmentResults, updateSingleValue, saveUserValues } = useAlignment();

  // If no values yet, redirect to quiz
  useEffect(() => {
    if (!userValues) {
      navigate("/alignment-quiz", { replace: true });
    }
  }, [userValues, navigate]);

  const confidence = useMemo(() => {
    if (!alignmentResults) return null;
    return computeConfidence(alignmentResults);
  }, [alignmentResults]);

  const topPriorities = useMemo(() => {
    if (!userValues) return [];
    return getTopPriorities(userValues);
  }, [userValues]);

  const topPriorityLenses = useMemo(() => {
    return topPriorities.map((key) =>
      VALUES_LENSES.find((l) => l.key === key)
    ).filter(Boolean);
  }, [topPriorities]);

  const groupedLenses = useMemo(() => {
    return VALUES_GROUPS.map((group) => ({
      ...group,
      lenses: VALUES_LENSES.filter((l) => l.group === group.key),
    }));
  }, []);

  if (!userValues) return null;

  return (
    <div
      className="min-h-screen"
      style={{ background: "#0a0a0e", fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-40"
        style={{ background: "rgba(10,10,14,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="max-w-[960px] mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
            style={{
              background: "none",
              border: "none",
              color: "#7a7590",
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 style={{ fontSize: 15, fontWeight: 600, color: "#f0ebe0" }}>
            Alignment Settings
          </h1>
          <button
            onClick={() => navigate("/alignment-quiz")}
            style={{
              background: "none",
              border: "1px solid rgba(255,255,255,0.07)",
              color: "#7a7590",
              fontSize: 12,
              padding: "6px 14px",
              borderRadius: 50,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Retake quiz
          </button>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-6 pt-8 pb-24">
        {/* Confidence badge */}
        {confidence && (
          <div
            className="flex items-center gap-2 mb-4"
            style={{ animation: "settingsFadeIn 0.4s ease both" }}
          >
            <Info className="w-3.5 h-3.5" style={{ color: confidence === "High" ? "#f0c040" : "#7a7590" }} />
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 12,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: confidence === "High" ? "#f0c040" : "#7a7590",
              }}
            >
              Confidence: {confidence}
            </span>
          </div>
        )}

        {/* Top Priorities Strip */}
        {topPriorityLenses.length > 0 && (
          <div
            className="mb-8"
            style={{
              background: "#13121a",
              border: "1px solid rgba(240,192,64,0.15)",
              borderRadius: 14,
              padding: "16px 20px",
              animation: "settingsFadeIn 0.4s ease 0.05s both",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4" style={{ color: "#f0c040" }} />
              <span
                style={{
                  fontSize: 12,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: "#f0c040",
                  fontWeight: 600,
                }}
              >
                Your top priorities
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {topPriorityLenses.map((lens) => {
                if (!lens) return null;
                const isDealbreaker = userValues[lens.key as ValuesLensKey] === "Dealbreaker";
                const Icon = lens.icon;
                return (
                  <span
                    key={lens.key}
                    className="flex items-center gap-1.5"
                    style={{
                      fontSize: 13,
                      padding: "6px 14px",
                      borderRadius: 50,
                      background: isDealbreaker ? "rgba(240,192,64,0.12)" : "rgba(240,235,224,0.06)",
                      border: `1px solid ${isDealbreaker ? "rgba(240,192,64,0.3)" : "rgba(255,255,255,0.07)"}`,
                      color: isDealbreaker ? "#f0c040" : "#f0ebe0",
                      fontWeight: 500,
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {lens.label}
                    {isDealbreaker && (
                      <Shield className="w-3 h-3 ml-0.5" style={{ color: "#f0c040" }} />
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Intro text */}
        <div className="mb-8" style={{ animation: "settingsFadeIn 0.4s ease 0.1s both" }}>
          <h2 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 600, color: "#f0ebe0", marginBottom: 8 }}>
            Fine-tune your alignment
          </h2>
          <p style={{ fontSize: 14, color: "#7a7590", lineHeight: 1.6, maxWidth: 560 }}>
            We've pre-filled these based on your quiz answers. Adjust any value to
            refine how we match you to companies. Dealbreakers are weighted heavily
            in your results.
          </p>
        </div>

        {/* Value Groups */}
        {groupedLenses.map((group, gIdx) => (
          <div
            key={group.key}
            className="mb-10"
            style={{ animation: `settingsFadeIn 0.4s ease ${0.15 + gIdx * 0.05}s both` }}
          >
            {/* Group header */}
            <div className="mb-4">
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#f0ebe0", marginBottom: 2 }}>
                {group.label}
              </h3>
              <p style={{ fontSize: 13, color: "#7a7590" }}>
                {group.description}
              </p>
            </div>

            {/* Lenses grid */}
            <div className="flex flex-col gap-3">
              {group.lenses.map((lens) => {
                const currentWeight = userValues[lens.key as ValuesLensKey] ?? "Important";
                const Icon = lens.icon;
                const isDealbreaker = currentWeight === "Dealbreaker";

                return (
                  <div
                    key={lens.key}
                    style={{
                      background: isDealbreaker ? "rgba(240,192,64,0.04)" : "#13121a",
                      border: `1px solid ${isDealbreaker ? "rgba(240,192,64,0.15)" : "rgba(255,255,255,0.05)"}`,
                      borderRadius: 12,
                      padding: "14px 18px",
                      transition: "border-color 0.2s, background 0.2s",
                    }}
                  >
                    <div className="flex items-start justify-between gap-4 flex-col sm:flex-row sm:items-center">
                      {/* Label */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Icon
                          className="w-4 h-4 flex-shrink-0"
                          style={{ color: isDealbreaker ? "#f0c040" : "#7a7590" }}
                        />
                        <div className="min-w-0">
                          <span
                            className="block truncate"
                            style={{
                              fontSize: 14,
                              fontWeight: 500,
                              color: isDealbreaker ? "#f0c040" : "#f0ebe0",
                            }}
                          >
                            {lens.label}
                          </span>
                          <span
                            className="block truncate"
                            style={{ fontSize: 12, color: "#7a7590" }}
                          >
                            {lens.description}
                          </span>
                        </div>
                      </div>

                      {/* Weight buttons */}
                      <div className="flex gap-1.5 flex-shrink-0">
                        {WEIGHT_OPTIONS.map((w) => {
                          const isActive = currentWeight === w;
                          return (
                            <button
                              key={w}
                              onClick={() => updateSingleValue(lens.key as ValuesLensKey, w)}
                              style={{
                                ...weightButtonStyle(w, isActive),
                                borderRadius: 50,
                                padding: "5px 12px",
                                fontSize: 11,
                                fontWeight: isActive ? 600 : 400,
                                fontFamily: "'DM Sans', sans-serif",
                                transition: "all 0.15s ease",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {w}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Bottom CTA */}
        <div
          className="text-center pt-4 pb-8"
          style={{ animation: "settingsFadeIn 0.4s ease 0.5s both" }}
        >
          <button
            onClick={() => navigate("/browse")}
            style={{
              background: "#f0c040",
              color: "#0a0a0e",
              borderRadius: 50,
              padding: "14px 36px",
              fontSize: 14,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              transition: "opacity 0.2s",
            }}
          >
            Find matching companies &rarr;
          </button>
          <p style={{ fontSize: 12, color: "#7a7590", marginTop: 12 }}>
            Your settings are saved automatically.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes settingsFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
