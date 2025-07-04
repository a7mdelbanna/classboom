export interface Student {
  id: string;
  school_id: string;
  student_code: string;
  first_name: string;
  last_name: string;
  full_name?: string; // Generated column
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  country: string | null;
  city: string | null;
  skill_level: string | null;
  interested_courses: string[];
  social_media: SocialMediaContacts | null;
  communication_preferences: CommunicationPreferences | null;
  emergency_contact: EmergencyContact | null;
  medical_info: MedicalInfo | null;
  parent_info: ParentInfo | null;
  enrolled_at: string;
  status: 'active' | 'inactive' | 'graduated' | 'dropped';
  notes: string | null;
  avatar_url: string | null;
  avatar_uploaded_at: string | null;
  // Authentication fields
  user_id: string | null;
  can_login: boolean;
  invite_token: string | null;
  invite_sent_at: string | null;
  account_created_at: string | null;
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

// Social Media Contacts
export interface SocialMediaContacts {
  whatsapp?: string;
  instagram?: string;
  telegram?: string;
  vk?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  wechat?: string;
  line?: string;
  viber?: string;
}

// Communication Preferences
export interface CommunicationPreferences {
  preferred_method: 'email' | 'phone' | 'whatsapp' | 'telegram' | 'instagram' | 'sms';
  allow_promotional: boolean;
  language_preference: string;
  time_preference: 'morning' | 'afternoon' | 'evening' | 'anytime';
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
  student_code?: string; // Auto-generated if not provided
  first_name: string;
  last_name: string;
  full_name?: string; // Auto-generated from first_name + last_name if not provided
  email: string;
  phone?: string;
  date_of_birth?: string;
  country?: string;
  city?: string;
  skill_level?: string;
  interested_courses?: string[];
  social_media?: SocialMediaContacts;
  communication_preferences?: CommunicationPreferences;
  emergency_contact?: EmergencyContact;
  medical_info?: MedicalInfo;
  parent_info?: ParentInfo;
  notes?: string;
}