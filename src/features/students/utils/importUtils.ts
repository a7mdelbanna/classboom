import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { ImportStudentData, ImportError } from '../types/import.types';

export const parseCSVFile = (file: File): Promise<{ data: any[], headers: string[] }> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        resolve({ data: results.data, headers });
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      }
    });
  });
};

export const parseExcelFile = (file: File): Promise<{ data: any[], headers: string[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length === 0) {
          reject(new Error('Excel file is empty'));
          return;
        }
        
        // Extract headers from first row
        const headers = (jsonData[0] as any[]).map(h => String(h || '').trim());
        
        // Convert remaining rows to objects
        const dataRows = jsonData.slice(1).map((row: any) => {
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] || '';
          });
          return obj;
        }).filter(row => Object.values(row).some(val => val !== ''));
        
        resolve({ data: dataRows, headers });
      } catch (error) {
        reject(new Error(`Excel parsing failed: ${error}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

export const validateImportData = (
  data: any[],
  mappings: { csvColumn: string; systemField: string }[]
): { validData: ImportStudentData[], errors: ImportError[] } => {
  const validData: ImportStudentData[] = [];
  const errors: ImportError[] = [];
  
  data.forEach((row, index) => {
    const student: any = {};
    let hasRequiredFields = true;
    
    // Map CSV columns to system fields
    mappings.forEach(mapping => {
      if (mapping.systemField !== 'ignore') {
        const value = row[mapping.csvColumn];
        if (value !== undefined && value !== null && value !== '') {
          student[mapping.systemField] = String(value).trim();
        }
      }
    });
    
    // Validate required fields
    if (!student.first_name || student.first_name.trim() === '') {
      errors.push({
        row: index + 2, // +2 because Excel rows start at 1 and we skip header
        field: 'first_name',
        message: 'First name is required'
      });
      hasRequiredFields = false;
    }
    
    if (!student.last_name || student.last_name.trim() === '') {
      errors.push({
        row: index + 2,
        field: 'last_name',
        message: 'Last name is required'
      });
      hasRequiredFields = false;
    }
    
    // Validate email format if provided
    if (student.email && !isValidEmail(student.email)) {
      errors.push({
        row: index + 2,
        field: 'email',
        message: 'Invalid email format'
      });
    }
    
    // Validate date format if provided
    if (student.date_of_birth && !isValidDate(student.date_of_birth)) {
      errors.push({
        row: index + 2,
        field: 'date_of_birth',
        message: 'Invalid date format (use YYYY-MM-DD)'
      });
    }
    
    // Process array fields (allergies, medications)
    if (student.allergies && typeof student.allergies === 'string') {
      student.allergies = student.allergies.split(',').map((a: string) => a.trim()).filter(Boolean);
    }
    
    if (student.medications && typeof student.medications === 'string') {
      student.medications = student.medications.split(',').map((m: string) => m.trim()).filter(Boolean);
    }
    
    if (hasRequiredFields) {
      validData.push(student as ImportStudentData);
    }
  });
  
  return { validData, errors };
};

const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const isValidDate = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
};

export const getSystemFields = (): Array<{ value: string; label: string; required: boolean }> => {
  return [
    { value: 'first_name', label: 'First Name', required: true },
    { value: 'last_name', label: 'Last Name', required: true },
    { value: 'email', label: 'Email', required: false },
    { value: 'phone', label: 'Phone Number', required: false },
    { value: 'date_of_birth', label: 'Date of Birth', required: false },
    { value: 'country', label: 'Country', required: false },
    { value: 'city', label: 'City', required: false },
    { value: 'skill_level', label: 'Skill Level', required: false },
    { value: 'grade', label: 'Grade', required: false },
    { value: 'notes', label: 'Notes', required: false },
    { value: 'parent_name', label: 'Parent Name', required: false },
    { value: 'parent_email', label: 'Parent Email', required: false },
    { value: 'parent_phone', label: 'Parent Phone', required: false },
    { value: 'emergency_contact_name', label: 'Emergency Contact Name', required: false },
    { value: 'emergency_contact_phone', label: 'Emergency Contact Phone', required: false },
    { value: 'emergency_contact_relationship', label: 'Emergency Contact Relationship', required: false },
    { value: 'blood_type', label: 'Blood Type', required: false },
    { value: 'allergies', label: 'Allergies (comma-separated)', required: false },
    { value: 'medications', label: 'Medications (comma-separated)', required: false },
    { value: 'doctor_name', label: 'Doctor Name', required: false },
    { value: 'ignore', label: '-- Ignore this column --', required: false }
  ];
};

export const generateSampleCSV = (): string => {
  const headers = [
    'First Name',
    'Last Name',
    'Email',
    'Phone',
    'Date of Birth',
    'Country',
    'City',
    'Skill Level',
    'Grade',
    'Parent Name',
    'Parent Email',
    'Parent Phone',
    'Emergency Contact Name',
    'Emergency Contact Phone',
    'Emergency Contact Relationship'
  ];
  
  const sampleData = [
    [
      'John',
      'Smith',
      'john.smith@email.com',
      '+1234567890',
      '2010-05-15',
      'US',
      'New York',
      'Beginner',
      '7th Grade',
      'Jane Smith',
      'jane.smith@email.com',
      '+1234567891',
      'Jane Smith',
      '+1234567891',
      'Mother'
    ],
    [
      'Emma',
      'Johnson',
      'emma.j@email.com',
      '+1234567892',
      '2011-08-22',
      'US',
      'Los Angeles',
      'Intermediate',
      '6th Grade',
      'Robert Johnson',
      'robert.j@email.com',
      '+1234567893',
      'Robert Johnson',
      '+1234567893',
      'Father'
    ]
  ];
  
  const csv = [headers.join(',')];
  sampleData.forEach(row => {
    csv.push(row.join(','));
  });
  
  return csv.join('\n');
};