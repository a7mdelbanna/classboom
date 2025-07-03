import type { InstitutionType } from '../../../types/institution.types';

export interface SkillLevel {
  value: string;
  label: string;
  description?: string;
  color?: string;
}

export interface SkillLevelConfig {
  name: string;
  levels: SkillLevel[];
}

// Skill Level Configurations by Institution Type
export const SKILL_LEVEL_CONFIG: Record<InstitutionType, SkillLevelConfig> = {
  // Educational Institutions
  public_school: {
    name: 'Grade Level',
    levels: [
      { value: 'K', label: 'Kindergarten', color: '#FF6B35' },
      { value: '1', label: '1st Grade', color: '#FF8C42' },
      { value: '2', label: '2nd Grade', color: '#FFAD51' },
      { value: '3', label: '3rd Grade', color: '#FFCE60' },
      { value: '4', label: '4th Grade', color: '#FFEF6F' },
      { value: '5', label: '5th Grade', color: '#E6FF7E' },
      { value: '6', label: '6th Grade', color: '#CDFF8D' },
      { value: '7', label: '7th Grade', color: '#B4FF9C' },
      { value: '8', label: '8th Grade', color: '#9BFFAB' },
      { value: '9', label: '9th Grade', color: '#82FFBA' },
      { value: '10', label: '10th Grade', color: '#69FFC9' },
      { value: '11', label: '11th Grade', color: '#50FFD8' },
      { value: '12', label: '12th Grade', color: '#37FFE7' },
    ],
  },
  private_school: {
    name: 'Grade Level',
    levels: [
      { value: 'K', label: 'Kindergarten', color: '#FF6B35' },
      { value: '1', label: '1st Grade', color: '#FF8C42' },
      { value: '2', label: '2nd Grade', color: '#FFAD51' },
      { value: '3', label: '3rd Grade', color: '#FFCE60' },
      { value: '4', label: '4th Grade', color: '#FFEF6F' },
      { value: '5', label: '5th Grade', color: '#E6FF7E' },
      { value: '6', label: '6th Grade', color: '#CDFF8D' },
      { value: '7', label: '7th Grade', color: '#B4FF9C' },
      { value: '8', label: '8th Grade', color: '#9BFFAB' },
      { value: '9', label: '9th Grade', color: '#82FFBA' },
      { value: '10', label: '10th Grade', color: '#69FFC9' },
      { value: '11', label: '11th Grade', color: '#50FFD8' },
      { value: '12', label: '12th Grade', color: '#37FFE7' },
    ],
  },
  charter_school: {
    name: 'Grade Level',
    levels: [
      { value: 'K', label: 'Kindergarten', color: '#FF6B35' },
      { value: '1', label: '1st Grade', color: '#FF8C42' },
      { value: '2', label: '2nd Grade', color: '#FFAD51' },
      { value: '3', label: '3rd Grade', color: '#FFCE60' },
      { value: '4', label: '4th Grade', color: '#FFEF6F' },
      { value: '5', label: '5th Grade', color: '#E6FF7E' },
      { value: '6', label: '6th Grade', color: '#CDFF8D' },
      { value: '7', label: '7th Grade', color: '#B4FF9C' },
      { value: '8', label: '8th Grade', color: '#9BFFAB' },
      { value: '9', label: '9th Grade', color: '#82FFBA' },
      { value: '10', label: '10th Grade', color: '#69FFC9' },
      { value: '11', label: '11th Grade', color: '#50FFD8' },
      { value: '12', label: '12th Grade', color: '#37FFE7' },
    ],
  },
  online_school: {
    name: 'Grade Level',
    levels: [
      { value: 'K', label: 'Kindergarten', color: '#FF6B35' },
      { value: '1', label: '1st Grade', color: '#FF8C42' },
      { value: '2', label: '2nd Grade', color: '#FFAD51' },
      { value: '3', label: '3rd Grade', color: '#FFCE60' },
      { value: '4', label: '4th Grade', color: '#FFEF6F' },
      { value: '5', label: '5th Grade', color: '#E6FF7E' },
      { value: '6', label: '6th Grade', color: '#CDFF8D' },
      { value: '7', label: '7th Grade', color: '#B4FF9C' },
      { value: '8', label: '8th Grade', color: '#9BFFAB' },
      { value: '9', label: '9th Grade', color: '#82FFBA' },
      { value: '10', label: '10th Grade', color: '#69FFC9' },
      { value: '11', label: '11th Grade', color: '#50FFD8' },
      { value: '12', label: '12th Grade', color: '#37FFE7' },
    ],
  },
  hybrid_school: {
    name: 'Grade Level',
    levels: [
      { value: 'K', label: 'Kindergarten', color: '#FF6B35' },
      { value: '1', label: '1st Grade', color: '#FF8C42' },
      { value: '2', label: '2nd Grade', color: '#FFAD51' },
      { value: '3', label: '3rd Grade', color: '#FFCE60' },
      { value: '4', label: '4th Grade', color: '#FFEF6F' },
      { value: '5', label: '5th Grade', color: '#E6FF7E' },
      { value: '6', label: '6th Grade', color: '#CDFF8D' },
      { value: '7', label: '7th Grade', color: '#B4FF9C' },
      { value: '8', label: '8th Grade', color: '#9BFFAB' },
      { value: '9', label: '9th Grade', color: '#82FFBA' },
      { value: '10', label: '10th Grade', color: '#69FFC9' },
      { value: '11', label: '11th Grade', color: '#50FFD8' },
      { value: '12', label: '12th Grade', color: '#37FFE7' },
    ],
  },

  // Higher Education
  university: {
    name: 'Academic Year',
    levels: [
      { value: 'freshman', label: 'Freshman', color: '#FF6B35' },
      { value: 'sophomore', label: 'Sophomore', color: '#FF8C42' },
      { value: 'junior', label: 'Junior', color: '#FFAD51' },
      { value: 'senior', label: 'Senior', color: '#FFCE60' },
      { value: 'graduate', label: 'Graduate Student', color: '#37FFE7' },
      { value: 'phd', label: 'PhD Student', color: '#9B59B6' },
    ],
  },
  community_college: {
    name: 'Academic Year',
    levels: [
      { value: 'first_year', label: 'First Year', color: '#FF6B35' },
      { value: 'second_year', label: 'Second Year', color: '#37FFE7' },
    ],
  },
  trade_school: {
    name: 'Program Level',
    levels: [
      { value: 'beginner', label: 'Beginner', color: '#FF6B35' },
      { value: 'intermediate', label: 'Intermediate', color: '#FFCE60' },
      { value: 'advanced', label: 'Advanced', color: '#37FFE7' },
      { value: 'certification', label: 'Certification Track', color: '#9B59B6' },
    ],
  },

  // Language Centers - CEFR Framework
  language_center: {
    name: 'CEFR Level',
    levels: [
      { value: 'A1', label: 'A1 - Beginner', description: 'Can understand and use familiar everyday expressions', color: '#FF6B35' },
      { value: 'A2', label: 'A2 - Elementary', description: 'Can communicate in simple and routine tasks', color: '#FF8C42' },
      { value: 'B1', label: 'B1 - Intermediate', description: 'Can deal with most situations while traveling', color: '#FFCE60' },
      { value: 'B2', label: 'B2 - Upper Intermediate', description: 'Can interact with fluency and spontaneity', color: '#E6FF7E' },
      { value: 'C1', label: 'C1 - Advanced', description: 'Can express ideas fluently and spontaneously', color: '#69FFC9' },
      { value: 'C2', label: 'C2 - Proficient', description: 'Can understand virtually everything heard or read', color: '#37FFE7' },
    ],
  },

  // Music Schools
  music_school: {
    name: 'Music Level',
    levels: [
      { value: 'beginner', label: 'Beginner', description: 'Learning basic notes and rhythm', color: '#FF6B35' },
      { value: 'elementary', label: 'Elementary', description: 'Can play simple melodies', color: '#FF8C42' },
      { value: 'intermediate', label: 'Intermediate', description: 'Can play songs with confidence', color: '#FFCE60' },
      { value: 'advanced', label: 'Advanced', description: 'Can perform complex pieces', color: '#69FFC9' },
      { value: 'professional', label: 'Professional', description: 'Performance/teaching level', color: '#37FFE7' },
    ],
  },

  // Art Schools
  art_school: {
    name: 'Skill Level',
    levels: [
      { value: 'beginner', label: 'Beginner', color: '#FF6B35' },
      { value: 'developing', label: 'Developing', color: '#FF8C42' },
      { value: 'intermediate', label: 'Intermediate', color: '#FFCE60' },
      { value: 'advanced', label: 'Advanced', color: '#69FFC9' },
      { value: 'portfolio', label: 'Portfolio Preparation', color: '#37FFE7' },
    ],
  },

  // Dance Studios
  dance_studio: {
    name: 'Dance Level',
    levels: [
      { value: 'beginner', label: 'Beginner', color: '#FF6B35' },
      { value: 'novice', label: 'Novice', color: '#FF8C42' },
      { value: 'intermediate', label: 'Intermediate', color: '#FFCE60' },
      { value: 'advanced', label: 'Advanced', color: '#69FFC9' },
      { value: 'pre_professional', label: 'Pre-Professional', color: '#37FFE7' },
      { value: 'professional', label: 'Professional', color: '#9B59B6' },
    ],
  },

  // Cooking Schools
  cooking_school: {
    name: 'Culinary Level',
    levels: [
      { value: 'home_cook', label: 'Home Cook', color: '#FF6B35' },
      { value: 'amateur', label: 'Amateur Chef', color: '#FF8C42' },
      { value: 'intermediate', label: 'Intermediate', color: '#FFCE60' },
      { value: 'advanced', label: 'Advanced', color: '#69FFC9' },
      { value: 'professional', label: 'Professional Chef', color: '#37FFE7' },
    ],
  },

  // Sports & Fitness
  sports_academy: {
    name: 'Performance Level',
    levels: [
      { value: 'recreational', label: 'Recreational', color: '#FF6B35' },
      { value: 'club', label: 'Club Level', color: '#FF8C42' },
      { value: 'competitive', label: 'Competitive', color: '#FFCE60' },
      { value: 'elite', label: 'Elite', color: '#69FFC9' },
      { value: 'professional', label: 'Professional', color: '#37FFE7' },
    ],
  },

  // Martial Arts - Belt System
  martial_arts_dojo: {
    name: 'Belt Level',
    levels: [
      { value: 'white', label: 'White Belt', color: '#FFFFFF' },
      { value: 'yellow', label: 'Yellow Belt', color: '#FFFF00' },
      { value: 'orange', label: 'Orange Belt', color: '#FFA500' },
      { value: 'green', label: 'Green Belt', color: '#00FF00' },
      { value: 'blue', label: 'Blue Belt', color: '#0000FF' },
      { value: 'brown', label: 'Brown Belt', color: '#8B4513' },
      { value: 'black_1', label: '1st Dan Black Belt', color: '#000000' },
      { value: 'black_2', label: '2nd Dan Black Belt', color: '#000000' },
      { value: 'black_3', label: '3rd Dan Black Belt', color: '#000000' },
    ],
  },

  // Fitness Centers
  fitness_center: {
    name: 'Fitness Level',
    levels: [
      { value: 'beginner', label: 'Beginner', description: 'New to fitness', color: '#FF6B35' },
      { value: 'intermediate', label: 'Intermediate', description: 'Regular exercise routine', color: '#FFCE60' },
      { value: 'advanced', label: 'Advanced', description: 'High fitness level', color: '#69FFC9' },
      { value: 'athlete', label: 'Athlete', description: 'Competitive level', color: '#37FFE7' },
    ],
  },

  // Yoga Studios
  yoga_studio: {
    name: 'Yoga Level',
    levels: [
      { value: 'beginner', label: 'Beginner', description: 'New to yoga', color: '#FF6B35' },
      { value: 'gentle', label: 'Gentle', description: 'Slow-paced practice', color: '#FF8C42' },
      { value: 'intermediate', label: 'Intermediate', description: 'Regular practice', color: '#FFCE60' },
      { value: 'advanced', label: 'Advanced', description: 'Experienced practitioner', color: '#69FFC9' },
      { value: 'teacher_training', label: 'Teacher Training', description: 'Instructor level', color: '#37FFE7' },
    ],
  },

  // Individual Services
  private_tutor: {
    name: 'Academic Level',
    levels: [
      { value: 'elementary', label: 'Elementary', color: '#FF6B35' },
      { value: 'middle_school', label: 'Middle School', color: '#FF8C42' },
      { value: 'high_school', label: 'High School', color: '#FFCE60' },
      { value: 'college', label: 'College', color: '#69FFC9' },
      { value: 'graduate', label: 'Graduate', color: '#37FFE7' },
    ],
  },

  personal_coach: {
    name: 'Experience Level',
    levels: [
      { value: 'new_client', label: 'New Client', color: '#FF6B35' },
      { value: 'developing', label: 'Developing', color: '#FF8C42' },
      { value: 'progressing', label: 'Progressing', color: '#FFCE60' },
      { value: 'advanced', label: 'Advanced', color: '#69FFC9' },
      { value: 'expert', label: 'Expert Level', color: '#37FFE7' },
    ],
  },

  music_teacher: {
    name: 'Music Level',
    levels: [
      { value: 'beginner', label: 'Beginner', color: '#FF6B35' },
      { value: 'elementary', label: 'Elementary', color: '#FF8C42' },
      { value: 'intermediate', label: 'Intermediate', color: '#FFCE60' },
      { value: 'advanced', label: 'Advanced', color: '#69FFC9' },
      { value: 'performance', label: 'Performance Ready', color: '#37FFE7' },
    ],
  },

  personal_trainer: {
    name: 'Fitness Level',
    levels: [
      { value: 'beginner', label: 'Beginner', color: '#FF6B35' },
      { value: 'intermediate', label: 'Intermediate', color: '#FFCE60' },
      { value: 'advanced', label: 'Advanced', color: '#69FFC9' },
      { value: 'athlete', label: 'Athlete', color: '#37FFE7' },
    ],
  },

  // Learning Centers
  tutoring_center: {
    name: 'Academic Level',
    levels: [
      { value: 'K-2', label: 'K-2nd Grade', color: '#FF6B35' },
      { value: '3-5', label: '3rd-5th Grade', color: '#FF8C42' },
      { value: '6-8', label: '6th-8th Grade', color: '#FFCE60' },
      { value: '9-12', label: '9th-12th Grade', color: '#69FFC9' },
      { value: 'college', label: 'College Level', color: '#37FFE7' },
    ],
  },

  training_center: {
    name: 'Training Level',
    levels: [
      { value: 'foundation', label: 'Foundation', color: '#FF6B35' },
      { value: 'intermediate', label: 'Intermediate', color: '#FFCE60' },
      { value: 'advanced', label: 'Advanced', color: '#69FFC9' },
      { value: 'certification', label: 'Certification', color: '#37FFE7' },
    ],
  },

  daycare_preschool: {
    name: 'Age Group',
    levels: [
      { value: 'infant', label: 'Infant (6 weeks - 12 months)', color: '#FF6B35' },
      { value: 'toddler', label: 'Toddler (1-2 years)', color: '#FF8C42' },
      { value: 'preschool', label: 'Preschool (3-4 years)', color: '#FFCE60' },
      { value: 'pre_k', label: 'Pre-K (4-5 years)', color: '#69FFC9' },
    ],
  },
};

// Helper function to get skill levels for institution type
export function getSkillLevels(institutionType: InstitutionType): SkillLevelConfig {
  return SKILL_LEVEL_CONFIG[institutionType];
}

// Helper function to get skill level by value
export function getSkillLevelInfo(institutionType: InstitutionType, value: string): SkillLevel | undefined {
  const config = SKILL_LEVEL_CONFIG[institutionType];
  return config.levels.find(level => level.value === value);
}