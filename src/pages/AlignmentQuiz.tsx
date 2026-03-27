import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { AlignmentCategory, AlignmentResults } from "@/lib/alignmentMapping";
import { mapAlignmentToValues } from "@/lib/alignmentMapping";
import { useAlignment } from "@/hooks/use-alignment";

// ── Questions ─────────────────────────────────────────────
interface AlignmentQuestion {
  category: AlignmentCategory;
  question: string;
  options: [string, string, string]; // index 0 = score 0, index 1 = score 1, index 2 = score 2
}

const QUESTIONS: AlignmentQuestion[] = [
  {
    category: "fairness",
    question: "How important is fair treatment and non-discrimination in your workplace?",
    options: [
      "It's not a deciding factor for me",
      "I care about it — it matters when choosing an employer",
      "It's a dealbreaker — I won't work somewhere with a bad record",
    ],
  },
  {
    category: "safety",
    question: "How much do workplace safety standards matter to you?",
    options: [
      "Not a major concern for the roles I consider",
      "I want to know a company takes safety seriously",
      "Non-negotiable — I need to see their safety record is clean",
    ],
  },
  {
    category: "politics",
    question: "Do you care about where a company spends its political money?",
    options: [
      "Not really — it doesn't affect my decision",
      "Somewhat — I'd like to know but it's not a dealbreaker",
      "Absolutely — I need to know their PAC donations and lobbying",
    ],
  },
  {
    category: "transparency",
    question: "How important is transparency around AI, data privacy, and ethical leadership?",
    options: [
      "Not a priority for me right now",
      "I'd factor it in, but other things matter more",
      "Critical — I need to trust how they use data and AI",
    ],
  },
  {
    category: "stability",
    question: "How much do worker protections and employment stability matter to you?",
    options: [
      "I'm flexible — stability isn't my top concern",
      "I value it — I want to know my rights are respected",
      "Essential — strong worker protections are a must-have",
    ],
  },
];

const TOTAL = QUESTIONS.length;

