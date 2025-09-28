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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      admin_notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      app_secrets: {
        Row: {
          created_at: string | null
          id: string
          key: string
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          value?: string
        }
        Relationships: []
      }
      applicants: {
        Row: {
          admin_notes: string | null
          created_at: string
          description: string | null
          email: string | null
          emergency_contact: string | null
          experience_years: string | null
          first_name: string
          has_insurance: boolean | null
          id: string
          last_name: string
          location: string | null
          phone: string | null
          price_per_day: number | null
          services_offered: string[] | null
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          emergency_contact?: string | null
          experience_years?: string | null
          first_name: string
          has_insurance?: boolean | null
          id?: string
          last_name: string
          location?: string | null
          phone?: string | null
          price_per_day?: number | null
          services_offered?: string[] | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          emergency_contact?: string | null
          experience_years?: string | null
          first_name?: string
          has_insurance?: boolean | null
          id?: string
          last_name?: string
          location?: string | null
          phone?: string | null
          price_per_day?: number | null
          services_offered?: string[] | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          accepted_at: string | null
          created_at: string
          currency: string
          declined_at: string | null
          end_date: string
          fee_cents: number
          house_details: Json | null
          id: string
          notes: string | null
          owner_id: string
          paid_at: string | null
          payment_intent_id: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          period: unknown | null
          pet_details: Json | null
          service_id: string
          sitter_id: string | null
          start_date: string
          status: Database["public"]["Enums"]["booking_status"] | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          subtotal_cents: number
          total_cents: number | null
          total_price: number
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          currency?: string
          declined_at?: string | null
          end_date: string
          fee_cents?: number
          house_details?: Json | null
          id?: string
          notes?: string | null
          owner_id: string
          paid_at?: string | null
          payment_intent_id?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          period?: unknown | null
          pet_details?: Json | null
          service_id: string
          sitter_id?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["booking_status"] | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subtotal_cents?: number
          total_cents?: number | null
          total_price: number
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          currency?: string
          declined_at?: string | null
          end_date?: string
          fee_cents?: number
          house_details?: Json | null
          id?: string
          notes?: string | null
          owner_id?: string
          paid_at?: string | null
          payment_intent_id?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          period?: unknown | null
          pet_details?: Json | null
          service_id?: string
          sitter_id?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["booking_status"] | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subtotal_cents?: number
          total_cents?: number | null
          total_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "sitters"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          sitter_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          sitter_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          sitter_id?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          id: string
          rating: number
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          active: boolean | null
          base_price: number
          created_at: string
          description: string | null
          duration_hours: number
          id: string
          name: string
          service_type: Database["public"]["Enums"]["service_type"]
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          base_price: number
          created_at?: string
          description?: string | null
          duration_hours: number
          id?: string
          name: string
          service_type: Database["public"]["Enums"]["service_type"]
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          base_price?: number
          created_at?: string
          description?: string | null
          duration_hours?: number
          id?: string
          name?: string
          service_type?: Database["public"]["Enums"]["service_type"]
          updated_at?: string
        }
        Relationships: []
      }
      sitter_services: {
        Row: {
          active: boolean
          available: boolean | null
          created_at: string | null
          custom_price: number
          discount_percent: number
          hourly_rate_cents: number
          id: string
          service_id: string
          sitter_id: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean
          available?: boolean | null
          created_at?: string | null
          custom_price: number
          discount_percent?: number
          hourly_rate_cents?: number
          id?: string
          service_id: string
          sitter_id: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean
          available?: boolean | null
          created_at?: string | null
          custom_price?: number
          discount_percent?: number
          hourly_rate_cents?: number
          id?: string
          service_id?: string
          sitter_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sitter_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sitter_services_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "sitters"
            referencedColumns: ["id"]
          },
        ]
      }
      sitter_services_mapping: {
        Row: {
          created_at: string
          id: string
          service_id: string
          sitter_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          service_id: string
          sitter_id: string
        }
        Update: {
          created_at?: string
          id?: string
          service_id?: string
          sitter_id?: string
        }
        Relationships: []
      }
      sitters: {
        Row: {
          available: boolean | null
          average_rating: number | null
          created_at: string
          description: string | null
          email: string | null
          experience_years: number | null
          id: string
          location: string | null
          name: string | null
          phone: string | null
          photo_url: string | null
          price_per_day: number | null
          response_time: string | null
          services_offered: Database["public"]["Enums"]["service_type"][] | null
          updated_at: string
          user_id: string | null
          verified: boolean | null
        }
        Insert: {
          available?: boolean | null
          average_rating?: number | null
          created_at?: string
          description?: string | null
          email?: string | null
          experience_years?: number | null
          id?: string
          location?: string | null
          name?: string | null
          phone?: string | null
          photo_url?: string | null
          price_per_day?: number | null
          response_time?: string | null
          services_offered?:
            | Database["public"]["Enums"]["service_type"][]
            | null
          updated_at?: string
          user_id?: string | null
          verified?: boolean | null
        }
        Update: {
          available?: boolean | null
          average_rating?: number | null
          created_at?: string
          description?: string | null
          email?: string | null
          experience_years?: number | null
          id?: string
          location?: string | null
          name?: string | null
          phone?: string | null
          photo_url?: string | null
          price_per_day?: number | null
          response_time?: string | null
          services_offered?:
            | Database["public"]["Enums"]["service_type"][]
            | null
          updated_at?: string
          user_id?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          location: string | null
          name: string
          phone: string | null
          photo_url: string | null
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          location?: string | null
          name: string
          phone?: string | null
          photo_url?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          location?: string | null
          name?: string
          phone?: string | null
          photo_url?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_booking_price: {
        Args: { end_date: string; service_id: string; start_date: string }
        Returns: number
      }
      gbt_bit_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_bool_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_bool_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_bpchar_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_bytea_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_cash_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_cash_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_date_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_date_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_enum_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_enum_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_float4_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_float4_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_float8_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_float8_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_inet_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_int2_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_int2_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_int4_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_int4_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_int8_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_int8_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_intv_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_intv_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_intv_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_macad_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_macad_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_macad8_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_macad8_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_numeric_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_oid_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_oid_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_text_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_time_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_time_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_timetz_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_ts_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_ts_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_tstz_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_uuid_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_uuid_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_var_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_var_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey_var_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey_var_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey16_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey16_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey2_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey2_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey32_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey32_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey4_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey4_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey8_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey8_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      get_app_secret: {
        Args: { secret_key: string }
        Returns: string
      }
      get_recent_bookings: {
        Args: Record<PropertyKey, never>
        Returns: {
          average_rating: number
          created_at: string
          id: string
          service_name: string
          service_type: Database["public"]["Enums"]["service_type"]
          sitter_name: string
          total_price: number
          verified: boolean
        }[]
      }
      get_sitter_contact_details: {
        Args: { sitter_id: string }
        Returns: {
          email: string
          phone: string
        }[]
      }
      get_sitters_by_service: {
        Args: { service_id_param: string }
        Returns: {
          available: boolean
          average_rating: number
          description: string
          experience_years: number
          id: string
          location: string
          name: string
          photo_url: string
          price_per_day: number
          response_time: string
          verified: boolean
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      validate_notification_request: {
        Args: { secret_header: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      booking_status:
        | "pending"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "assigned"
      payment_status: "pending" | "paid" | "failed" | "refunded"
      service_type: "pet" | "house" | "combined"
      user_type: "owner" | "sitter" | "admin"
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
      app_role: ["admin", "moderator", "user"],
      booking_status: [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "assigned",
      ],
      payment_status: ["pending", "paid", "failed", "refunded"],
      service_type: ["pet", "house", "combined"],
      user_type: ["owner", "sitter", "admin"],
    },
  },
} as const
