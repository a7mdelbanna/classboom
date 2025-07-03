export interface ParentAccount {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  occupation: string | null;
  created_at: string;
  updated_at: string;
}

export interface ParentStudentRelationship {
  id: string;
  parent_id: string;
  student_id: string;
  relationship_type: 'parent' | 'guardian' | 'other';
  is_primary: boolean;
  can_access_grades: boolean;
  can_access_attendance: boolean;
  can_access_payments: boolean;
  can_communicate: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateParentAccountInput {
  first_name: string;
  last_name: string;
  phone?: string;
  occupation?: string;
}

export interface ParentWithChildren extends ParentAccount {
  children: Array<{
    relationship: ParentStudentRelationship;
    student: import('../../students/types/student.types').Student;
  }>;
}

export interface LinkStudentsInput {
  student_codes: string[];
}