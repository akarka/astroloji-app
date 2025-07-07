import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for birth chart operations
export const birthChartService = {
  // Save birth chart calculation result
  async saveCalculation(personData, birthChartData) {
    const { data, error } = await supabase
      .from("calculation_results")
      .insert([
        {
          result_json: {
            person: personData,
            ...birthChartData,
          },
        },
      ])
      .select();

    if (error) {
      console.error("Error saving calculation:", error);
      throw error;
    }

    return data[0];
  },

  // Get all calculations
  async getCalculations() {
    const { data, error } = await supabase
      .from("calculation_results")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching calculations:", error);
      throw error;
    }

    return data;
  },

  // Get calculation by ID
  async getCalculationById(id) {
    const { data, error } = await supabase
      .from("calculation_results")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching calculation:", error);
      throw error;
    }

    return data;
  },

  // Delete calculation
  async deleteCalculation(id) {
    const { error } = await supabase
      .from("calculation_results")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting calculation:", error);
      throw error;
    }
  },

  // Update calculation
  async updateCalculation(id, updatedData) {
    const { data, error } = await supabase
      .from("calculation_results")
      .update({ result_json: updatedData })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error updating calculation:", error);
      throw error;
    }

    return data[0];
  },

  // Subscribe to real-time changes
  subscribeToChanges(callback) {
    return supabase
      .channel("calculation_results_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "calculation_results" },
        callback
      )
      .subscribe();
  },

  // Görseli Supabase Storage'a yükle ve calculation_results tablosuna URL kaydet
  async uploadChartImageAndSaveUrl(calculationId, file) {
    // Dosya uzantısı
    const fileExt = file.name.split(".").pop();
    const fileName = `${calculationId}.${fileExt}`; // UUID ile aynı isim
    // 1. Storage'a yükle (upsert: true ile overwrite)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("natalcharts")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });
    if (uploadError) {
      console.error("Görsel yüklenemedi:", uploadError);
      throw uploadError;
    }
    // 2. Public URL al
    const { data: publicUrlData } = supabase.storage
      .from("natalcharts")
      .getPublicUrl(fileName);
    const publicUrl = publicUrlData.publicUrl;
    // 3. Tabloya URL kaydet
    const { error: updateError } = await supabase
      .from("calculation_results")
      .update({ chart_image_url: publicUrl })
      .eq("id", calculationId);
    if (updateError) {
      console.error("Tabloya görsel URL kaydedilemedi:", updateError);
      throw updateError;
    }
    return publicUrl;
  },

  // Storage'dan görsel sil
  async deleteChartImageFromStorage(chartImageUrl) {
    if (!chartImageUrl) return;
    // chartImageUrl: https://.../natalcharts/uuid.jpg
    const parts = chartImageUrl.split("/");
    const fileName = parts[parts.length - 1];
    const { error } = await supabase.storage
      .from("natalcharts")
      .remove([fileName]);
    if (error) {
      console.error("Görsel Storage’dan silinemedi:", error);
      throw error;
    }
  },

  // Tablo kaydından chart_image_url alanını temizle
  async removeChartImageUrl(calculationId) {
    const { error } = await supabase
      .from("calculation_results")
      .update({ chart_image_url: null })
      .eq("id", calculationId);
    if (error) {
      console.error("Tablodan görsel URL silinemedi:", error);
      throw error;
    }
  },
};
