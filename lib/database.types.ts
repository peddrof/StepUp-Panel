export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      mentors: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          email: string;
          expertise_level: string;
          pin_code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone?: string | null;
          email: string;
          expertise_level?: string;
          pin_code?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string | null;
          email?: string;
          expertise_level?: string;
          pin_code?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      students: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          email: string | null;
          english_level: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          english_level?: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string | null;
          email?: string | null;
          english_level?: string;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      groups: {
        Row: {
          id: string;
          name: string;
          level: string;
          schedule_time: string;
          mentor_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          level: string;
          schedule_time: string;
          mentor_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          level?: string;
          schedule_time?: string;
          mentor_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "groups_mentor_id_fkey";
            columns: ["mentor_id"];
            isOneToOne: false;
            referencedRelation: "mentors";
            referencedColumns: ["id"];
          }
        ];
      };
      group_students: {
        Row: {
          id: string;
          group_id: string;
          student_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          student_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          student_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "group_students_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "group_students_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          }
        ];
      };
      class_logs: {
        Row: {
          id: string;
          group_id: string;
          date: string;
          topic: string;
          attendance_data: Json;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          date: string;
          topic: string;
          attendance_data?: Json;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          date?: string;
          topic?: string;
          attendance_data?: Json;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "class_logs_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Mentor = Database["public"]["Tables"]["mentors"]["Row"];
export type Student = Database["public"]["Tables"]["students"]["Row"];
export type Group = Database["public"]["Tables"]["groups"]["Row"];
export type GroupStudent = Database["public"]["Tables"]["group_students"]["Row"];
export type ClassLog = Database["public"]["Tables"]["class_logs"]["Row"];

export type GroupWithMentor = Group & {
  mentor: Mentor | null;
};

export type GroupWithDetails = Group & {
  mentor: Mentor | null;
  students: Student[];
};

export type ClassLogWithDetails = ClassLog & {
  group: GroupWithMentor;
};
