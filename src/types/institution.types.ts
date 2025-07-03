// Institution Types and Configuration

export type InstitutionType = 
  | 'public_school'
  | 'private_school'
  | 'charter_school'
  | 'online_school'
  | 'hybrid_school'
  | 'university'
  | 'community_college'
  | 'trade_school'
  | 'language_center'
  | 'music_school'
  | 'art_school'
  | 'dance_studio'
  | 'cooking_school'
  | 'sports_academy'
  | 'martial_arts_dojo'
  | 'fitness_center'
  | 'yoga_studio'
  | 'private_tutor'
  | 'personal_coach'
  | 'music_teacher'
  | 'personal_trainer'
  | 'tutoring_center'
  | 'training_center'
  | 'daycare_preschool';

export type AgeGroup = 'kids' | 'adults' | 'both';

export type LocationModel = 'centralized' | 'federated' | 'independent';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CNY' | 'INR';

export type MeetingPlatform = 'zoom' | 'google_meet' | 'teams' | 'custom';

export type PricingModel = 'per_session' | 'monthly' | 'quarterly' | 'semester' | 'annual' | 'package';

export interface Terminology {
  student: string;
  students: string;
  teacher: string;
  teachers: string;
  class: string;
  classes: string;
  enrollment: string;
  grade: string;
  parent: string;
  schedule: string;
}

export interface InstitutionCategory {
  id: string;
  name: string;
  icon: string;
  types: Array<{
    value: InstitutionType;
    label: string;
    icon: string;
  }>;
}

export interface InstitutionConfig {
  type: InstitutionType;
  category: string;
  terminology: Terminology;
  features: {
    grades: boolean;
    parents: boolean;
    transportation: boolean;
    equipment: boolean;
    certificates: boolean;
    multiLocation: boolean;
    onlineCapable: boolean;
  };
  requiredFields: {
    address: boolean;
    meetingLink: boolean;
    operatingHours: boolean;
  };
}

export interface SchoolSettings {
  // Basic Info
  institution_type: InstitutionType;
  age_group: AgeGroup;
  language: string;
  
