import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) throw new Error("LOVABLE_API_KEY not configured");

    // Auth check
    const userClient = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { reviewId } = await req.json();
    if (!reviewId) throw new Error("Missing reviewId");

    const adminClient = createClient(supabaseUrl, serviceKey);

    // Get the review record
    const { data: review, error: reviewError } = await adminClient
      .from("offer_letter_reviews")
      .select("*")
      .eq("id", reviewId)
      .eq("user_id", user.id)
      .single();
    if (reviewError || !review) throw new Error("Review not found");

    // Update status to processing
    await adminClient.from("offer_letter_reviews").update({ processing_status: "processing" }).eq("id", reviewId);

    let documentText = review.extracted_text || "";

    // If file was uploaded, download and extract text
    if (review.file_path && !documentText) {
      const { data: fileData, error: fileError } = await adminClient.storage
        .from("offer-letters")
        .download(review.file_path);
      if (fileError) throw new Error(`File download failed: ${fileError.message}`);

      const filename = (review.original_filename || "").toLowerCase();
      if (filename.endsWith(".txt")) {
        documentText = await fileData.text();
      } else if (filename.endsWith(".pdf") || filename.endsWith(".docx")) {
        // For PDF/DOCX, convert to text via the blob content
        // Basic text extraction from raw bytes
        const rawText = await fileData.text();
        // Strip non-printable chars for basic extraction
        documentText = rawText.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ").trim();
        if (documentText.length < 50) {
          documentText = "Document content could not be fully extracted. Raw text preview: " + documentText.slice(0, 500);
        }
      } else {
        documentText = await fileData.text();
      }

      // Store extracted text
      await adminClient.from("offer_letter_reviews").update({ extracted_text: documentText.slice(0, 50000) }).eq("id", reviewId);
    }

    if (!documentText || documentText.length < 20) {
      await adminClient.from("offer_letter_reviews").update({
        processing_status: "failed",
        error_message: "Could not extract sufficient text from the document.",
      }).eq("id", reviewId);
      return new Response(JSON.stringify({ error: "Insufficient text" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get company info for comparison context
    const { data: company } = await adminClient.from("companies").select("name, industry, state").eq("id", review.company_id).single();

    const systemPrompt = `You are a document analysis tool that extracts structured information from employment offer letters. You identify terms, clauses, and structural elements. You do NOT provide legal advice or interpret contract validity. You report what is detected in neutral language.

Extract the following categories of information where present:
1. Offer Snapshot: employer_name, role_title, department, base_salary, start_date, work_location, work_arrangement (remote/hybrid/onsite)
2. Compensation Terms: base_salary, bonus_language, equity_or_stock, signing_bonus, compensation_structure
3. Clause Signals: arbitration_clause, non_compete, non_solicitation, confidentiality, repayment_or_clawback, at_will_employment, probationary_period
4. Benefits References: any mentions of health, dental, vision, 401k, PTO, parental leave, etc.
5. Contingencies: background_check, references, drug_screening, etc.
6. Other Notable Terms: severance, reporting_structure, relocation language

For the company context: The company is "${company?.name || 'Unknown'}" in the "${company?.industry || 'Unknown'}" industry, based in ${company?.state || 'Unknown'}.`;

    const userPrompt = `Analyze this employment offer letter and extract all structured information. For each detected item, provide the category, term name, extracted text snippet, and a confidence level (high, medium, low).

Document text:
---
${documentText.slice(0, 15000)}
---`;

    // Call Lovable AI with tool calling for structured output
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_offer_terms",
              description: "Extract structured terms and clauses from an employment offer letter.",
              parameters: {
                type: "object",
                properties: {
                  offer_snapshot: {
                    type: "object",
                    properties: {
                      employer_name: { type: "string" },
                      role_title: { type: "string" },
                      department: { type: "string" },
                      base_salary: { type: "string" },
                      start_date: { type: "string" },
                      work_location: { type: "string" },
                      work_arrangement: { type: "string" },
                      compensation_summary: { type: "string" },
                    },
                    additionalProperties: false,
                  },
                  extracted_terms: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        category: { type: "string", enum: ["compensation", "benefits", "work_arrangement", "contingencies", "reporting", "other"] },
                        term_name: { type: "string" },
                        extracted_text: { type: "string" },
                        confidence: { type: "string", enum: ["high", "medium", "low"] },
                      },
                      required: ["category", "term_name", "extracted_text", "confidence"],
                      additionalProperties: false,
                    },
                  },
                  detected_clauses: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        clause_type: { type: "string", enum: ["arbitration", "non_compete", "non_solicitation", "confidentiality", "repayment_clawback", "at_will", "probationary", "severance", "other"] },
                        label: { type: "string" },
                        extracted_text: { type: "string" },
                        confidence: { type: "string", enum: ["high", "medium", "low"] },
                      },
                      required: ["clause_type", "label", "extracted_text", "confidence"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["offer_snapshot", "extracted_terms", "detected_clauses"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_offer_terms" } },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      
      if (aiResponse.status === 429) {
        await adminClient.from("offer_letter_reviews").update({ processing_status: "failed", error_message: "Rate limit exceeded. Please try again later." }).eq("id", reviewId);
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (aiResponse.status === 402) {
        await adminClient.from("offer_letter_reviews").update({ processing_status: "failed", error_message: "AI credits exhausted." }).eq("id", reviewId);
        return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      throw new Error("AI analysis failed");
    }

    const aiResult = await aiResponse.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error("AI did not return structured output");
    }

    const extracted = JSON.parse(toolCall.function.arguments);

    // Update the review with extracted data
    await adminClient.from("offer_letter_reviews").update({
      offer_snapshot: extracted.offer_snapshot || {},
      extracted_terms: extracted.extracted_terms || [],
      detected_clauses: extracted.detected_clauses || [],
      processing_status: "completed",
    }).eq("id", reviewId);

    // If user opted to delete file after analysis
    if (review.file_path && review.file_deleted) {
      await adminClient.storage.from("offer-letters").remove([review.file_path]);
    }

    return new Response(JSON.stringify({ success: true, reviewId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("extract-offer-terms error:", e);
    return new Response(JSON.stringify({ error: e.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
