import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { customer_id } = await req.json();

    if (!customer_id) {
      throw new Error("customer_id is required");
    }

    // Fetch customer order history
    const { data: orderHistory } = await supabase
      .from("customer_orders")
      .select(`
        listing:marketplace_listings (
          category,
          title,
          farming_method
        )
      `)
      .eq("customer_id", customer_id)
      .eq("status", "delivered")
      .limit(20);

    // Fetch current available listings
    const { data: availableListings } = await supabase
      .from("marketplace_listings")
      .select("id, title, category, farming_method, price, quantity, unit, location")
      .eq("status", "active")
      .limit(50);

    // Build context for AI
    const purchasedCategories = orderHistory
      ?.map(o => (o.listing as any)?.category)
      .filter(Boolean) || [];
    
    const purchasedItems = orderHistory
      ?.map(o => (o.listing as any)?.title)
      .filter(Boolean) || [];

    const currentMonth = new Date().toLocaleString('default', { month: 'long' });

    const prompt = `Based on the following customer purchase history and current available produce, suggest 5 personalized crop recommendations.

Customer Purchase History:
- Categories bought: ${[...new Set(purchasedCategories)].join(", ") || "None yet"}
- Items purchased: ${[...new Set(purchasedItems)].slice(0, 10).join(", ") || "None yet"}
- Current month: ${currentMonth} (consider seasonal availability)

Available listings:
${availableListings?.map(l => `- ${l.title} (${l.category}, ₹${l.price}/${l.unit}, ${l.farming_method || 'conventional'})`).join("\n") || "None"}

Provide recommendations that:
1. Match customer preferences based on history
2. Consider seasonal availability for ${currentMonth}
3. Include a mix of their favorites and new discoveries
4. Prioritize organic/sustainable options when available`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: "You are an agricultural recommendation assistant. Provide personalized crop recommendations based on customer history, seasonality, and availability. Return structured recommendations.",
          },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_recommendations",
              description: "Return personalized crop recommendations",
              parameters: {
                type: "object",
                properties: {
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        category: { type: "string" },
                        reason: { type: "string" },
                        listing_id: { type: "string" },
                        priority: { type: "string", enum: ["high", "medium", "low"] },
                      },
                      required: ["title", "category", "reason", "priority"],
                    },
                  },
                  seasonal_tip: { type: "string" },
                },
                required: ["recommendations", "seasonal_tip"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "provide_recommendations" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    
    let recommendations = { recommendations: [], seasonal_tip: "" };
    if (toolCall?.function?.arguments) {
      try {
        recommendations = JSON.parse(toolCall.function.arguments);
      } catch (e) {
        console.error("Failed to parse AI response:", e);
      }
    }

    // Save recommendations to customer preferences
    await supabase
      .from("customer_preferences")
      .upsert({
        customer_id,
        last_recommendations: recommendations,
        recommendations_updated_at: new Date().toISOString(),
      }, { onConflict: 'customer_id' });

    return new Response(JSON.stringify(recommendations), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ai-recommendations:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