// ── Main Component ────────────────────────────────────────
export default function AlignmentQuiz() {
  const navigate = useNavigate();
  const { saveAlignmentResults, saveUserValues } = useAlignment();

  const [step, setStep] = useState(0); // 0..4 = questions, 5 = transition screen
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(TOTAL).fill(null)
  );
  const [direction, setDirection] = useState<"left" | "right">("left");

  const isTransition = step === TOTAL;
  const progressPct = isTransition ? 100 : (step / TOTAL) * 100;
  const canAdvance = !isTransition && answers[step] !== null;

  const selectAnswer = useCallback(
    (score: number) => {
      setAnswers((prev) => {
        const next = [...prev];
        next[step] = score;
        return next;
      });
    },
    [step]
  );

  const computeAndSave = useCallback(() => {
    const results: AlignmentResults = {
      fairness: answers[0]!,
      safety: answers[1]!,
      politics: answers[2]!,
      transparency: answers[3]!,
      stability: answers[4]!,
    };
    saveAlignmentResults(results);
    const values = mapAlignmentToValues(results);
    saveUserValues(values);
  }, [answers, saveAlignmentResults, saveUserValues]);

  const advance = useCallback(() => {
    if (!canAdvance) return;
    setDirection("left");
    if (step === TOTAL - 1) {
      computeAndSave();
    }
    setStep((s) => s + 1);
  }, [canAdvance, step, computeAndSave]);

  const goBack = useCallback(() => {
    if (step <= 0) return;
    setDirection("right");
    setStep((s) => s - 1);
  }, [step]);

  // Auto-redirect after transition screen
  useEffect(() => {
    if (!isTransition) return;
    const timer = setTimeout(() => {
      navigate("/advanced-alignment-settings");
    }, 2400);
    return () => clearTimeout(timer);
  }, [isTransition, navigate]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && canAdvance && !isTransition) advance();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [canAdvance, advance, isTransition]);

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ background: "#0a0a0e", fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Grain overlay */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 50, opacity: 0.04 }}
      >
        <filter id="alignGrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#alignGrain)" />
      </svg>

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0" style={{ height: 3, background: "rgba(255,255,255,0.05)", zIndex: 60 }}>
        <div
          style={{
            height: "100%",
            width: `${progressPct}%`,
            background: "#f0c040",
            transition: "width 0.5s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
      </div>

      {/* Slide track */}
      <div
        className="flex h-full"
        style={{
          width: `${(TOTAL + 1) * 100}vw`,
          transform: `translateX(-${step * 100}vw)`,
          transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* Question screens */}
        {QUESTIONS.map((q, qIdx) => (
          <div
            key={qIdx}
            className="flex flex-col items-center justify-center px-6"
            style={{ width: "100vw", minHeight: "100vh" }}
          >
            <div className="w-full" style={{ maxWidth: 640 }}>
              {/* Step indicator */}
              <p
                className="text-center mb-4"
                style={{
                  fontSize: 12,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: "#f0c040",
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                {qIdx + 1} / {TOTAL}
              </p>

              {/* Question */}
              <h2
                style={{
                  fontWeight: 600,
                  fontSize: "clamp(22px, 3.5vw, 32px)",
                  color: "#f0ebe0",
                  lineHeight: 1.3,
                  marginBottom: 36,
                  textAlign: "center",
                }}
              >
                {q.question}
              </h2>

              {/* Options */}
              <div className="flex flex-col gap-3" style={{ maxWidth: 540, margin: "0 auto" }}>
                {q.options.map((text, optIdx) => {
                  const isSelected = answers[qIdx] === optIdx;
                  const isDealbreaker = optIdx === 2;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => selectAnswer(optIdx)}
                      className="text-left"
                      style={{
                        background: isSelected
                          ? isDealbreaker
                            ? "rgba(240,192,64,0.15)"
                            : "rgba(240,192,64,0.08)"
                          : "#1a1826",
                        border: `1px solid ${
                          isSelected
                            ? isDealbreaker
                              ? "#f0c040"
                              : "rgba(240,192,64,0.5)"
                            : "rgba(255,255,255,0.07)"
                        }`,
                        borderRadius: 12,
                        padding: "16px 20px",
                        color: isSelected ? "#f0ebe0" : "#7a7590",
                        fontSize: 14,
                        lineHeight: 1.55,
                        cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                        transition: "border-color 0.2s, background 0.2s, color 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.borderColor = "rgba(240,192,64,0.3)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                      }}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: isSelected
                              ? isDealbreaker ? "#f0c040" : "rgba(240,192,64,0.6)"
                              : "rgba(255,255,255,0.1)",
                            flexShrink: 0,
                          }}
                        />
                        {text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Nav buttons */}
              <div className="flex items-center justify-center gap-3 mt-10" style={{ minHeight: 52 }}>
                {qIdx > 0 && (
                  <button
                    onClick={goBack}
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,0.07)",
                      color: "hsl(var(--muted-foreground))",
                      borderRadius: 50,
                      padding: "12px 24px",
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                      transition: "border-color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(240,192,64,0.3)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
                  >
                    &larr; Back
                  </button>
                )}
                <button
                  onClick={advance}
                  disabled={!canAdvance}
                  style={{
                    background: canAdvance ? "#f0c040" : "rgba(240,192,64,0.25)",
                    color: "#0a0a0e",
                    borderRadius: 50,
                    padding: "14px 36px",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: canAdvance ? "pointer" : "not-allowed",
                    border: "none",
                    fontFamily: "'DM Sans', sans-serif",
                    transition: "background 0.2s, opacity 0.2s",
                    opacity: canAdvance ? 1 : 0.5,
                  }}
                >
                  {qIdx === TOTAL - 1 ? "See my alignment" : "Next \u2192"}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Transition screen */}
        <div
          className="flex flex-col items-center justify-center px-6"
          style={{ width: "100vw", minHeight: "100vh" }}
        >
          <div className="text-center" style={{ maxWidth: 480 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "rgba(240,192,64,0.12)",
                border: "1px solid rgba(240,192,64,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                animation: "alignFadeUp 0.6s ease both",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f0c040" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2
              style={{
                fontWeight: 600,
                fontSize: "clamp(20px, 3vw, 28px)",
                color: "#f0ebe0",
                marginBottom: 12,
                animation: "alignFadeUp 0.6s ease 0.1s both",
              }}
            >
              This is what we're using to match you to companies.
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "#7a7590",
                lineHeight: 1.6,
                animation: "alignFadeUp 0.6s ease 0.25s both",
              }}
            >
              Redirecting to your personalized alignment settings...
            </p>

            {/* Loading dots animation */}
            <div
              className="flex justify-center gap-1.5 mt-6"
              style={{ animation: "alignFadeUp 0.6s ease 0.4s both" }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#f0c040",
                    animation: `alignPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>

          <style>{`
            @keyframes alignFadeUp {
              from { opacity: 0; transform: translateY(16px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes alignPulse {
              0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
              40% { opacity: 1; transform: scale(1.2); }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}