  // Location
  location_count: number;
  location_model?: LocationModel;
  locations?: Array<{
    id: string;
    name: string;
    address?: {
      street: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
    is_primary: boolean;
  }>;
  
  // Regional
  timezone: string;
  currency: Currency;
  academic_year_start: number; // month (1-12)
  
  // Academic
  academic_hour_minutes: number;
  default_session_duration: number;
  terminology: Terminology;
  
  // Online Settings
  meeting_platform?: MeetingPlatform;
  default_meeting_link?: string;
  
  // Financial
  payment_accounts: Array<{
    id: string;
    name: string;
    type: 'bank' | 'paypal' | 'stripe' | 'other';
    is_default: boolean;
  }>;
  pricing_models: PricingModel[];
  
  // Features
  enabled_features: string[];
  
  // Branding
  theme: {
    name: string;
    primary: string;
    secondary: string;
    font: 'modern' | 'classic' | 'playful';
  };
  logo_url?: string;
  
  // Operational
  operating_hours?: {
    [key: string]: {
      open: string;
      close: string;
      closed?: boolean;
    };
  };
}

// Institution Categories with Icons
export const INSTITUTION_CATEGORIES: InstitutionCategory[] = [
  {
    id: 'educational',
    name: 'Educational Institutions',
    icon: '🏫',
    types: [
      { value: 'public_school', label: 'Public School', icon: '🏫' },
      { value: 'private_school', label: 'Private School', icon: '🎓' },
      { value: 'charter_school', label: 'Charter School', icon: '📚' },
      { value: 'online_school', label: 'Online School', icon: '💻' },
      { value: 'hybrid_school', label: 'Hybrid School', icon: '🔄' },
    ],
  },
  {
    id: 'higher_education',
    name: 'Higher Education',
    icon: '🎓',
    types: [
      { value: 'university', label: 'University/College', icon: '🎓' },
      { value: 'community_college', label: 'Community College', icon: '🏛️' },
      { value: 'trade_school', label: 'Trade School', icon: '🔧' },
    ],
  },
  {
    id: 'specialized',
    name: 'Specialized Learning',
    icon: '🎨',
    types: [
      { value: 'language_center', label: 'Language Center', icon: '🗣️' },
      { value: 'music_school', label: 'Music School', icon: '🎵' },
      { value: 'art_school', label: 'Art School', icon: '🎨' },
      { value: 'dance_studio', label: 'Dance Studio', icon: '💃' },
      { value: 'cooking_school', label: 'Cooking School', icon: '👨‍🍳' },
    ],
  },
  {
    id: 'sports_fitness',
    name: 'Sports & Fitness',
    icon: '💪',
    types: [
      { value: 'sports_academy', label: 'Sports Academy', icon: '⚽' },
      { value: 'martial_arts_dojo', label: 'Martial Arts Dojo', icon: '🥋' },
      { value: 'fitness_center', label: 'Fitness Center/Gym', icon: '💪' },
      { value: 'yoga_studio', label: 'Yoga Studio', icon: '🧘' },
    ],
  },
  {
    id: 'individual',
    name: 'Individual Services',
    icon: '👨‍🏫',
    types: [
      { value: 'private_tutor', label: 'Private Tutor', icon: '👨‍🏫' },
      { value: 'personal_coach', label: 'Personal Coach', icon: '🏃' },
      { value: 'music_teacher', label: 'Music Teacher', icon: '🎹' },
      { value: 'personal_trainer', label: 'Personal Trainer', icon: '🏋️' },
    ],
  },
  {
    id: 'learning_centers',
    name: 'Learning Centers',
    icon: '📖',
    types: [
      { value: 'tutoring_center', label: 'Tutoring Center', icon: '📖' },
      { value: 'training_center', label: 'Training Center', icon: '💼' },
      { value: 'daycare_preschool', label: 'Daycare/Preschool', icon: '👶' },
    ],
  },
];

// Terminology Configuration
export const TERMINOLOGY_CONFIG: Record<InstitutionType, Terminology> = {
  // Educational
  public_school: {
    student: 'Student',
    students: 'Students',
    teacher: 'Teacher',
    teachers: 'Teachers',
    class: 'Class',
    classes: 'Classes',
    enrollment: 'Enrollment',
    grade: 'Grade',
    parent: 'Parent',
    schedule: 'Schedule',
  },
  private_school: {
    student: 'Student',
    students: 'Students',
    teacher: 'Teacher',
    teachers: 'Teachers',
    class: 'Class',
    classes: 'Classes',
    enrollment: 'Enrollment',
    grade: 'Grade',
    parent: 'Parent',
    schedule: 'Schedule',
  },
  charter_school: {
    student: 'Student',
    students: 'Students',
    teacher: 'Teacher',
    teachers: 'Teachers',
    class: 'Class',
    classes: 'Classes',
    enrollment: 'Enrollment',
    grade: 'Grade',
    parent: 'Parent',
    schedule: 'Schedule',
  },
  online_school: {
    student: 'Student',
    students: 'Students',
    teacher: 'Instructor',
    teachers: 'Instructors',
    class: 'Course',
    classes: 'Courses',
    enrollment: 'Enrollment',
    grade: 'Grade',
    parent: 'Parent',
    schedule: 'Schedule',
  },
  hybrid_school: {
    student: 'Student',
    students: 'Students',
    teacher: 'Teacher',
    teachers: 'Teachers',
    class: 'Class',
    classes: 'Classes',
    enrollment: 'Enrollment',
    grade: 'Grade',
    parent: 'Parent',
    schedule: 'Schedule',
  },
  
  // Higher Education
  university: {
    student: 'Student',
    students: 'Students',
    teacher: 'Professor',
    teachers: 'Professors',
    class: 'Course',
    classes: 'Courses',
    enrollment: 'Registration',
    grade: 'Grade',
    parent: 'Emergency Contact',
    schedule: 'Schedule',
  },
  community_college: {
    student: 'Student',
    students: 'Students',
    teacher: 'Instructor',
    teachers: 'Instructors',
    class: 'Course',
    classes: 'Courses',
    enrollment: 'Registration',
    grade: 'Grade',
    parent: 'Emergency Contact',
    schedule: 'Schedule',
  },
  trade_school: {
    student: 'Student',
    students: 'Students',
    teacher: 'Instructor',
    teachers: 'Instructors',
    class: 'Course',
    classes: 'Courses',
    enrollment: 'Enrollment',
    grade: 'Certification',
    parent: 'Emergency Contact',
    schedule: 'Schedule',
  },
  
  // Specialized Learning
  language_center: {
    student: 'Student',
    students: 'Students',
    teacher: 'Instructor',
    teachers: 'Instructors',
    class: 'Lesson',
    classes: 'Lessons',
    enrollment: 'Registration',
    grade: 'Level',
    parent: 'Contact',
    schedule: 'Schedule',
  },
  music_school: {
    student: 'Student',
    students: 'Students',
    teacher: 'Instructor',
    teachers: 'Instructors',
    class: 'Lesson',
    classes: 'Lessons',
    enrollment: 'Enrollment',
    grade: 'Level',
    parent: 'Parent',
    schedule: 'Schedule',
  },
  art_school: {
    student: 'Student',
    students: 'Students',
    teacher: 'Instructor',
    teachers: 'Instructors',
    class: 'Workshop',
    classes: 'Workshops',
    enrollment: 'Registration',
    grade: 'Portfolio',
    parent: 'Contact',
    schedule: 'Schedule',
  },
  dance_studio: {
    student: 'Dancer',
    students: 'Dancers',
    teacher: 'Instructor',
    teachers: 'Instructors',
    class: 'Class',
    classes: 'Classes',
    enrollment: 'Registration',
    grade: 'Level',
    parent: 'Parent',
    schedule: 'Schedule',
  },
  cooking_school: {
    student: 'Student',
    students: 'Students',
    teacher: 'Chef Instructor',
    teachers: 'Chef Instructors',
    class: 'Class',
    classes: 'Classes',
    enrollment: 'Registration',
    grade: 'Certification',
    parent: 'Contact',
    schedule: 'Schedule',
  },
  
  // Sports & Fitness
  sports_academy: {
    student: 'Athlete',
    students: 'Athletes',
    teacher: 'Coach',
    teachers: 'Coaches',
    class: 'Training Session',
    classes: 'Training Sessions',
    enrollment: 'Registration',
    grade: 'Performance Level',
    parent: 'Parent',
    schedule: 'Training Schedule',
  },
  martial_arts_dojo: {
    student: 'Student',
    students: 'Students',
    teacher: 'Sensei',
    teachers: 'Instructors',
    class: 'Class',
    classes: 'Classes',
    enrollment: 'Enrollment',
    grade: 'Belt',
    parent: 'Parent',
    schedule: 'Schedule',
  },
  fitness_center: {
    student: 'Member',
    students: 'Members',
    teacher: 'Trainer',
    teachers: 'Trainers',
    class: 'Session',
    classes: 'Sessions',
    enrollment: 'Membership',
    grade: 'Fitness Level',
    parent: 'Emergency Contact',
    schedule: 'Schedule',
  },
  yoga_studio: {
    student: 'Member',
    students: 'Members',
    teacher: 'Instructor',
    teachers: 'Instructors',
    class: 'Class',
    classes: 'Classes',
    enrollment: 'Membership',
    grade: 'Level',
    parent: 'Emergency Contact',
    schedule: 'Schedule',
  },
  
  // Individual Services
  private_tutor: {
    student: 'Student',
    students: 'Students',
    teacher: 'Tutor',
    teachers: 'Tutors',
    class: 'Session',
    classes: 'Sessions',
    enrollment: 'Booking',
    grade: 'Progress',
    parent: 'Parent',
    schedule: 'Appointments',
  },
  personal_coach: {
    student: 'Client',
    students: 'Clients',
    teacher: 'Coach',
    teachers: 'Coaches',
    class: 'Session',
    classes: 'Sessions',
    enrollment: 'Booking',
    grade: 'Goal Progress',
    parent: 'Contact',
    schedule: 'Appointments',
  },
  music_teacher: {
    student: 'Student',
    students: 'Students',
    teacher: 'Teacher',
    teachers: 'Teachers',
    class: 'Lesson',
    classes: 'Lessons',
    enrollment: 'Booking',
    grade: 'Level',
    parent: 'Parent',
    schedule: 'Lesson Schedule',
  },
  personal_trainer: {
    student: 'Client',
    students: 'Clients',
    teacher: 'Trainer',
    teachers: 'Trainers',
    class: 'Session',
    classes: 'Sessions',
    enrollment: 'Booking',
    grade: 'Fitness Progress',
    parent: 'Emergency Contact',
    schedule: 'Training Schedule',
  },
  
  // Learning Centers
  tutoring_center: {
    student: 'Student',
    students: 'Students',
    teacher: 'Tutor',
    teachers: 'Tutors',
    class: 'Session',
    classes: 'Sessions',
    enrollment: 'Registration',
    grade: 'Progress Report',
    parent: 'Parent',
    schedule: 'Schedule',
  },
  training_center: {
    student: 'Trainee',
    students: 'Trainees',
    teacher: 'Trainer',
    teachers: 'Trainers',
    class: 'Module',
    classes: 'Modules',
    enrollment: 'Registration',
    grade: 'Certification',
    parent: 'Contact',
    schedule: 'Training Schedule',
  },
  daycare_preschool: {
    student: 'Child',
    students: 'Children',
    teacher: 'Teacher',
    teachers: 'Teachers',
    class: 'Group',
    classes: 'Groups',
    enrollment: 'Enrollment',
    grade: 'Age Group',
    parent: 'Parent',
    schedule: 'Daily Schedule',
  },
};

// Feature Configuration
export const FEATURE_CONFIG: Record<InstitutionType, InstitutionConfig['features']> = {
  // Educational - All have grades and parents
  public_school: {
    grades: true,
    parents: true,
    transportation: true,
    equipment: false,
    certificates: true,
    multiLocation: true,
    onlineCapable: false,
  },
  private_school: {
    grades: true,
    parents: true,
    transportation: true,
    equipment: false,
    certificates: true,
    multiLocation: true,
    onlineCapable: false,
  },
  charter_school: {
    grades: true,
    parents: true,
    transportation: true,
    equipment: false,
    certificates: true,
    multiLocation: false,
    onlineCapable: false,
  },
  online_school: {
    grades: true,
    parents: true,
    transportation: false,
    equipment: false,
    certificates: true,
    multiLocation: false,
    onlineCapable: true,
  },
  hybrid_school: {
    grades: true,
    parents: true,
    transportation: true,
    equipment: false,
    certificates: true,
    multiLocation: true,
    onlineCapable: true,
  },
  
  // Higher Education - No parents for adults
  university: {
    grades: true,
    parents: false,
    transportation: false,
    equipment: false,
    certificates: true,
    multiLocation: true,
    onlineCapable: true,
  },
  community_college: {
    grades: true,
    parents: false,
    transportation: false,
    equipment: false,
    certificates: true,
    multiLocation: true,
    onlineCapable: true,
  },
  trade_school: {
    grades: false,
    parents: false,
    transportation: false,
    equipment: true,
    certificates: true,
    multiLocation: false,
    onlineCapable: false,
  },
  
  // Specialized Learning
  language_center: {
    grades: false,
    parents: false,
    transportation: false,
    equipment: false,
    certificates: true,
    multiLocation: true,
    onlineCapable: true,
  },
  music_school: {
    grades: false,
    parents: true,
    transportation: false,
    equipment: true,
    certificates: true,
    multiLocation: true,
    onlineCapable: false,
  },
  art_school: {
    grades: false,
    parents: false,
    transportation: false,
    equipment: true,
    certificates: true,
    multiLocation: true,
    onlineCapable: false,
  },
  dance_studio: {
    grades: false,
    parents: true,
    transportation: false,
    equipment: true,
    certificates: true,
    multiLocation: true,
    onlineCapable: false,
  },
  cooking_school: {
    grades: false,
    parents: false,
    transportation: false,
    equipment: true,
    certificates: true,
    multiLocation: true,
    onlineCapable: false,
  },
  
  // Sports & Fitness
  sports_academy: {
    grades: false,
    parents: true,
    transportation: true,
    equipment: true,
    certificates: true,
    multiLocation: true,
    onlineCapable: false,
  },
  martial_arts_dojo: {
    grades: false,
    parents: true,
    transportation: false,
    equipment: true,
    certificates: true,
    multiLocation: true,
    onlineCapable: false,
  },
  fitness_center: {
    grades: false,
    parents: false,
    transportation: false,
    equipment: true,
    certificates: false,
    multiLocation: true,
    onlineCapable: false,
  },
  yoga_studio: {
    grades: false,
    parents: false,
    transportation: false,
    equipment: true,
    certificates: true,
    multiLocation: true,
    onlineCapable: true,
  },
  
  // Individual Services - Single location
  private_tutor: {
    grades: true,
    parents: true,
    transportation: false,
    equipment: false,
    certificates: false,
    multiLocation: false,
    onlineCapable: true,
  },
  personal_coach: {
    grades: false,
    parents: false,
    transportation: false,
    equipment: false,
    certificates: true,
    multiLocation: false,
    onlineCapable: true,
  },
  music_teacher: {
    grades: false,
    parents: true,
    transportation: false,
    equipment: true,
    certificates: true,
    multiLocation: false,
    onlineCapable: true,
  },
  personal_trainer: {
    grades: false,
    parents: false,
    transportation: false,
    equipment: true,
    certificates: true,
    multiLocation: false,
    onlineCapable: false,
  },
  
  // Learning Centers
  tutoring_center: {
    grades: true,
    parents: true,
    transportation: false,
    equipment: false,
    certificates: true,
    multiLocation: true,
    onlineCapable: true,
  },
  training_center: {
    grades: false,
    parents: false,
    transportation: false,
    equipment: true,
    certificates: true,
    multiLocation: true,
    onlineCapable: true,
  },
  daycare_preschool: {
    grades: false,
    parents: true,
    transportation: true,
    equipment: true,
    certificates: false,
    multiLocation: true,
    onlineCapable: false,
  },
};

// Helper function to get institution config
export function getInstitutionConfig(type: InstitutionType): InstitutionConfig {
  const category = INSTITUTION_CATEGORIES.find(cat => 
    cat.types.some(t => t.value === type)
  );
  
  return {
    type,
    category: category?.id || 'educational',
    terminology: TERMINOLOGY_CONFIG[type],
    features: FEATURE_CONFIG[type],
    requiredFields: {
      address: type !== 'online_school' && !type.includes('online'),
      meetingLink: type === 'online_school' || type.includes('online') || type.includes('tutor'),
      operatingHours: type !== 'online_school',
    },
  };
}

// Helper to get appropriate fields based on age group
export function getRequiredFieldsByAge(ageGroup: AgeGroup): string[] {
  const baseFields = ['first_name', 'last_name'];
  
  if (ageGroup === 'kids') {
    return [
      ...baseFields,
      'date_of_birth',
      'parent_name',
      'parent_email',
      'parent_phone',
      'emergency_contact',
      'medical_info',
      'allergies',
      'pickup_authorization',
    ];
  } else if (ageGroup === 'adults') {
    return [
      ...baseFields,
      'email',
      'phone',
    ];
  } else {
    // Both - will be determined by age field
    return baseFields;
  }
}