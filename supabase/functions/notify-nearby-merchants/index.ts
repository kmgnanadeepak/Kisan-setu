import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
};

interface DiseaseNotificationPayload {
  diseaseName: string;
  diseaseDescription: string;
  recommendedTreatment: string;
  farmerLocation: {
    lat: number;
    lon: number;
  };
}

interface Merchant {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  lat?: number;
  lon?: number;
  category?: string;
}

interface NotificationResponse {
  success: boolean;
  notifiedCount: number;
  message?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { 
          status: 405, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Parse request body
    const payload: DiseaseNotificationPayload = await req.json();
    const { diseaseName, diseaseDescription, recommendedTreatment, farmerLocation } = payload;

    // Validate required fields
    if (!diseaseName || !farmerLocation || !farmerLocation.lat || !farmerLocation.lon) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields: diseaseName and farmerLocation with lat/lon" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Mock merchant data for demonstration
    // In production, this would fetch from your database
    const mockMerchants: Merchant[] = [
      {
        id: "1",
        name: "Kisan Agro Center",
        email: "kisan@agro.com",
        phone: "+91 98765 43210",
        address: "Near bus stand",
        lat: farmerLocation.lat + 0.005,
        lon: farmerLocation.lon + 0.005,
        category: "Agricultural Supplies"
      },
      {
        id: "2", 
        name: "Green Seeds & Fertilizers",
        email: "green@seeds.com",
        phone: "+91 98765 43211",
        address: "Main market",
        lat: farmerLocation.lat + 0.01,
        lon: farmerLocation.lon - 0.01,
        category: "Seed Store"
      },
      {
        id: "3",
        name: "Farm Tech Equipment", 
        email: "farmtech@equipment.com",
        phone: "+91 98765 43212",
        address: "Industrial area",
        lat: farmerLocation.lat - 0.02,
        lon: farmerLocation.lon + 0.02,
        category: "Farm Equipment"
      }
    ];

    // Filter merchants by distance (within 50km radius)
    const nearbyMerchants = mockMerchants.filter((merchant: Merchant) => {
      if (!merchant.lat || !merchant.lon) {
        return true; // Include if no location data
      }

      const distance = calculateDistance(
        farmerLocation.lat,
        farmerLocation.lon,
        merchant.lat,
        merchant.lon
      );

      return distance <= 50; // 50km radius
    });

    // Send notifications to nearby merchants
    let notifiedCount = 0;
    const notificationPromises = nearbyMerchants.map(async (merchant: Merchant) => {
      try {
        // Mock notification sending
        console.log(`Sending notification to merchant: ${merchant.name} (${merchant.email || merchant.phone})`);
        
        // Mock email sending
        if (merchant.email) {
          await sendMockEmail(merchant.email, {
            subject: "Crop Disease Alert - Potential Sales Opportunity",
            message: `Dear ${merchant.name},\n\nA farmer in your area has detected ${diseaseName} in their crops.\n\nRecommended treatment: ${recommendedTreatment}\n\nThis could be a sales opportunity for your agricultural products. Please check your inventory and consider reaching out to the farmer.\n\nBest regards,\nKisanSetu Team`,
          });
        }

        notifiedCount++;
        return true;
      } catch (error) {
        console.error(`Failed to notify merchant ${merchant.id}:`, error);
        return false;
      }
    });

    // Wait for all notifications to be processed
    await Promise.allSettled(notificationPromises);

    const response: NotificationResponse = {
      success: true,
      notifiedCount,
      message: `Successfully notified ${notifiedCount} nearby merchants`,
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Error in notify-nearby-merchants function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Internal server error",
        notifiedCount: 0 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Mock email sending function
async function sendMockEmail(email: string, { subject, message }: { subject: string; message: string }) {
  // In a real implementation, you would use a service like SendGrid, AWS SES, etc.
  console.log(`MOCK EMAIL to ${email}:`);
  console.log(`Subject: ${subject}`);
  console.log(`Message: ${message}`);
  
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return { success: true };
}
