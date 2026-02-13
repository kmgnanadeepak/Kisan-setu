import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, symptoms, method } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let prompt: string;
    let messages: any[];

    if (method === "image" && imageBase64) {
      prompt = `You are an expert agricultural plant pathologist. Analyze this leaf image and identify any plant diseases present.

Provide your analysis in the following JSON format:
{
  "disease_name": "Name of the detected disease",
  "confidence": "high" | "medium" | "low",
  "severity": "low" | "medium" | "high",
  "description": "Brief description of the disease",
  "symptoms": ["symptom1", "symptom2"],
  "treatments": [
    {
      "name": "Treatment product name",
      "pricePerUnit": 500,
      "unit": "kg",
      "dosagePerAcre": 2.5,
      "description": "How to apply"
    }
  ],
  "applicationGuide": [
    {"step": "Step description", "timing": "When to do it"}
  ],
  "preventionTips": ["tip1", "tip2"]
}

Be accurate and provide practical advice for Indian farmers. If no disease is detected, return a healthy plant assessment.`;

      messages = [
        { role: "system", content: prompt },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze this leaf image for any plant diseases."
            },
            {
              type: "image_url",
              image_url: {
                url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ];
    } else if (method === "symptom" && symptoms?.length > 0) {
      prompt = `You are an expert agricultural plant pathologist. Based on the following symptoms observed by a farmer, identify the most likely plant disease and provide guidance.

Observed symptoms: ${symptoms.join(", ")}

Provide your analysis in the following JSON format:
{
  "disease_name": "Most likely disease name",
  "confidence": "medium",
  "severity": "low" | "medium" | "high",
  "description": "Brief description of the probable disease",
  "symptoms": ["symptom1", "symptom2"],
  "treatments": [
    {
      "name": "Treatment product name",
      "pricePerUnit": 500,
      "unit": "kg",
      "dosagePerAcre": 2.5,
      "description": "How to apply"
    }
  ],
  "applicationGuide": [
    {"step": "Step description", "timing": "When to do it"}
  ],
  "preventionTips": ["tip1", "tip2"],
  "note": "This is preliminary guidance based on symptoms only. For accurate diagnosis, please submit a leaf image."
}

Provide practical advice suitable for Indian farmers. Consider common diseases in Indian agriculture.`;

      messages = [
        { role: "system", content: "You are an expert agricultural plant pathologist specializing in Indian crops. Always respond with valid JSON." },
        { role: "user", content: prompt }
      ];
    } else {
      throw new Error("Invalid request: must provide either imageBase64 or symptoms");
    }

    console.log("Calling Lovable AI for disease analysis...");
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please try again." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No response from AI model");
    }

    // Parse the JSON response
    let analysisResult;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Return a fallback response
      analysisResult = {
        disease_name: "Analysis Pending",
        confidence: "low",
        severity: "medium",
        description: "Unable to parse AI response. Please try again.",
        symptoms: [],
        treatments: [],
        applicationGuide: [],
        preventionTips: []
      };
    }

    console.log("Disease analysis completed successfully");

    return new Response(JSON.stringify({ success: true, analysis: analysisResult }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-disease:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
