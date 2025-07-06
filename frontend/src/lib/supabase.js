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
};
