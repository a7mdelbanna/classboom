export interface ImportStudentData {
  // Required fields
  first_name: string;
  last_name: string;
  
  // Optional student info
  email?: string;
  phone?: string;
  date_of_birth?: string;
  country?: string;
  city?: string;
  skill_level?: string;
  grade?: string;
  notes?: string;
  
  // Parent info (optional)
  parent_name?: string;
  parent_email?: string;
  parent_phone?: string;
  
  // Emergency contact (optional)
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  
  // Medical info (optional)
  blood_type?: string;
  allergies?: string;
  medications?: string;
  doctor_name?: string;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  errors: ImportError[];
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
  data?: any;
}

export interface ColumnMapping {
  csvColumn: string;
  systemField: keyof ImportStudentData | 'ignore';
}

export type ImportStep = 'upload' | 'mapping' | 'preview' | 'importing' | 'complete';

export interface ImportState {
  step: ImportStep;
  fileName: string;
  fileData: any[];
  headers: string[];
  mappings: ColumnMapping[];
  validatedData: ImportStudentData[];
  errors: ImportError[];
  result?: ImportResult;
}