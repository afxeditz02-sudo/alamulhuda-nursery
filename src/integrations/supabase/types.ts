export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      analysis_data: {
        Row: {
          category: string
          icon: string | null
          id: string
          sort_order: number | null
          value: number
          year: string
        }
        Insert: {
          category: string
          icon?: string | null
          id?: string
          sort_order?: number | null
          value?: number
          year: string
        }
        Update: {
          category?: string
          icon?: string | null
          id?: string
          sort_order?: number | null
          value?: number
          year?: string
        }
        Relationships: []
      }
      banners: {
        Row: {
          created_at: string | null
          ends_at: string | null
          id: string
          image_url: string
          is_published: boolean | null
          link_url: string | null
          sort_order: number | null
          starts_at: string | null
        }
        Insert: {
          created_at?: string | null
          ends_at?: string | null
          id?: string
          image_url: string
          is_published?: boolean | null
          link_url?: string | null
          sort_order?: number | null
          starts_at?: string | null
        }
        Update: {
          created_at?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string
          is_published?: boolean | null
          link_url?: string | null
          sort_order?: number | null
          starts_at?: string | null
        }
        Relationships: []
      }
      features: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          sort_order: number | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          sort_order?: number | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          sort_order?: number | null
          title?: string
        }
        Relationships: []
      }
      footer_logos: {
        Row: {
          id: string
          image_url: string
          name: string | null
          sort_order: number | null
        }
        Insert: {
          id?: string
          image_url: string
          name?: string | null
          sort_order?: number | null
        }
        Update: {
          id?: string
          image_url?: string
          name?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      live_streams: {
        Row: {
          created_at: string | null
          ends_at: string | null
          id: string
          is_live: boolean
          is_published: boolean
          scheduled_at: string | null
          sort_order: number | null
          title: string
          youtube_url: string
        }
        Insert: {
          created_at?: string | null
          ends_at?: string | null
          id?: string
          is_live?: boolean
          is_published?: boolean
          scheduled_at?: string | null
          sort_order?: number | null
          title: string
          youtube_url: string
        }
        Update: {
          created_at?: string | null
          ends_at?: string | null
          id?: string
          is_live?: boolean
          is_published?: boolean
          scheduled_at?: string | null
          sort_order?: number | null
          title?: string
          youtube_url?: string
        }
        Relationships: []
      }
      nav_menu_items: {
        Row: {
          created_at: string | null
          href: string
          id: string
          is_visible: boolean | null
          label: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          href: string
          id?: string
          is_visible?: boolean | null
          label: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          href?: string
          id?: string
          is_visible?: boolean | null
          label?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string
          id: string
          is_removed: boolean
          removed_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          is_removed?: boolean
          removed_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          is_removed?: boolean
          removed_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      programmes: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_published: boolean | null
          media: Json | null
          scheduled_at: string | null
          see_more_url: string | null
          sort_order: number | null
          title: string
          year: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          media?: Json | null
          scheduled_at?: string | null
          see_more_url?: string | null
          sort_order?: number | null
          title: string
          year: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          media?: Json | null
          scheduled_at?: string | null
          see_more_url?: string | null
          sort_order?: number | null
          title?: string
          year?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          admission_button_text: string | null
          admission_heading: string | null
          admission_text: string | null
          analysis_heading: string | null
          features_heading: string | null
          footer_copyright: string | null
          footer_estd: string | null
          footer_managed_by: string | null
          footer_reg: string | null
          footer_run_by: string | null
          footer_under: string | null
          id: string
          logo_url: string | null
          primary_analysis_year: string | null
          primary_programmes_year: string | null
          programmes_heading: string | null
          school_name: string
          tagline: string | null
          updated_at: string | null
        }
        Insert: {
          admission_button_text?: string | null
          admission_heading?: string | null
          admission_text?: string | null
          analysis_heading?: string | null
          features_heading?: string | null
          footer_copyright?: string | null
          footer_estd?: string | null
          footer_managed_by?: string | null
          footer_reg?: string | null
          footer_run_by?: string | null
          footer_under?: string | null
          id?: string
          logo_url?: string | null
          primary_analysis_year?: string | null
          primary_programmes_year?: string | null
          programmes_heading?: string | null
          school_name?: string
          tagline?: string | null
          updated_at?: string | null
        }
        Update: {
          admission_button_text?: string | null
          admission_heading?: string | null
          admission_text?: string | null
          analysis_heading?: string | null
          features_heading?: string | null
          footer_copyright?: string | null
          footer_estd?: string | null
          footer_managed_by?: string | null
          footer_reg?: string | null
          footer_run_by?: string | null
          footer_under?: string | null
          id?: string
          logo_url?: string | null
          primary_analysis_year?: string | null
          primary_programmes_year?: string | null
          programmes_heading?: string | null
          school_name?: string
          tagline?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      slider_images: {
        Row: {
          created_at: string | null
          description: string | null
          heading: string | null
          id: string
          image_url: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          heading?: string | null
          id?: string
          image_url: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          heading?: string | null
          id?: string
          image_url?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
