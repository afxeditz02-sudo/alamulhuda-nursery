import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSiteSettings = () =>
  useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").limit(1).single();
      if (error) throw error;
      return data;
    },
  });

export const useFeatures = () =>
  useQuery({
    queryKey: ["features"],
    queryFn: async () => {
      const { data, error } = await supabase.from("features").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

export const useSliderImages = () =>
  useQuery({
    queryKey: ["slider_images"],
    queryFn: async () => {
      const { data, error } = await supabase.from("slider_images").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

export const useAnalysisData = (year: string) =>
  useQuery({
    queryKey: ["analysis_data", year],
    queryFn: async () => {
      const { data, error } = await supabase.from("analysis_data").select("*").eq("year", year).order("sort_order");
      if (error) throw error;
      return data;
    },
  });

export const useAnalysisYears = () =>
  useQuery({
    queryKey: ["analysis_years"],
    queryFn: async () => {
      const { data, error } = await supabase.from("analysis_data").select("year");
      if (error) throw error;
      const years = [...new Set((data || []).map((d) => d.year))];
      return years.sort();
    },
  });

export const useProgrammes = (year: string) =>
  useQuery({
    queryKey: ["programmes", year],
    queryFn: async () => {
      const { data, error } = await supabase.from("programmes").select("*").eq("year", year).order("sort_order");
      if (error) throw error;
      return data;
    },
  });

export const useProgrammeYears = () =>
  useQuery({
    queryKey: ["programme_years"],
    queryFn: async () => {
      const { data, error } = await supabase.from("programmes").select("year");
      if (error) throw error;
      const years = [...new Set((data || []).map((d) => d.year))];
      return years.sort();
    },
  });

export const useFooterLogos = () =>
  useQuery({
    queryKey: ["footer_logos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("footer_logos").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

export const useNavMenuItems = () =>
  useQuery({
    queryKey: ["nav_menu_items"],
    queryFn: async () => {
      const { data, error } = await supabase.from("nav_menu_items").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

export const useLiveStreams = () =>
  useQuery({
    queryKey: ["live_streams"],
    queryFn: async () => {
      const { data, error } = await supabase.from("live_streams").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });
