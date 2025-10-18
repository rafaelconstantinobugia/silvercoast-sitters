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
          about: string | null
          city: string | null
          created_at: string
          email: string | null
          emergency_contact: string | null
          full_name: string | null
          has_insurance: boolean | null
          id: string
          meta: Json
          phone: string | null
          photo_url: string | null
          price_per_day: number | null
          status: string
          user_id: string | null
        }
        Insert: {
          about?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          emergency_contact?: string | null
          full_name?: string | null
          has_insurance?: boolean | null
          id?: string
          meta?: Json
          phone?: string | null
          photo_url?: string | null
          price_per_day?: number | null
          status?: string
          user_id?: string | null
        }
        Update: {
          about?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          emergency_contact?: string | null
          full_name?: string | null
          has_insurance?: boolean | null
          id?: string
          meta?: Json
          phone?: string | null
          photo_url?: string | null
          price_per_day?: number | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applicants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_slots: {
        Row: {
          end_ts: string
          id: string
          is_booked: boolean | null
          sitter_id: string
          start_ts: string
        }
        Insert: {
          end_ts: string
          id?: string
          is_booked?: boolean | null
          sitter_id: string
          start_ts: string
        }
        Update: {
          end_ts?: string
          id?: string
          is_booked?: boolean | null
          sitter_id?: string
          start_ts?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_slots_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_pets: {
        Row: {
          booking_id: string
          pet_id: string
        }
        Insert: {
          booking_id: string
          pet_id: string
        }
        Update: {
          booking_id?: string
          pet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_pets_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_pets_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          accepted_at: string | null
          address_text: string | null
          amount_cents: number | null
          cancelled_reason: string | null
          completed_at: string | null
          created_at: string | null
          currency: string | null
          customer_id: string
          end_time: string
          end_ts: string | null
          hourly_rate_cents: number | null
          id: string
          listing_id: string | null
          notes: string | null
          owner_id: string | null
          pet_type: string | null
          price_cents: number | null
          service_id: string | null
          sitter_id: string
          start_time: string
          start_ts: string | null
          status: Database["public"]["Enums"]["booking_status"]
        }
        Insert: {
          accepted_at?: string | null
          address_text?: string | null
          amount_cents?: number | null
          cancelled_reason?: string | null
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          customer_id: string
          end_time: string
          end_ts?: string | null
          hourly_rate_cents?: number | null
          id?: string
          listing_id?: string | null
          notes?: string | null
          owner_id?: string | null
          pet_type?: string | null
          price_cents?: number | null
          service_id?: string | null
          sitter_id: string
          start_time: string
          start_ts?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
        }
        Update: {
          accepted_at?: string | null
          address_text?: string | null
          amount_cents?: number | null
          cancelled_reason?: string | null
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string
          end_time?: string
          end_ts?: string | null
          hourly_rate_cents?: number | null
          id?: string
          listing_id?: string | null
          notes?: string | null
          owner_id?: string | null
          pet_type?: string | null
          price_cents?: number | null
          service_id?: string | null
          sitter_id?: string
          start_time?: string
          start_ts?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "service_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
            referencedRelation: "profiles"
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
      invoice_lines: {
        Row: {
          description: string
          id: string
          invoice_id: string
          qty: number
          total_cents: number
          unit_price_cents: number
        }
        Insert: {
          description: string
          id?: string
          invoice_id: string
          qty?: number
          total_cents: number
          unit_price_cents: number
        }
        Update: {
          description?: string
          id?: string
          invoice_id?: string
          qty?: number
          total_cents?: number
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_lines_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          booking_id: string
          created_at: string | null
          currency: string | null
          due_date: string | null
          id: string
          invoice_number: string | null
          issue_date: string | null
          payment_instructions: string | null
          payment_method: string
          payment_reference: string | null
          status: string
          total_cents: number
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          currency?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          issue_date?: string | null
          payment_instructions?: string | null
          payment_method?: string
          payment_reference?: string | null
          status?: string
          total_cents: number
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          currency?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          issue_date?: string | null
          payment_instructions?: string | null
          payment_method?: string
          payment_reference?: string | null
          status?: string
          total_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      ledger: {
        Row: {
          actor_id: string | null
          booking_id: string | null
          event_name: string
          event_ts: string | null
          id: number
          invoice_id: string | null
          meta: Json | null
          payout_id: string | null
        }
        Insert: {
          actor_id?: string | null
          booking_id?: string | null
          event_name: string
          event_ts?: string | null
          id?: number
          invoice_id?: string | null
          meta?: Json | null
          payout_id?: string | null
        }
        Update: {
          actor_id?: string | null
          booking_id?: string | null
          event_name?: string
          event_ts?: string | null
          id?: number
          invoice_id?: string | null
          meta?: Json | null
          payout_id?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string | null
          id: string
          invoice_id: string
          method: string
          payer_id: string
          proof_url: string | null
          received_at: string | null
          recorded_by: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          id?: string
          invoice_id: string
          method: string
          payer_id: string
          proof_url?: string | null
          received_at?: string | null
          recorded_by?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          id?: string
          invoice_id?: string
          method?: string
          payer_id?: string
          proof_url?: string | null
          received_at?: string | null
          recorded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payer_id_fkey"
            columns: ["payer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_requests: {
        Row: {
          admin_note: string | null
          amount_cents: number
          created_at: string | null
          id: string
          processed_at: string | null
          sitter_id: string
          status: Database["public"]["Enums"]["payout_status"]
        }
        Insert: {
          admin_note?: string | null
          amount_cents: number
          created_at?: string | null
          id?: string
          processed_at?: string | null
          sitter_id: string
          status?: Database["public"]["Enums"]["payout_status"]
        }
        Update: {
          admin_note?: string | null
          amount_cents?: number
          created_at?: string | null
          id?: string
          processed_at?: string | null
          sitter_id?: string
          status?: Database["public"]["Enums"]["payout_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payout_requests_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount_cents: number
          booking_id: string
          created_at: string | null
          id: string
          notes: string | null
          paid_at: string | null
          payment_method: string | null
          sitter_id: string
          status: string
          transaction_reference: string | null
        }
        Insert: {
          amount_cents: number
          booking_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          sitter_id: string
          status?: string
          transaction_reference?: string | null
        }
        Update: {
          amount_cents?: number
          booking_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          sitter_id?: string
          status?: string
          transaction_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payouts_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pets: {
        Row: {
          created_at: string | null
          id: string
          name: string
          notes: string | null
          owner_id: string
          photo_url: string | null
          species: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          owner_id: string
          photo_url?: string | null
          species?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          owner_id?: string
          photo_url?: string | null
          species?: string
        }
        Relationships: [
          {
            foreignKeyName: "pets_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          locality: string | null
          phone: string | null
          role: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          locality?: string | null
          phone?: string | null
          role?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          locality?: string | null
          phone?: string | null
          role?: string | null
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
        Relationships: []
      }
      reviews_new: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          id: string
          rating: number
          reviewee_id: string
          reviewer_id: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          reviewee_id: string
          reviewer_id: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          reviewee_id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_new_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      service_listings: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          id: string
          locality: string
          price_cents: number
          price_unit: string
          service_type: string
          sitter_id: string
          title: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          locality: string
          price_cents: number
          price_unit?: string
          service_type: string
          sitter_id: string
          title: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          locality?: string
          price_cents?: number
          price_unit?: string
          service_type?: string
          sitter_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_listings_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          base_price: number
          created_at: string
          description: string | null
          duration_hours: number
          id: string
          is_active: boolean
          name: string
          service_type: string
          updated_at: string
        }
        Insert: {
          base_price?: number
          created_at?: string
          description?: string | null
          duration_hours?: number
          id?: string
          is_active?: boolean
          name: string
          service_type?: string
          updated_at?: string
        }
        Update: {
          base_price?: number
          created_at?: string
          description?: string | null
          duration_hours?: number
          id?: string
          is_active?: boolean
          name?: string
          service_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      sitter_details: {
        Row: {
          accepts_home_visits: boolean | null
          accepts_overnight: boolean | null
          address_text: string | null
          base_hourly_rate_cents: number
          display_name: string | null
          pet_types: string[] | null
          service_radius_km: number | null
          sitter_id: string
          updated_at: string | null
        }
        Insert: {
          accepts_home_visits?: boolean | null
          accepts_overnight?: boolean | null
          address_text?: string | null
          base_hourly_rate_cents?: number
          display_name?: string | null
          pet_types?: string[] | null
          service_radius_km?: number | null
          sitter_id: string
          updated_at?: string | null
        }
        Update: {
          accepts_home_visits?: boolean | null
          accepts_overnight?: boolean | null
          address_text?: string | null
          base_hourly_rate_cents?: number
          display_name?: string | null
          pet_types?: string[] | null
          service_radius_km?: number | null
          sitter_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sitter_details_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sitter_photos: {
        Row: {
          created_at: string | null
          id: string
          is_public: boolean | null
          sitter_id: string
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          sitter_id: string
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          sitter_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "sitter_photos_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sitter_public: {
        Row: {
          avatar_url: string | null
          base_hourly_rate_cents: number | null
          bio_short: string | null
          city: string | null
          is_listed: boolean | null
          is_verified: boolean | null
          name: string
          pet_types: string[] | null
          sitter_id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          base_hourly_rate_cents?: number | null
          bio_short?: string | null
          city?: string | null
          is_listed?: boolean | null
          is_verified?: boolean | null
          name: string
          pet_types?: string[] | null
          sitter_id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          base_hourly_rate_cents?: number | null
          bio_short?: string | null
          city?: string | null
          is_listed?: boolean | null
          is_verified?: boolean | null
          name?: string
          pet_types?: string[] | null
          sitter_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sitter_public_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sitter_services: {
        Row: {
          created_at: string
          custom_price: number | null
          id: string
          service_id: string
          sitter_id: string
        }
        Insert: {
          created_at?: string
          custom_price?: number | null
          id?: string
          service_id: string
          sitter_id: string
        }
        Update: {
          created_at?: string
          custom_price?: number | null
          id?: string
          service_id?: string
          sitter_id?: string
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
            referencedRelation: "profiles"
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
      system_settings: {
        Row: {
          key: string
          value: Json
        }
        Insert: {
          key: string
          value: Json
        }
        Update: {
          key?: string
          value?: Json
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
      sitters: {
        Row: {
          avatar_url: string | null
          base_hourly_rate_cents: number | null
          bio_short: string | null
          city: string | null
          name: string | null
          pet_types: string[] | null
          sitter_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          base_hourly_rate_cents?: number | null
          bio_short?: string | null
          city?: string | null
          name?: string | null
          pet_types?: string[] | null
          sitter_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          base_hourly_rate_cents?: number | null
          bio_short?: string | null
          city?: string | null
          name?: string | null
          pet_types?: string[] | null
          sitter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sitter_public_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sitters_public_view: {
        Row: {
          avatar_url: string | null
          base_hourly_rate_cents: number | null
          bio_short: string | null
          city: string | null
          is_verified: boolean | null
          name: string | null
          pet_types: string[] | null
          sitter_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          base_hourly_rate_cents?: number | null
          bio_short?: string | null
          city?: string | null
          is_verified?: boolean | null
          name?: string | null
          pet_types?: string[] | null
          sitter_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          base_hourly_rate_cents?: number | null
          bio_short?: string | null
          city?: string | null
          is_verified?: boolean | null
          name?: string | null
          pet_types?: string[] | null
          sitter_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sitter_public_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_booking: {
        Args: { p_booking_id: string }
        Returns: {
          accepted_at: string | null
          address_text: string | null
          amount_cents: number | null
          cancelled_reason: string | null
          completed_at: string | null
          created_at: string | null
          currency: string | null
          customer_id: string
          end_time: string
          end_ts: string | null
          hourly_rate_cents: number | null
          id: string
          listing_id: string | null
          notes: string | null
          owner_id: string | null
          pet_type: string | null
          price_cents: number | null
          service_id: string | null
          sitter_id: string
          start_time: string
          start_ts: string | null
          status: Database["public"]["Enums"]["booking_status"]
        }
      }
      calculate_booking_price: {
        Args: { end_date: string; service_id: string; start_date: string }
        Returns: number
      }
      cancel_booking_by_customer: {
        Args: { p_booking_id: string; p_reason?: string }
        Returns: {
          accepted_at: string | null
          address_text: string | null
          amount_cents: number | null
          cancelled_reason: string | null
          completed_at: string | null
          created_at: string | null
          currency: string | null
          customer_id: string
          end_time: string
          end_ts: string | null
          hourly_rate_cents: number | null
          id: string
          listing_id: string | null
          notes: string | null
          owner_id: string | null
          pet_type: string | null
          price_cents: number | null
          service_id: string | null
          sitter_id: string
          start_time: string
          start_ts: string | null
          status: Database["public"]["Enums"]["booking_status"]
        }
      }
      cancel_booking_by_sitter: {
        Args: { p_booking_id: string; p_reason?: string }
        Returns: {
          accepted_at: string | null
          address_text: string | null
          amount_cents: number | null
          cancelled_reason: string | null
          completed_at: string | null
          created_at: string | null
          currency: string | null
          customer_id: string
          end_time: string
          end_ts: string | null
          hourly_rate_cents: number | null
          id: string
          listing_id: string | null
          notes: string | null
          owner_id: string | null
          pet_type: string | null
          price_cents: number | null
          service_id: string | null
          sitter_id: string
          start_time: string
          start_ts: string | null
          status: Database["public"]["Enums"]["booking_status"]
        }
      }
      complete_booking: {
        Args: { p_booking_id: string }
        Returns: {
          accepted_at: string | null
          address_text: string | null
          amount_cents: number | null
          cancelled_reason: string | null
          completed_at: string | null
          created_at: string | null
          currency: string | null
          customer_id: string
          end_time: string
          end_ts: string | null
          hourly_rate_cents: number | null
          id: string
          listing_id: string | null
          notes: string | null
          owner_id: string | null
          pet_type: string | null
          price_cents: number | null
          service_id: string | null
          sitter_id: string
          start_time: string
          start_ts: string | null
          status: Database["public"]["Enums"]["booking_status"]
        }
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
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
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
      is_admin: {
        Args: Record<PropertyKey, never> | { p_uid?: string }
        Returns: boolean
      }
      request_booking: {
        Args: {
          p_address: string
          p_end: string
          p_notes?: string
          p_pet_type?: string
          p_service_id: string
          p_sitter_id: string
          p_start: string
        }
        Returns: {
          accepted_at: string | null
          address_text: string | null
          amount_cents: number | null
          cancelled_reason: string | null
          completed_at: string | null
          created_at: string | null
          currency: string | null
          customer_id: string
          end_time: string
          end_ts: string | null
          hourly_rate_cents: number | null
          id: string
          listing_id: string | null
          notes: string | null
          owner_id: string | null
          pet_type: string | null
          price_cents: number | null
          service_id: string | null
          sitter_id: string
          start_time: string
          start_ts: string | null
          status: Database["public"]["Enums"]["booking_status"]
        }
      }
      request_payout: {
        Args: { p_amount_cents: number }
        Returns: {
          admin_note: string | null
          amount_cents: number
          created_at: string | null
          id: string
          processed_at: string | null
          sitter_id: string
          status: Database["public"]["Enums"]["payout_status"]
        }
      }
      search_sitters: {
        Args: { p_city: string; p_pet_type?: string; p_service_name?: string }
        Returns: {
          avatar_url: string | null
          base_hourly_rate_cents: number | null
          bio_short: string | null
          city: string | null
          is_listed: boolean | null
          is_verified: boolean | null
          name: string
          pet_types: string[] | null
          sitter_id: string
          updated_at: string | null
        }[]
      }
      sitter_balance: {
        Args: { p_sitter?: string }
        Returns: {
          available_cents: number
          paid_cents: number
          requested_cents: number
          total_cents: number
        }[]
      }
      submit_sitter_application: {
        Args: {
          p_city?: string
          p_email?: string
          p_emergency_contact?: string
          p_full_name?: string
          p_has_insurance?: boolean
          p_meta?: Json
          p_phone?: string
          p_photo_url?: string
        }
        Returns: {
          about: string | null
          city: string | null
          created_at: string
          email: string | null
          emergency_contact: string | null
          full_name: string | null
          has_insurance: boolean | null
          id: string
          meta: Json
          phone: string | null
          photo_url: string | null
          price_per_day: number | null
          status: string
          user_id: string | null
        }
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
      payout_status: "requested" | "approved" | "paid" | "rejected"
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
      payout_status: ["requested", "approved", "paid", "rejected"],
      service_type: ["pet", "house", "combined"],
      user_type: ["owner", "sitter", "admin"],
    },
  },
} as const
