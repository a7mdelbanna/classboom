export interface Student {
  id: string;
  school_id: string;
  student_code: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  grade_level: string | null;
  emergency_contact: EmergencyContact | null;
  medical_info: MedicalInfo | null;
  parent_info: ParentInfo | null;
  enrolled_at: string;
  status: 'active' | 'inactive' | 'graduated' | 'dropped';
  notes: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  alternate_phone?: string;
}

export interface MedicalInfo {
  blood_type?: string;
  allergies?: string[];
  medications?: string[];
  conditions?: string[];
  doctor_name?: string;
  doctor_phone?: string;
}

export interface ParentInfo {
  father_name?: string;
  father_phone?: string;
  father_email?: string;
  father_occupation?: string;
  mother_name?: string;
  mother_phone?: string;
  mother_email?: string;
  mother_occupation?: string;
}

export interface CreateStudentInput {
  full_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  grade_level?: string;
  student_code?: string;
  emergency_contact?: EmergencyContact;
  medical_info?: MedicalInfo;
  parent_info?: ParentInfo;
  notes?: string;
}