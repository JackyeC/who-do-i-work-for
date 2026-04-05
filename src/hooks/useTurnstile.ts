import { useRef, useEffect, useCallback } from "react";

const SITE_KEY = "0x4AAAAAACwUKaSXORtxl_tu";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      execute: (widgetId: string) => void;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const GET_TOKEN_TIMEOUT_MS = 20_000;

export function useTurnstile() {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const tokenRef = useRef<string | null>(null);
  const resolveRef = useRef<((token: string) => void) | null>(null);
  const getTokenTimeoutRef = useRef<number | null>(null);

  const clearGetTokenTimeout = () => {
    if (getTokenTimeoutRef.current != null) {
      window.clearTimeout(getTokenTimeoutRef.current);
      getTokenTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    const mount = () => {
      if (!containerRef.current || !window.turnstile || widgetIdRef.current) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        size: "invisible",
        callback: (token: string) => {
          clearGetTokenTimeout();
          tokenRef.current = token;
          resolveRef.current?.(token);
          resolveRef.current = null;
        },
        "error-callback": () => {
          clearGetTokenTimeout();
          resolveRef.current?.("");
          resolveRef.current = null;
        },
        "expired-callback": () => {
          tokenRef.current = null;
        },
      });
    };

    if (window.turnstile) {
      mount();
    } else {
      const interval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(interval);
          mount();
        }
      }, 200);
      return () => clearInterval(interval);
    }

    return () => {
      clearGetTokenTimeout();
      const pending = resolveRef.current;
      if (pending) {
        resolveRef.current = null;
        pending("");
      }
      if (widgetIdRef.current && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current); } catch {}
        widgetIdRef.current = null;
      }
    };
  }, []);

  const getToken = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      clearGetTokenTimeout();
      resolveRef.current = resolve;

      if (!widgetIdRef.current || !window.turnstile) {
        resolveRef.current = null;
        resolve("");
        return;
      }

      // Turnstile tokens are single-use and short-lived. Never return a cached token —
      // reusing it causes siteverify to fail (invalid / already spent).
      tokenRef.current = null;
      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch {
        /* ignore */
      }

      getTokenTimeoutRef.current = window.setTimeout(() => {
        getTokenTimeoutRef.current = null;
        const pending = resolveRef.current;
        if (pending) {
          resolveRef.current = null;
          pending("");
        }
      }, GET_TOKEN_TIMEOUT_MS);

      window.turnstile.execute(widgetIdRef.current);
    });
  }, []);

  const resetToken = useCallback(() => {
    clearGetTokenTimeout();
    resolveRef.current = null;
    tokenRef.current = null;
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }, []);

  return { containerRef, getToken, resetToken };
}
