import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LinkedInProfile {
  linkedin_id: string;
  name: string | null;
  email: string | null;
  profile_picture_url: string | null;
  expires_at: string;
}

export type CertificateShareParams = {
  playerName: string;
  certName: string;
  certBadge: string;
  insightQuote: string;
  imageBase64?: string;
  realWorld?: string;
  credibilityPct?: number;
  checkUrl?: string;
  score?: string | number;
};

export function useLinkedIn() {
  const [linkedinProfile, setLinkedinProfile] = useState<LinkedInProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user has a connected LinkedIn profile
  const checkConnection = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLinkedinProfile(null);
        setLoading(false);
        return;
      }

      // Use the safe view that excludes access_token
      const { data, error } = await supabase
        .from("linkedin_profiles_safe")
        .select("linkedin_id, name, email, profile_picture_url, expires_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking LinkedIn connection:", error);
        setLinkedinProfile(null);
      } else {
        setLinkedinProfile(data);
      }
    } catch (err) {
      console.error("LinkedIn check failed:", err);
      setLinkedinProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  // Initiate LinkedIn OAuth
  const connectLinkedIn = useCallback((returnTo?: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const path = returnTo || window.location.pathname;
    window.location.href = `${supabaseUrl}/functions/v1/linkedin-auth?return_to=${encodeURIComponent(path)}`;
  }, []);

  // Share certificate to LinkedIn
  const shareCertificate = useCallback(async (params: CertificateShareParams) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not logged in");

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const res = await fetch(`${supabaseUrl}/functions/v1/linkedin-share-certificate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok) {
      if (data.needsAuth) {
        throw new Error("NEEDS_AUTH");
      }
      throw new Error(data.error || "Failed to share on LinkedIn");
    }

    return data;
  }, []);

  const isConnected = !!linkedinProfile;
  const isExpired = linkedinProfile
    ? new Date(linkedinProfile.expires_at) < new Date()
    : false;

  return {
    linkedinProfile,
    isConnected,
    isExpired,
    loading,
    connectLinkedIn,
    shareCertificate,
    refreshConnection: checkConnection,
  };
}
