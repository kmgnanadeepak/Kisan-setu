import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DiseaseNotificationPayload {
  diseaseName: string;
  diseaseDescription: string;
  recommendedTreatment: string;
  farmerLocation: {
    lat: number;
    lon: number;
  };
}

interface NotificationResponse {
  success: boolean;
  notifiedCount: number;
  message?: string;
}

export const notifyNearbyMerchants = async (
  payload: DiseaseNotificationPayload
): Promise<NotificationResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('notify-nearby-merchants', {
      body: payload,
    });

    if (error) {
      console.error('Error notifying merchants:', error);
      throw new Error(error.message || 'Failed to notify merchants');
    }

    return data as NotificationResponse;
  } catch (error) {
    console.error('Error notifying merchants:', error);
    throw error;
  }
};

export const useDiseaseNotification = () => {
  const notifyMerchants = async (
    diseaseName: string,
    diseaseDescription: string,
    recommendedTreatment: string,
    farmerLocation: { lat: number; lon: number }
  ) => {
    try {
      const result = await notifyNearbyMerchants({
        diseaseName,
        diseaseDescription,
        recommendedTreatment,
        farmerLocation,
      });

      toast.success(`Nearby merchants notified successfully. ${result.notifiedCount} merchants contacted.`);
      return result;
    } catch (error) {
      toast.error('Failed to notify nearby merchants. Please try again.');
      throw error;
    }
  };

  return { notifyMerchants };
};
