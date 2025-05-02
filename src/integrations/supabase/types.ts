export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      centers: {
        Row: {
          battery_level: number | null
          created_at: string | null
          id: string
          internet_status: string | null
          latitude: number | null
          location: string
          longitude: number | null
          name: string
          updated_at: string | null
        }
        Insert: {
          battery_level?: number | null
          created_at?: string | null
          id?: string
          internet_status?: string | null
          latitude?: number | null
          location: string
          longitude?: number | null
          name: string
          updated_at?: string | null
        }
        Update: {
          battery_level?: number | null
          created_at?: string | null
          id?: string
          internet_status?: string | null
          latitude?: number | null
          location?: string
          longitude?: number | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      challenges: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string
          end_date: string
          id: string
          start_date: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description: string
          end_date: string
          id?: string
          start_date: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string
          end_date?: string
          id?: string
          start_date?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ideas: {
        Row: {
          challenge_id: string | null
          created_at: string | null
          description: string
          id: string
          media_url: string | null
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          challenge_id?: string | null
          created_at?: string | null
          description: string
          id?: string
          media_url?: string | null
          status?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          media_url?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          created_at: string | null
          description: string | null
          downloads: number | null
          duration: number | null
          file_url: string | null
          grade: string
          id: string
          subject: string
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          downloads?: number | null
          duration?: number | null
          file_url?: string | null
          grade: string
          id?: string
          subject: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          downloads?: number | null
          duration?: number | null
          file_url?: string | null
          grade?: string
          id?: string
          subject?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          center_id: string | null
          created_at: string | null
          first_name: string | null
          grade: string | null
          id: string
          last_name: string | null
          role: string
        }
        Insert: {
          center_id?: string | null
          created_at?: string | null
          first_name?: string | null
          grade?: string | null
          id: string
          last_name?: string | null
          role: string
        }
        Update: {
          center_id?: string | null
          created_at?: string | null
          first_name?: string | null
          grade?: string | null
          id?: string
          last_name?: string | null
          role?: string
        }
        Relationships: []
      }
      student_centers: {
        Row: {
          center_id: string
          id: string
          student_id: string
        }
        Insert: {
          center_id: string
          id?: string
          student_id: string
        }
        Update: {
          center_id?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_centers_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
        ]
      }
      test_results: {
        Row: {
          answers: Json | null
          completed_at: string | null
          id: string
          score: number
          synced_at: string | null
          test_id: string
          user_id: string
        }
        Insert: {
          answers?: Json | null
          completed_at?: string | null
          id?: string
          score: number
          synced_at?: string | null
          test_id: string
          user_id: string
        }
        Update: {
          answers?: Json | null
          completed_at?: string | null
          id?: string
          score?: number
          synced_at?: string | null
          test_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_results_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          answers: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          duration: number
          grade: string
          id: string
          questions: Json
          subject: string
          title: string
          updated_at: string | null
        }
        Insert: {
          answers: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration: number
          grade: string
          id?: string
          questions: Json
          subject: string
          title: string
          updated_at?: string | null
        }
        Update: {
          answers?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration?: number
          grade?: string
          id?: string
          questions?: Json
          subject?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
