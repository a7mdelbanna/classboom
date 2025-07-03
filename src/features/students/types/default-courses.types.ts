import type { InstitutionType } from '../../../types/institution.types';

export interface Course {
  id: string;
  name: string;
  description?: string;
  category?: string;
  level?: string;
  duration_hours?: number;
  is_active: boolean;
}

export interface CourseCategory {
  id: string;
  name: string;
  courses: Omit<Course, 'id'>[];
}

// Default courses for each institution type
export const DEFAULT_COURSES: Record<InstitutionType, CourseCategory[]> = {
  // Educational Institutions
  public_school: [
    {
      id: 'core_subjects',
      name: 'Core Subjects',
      courses: [
        { name: 'Mathematics', description: 'Basic to advanced mathematics', category: 'core_subjects', is_active: true },
        { name: 'English Language Arts', description: 'Reading, writing, and literature', category: 'core_subjects', is_active: true },
        { name: 'Science', description: 'General science concepts', category: 'core_subjects', is_active: true },
        { name: 'Social Studies', description: 'History, geography, and civics', category: 'core_subjects', is_active: true },
        { name: 'Physical Education', description: 'Sports and physical fitness', category: 'core_subjects', is_active: true },
      ]
    },
    {
      id: 'electives',
      name: 'Electives',
      courses: [
        { name: 'Art', description: 'Visual arts and creativity', category: 'electives', is_active: true },
        { name: 'Music', description: 'Musical education and performance', category: 'electives', is_active: true },
        { name: 'Computer Science', description: 'Basic programming and technology', category: 'electives', is_active: true },
        { name: 'Foreign Language', description: 'Second language learning', category: 'electives', is_active: true },
      ]
    }
  ],

  private_school: [
    {
      id: 'core_subjects',
      name: 'Core Subjects',
      courses: [
        { name: 'Advanced Mathematics', description: 'Algebra, geometry, calculus', category: 'core_subjects', is_active: true },
        { name: 'English Literature', description: 'Classic and modern literature', category: 'core_subjects', is_active: true },
        { name: 'Sciences', description: 'Biology, chemistry, physics', category: 'core_subjects', is_active: true },
        { name: 'History & Social Studies', description: 'World history and social sciences', category: 'core_subjects', is_active: true },
        { name: 'Philosophy & Ethics', description: 'Critical thinking and moral reasoning', category: 'core_subjects', is_active: true },
      ]
    },
    {
      id: 'enrichment',
      name: 'Enrichment Programs',
      courses: [
        { name: 'Latin', description: 'Classical Latin language', category: 'enrichment', is_active: true },
        { name: 'Debate & Public Speaking', description: 'Communication and argumentation skills', category: 'enrichment', is_active: true },
        { name: 'Fine Arts', description: 'Painting, sculpture, and visual arts', category: 'enrichment', is_active: true },
        { name: 'Advanced STEM', description: 'Robotics, engineering, advanced sciences', category: 'enrichment', is_active: true },
      ]
    }
  ],

  charter_school: [
    {
      id: 'innovative_curriculum',
      name: 'Innovative Curriculum',
      courses: [
        { name: 'Project-Based Math', description: 'Mathematics through real-world projects', category: 'innovative_curriculum', is_active: true },
        { name: 'Integrated Science', description: 'Cross-disciplinary science approach', category: 'innovative_curriculum', is_active: true },
        { name: 'Digital Literacy', description: 'Modern technology and media skills', category: 'innovative_curriculum', is_active: true },
        { name: 'Community Studies', description: 'Local history and civic engagement', category: 'innovative_curriculum', is_active: true },
        { name: 'Entrepreneurship', description: 'Business and innovation skills', category: 'innovative_curriculum', is_active: true },
      ]
    }
  ],

  online_school: [
    {
      id: 'digital_courses',
      name: 'Digital Courses',
      courses: [
        { name: 'Virtual Mathematics', description: 'Interactive online math curriculum', category: 'digital_courses', is_active: true },
        { name: 'Digital English', description: 'Online reading and writing programs', category: 'digital_courses', is_active: true },
        { name: 'Virtual Science Labs', description: 'Simulated science experiments', category: 'digital_courses', is_active: true },
        { name: 'Online History', description: 'Interactive historical studies', category: 'digital_courses', is_active: true },
        { name: 'Computer Programming', description: 'Coding and software development', category: 'digital_courses', is_active: true },
        { name: 'Digital Art & Design', description: 'Creative digital media', category: 'digital_courses', is_active: true },
      ]
    }
  ],

  hybrid_school: [
    {
      id: 'blended_learning',
      name: 'Blended Learning',
      courses: [
        { name: 'Hybrid Mathematics', description: 'In-person and online math instruction', category: 'blended_learning', is_active: true },
        { name: 'Blended Science', description: 'Lab work and virtual experiments', category: 'blended_learning', is_active: true },
        { name: 'Digital Communication', description: 'Online and face-to-face communication', category: 'blended_learning', is_active: true },
        { name: 'Flexible Learning Paths', description: 'Personalized education tracks', category: 'blended_learning', is_active: true },
      ]
    }
  ],

  // Higher Education
  university: [
    {
      id: 'undergraduate',
      name: 'Undergraduate Programs',
      courses: [
        { name: 'Liberal Arts', description: 'Broad-based education', category: 'undergraduate', is_active: true },
        { name: 'Business Administration', description: 'Management and business skills', category: 'undergraduate', is_active: true },
        { name: 'Computer Science', description: 'Programming and software engineering', category: 'undergraduate', is_active: true },
        { name: 'Engineering', description: 'Various engineering disciplines', category: 'undergraduate', is_active: true },
        { name: 'Pre-Med Sciences', description: 'Preparation for medical school', category: 'undergraduate', is_active: true },
      ]
    },
    {
      id: 'graduate',
      name: 'Graduate Programs',
      courses: [
        { name: 'MBA', description: 'Master of Business Administration', category: 'graduate', is_active: true },
        { name: 'Master of Science', description: 'Advanced scientific studies', category: 'graduate', is_active: true },
        { name: 'PhD Programs', description: 'Doctoral research programs', category: 'graduate', is_active: true },
      ]
    }
  ],

  community_college: [
    {
      id: 'associate_degrees',
      name: 'Associate Degrees',
      courses: [
        { name: 'Liberal Arts Transfer', description: 'Transfer to 4-year universities', category: 'associate_degrees', is_active: true },
        { name: 'Business Studies', description: 'Basic business principles', category: 'associate_degrees', is_active: true },
        { name: 'Nursing', description: 'Healthcare and nursing education', category: 'associate_degrees', is_active: true },
        { name: 'Information Technology', description: 'Computer and IT skills', category: 'associate_degrees', is_active: true },
      ]
    },
    {
      id: 'continuing_education',
      name: 'Continuing Education',
      courses: [
        { name: 'Professional Development', description: 'Career advancement skills', category: 'continuing_education', is_active: true },
        { name: 'English as Second Language', description: 'ESL programs', category: 'continuing_education', is_active: true },
        { name: 'GED Preparation', description: 'High school equivalency', category: 'continuing_education', is_active: true },
      ]
    }
  ],

  trade_school: [
    {
      id: 'skilled_trades',
      name: 'Skilled Trades',
      courses: [
        { name: 'Electrical Work', description: 'Electrical installation and repair', category: 'skilled_trades', is_active: true },
        { name: 'Plumbing', description: 'Plumbing systems and repair', category: 'skilled_trades', is_active: true },
        { name: 'HVAC', description: 'Heating, ventilation, and air conditioning', category: 'skilled_trades', is_active: true },
        { name: 'Automotive Technology', description: 'Car maintenance and repair', category: 'skilled_trades', is_active: true },
        { name: 'Welding', description: 'Metal fabrication and welding', category: 'skilled_trades', is_active: true },
        { name: 'Carpentry', description: 'Woodworking and construction', category: 'skilled_trades', is_active: true },
      ]
    }
  ],

  // Language Centers
  language_center: [
    {
      id: 'language_courses',
      name: 'Language Courses',
      courses: [
        { name: 'English (ESL)', description: 'English as a Second Language', category: 'language_courses', level: 'A1-C2', is_active: true },
        { name: 'Spanish', description: 'Spanish language learning', category: 'language_courses', level: 'A1-C2', is_active: true },
        { name: 'French', description: 'French language learning', category: 'language_courses', level: 'A1-C2', is_active: true },
        { name: 'German', description: 'German language learning', category: 'language_courses', level: 'A1-C2', is_active: true },
        { name: 'Mandarin Chinese', description: 'Chinese language learning', category: 'language_courses', level: 'A1-C2', is_active: true },
        { name: 'Japanese', description: 'Japanese language learning', category: 'language_courses', level: 'A1-C2', is_active: true },
      ]
    },
    {
      id: 'specialized',
      name: 'Specialized Programs',
      courses: [
        { name: 'Business English', description: 'English for professional contexts', category: 'specialized', is_active: true },
        { name: 'Test Preparation', description: 'TOEFL, IELTS, and other exams', category: 'specialized', is_active: true },
        { name: 'Conversation Classes', description: 'Speaking and listening practice', category: 'specialized', is_active: true },
      ]
    }
  ],

  // Arts & Music Schools
  music_school: [
    {
      id: 'instruments',
      name: 'Instruments',
      courses: [
        { name: 'Piano', description: 'Piano lessons for all levels', category: 'instruments', is_active: true },
        { name: 'Guitar', description: 'Acoustic and electric guitar', category: 'instruments', is_active: true },
        { name: 'Violin', description: 'Classical violin instruction', category: 'instruments', is_active: true },
        { name: 'Drums', description: 'Percussion and drum set', category: 'instruments', is_active: true },
        { name: 'Voice', description: 'Vocal training and singing', category: 'instruments', is_active: true },
        { name: 'Saxophone', description: 'Jazz and classical saxophone', category: 'instruments', is_active: true },
      ]
    },
    {
      id: 'theory_composition',
      name: 'Theory & Composition',
      courses: [
        { name: 'Music Theory', description: 'Understanding musical structure', category: 'theory_composition', is_active: true },
        { name: 'Composition', description: 'Creating original music', category: 'theory_composition', is_active: true },
        { name: 'Music History', description: 'Historical periods and styles', category: 'theory_composition', is_active: true },
      ]
    }
  ],

  art_school: [
    {
      id: 'visual_arts',
      name: 'Visual Arts',
      courses: [
        { name: 'Drawing', description: 'Pencil, charcoal, and ink drawing', category: 'visual_arts', is_active: true },
        { name: 'Painting', description: 'Oil, acrylic, and watercolor', category: 'visual_arts', is_active: true },
        { name: 'Sculpture', description: 'Clay, stone, and metal sculpture', category: 'visual_arts', is_active: true },
        { name: 'Digital Art', description: 'Computer-based art creation', category: 'visual_arts', is_active: true },
        { name: 'Photography', description: 'Digital and film photography', category: 'visual_arts', is_active: true },
      ]
    },
    {
      id: 'design',
      name: 'Design',
      courses: [
        { name: 'Graphic Design', description: 'Visual communication design', category: 'design', is_active: true },
        { name: 'Fashion Design', description: 'Clothing and textile design', category: 'design', is_active: true },
        { name: 'Interior Design', description: 'Space planning and decoration', category: 'design', is_active: true },
      ]
    }
  ],

  dance_studio: [
    {
      id: 'dance_styles',
      name: 'Dance Styles',
      courses: [
        { name: 'Ballet', description: 'Classical ballet technique', category: 'dance_styles', is_active: true },
        { name: 'Jazz Dance', description: 'Contemporary jazz movement', category: 'dance_styles', is_active: true },
        { name: 'Hip Hop', description: 'Urban dance styles', category: 'dance_styles', is_active: true },
        { name: 'Contemporary', description: 'Modern dance expression', category: 'dance_styles', is_active: true },
        { name: 'Tap Dance', description: 'Rhythmic tap dancing', category: 'dance_styles', is_active: true },
        { name: 'Ballroom', description: 'Partner dancing styles', category: 'dance_styles', is_active: true },
      ]
    }
  ],

  cooking_school: [
    {
      id: 'culinary_arts',
      name: 'Culinary Arts',
      courses: [
        { name: 'Basic Cooking Techniques', description: 'Fundamental cooking methods', category: 'culinary_arts', is_active: true },
        { name: 'Baking & Pastry', description: 'Bread, cakes, and desserts', category: 'culinary_arts', is_active: true },
        { name: 'International Cuisine', description: 'Dishes from around the world', category: 'culinary_arts', is_active: true },
        { name: 'Food Safety', description: 'Hygiene and safety protocols', category: 'culinary_arts', is_active: true },
        { name: 'Restaurant Management', description: 'Business side of food service', category: 'culinary_arts', is_active: true },
      ]
    }
  ],

  // Sports & Fitness
  sports_academy: [
    {
      id: 'team_sports',
      name: 'Team Sports',
      courses: [
        { name: 'Soccer', description: 'Football training and techniques', category: 'team_sports', is_active: true },
        { name: 'Basketball', description: 'Basketball skills and strategy', category: 'team_sports', is_active: true },
        { name: 'Volleyball', description: 'Volleyball fundamentals', category: 'team_sports', is_active: true },
        { name: 'Baseball', description: 'Baseball training and rules', category: 'team_sports', is_active: true },
      ]
    },
    {
      id: 'individual_sports',
      name: 'Individual Sports',
      courses: [
        { name: 'Tennis', description: 'Tennis technique and strategy', category: 'individual_sports', is_active: true },
        { name: 'Swimming', description: 'Swimming strokes and conditioning', category: 'individual_sports', is_active: true },
        { name: 'Track & Field', description: 'Running, jumping, and throwing events', category: 'individual_sports', is_active: true },
        { name: 'Golf', description: 'Golf fundamentals and course management', category: 'individual_sports', is_active: true },
      ]
    }
  ],

  martial_arts_dojo: [
    {
      id: 'martial_arts',
      name: 'Martial Arts',
      courses: [
        { name: 'Karate', description: 'Traditional Japanese martial art', category: 'martial_arts', is_active: true },
        { name: 'Taekwondo', description: 'Korean martial art emphasizing kicks', category: 'martial_arts', is_active: true },
        { name: 'Judo', description: 'Grappling and throwing techniques', category: 'martial_arts', is_active: true },
        { name: 'Brazilian Jiu-Jitsu', description: 'Ground fighting and submissions', category: 'martial_arts', is_active: true },
        { name: 'Kung Fu', description: 'Chinese martial arts', category: 'martial_arts', is_active: true },
        { name: 'Mixed Martial Arts', description: 'Combination of fighting styles', category: 'martial_arts', is_active: true },
      ]
    }
  ],

  fitness_center: [
    {
      id: 'fitness_programs',
      name: 'Fitness Programs',
      courses: [
        { name: 'Personal Training', description: 'One-on-one fitness coaching', category: 'fitness_programs', is_active: true },
        { name: 'Group Fitness Classes', description: 'Aerobics, Zumba, and more', category: 'fitness_programs', is_active: true },
        { name: 'Weight Training', description: 'Strength and muscle building', category: 'fitness_programs', is_active: true },
        { name: 'Cardio Programs', description: 'Cardiovascular fitness', category: 'fitness_programs', is_active: true },
        { name: 'Nutrition Counseling', description: 'Diet and nutrition guidance', category: 'fitness_programs', is_active: true },
      ]
    }
  ],

  yoga_studio: [
    {
      id: 'yoga_styles',
      name: 'Yoga Styles',
      courses: [
        { name: 'Hatha Yoga', description: 'Gentle, slow-paced yoga', category: 'yoga_styles', is_active: true },
        { name: 'Vinyasa Flow', description: 'Dynamic, flowing sequences', category: 'yoga_styles', is_active: true },
        { name: 'Ashtanga Yoga', description: 'Traditional, structured practice', category: 'yoga_styles', is_active: true },
        { name: 'Yin Yoga', description: 'Deep, meditative stretches', category: 'yoga_styles', is_active: true },
        { name: 'Hot Yoga', description: 'Yoga in heated rooms', category: 'yoga_styles', is_active: true },
        { name: 'Meditation', description: 'Mindfulness and breathing', category: 'yoga_styles', is_active: true },
      ]
    }
  ],

  // Individual Services
  private_tutor: [
    {
      id: 'academic_subjects',
      name: 'Academic Subjects',
      courses: [
        { name: 'Mathematics Tutoring', description: 'Math help at all levels', category: 'academic_subjects', is_active: true },
        { name: 'English Tutoring', description: 'Reading, writing, and literature', category: 'academic_subjects', is_active: true },
        { name: 'Science Tutoring', description: 'Biology, chemistry, physics', category: 'academic_subjects', is_active: true },
        { name: 'Test Preparation', description: 'SAT, ACT, and standardized tests', category: 'academic_subjects', is_active: true },
        { name: 'Study Skills', description: 'Learning strategies and organization', category: 'academic_subjects', is_active: true },
      ]
    }
  ],

  personal_coach: [
    {
      id: 'coaching_areas',
      name: 'Coaching Areas',
      courses: [
        { name: 'Life Coaching', description: 'Personal development and goals', category: 'coaching_areas', is_active: true },
        { name: 'Career Coaching', description: 'Professional development', category: 'coaching_areas', is_active: true },
        { name: 'Health & Wellness', description: 'Lifestyle and health coaching', category: 'coaching_areas', is_active: true },
        { name: 'Leadership Development', description: 'Management and leadership skills', category: 'coaching_areas', is_active: true },
      ]
    }
  ],

  music_teacher: [
    {
      id: 'private_lessons',
      name: 'Private Lessons',
      courses: [
        { name: 'Piano Lessons', description: 'Individual piano instruction', category: 'private_lessons', is_active: true },
        { name: 'Guitar Lessons', description: 'Individual guitar instruction', category: 'private_lessons', is_active: true },
        { name: 'Voice Lessons', description: 'Individual vocal training', category: 'private_lessons', is_active: true },
        { name: 'Music Theory', description: 'Understanding musical concepts', category: 'private_lessons', is_active: true },
      ]
    }
  ],

  personal_trainer: [
    {
      id: 'training_programs',
      name: 'Training Programs',
      courses: [
        { name: 'Strength Training', description: 'Muscle building and conditioning', category: 'training_programs', is_active: true },
        { name: 'Cardio Training', description: 'Cardiovascular fitness', category: 'training_programs', is_active: true },
        { name: 'Weight Loss', description: 'Fat loss and body composition', category: 'training_programs', is_active: true },
        { name: 'Sports Performance', description: 'Athletic enhancement', category: 'training_programs', is_active: true },
        { name: 'Injury Rehabilitation', description: 'Recovery and physical therapy', category: 'training_programs', is_active: true },
      ]
    }
  ],

  // Learning Centers
  tutoring_center: [
    {
      id: 'tutoring_services',
      name: 'Tutoring Services',
      courses: [
        { name: 'Elementary Tutoring', description: 'K-5 academic support', category: 'tutoring_services', is_active: true },
        { name: 'Middle School Tutoring', description: '6-8 grade assistance', category: 'tutoring_services', is_active: true },
        { name: 'High School Tutoring', description: '9-12 grade help', category: 'tutoring_services', is_active: true },
        { name: 'College Prep', description: 'University preparation', category: 'tutoring_services', is_active: true },
        { name: 'Special Needs Support', description: 'Individualized learning assistance', category: 'tutoring_services', is_active: true },
      ]
    }
  ],

  training_center: [
    {
      id: 'professional_training',
      name: 'Professional Training',
      courses: [
        { name: 'Project Management', description: 'PMP and project skills', category: 'professional_training', is_active: true },
        { name: 'IT Certification', description: 'Technology certifications', category: 'professional_training', is_active: true },
        { name: 'Leadership Training', description: 'Management development', category: 'professional_training', is_active: true },
        { name: 'Sales Training', description: 'Sales techniques and skills', category: 'professional_training', is_active: true },
        { name: 'Compliance Training', description: 'Regulatory and safety training', category: 'professional_training', is_active: true },
      ]
    }
  ],

  daycare_preschool: [
    {
      id: 'early_childhood',
      name: 'Early Childhood Programs',
      courses: [
        { name: 'Infant Care', description: '6 weeks to 12 months', category: 'early_childhood', is_active: true },
        { name: 'Toddler Program', description: '1-2 years old', category: 'early_childhood', is_active: true },
        { name: 'Preschool', description: '3-4 years old', category: 'early_childhood', is_active: true },
        { name: 'Pre-K', description: '4-5 years old', category: 'early_childhood', is_active: true },
        { name: 'After School Care', description: 'School-age child care', category: 'early_childhood', is_active: true },
      ]
    }
  ]
};

// Helper function to get default courses for institution type
export function getDefaultCourses(institutionType: InstitutionType): CourseCategory[] {
  return DEFAULT_COURSES[institutionType] || DEFAULT_COURSES.public_school;
}

// Helper function to get flat list of course names
export function getDefaultCourseNames(institutionType: InstitutionType): string[] {
  const categories = getDefaultCourses(institutionType);
  return categories.flatMap(category => 
    category.courses.map(course => course.name)
  );
}