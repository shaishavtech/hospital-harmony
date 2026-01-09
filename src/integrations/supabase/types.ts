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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      appointment_status_history: {
        Row: {
          appointment_id: number
          change_reason: string | null
          changed_at_ist: string
          changed_by_user_id: number | null
          history_id: number
          new_status: Database["public"]["Enums"]["appointment_status"]
          old_status: Database["public"]["Enums"]["appointment_status"] | null
        }
        Insert: {
          appointment_id: number
          change_reason?: string | null
          changed_at_ist?: string
          changed_by_user_id?: number | null
          history_id?: never
          new_status: Database["public"]["Enums"]["appointment_status"]
          old_status?: Database["public"]["Enums"]["appointment_status"] | null
        }
        Update: {
          appointment_id?: number
          change_reason?: string | null
          changed_at_ist?: string
          changed_by_user_id?: number | null
          history_id?: never
          new_status?: Database["public"]["Enums"]["appointment_status"]
          old_status?: Database["public"]["Enums"]["appointment_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_status_history_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "appointment_status_history_changed_by_user_id_fkey"
            columns: ["changed_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_datetime_ist: string
          appointment_id: number
          cancellation_reason: string | null
          created_at_ist: string
          created_by_user_id: number | null
          doctor_id: number
          followup_of_appointment_id: number | null
          notes: string | null
          parent_appointment_id: number | null
          patient_id: number
          reschedule_reason: string | null
          slot_id: number | null
          source: Database["public"]["Enums"]["appointment_source"]
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at_ist: string | null
        }
        Insert: {
          appointment_datetime_ist: string
          appointment_id?: never
          cancellation_reason?: string | null
          created_at_ist?: string
          created_by_user_id?: number | null
          doctor_id: number
          followup_of_appointment_id?: number | null
          notes?: string | null
          parent_appointment_id?: number | null
          patient_id: number
          reschedule_reason?: string | null
          slot_id?: number | null
          source?: Database["public"]["Enums"]["appointment_source"]
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at_ist?: string | null
        }
        Update: {
          appointment_datetime_ist?: string
          appointment_id?: never
          cancellation_reason?: string | null
          created_at_ist?: string
          created_by_user_id?: number | null
          doctor_id?: number
          followup_of_appointment_id?: number | null
          notes?: string | null
          parent_appointment_id?: number | null
          patient_id?: number
          reschedule_reason?: string | null
          slot_id?: number | null
          source?: Database["public"]["Enums"]["appointment_source"]
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at_ist?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["doctor_id"]
          },
          {
            foreignKeyName: "appointments_followup_of_appointment_id_fkey"
            columns: ["followup_of_appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "appointments_parent_appointment_id_fkey"
            columns: ["parent_appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "appointments_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "doctor_slots"
            referencedColumns: ["slot_id"]
          },
        ]
      }
      departments: {
        Row: {
          department_id: number
          name: string
        }
        Insert: {
          department_id?: never
          name: string
        }
        Update: {
          department_id?: never
          name?: string
        }
        Relationships: []
      }
      doctor_slot_exceptions: {
        Row: {
          created_at_ist: string
          date_ist: string
          doctor_id: number
          exception_id: number
          is_available: number
          reason: string | null
        }
        Insert: {
          created_at_ist?: string
          date_ist: string
          doctor_id: number
          exception_id?: never
          is_available?: number
          reason?: string | null
        }
        Update: {
          created_at_ist?: string
          date_ist?: string
          doctor_id?: number
          exception_id?: never
          is_available?: number
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctor_slot_exceptions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["doctor_id"]
          },
        ]
      }
      doctor_slots: {
        Row: {
          created_at_ist: string
          doctor_id: number
          end_time: string
          is_active: number
          max_patients: number
          slot_id: number
          start_time: string
          updated_at_ist: string | null
          weekday: number
        }
        Insert: {
          created_at_ist?: string
          doctor_id: number
          end_time: string
          is_active?: number
          max_patients?: number
          slot_id?: never
          start_time: string
          updated_at_ist?: string | null
          weekday: number
        }
        Update: {
          created_at_ist?: string
          doctor_id?: number
          end_time?: string
          is_active?: number
          max_patients?: number
          slot_id?: never
          start_time?: string
          updated_at_ist?: string | null
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "doctor_slots_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["doctor_id"]
          },
        ]
      }
      doctors: {
        Row: {
          consultation_fee: number
          created_at_ist: string
          department_id: number | null
          doctor_id: number
          full_name: string
          is_active: number
          photo_url: string | null
          specialty: string
        }
        Insert: {
          consultation_fee?: number
          created_at_ist?: string
          department_id?: number | null
          doctor_id?: never
          full_name: string
          is_active?: number
          photo_url?: string | null
          specialty: string
        }
        Update: {
          consultation_fee?: number
          created_at_ist?: string
          department_id?: number | null
          doctor_id?: never
          full_name?: string
          is_active?: number
          photo_url?: string | null
          specialty?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctors_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["department_id"]
          },
        ]
      }
      languages: {
        Row: {
          is_active: number
          language_code: string
          name: string
        }
        Insert: {
          is_active?: number
          language_code: string
          name: string
        }
        Update: {
          is_active?: number
          language_code?: string
          name?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          created_at_ist: string
          date_of_birth: string | null
          full_name: string
          gender: Database["public"]["Enums"]["gender_type"]
          mobile_number: string
          patient_id: number
          whatsapp_opt_in: number
        }
        Insert: {
          created_at_ist?: string
          date_of_birth?: string | null
          full_name: string
          gender?: Database["public"]["Enums"]["gender_type"]
          mobile_number: string
          patient_id?: never
          whatsapp_opt_in?: number
        }
        Update: {
          created_at_ist?: string
          date_of_birth?: string | null
          full_name?: string
          gender?: Database["public"]["Enums"]["gender_type"]
          mobile_number?: string
          patient_id?: never
          whatsapp_opt_in?: number
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          appointment_id: number
          created_at_ist: string
          currency: string
          gateway_name: string
          gateway_payment_ref: string | null
          paid_at_ist: string | null
          payment_id: number
          payment_method: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
        }
        Insert: {
          amount: number
          appointment_id: number
          created_at_ist?: string
          currency?: string
          gateway_name: string
          gateway_payment_ref?: string | null
          paid_at_ist?: string | null
          payment_id?: never
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
        }
        Update: {
          amount?: number
          appointment_id?: number
          created_at_ist?: string
          currency?: string
          gateway_name?: string
          gateway_payment_ref?: string | null
          paid_at_ist?: string | null
          payment_id?: never
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["appointment_id"]
          },
        ]
      }
      refunds: {
        Row: {
          amount: number
          gateway_refund_ref: string | null
          payment_id: number
          processed_at_ist: string | null
          reason: string | null
          refund_id: number
          refund_status: Database["public"]["Enums"]["refund_status"]
          requested_at_ist: string
        }
        Insert: {
          amount: number
          gateway_refund_ref?: string | null
          payment_id: number
          processed_at_ist?: string | null
          reason?: string | null
          refund_id?: never
          refund_status?: Database["public"]["Enums"]["refund_status"]
          requested_at_ist?: string
        }
        Update: {
          amount?: number
          gateway_refund_ref?: string | null
          payment_id?: number
          processed_at_ist?: string | null
          reason?: string | null
          refund_id?: never
          refund_status?: Database["public"]["Enums"]["refund_status"]
          requested_at_ist?: string
        }
        Relationships: [
          {
            foreignKeyName: "refunds_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["payment_id"]
          },
        ]
      }
      reminders: {
        Row: {
          appointment_id: number
          channel: Database["public"]["Enums"]["channel_type"]
          created_at_ist: string
          failure_reason: string | null
          language_code: string
          reminder_id: number
          reminder_type: Database["public"]["Enums"]["reminder_type"]
          scheduled_at_ist: string
          sent_at_ist: string | null
          status: Database["public"]["Enums"]["reminder_status"]
          template_key: string
        }
        Insert: {
          appointment_id: number
          channel?: Database["public"]["Enums"]["channel_type"]
          created_at_ist?: string
          failure_reason?: string | null
          language_code: string
          reminder_id?: never
          reminder_type: Database["public"]["Enums"]["reminder_type"]
          scheduled_at_ist: string
          sent_at_ist?: string | null
          status?: Database["public"]["Enums"]["reminder_status"]
          template_key: string
        }
        Update: {
          appointment_id?: number
          channel?: Database["public"]["Enums"]["channel_type"]
          created_at_ist?: string
          failure_reason?: string | null
          language_code?: string
          reminder_id?: never
          reminder_type?: Database["public"]["Enums"]["reminder_type"]
          scheduled_at_ist?: string
          sent_at_ist?: string | null
          status?: Database["public"]["Enums"]["reminder_status"]
          template_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "reminders_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["language_code"]
          },
        ]
      }
      users: {
        Row: {
          created_at_ist: string
          is_active: number
          last_login_at_ist: string | null
          password_hash: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: number
          username: string
        }
        Insert: {
          created_at_ist?: string
          is_active?: number
          last_login_at_ist?: string | null
          password_hash: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: never
          username: string
        }
        Update: {
          created_at_ist?: string
          is_active?: number
          last_login_at_ist?: string | null
          password_hash?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: never
          username?: string
        }
        Relationships: []
      }
      whatsapp_templates: {
        Row: {
          body: string
          created_at_ist: string
          is_active: number
          language_code: string
          template_id: number
          template_key: string
          template_name: string
        }
        Insert: {
          body: string
          created_at_ist?: string
          is_active?: number
          language_code: string
          template_id?: never
          template_key: string
          template_name: string
        }
        Update: {
          body?: string
          created_at_ist?: string
          is_active?: number
          language_code?: string
          template_id?: never
          template_key?: string
          template_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_templates_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["language_code"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      appointment_source: "WHATSAPP" | "FRONTDESK" | "PHONE_CALL" | "OTHER"
      appointment_status:
        | "BOOKED"
        | "COMPLETED"
        | "CANCELLED"
        | "NO_SHOW"
        | "RESCHEDULED"
      channel_type: "WHATSAPP" | "SMS" | "EMAIL"
      gender_type: "MALE" | "FEMALE" | "OTHER" | "UNKNOWN"
      payment_status:
        | "PENDING"
        | "SUCCESS"
        | "FAILED"
        | "REFUNDED"
        | "PARTIAL_REFUND"
      refund_status: "REQUESTED" | "PROCESSING" | "SUCCESS" | "FAILED"
      reminder_status: "PENDING" | "SENT" | "FAILED" | "CANCELLED"
      reminder_type:
        | "BOOKING_CONFIRMATION"
        | "UPCOMING_APPOINTMENT"
        | "FOLLOWUP_REMINDER"
        | "CANCELLATION_NOTICE"
      user_role: "ADMIN" | "RECEPTIONIST" | "DOCTOR" | "MANAGER"
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
      appointment_source: ["WHATSAPP", "FRONTDESK", "PHONE_CALL", "OTHER"],
      appointment_status: [
        "BOOKED",
        "COMPLETED",
        "CANCELLED",
        "NO_SHOW",
        "RESCHEDULED",
      ],
      channel_type: ["WHATSAPP", "SMS", "EMAIL"],
      gender_type: ["MALE", "FEMALE", "OTHER", "UNKNOWN"],
      payment_status: [
        "PENDING",
        "SUCCESS",
        "FAILED",
        "REFUNDED",
        "PARTIAL_REFUND",
      ],
      refund_status: ["REQUESTED", "PROCESSING", "SUCCESS", "FAILED"],
      reminder_status: ["PENDING", "SENT", "FAILED", "CANCELLED"],
      reminder_type: [
        "BOOKING_CONFIRMATION",
        "UPCOMING_APPOINTMENT",
        "FOLLOWUP_REMINDER",
        "CANCELLATION_NOTICE",
      ],
      user_role: ["ADMIN", "RECEPTIONIST", "DOCTOR", "MANAGER"],
    },
  },
} as const
