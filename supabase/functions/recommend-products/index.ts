import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const body = await req.json().catch(() => ({}));
    const currentProductId: string | undefined = body?.currentProductId;
    const limit: number = Math.min(Math.max(Number(body?.limit ?? 6), 1), 12);

    // Identify user (optional — anonymous users get popularity-based recs)
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes } = await userClient.auth.getUser();
    const userId = userRes?.user?.id ?? null;

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Pull active products (candidate pool)
    const { data: allProducts, error: prodErr } = await admin
      .from("products")
      .select("id, title, description, category, price, rating, images, artist_id")
      .eq("is_active", true)
      .limit(80);
    if (prodErr) throw prodErr;
    let candidates = (allProducts ?? []).filter((p) => p.id !== currentProductId);

    // Build user signals
    let viewed: any[] = [];
    let wishlisted: any[] = [];
    let currentProduct: any = null;
    if (currentProductId) {
      currentProduct = (allProducts ?? []).find((p) => p.id === currentProductId) ?? null;
    }
    if (userId) {
      const [{ data: views }, { data: wish }] = await Promise.all([
        admin
          .from("product_views")
          .select("product_id, viewed_at, products(id,title,category,price)")
          .eq("user_id", userId)
          .order("viewed_at", { ascending: false })
          .limit(20),
        admin
          .from("wishlist")
          .select("product_id, products(id,title,category,price)")
          .eq("user_id", userId)
          .limit(20),
      ]);
      viewed = views ?? [];
      wishlisted = wish ?? [];
    }

    // Fallback: no signals at all → popularity by rating
    const hasSignal = viewed.length || wishlisted.length || currentProduct;
    if (!hasSignal) {
      const sorted = [...candidates]
        .sort((a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0))
        .slice(0, limit);
      return new Response(
        JSON.stringify({ productIds: sorted.map((p) => p.id), reason: "popular" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Compact catalog for the model
    const catalog = candidates.slice(0, 60).map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      price: Number(p.price),
      rating: Number(p.rating ?? 0),
    }));

    const profile = {
      currentProduct: currentProduct
        ? { id: currentProduct.id, title: currentProduct.title, category: currentProduct.category }
        : null,
      recentlyViewed: viewed
        .map((v: any) => v.products)
        .filter(Boolean)
        .slice(0, 10),
      wishlist: wishlisted.map((w: any) => w.products).filter(Boolean).slice(0, 10),
    };

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You recommend handcrafted art products. Pick items the shopper is most likely to love based on their browsing/wishlist signals and (if any) the product they're currently viewing. Prefer related categories and similar price ranges. Never include the current product. Only return ids that exist in the provided catalog.",
          },
          {
            role: "user",
            content: `Shopper profile:\n${JSON.stringify(profile)}\n\nCatalog:\n${JSON.stringify(catalog)}\n\nReturn the top ${limit} product ids ranked best-first.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_recommendations",
              description: "Return the ranked product ids to recommend.",
              parameters: {
                type: "object",
                properties: {
                  product_ids: { type: "array", items: { type: "string" } },
                  reason: { type: "string" },
                },
                required: ["product_ids"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_recommendations" } },
      }),
    });

    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI gateway error", aiResp.status, t);
      // Graceful fallback for any AI gateway failure
      const fallback = scoreFallback(candidates, profile, limit);
      return new Response(
        JSON.stringify({
          productIds: fallback.map((p) => p.id),
          reason: "fallback",
          fallback: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const aiJson = await aiResp.json();
    const toolCall = aiJson?.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall ? JSON.parse(toolCall.function.arguments) : {};
    let ids: string[] = Array.isArray(args.product_ids) ? args.product_ids : [];
    const valid = new Set(candidates.map((p) => p.id));
    ids = ids.filter((id) => valid.has(id)).slice(0, limit);

    if (ids.length === 0) {
      const fallback = scoreFallback(candidates, profile, limit);
      ids = fallback.map((p) => p.id);
    }

    return new Response(
      JSON.stringify({ productIds: ids, reason: args.reason ?? "ai" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("recommend-products error", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
        productIds: [],
        fallback: true,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

function scoreFallback(candidates: any[], profile: any, limit: number) {
  const preferredCats = new Set<string>();
  for (const p of [...(profile.recentlyViewed ?? []), ...(profile.wishlist ?? [])]) {
    if (p?.category) preferredCats.add(p.category);
  }
  if (profile.currentProduct?.category) preferredCats.add(profile.currentProduct.category);
  return [...candidates]
    .map((p) => ({
      p,
      score: (preferredCats.has(p.category) ? 2 : 0) + Number(p.rating ?? 0) / 5,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p);
}