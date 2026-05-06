import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { title, category, materials, dimensions, currentDescription, voiceTranscript, language } = await req.json();
    if (!title && !category && !currentDescription && !voiceTranscript) {
      return new Response(JSON.stringify({ error: "Provide at least a title, category or voice description" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const lang = language || "English";
    const systemPrompt = `You are a marketplace copywriter and pricing assistant for KalaHeart, a marketplace for handmade artisan goods.
Generate a compelling product description and a fair suggested price in USD for a handmade product.
Write the description and hashtags in ${lang}.

Guidelines:
- Description: 80-140 words, warm and evocative, highlights craft, materials and use
- Hashtags: 6-10 relevant hashtags (mix of broad + niche), no spaces, lowercase
- Price: realistic USD price for a handmade artisan item given the inputs
- priceReasoning: 1 short sentence explaining the price`;

    const userPrompt = `Title: ${title || "(none)"}
Category: ${category || "(none)"}
Materials: ${materials || "(none)"}
Dimensions: ${dimensions || "(none)"}
Current description (may be empty): ${currentDescription || "(none)"}
Artisan's voice notes (may include filler words, mixed languages): ${voiceTranscript || "(none)"}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_product",
              description: "Return product description, hashtags and suggested price.",
              parameters: {
                type: "object",
                properties: {
                  description: { type: "string" },
                  hashtags: { type: "array", items: { type: "string" } },
                  suggestedPrice: { type: "number" },
                  priceReasoning: { type: "string" },
                },
                required: ["description", "hashtags", "suggestedPrice", "priceReasoning"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_product" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits to your workspace." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const call = data.choices?.[0]?.message?.tool_calls?.[0];
    const args = call?.function?.arguments ? JSON.parse(call.function.arguments) : null;
    if (!args) {
      return new Response(JSON.stringify({ error: "No suggestion produced" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(args), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("suggest-product-details error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});