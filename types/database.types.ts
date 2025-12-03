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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_activity_logs: {
        Row: {
          action: string
          action_type: string | null
          admin_id: string | null
          created_at: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          new_value: Json | null
          old_value: Json | null
          severity: string | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          action_type?: string | null
          admin_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          severity?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          action_type?: string | null
          admin_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          severity?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_activity_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      aliases: {
        Row: {
          alias: string
          clicks: number | null
          created_at: string | null
          form_id: string | null
          is_active: boolean | null
          metadata: Json | null
          owner_id: string | null
          type: string | null
        }
        Insert: {
          alias: string
          clicks?: number | null
          created_at?: string | null
          form_id?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          owner_id?: string | null
          type?: string | null
        }
        Update: {
          alias?: string
          clicks?: number | null
          created_at?: string | null
          form_id?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          owner_id?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aliases_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aliases_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_snapshots: {
        Row: {
          created_at: string | null
          form_id: string | null
          id: string
          period: string | null
          snapshot_time: string | null
          stats: Json
        }
        Insert: {
          created_at?: string | null
          form_id?: string | null
          id?: string
          period?: string | null
          snapshot_time?: string | null
          stats?: Json
        }
        Update: {
          created_at?: string | null
          form_id?: string | null
          id?: string
          period?: string | null
          snapshot_time?: string | null
          stats?: Json
        }
        Relationships: [
          {
            foreignKeyName: "analytics_snapshots_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_name: string
          key_prefix: string
          last_used_at: string | null
          permissions: string[] | null
          revoked_at: string | null
          revoked_by: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_name: string
          key_prefix: string
          last_used_at?: string | null
          permissions?: string[] | null
          revoked_at?: string | null
          revoked_by?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_name?: string
          key_prefix?: string
          last_used_at?: string | null
          permissions?: string[] | null
          revoked_at?: string | null
          revoked_by?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_revoked_by_fkey"
            columns: ["revoked_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          new_value: Json | null
          old_value: Json | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      background_jobs: {
        Row: {
          attempts: number | null
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          job_type: string
          max_attempts: number | null
          payload: Json
          priority: number | null
          scheduled_at: string | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          attempts?: number | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_type: string
          max_attempts?: number | null
          payload: Json
          priority?: number | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          attempts?: number | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_type?: string
          max_attempts?: number | null
          payload?: Json
          priority?: number | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      blacklisted_aliases: {
        Row: {
          added_by: string | null
          alias: string
          created_at: string | null
          reason: string | null
        }
        Insert: {
          added_by?: string | null
          alias: string
          created_at?: string | null
          reason?: string | null
        }
        Update: {
          added_by?: string | null
          alias?: string
          created_at?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blacklisted_aliases_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      edit_tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          ip_address: unknown
          response_id: string | null
          token: string
          used: boolean | null
          used_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          ip_address?: unknown
          response_id?: string | null
          token: string
          used?: boolean | null
          used_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          ip_address?: unknown
          response_id?: string | null
          token?: string
          used?: boolean | null
          used_at?: string | null
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          body_html: string
          body_text: string | null
          click_count: number | null
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          open_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          sent_count: number | null
          status: string | null
          subject: string
          target_criteria: Json | null
          target_segment: string | null
          updated_at: string | null
        }
        Insert: {
          body_html: string
          body_text?: string | null
          click_count?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          open_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string | null
          subject: string
          target_criteria?: Json | null
          target_segment?: string | null
          updated_at?: string | null
        }
        Update: {
          body_html?: string
          body_text?: string | null
          click_count?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          open_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string | null
          subject?: string
          target_criteria?: Json | null
          target_segment?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      exports: {
        Row: {
          completed_at: string | null
          created_at: string | null
          download_url: string | null
          error_message: string | null
          expires_at: string | null
          file_size_bytes: number | null
          form_id: string | null
          format: string | null
          id: string
          metadata: Json | null
          r2_path: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          download_url?: string | null
          error_message?: string | null
          expires_at?: string | null
          file_size_bytes?: number | null
          form_id?: string | null
          format?: string | null
          id?: string
          metadata?: Json | null
          r2_path?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          download_url?: string | null
          error_message?: string | null
          expires_at?: string | null
          file_size_bytes?: number | null
          form_id?: string | null
          format?: string | null
          id?: string
          metadata?: Json | null
          r2_path?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exports_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          allowed_plans: string[] | null
          created_at: string | null
          description: string | null
          flag_key: string
          id: string
          is_enabled: boolean | null
          metadata: Json | null
          name: string
          rollout_percentage: number | null
          updated_at: string | null
        }
        Insert: {
          allowed_plans?: string[] | null
          created_at?: string | null
          description?: string | null
          flag_key: string
          id?: string
          is_enabled?: boolean | null
          metadata?: Json | null
          name: string
          rollout_percentage?: number | null
          updated_at?: string | null
        }
        Update: {
          allowed_plans?: string[] | null
          created_at?: string | null
          description?: string | null
          flag_key?: string
          id?: string
          is_enabled?: boolean | null
          metadata?: Json | null
          name?: string
          rollout_percentage?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      form_collaborators: {
        Row: {
          created_at: string | null
          form_id: string | null
          id: string
          invited_by: string | null
          permissions: Json | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          form_id?: string | null
          id?: string
          invited_by?: string | null
          permissions?: Json | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          form_id?: string | null
          id?: string
          invited_by?: string | null
          permissions?: Json | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_collaborators_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_collaborators_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_collaborators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      form_fields: {
        Row: {
          created_at: string | null
          field_key: string
          form_id: string | null
          id: string
          is_required: boolean | null
          label: string
          meta: Json | null
          order_idx: number
          placeholder: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          field_key: string
          form_id?: string | null
          id?: string
          is_required?: boolean | null
          label: string
          meta?: Json | null
          order_idx: number
          placeholder?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          field_key?: string
          form_id?: string | null
          id?: string
          is_required?: boolean | null
          label?: string
          meta?: Json | null
          order_idx?: number
          placeholder?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_fields_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_imports: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          form_id: string | null
          id: string
          mapping: Json | null
          source: string | null
          source_id: string | null
          source_url: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          form_id?: string | null
          id?: string
          mapping?: Json | null
          source?: string | null
          source_id?: string | null
          source_url: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          form_id?: string | null
          id?: string
          mapping?: Json | null
          source?: string | null
          source_id?: string | null
          source_url?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_imports_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_imports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      form_reports: {
        Row: {
          created_at: string | null
          description: string
          form_id: string | null
          id: string
          report_type: string | null
          reported_by: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          form_id?: string | null
          id?: string
          report_type?: string | null
          reported_by?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          form_id?: string | null
          id?: string
          report_type?: string | null
          reported_by?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_reports_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_reports_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_reports_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      form_response_files: {
        Row: {
          created_at: string | null
          download_url: string | null
          field_id: string | null
          filename: string
          id: string
          is_public: boolean | null
          metadata: Json | null
          mimetype: string
          preview_url: string | null
          r2_bucket: string | null
          r2_path: string
          response_id: string | null
          size_bytes: number
        }
        Insert: {
          created_at?: string | null
          download_url?: string | null
          field_id?: string | null
          filename: string
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          mimetype: string
          preview_url?: string | null
          r2_bucket?: string | null
          r2_path: string
          response_id?: string | null
          size_bytes: number
        }
        Update: {
          created_at?: string | null
          download_url?: string | null
          field_id?: string | null
          filename?: string
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          mimetype?: string
          preview_url?: string | null
          r2_bucket?: string | null
          r2_path?: string
          response_id?: string | null
          size_bytes?: number
        }
        Relationships: [
          {
            foreignKeyName: "form_response_files_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "form_fields"
            referencedColumns: ["id"]
          },
        ]
      }
      form_response_values: {
        Row: {
          created_at: string | null
          field_id: string | null
          id: string
          response_id: string | null
          updated_at: string | null
          value: Json | null
        }
        Insert: {
          created_at?: string | null
          field_id?: string | null
          id?: string
          response_id?: string | null
          updated_at?: string | null
          value?: Json | null
        }
        Update: {
          created_at?: string | null
          field_id?: string | null
          id?: string
          response_id?: string | null
          updated_at?: string | null
          value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "form_response_values_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "form_fields"
            referencedColumns: ["id"]
          },
        ]
      }
      form_responses: {
        Row: {
          completed_at: string | null
          completion_time_seconds: number | null
          created_at: string
          current_step: string | null
          device_info: Json | null
          form_id: string | null
          id: string
          ip_address: unknown
          last_activity_at: string | null
          respondent_email: string | null
          respondent_name: string | null
          respondent_phone: string | null
          search_vector: unknown
          session_data: Json | null
          source: string | null
          status: string | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          completed_at?: string | null
          completion_time_seconds?: number | null
          created_at?: string
          current_step?: string | null
          device_info?: Json | null
          form_id?: string | null
          id?: string
          ip_address?: unknown
          last_activity_at?: string | null
          respondent_email?: string | null
          respondent_name?: string | null
          respondent_phone?: string | null
          search_vector?: unknown
          session_data?: Json | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          completed_at?: string | null
          completion_time_seconds?: number | null
          created_at?: string
          current_step?: string | null
          device_info?: Json | null
          form_id?: string | null
          id?: string
          ip_address?: unknown
          last_activity_at?: string | null
          respondent_email?: string | null
          respondent_name?: string | null
          respondent_phone?: string | null
          search_vector?: unknown
          session_data?: Json | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "form_responses_form_id_fkey1"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_responses_2025_01: {
        Row: {
          completed_at: string | null
          completion_time_seconds: number | null
          created_at: string
          current_step: string | null
          device_info: Json | null
          form_id: string | null
          id: string
          ip_address: unknown
          last_activity_at: string | null
          respondent_email: string | null
          respondent_name: string | null
          respondent_phone: string | null
          search_vector: unknown
          session_data: Json | null
          source: string | null
          status: string | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          completed_at?: string | null
          completion_time_seconds?: number | null
          created_at?: string
          current_step?: string | null
          device_info?: Json | null
          form_id?: string | null
          id?: string
          ip_address?: unknown
          last_activity_at?: string | null
          respondent_email?: string | null
          respondent_name?: string | null
          respondent_phone?: string | null
          search_vector?: unknown
          session_data?: Json | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          completed_at?: string | null
          completion_time_seconds?: number | null
          created_at?: string
          current_step?: string | null
          device_info?: Json | null
          form_id?: string | null
          id?: string
          ip_address?: unknown
          last_activity_at?: string | null
          respondent_email?: string | null
          respondent_name?: string | null
          respondent_phone?: string | null
          search_vector?: unknown
          session_data?: Json | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: []
      }
      form_responses_2025_02: {
        Row: {
          completed_at: string | null
          completion_time_seconds: number | null
          created_at: string
          current_step: string | null
          device_info: Json | null
          form_id: string | null
          id: string
          ip_address: unknown
          last_activity_at: string | null
          respondent_email: string | null
          respondent_name: string | null
          respondent_phone: string | null
          search_vector: unknown
          session_data: Json | null
          source: string | null
          status: string | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          completed_at?: string | null
          completion_time_seconds?: number | null
          created_at?: string
          current_step?: string | null
          device_info?: Json | null
          form_id?: string | null
          id?: string
          ip_address?: unknown
          last_activity_at?: string | null
          respondent_email?: string | null
          respondent_name?: string | null
          respondent_phone?: string | null
          search_vector?: unknown
          session_data?: Json | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          completed_at?: string | null
          completion_time_seconds?: number | null
          created_at?: string
          current_step?: string | null
          device_info?: Json | null
          form_id?: string | null
          id?: string
          ip_address?: unknown
          last_activity_at?: string | null
          respondent_email?: string | null
          respondent_name?: string | null
          respondent_phone?: string | null
          search_vector?: unknown
          session_data?: Json | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: []
      }
      form_versions: {
        Row: {
          change_summary: string | null
          created_at: string | null
          flow_json: Json
          form_id: string | null
          id: string
          published_by: string | null
          version: number
        }
        Insert: {
          change_summary?: string | null
          created_at?: string | null
          flow_json: Json
          form_id?: string | null
          id?: string
          published_by?: string | null
          version: number
        }
        Update: {
          change_summary?: string | null
          created_at?: string | null
          flow_json?: Json
          form_id?: string | null
          id?: string
          published_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "form_versions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_versions_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      forms: {
        Row: {
          category: string | null
          config: Json | null
          created_at: string | null
          description: string | null
          flow_json: Json | null
          flow_version: number | null
          form_key: string
          id: string
          is_active: boolean | null
          is_published: boolean | null
          metadata: Json | null
          owner_id: string | null
          public_alias: string | null
          published_at: string | null
          search_vector: unknown
          slug: string | null
          status: string | null
          tags: string[] | null
          title: string
          total_responses: number | null
          updated_at: string | null
          web_url: string | null
          whatsapp_trigger: string | null
        }
        Insert: {
          category?: string | null
          config?: Json | null
          created_at?: string | null
          description?: string | null
          flow_json?: Json | null
          flow_version?: number | null
          form_key: string
          id?: string
          is_active?: boolean | null
          is_published?: boolean | null
          metadata?: Json | null
          owner_id?: string | null
          public_alias?: string | null
          published_at?: string | null
          search_vector?: unknown
          slug?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          total_responses?: number | null
          updated_at?: string | null
          web_url?: string | null
          whatsapp_trigger?: string | null
        }
        Update: {
          category?: string | null
          config?: Json | null
          created_at?: string | null
          description?: string | null
          flow_json?: Json | null
          flow_version?: number | null
          form_key?: string
          id?: string
          is_active?: boolean | null
          is_published?: boolean | null
          metadata?: Json | null
          owner_id?: string | null
          public_alias?: string | null
          published_at?: string | null
          search_vector?: unknown
          slug?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          total_responses?: number | null
          updated_at?: string | null
          web_url?: string | null
          whatsapp_trigger?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forms_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      orphaned_files: {
        Row: {
          cleanup_attempted_at: string | null
          cleanup_status: string | null
          detected_at: string | null
          file_size_bytes: number | null
          id: string
          r2_path: string
        }
        Insert: {
          cleanup_attempted_at?: string | null
          cleanup_status?: string | null
          detected_at?: string | null
          file_size_bytes?: number | null
          id?: string
          r2_path: string
        }
        Update: {
          cleanup_attempted_at?: string | null
          cleanup_status?: string | null
          detected_at?: string | null
          file_size_bytes?: number | null
          id?: string
          r2_path?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string | null
          currency: string | null
          gateway: string | null
          gateway_ref: string | null
          id: string
          metadata: Json | null
          status: string | null
          transaction_ref: string | null
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          gateway?: string | null
          gateway_ref?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          transaction_ref?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          gateway?: string | null
          gateway_ref?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          transaction_ref?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_metrics: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          metric_date: string
          metric_type: string
          value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_date: string
          metric_type: string
          value: number
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_date?: string
          metric_type?: string
          value?: number
        }
        Relationships: []
      }
      promo_code_usage: {
        Row: {
          id: string
          payment_id: string | null
          promo_code_id: string | null
          used_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          payment_id?: string | null
          promo_code_id?: string | null
          used_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          payment_id?: string | null
          promo_code_id?: string | null
          used_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promo_code_usage_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promo_code_usage_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promo_code_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string | null
          created_by: string | null
          description: string | null
          discount_type: string | null
          discount_value: number
          id: string
          is_active: boolean | null
          max_uses: number | null
          metadata: Json | null
          plan_restriction: string[] | null
          updated_at: string | null
          uses_count: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          metadata?: Json | null
          plan_restriction?: string[] | null
          updated_at?: string | null
          uses_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          metadata?: Json | null
          plan_restriction?: string[] | null
          updated_at?: string | null
          uses_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promo_codes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      refunds: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          gateway_ref: string | null
          id: string
          notes: string | null
          payment_id: string | null
          processed_at: string | null
          processed_by: string | null
          reason: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          gateway_ref?: string | null
          id?: string
          notes?: string | null
          payment_id?: string | null
          processed_at?: string | null
          processed_by?: string | null
          reason: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          gateway_ref?: string | null
          id?: string
          notes?: string | null
          payment_id?: string | null
          processed_at?: string | null
          processed_by?: string | null
          reason?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refunds_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      response_edit_history: {
        Row: {
          created_at: string | null
          edit_source: string | null
          edited_by_phone: string | null
          field_id: string | null
          id: string
          ip_address: unknown
          new_value: Json | null
          old_value: Json | null
          response_id: string | null
        }
        Insert: {
          created_at?: string | null
          edit_source?: string | null
          edited_by_phone?: string | null
          field_id?: string | null
          id?: string
          ip_address?: unknown
          new_value?: Json | null
          old_value?: Json | null
          response_id?: string | null
        }
        Update: {
          created_at?: string | null
          edit_source?: string | null
          edited_by_phone?: string | null
          field_id?: string | null
          id?: string
          ip_address?: unknown
          new_value?: Json | null
          old_value?: Json | null
          response_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "response_edit_history_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "form_fields"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsored_forms: {
        Row: {
          created_at: string | null
          custom_branding: Json | null
          ended_at: string | null
          form_id: string | null
          id: string
          show_sponsor_logo: boolean | null
          sponsor_id: string | null
          started_at: string | null
          subsidy_percentage: number | null
        }
        Insert: {
          created_at?: string | null
          custom_branding?: Json | null
          ended_at?: string | null
          form_id?: string | null
          id?: string
          show_sponsor_logo?: boolean | null
          sponsor_id?: string | null
          started_at?: string | null
          subsidy_percentage?: number | null
        }
        Update: {
          created_at?: string | null
          custom_branding?: Json | null
          ended_at?: string | null
          form_id?: string | null
          id?: string
          show_sponsor_logo?: boolean | null
          sponsor_id?: string | null
          started_at?: string | null
          subsidy_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sponsored_forms_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsored_forms_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsors: {
        Row: {
          branding_config: Json | null
          company_name: string
          contract_end: string | null
          contract_start: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          sponsored_forms_limit: number | null
          tier: string | null
          updated_at: string | null
          user_id: string | null
          website: string | null
        }
        Insert: {
          branding_config?: Json | null
          company_name: string
          contract_end?: string | null
          contract_start?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          sponsored_forms_limit?: number | null
          tier?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Update: {
          branding_config?: Json | null
          company_name?: string
          contract_end?: string | null
          contract_start?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          sponsored_forms_limit?: number | null
          tier?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sponsors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          billing_period: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          features: Json
          id: string
          is_active: boolean | null
          is_public: boolean | null
          limits: Json
          name: string
          plan_key: string
          price: number
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          billing_period?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          limits?: Json
          name: string
          plan_key: string
          price: number
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          billing_period?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          limits?: Json
          name?: string
          plan_key?: string
          price?: number
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      system_announcements: {
        Row: {
          announcement_type: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          message: string
          priority: number | null
          show_from: string | null
          show_until: string | null
          target_audience: string | null
          target_plans: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          announcement_type?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          message: string
          priority?: number | null
          show_from?: string | null
          show_until?: string | null
          target_audience?: string | null
          target_plans?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          announcement_type?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          message?: string
          priority?: number | null
          show_from?: string | null
          show_until?: string | null
          target_audience?: string | null
          target_plans?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_at: string | null
          description: string | null
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_storage_quotas: {
        Row: {
          file_count: number | null
          last_calculated_at: string | null
          storage_limit_bytes: number
          storage_used_bytes: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          file_count?: number | null
          last_calculated_at?: string | null
          storage_limit_bytes: number
          storage_used_bytes?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          file_count?: number | null
          last_calculated_at?: string | null
          storage_limit_bytes?: number
          storage_used_bytes?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_storage_quotas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          auto_renew: boolean | null
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          metadata: Json | null
          payment_id: string | null
          plan_id: string | null
          started_at: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auto_renew?: boolean | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          payment_id?: string | null
          plan_id?: string | null
          started_at: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auto_renew?: boolean | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          payment_id?: string | null
          plan_id?: string | null
          started_at?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_suspensions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          lifted_at: string | null
          lifted_by: string | null
          notes: string | null
          reason: string
          suspended_by: string | null
          suspension_type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          lifted_at?: string | null
          lifted_by?: string | null
          notes?: string | null
          reason: string
          suspended_by?: string | null
          suspension_type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          lifted_at?: string | null
          lifted_by?: string | null
          notes?: string | null
          reason?: string
          suspended_by?: string | null
          suspension_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_suspensions_lifted_by_fkey"
            columns: ["lifted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_suspensions_suspended_by_fkey"
            columns: ["suspended_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_suspensions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          billing_plan: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_suspended: boolean | null
          last_login: string | null
          metadata: Json | null
          name: string | null
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          billing_plan?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_suspended?: boolean | null
          last_login?: string | null
          metadata?: Json | null
          name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_plan?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_suspended?: boolean | null
          last_login?: string | null
          metadata?: Json | null
          name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      webhook_endpoints: {
        Row: {
          created_at: string | null
          events: string[]
          failure_count: number | null
          form_id: string | null
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          metadata: Json | null
          secret: string | null
          updated_at: string | null
          url: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          events: string[]
          failure_count?: number | null
          form_id?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          metadata?: Json | null
          secret?: string | null
          updated_at?: string | null
          url: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          events?: string[]
          failure_count?: number | null
          form_id?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          metadata?: Json | null
          secret?: string | null
          updated_at?: string | null
          url?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_endpoints_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_endpoints_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_messages: {
        Row: {
          content: Json | null
          created_at: string | null
          direction: string | null
          error_code: string | null
          id: string
          media_id: string | null
          message_id: string | null
          phone: string
          session_id: string | null
          status: string | null
          timestamp: string | null
          type: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          direction?: string | null
          error_code?: string | null
          id?: string
          media_id?: string | null
          message_id?: string | null
          phone: string
          session_id?: string | null
          status?: string | null
          timestamp?: string | null
          type?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          direction?: string | null
          error_code?: string | null
          id?: string
          media_id?: string | null
          message_id?: string | null
          phone?: string
          session_id?: string | null
          status?: string | null
          timestamp?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_sessions: {
        Row: {
          created_at: string | null
          current_step: string | null
          expires_at: string | null
          form_id: string | null
          id: string
          is_active: boolean | null
          last_message_at: string | null
          last_message_id: string | null
          phone: string
          response_id: string | null
          state: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_step?: string | null
          expires_at?: string | null
          form_id?: string | null
          id?: string
          is_active?: boolean | null
          last_message_at?: string | null
          last_message_id?: string | null
          phone: string
          response_id?: string | null
          state?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_step?: string | null
          expires_at?: string | null
          form_id?: string | null
          id?: string
          is_active?: boolean | null
          last_message_at?: string | null
          last_message_id?: string | null
          phone?: string
          response_id?: string | null
          state?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_sessions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_templates: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          id: string
          language: string | null
          name: string
          status: string | null
          template_body: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          language?: string | null
          name: string
          status?: string | null
          template_body: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          language?: string | null
          name?: string
          status?: string | null
          template_body?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_webhook_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          event_type: string | null
          id: string
          payload: Json
          phone: string | null
          processing_time_ms: number | null
          response_body: string | null
          response_status: number | null
          webhook_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event_type?: string | null
          id?: string
          payload: Json
          phone?: string | null
          processing_time_ms?: number | null
          response_body?: string | null
          response_status?: number | null
          webhook_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event_type?: string | null
          id?: string
          payload?: Json
          phone?: string | null
          processing_time_ms?: number | null
          response_body?: string | null
          response_status?: number | null
          webhook_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      admin_daily_active_users: {
        Row: {
          active_users: number | null
          date: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_bulk_delete_forms: {
        Args: { p_admin_id: string; p_form_ids: string[]; p_reason: string }
        Returns: number
      }
      admin_bulk_suspend_users: {
        Args: {
          p_admin_id: string
          p_reason: string
          p_suspension_type: string
          p_user_ids: string[]
        }
        Returns: number
      }
      admin_lift_suspension: {
        Args: { p_admin_id: string; p_suspension_id: string }
        Returns: undefined
      }
      admin_process_refund: {
        Args: {
          p_admin_id: string
          p_notes?: string
          p_refund_id: string
          p_status: string
        }
        Returns: undefined
      }
      admin_suspend_user: {
        Args: {
          p_admin_id: string
          p_expires_at?: string
          p_reason: string
          p_suspension_type: string
          p_user_id: string
        }
        Returns: undefined
      }
      calculate_platform_metrics: {
        Args: { p_date?: string }
        Returns: undefined
      }
      can_user_create_form: { Args: { p_user_id: string }; Returns: boolean }
      cleanup_orphaned_files: {
        Args: { p_batch_size?: number }
        Returns: number
      }
      expire_old_sessions: { Args: never; Returns: undefined }
      generate_edit_token: { Args: never; Returns: string }
      generate_form_key: { Args: never; Returns: string }
      get_user_plan_limits: { Args: { p_user_id: string }; Returns: Json }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      validate_payment_webhook: {
        Args: { p_payload: Json; p_secret: string; p_signature: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
