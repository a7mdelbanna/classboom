import { supabase } from '../../../lib/supabase';
import { getDefaultCourseNames, getDefaultCourses } from '../../students/types/default-courses.types';
import type { InstitutionType } from '../../../types/institution.types';

export interface SchoolCourse {
  id: string;
  school_id: string;
  name: string;
  description?: string;
  category?: string;
  level?: string;
  duration_hours?: number;
  max_capacity?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseFormData {
  name: string;
  description?: string;
  category?: string;
  level?: string;
  duration_hours?: number;
  max_capacity?: number;
  is_active?: boolean;
}

export interface CourseFilters {
  category?: string;
  level?: string;
  is_active?: boolean;
  search?: string;
}

export class CoursesService {
  // Helper to get current user's school ID
  static async getCurrentSchoolId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user');
    }

    let schoolId = user.user_metadata?.school_id;
    
    if (!schoolId) {
      const { data: schools, error } = await supabase
        .from('schools')
        .select('id')
        .eq('owner_id', user.id)
        .single();
      
      if (error || !schools) {
        throw new Error('No school found for user');
      }
      
      schoolId = schools.id;
    }
    
    return schoolId;
  }

  // Get courses for the current school
  static async getSchoolCourses(): Promise<string[]> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      // First try to get courses from the database
      const { data: courses, error } = await supabase
        .from('courses')
        .select('name')
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .order('name');

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching courses:', error);
        // Fall back to defaults
        return this.getDefaultCoursesForSchool();
      }

      // If we have courses in the database, return them
      if (courses && courses.length > 0) {
        return courses.map(course => course.name);
      }

      // If no courses in database, return defaults and optionally seed the database
      const defaultCourses = await this.getDefaultCoursesForSchool();
      
      // Optionally seed the database with defaults (commented out for now)
      // await this.seedDefaultCourses();
      
      return defaultCourses;
    } catch (error) {
      console.error('Error in getSchoolCourses:', error);
      return this.getDefaultCoursesForSchool();
    }
  }

  // Get default courses based on school's institution type
  static async getDefaultCoursesForSchool(): Promise<string[]> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      // Get the school's institution type from settings
      const { data: school, error } = await supabase
        .from('schools')
        .select('settings')
        .eq('id', schoolId)
        .single();

      if (error) {
        console.error('Error fetching school settings:', error);
        // Default to public_school if we can't determine type
        return getDefaultCourseNames('public_school');
      }

      // Handle case where school exists but settings is null
      if (!school || !school.settings) {
        console.log('School settings not found, using default');
        return getDefaultCourseNames('public_school');
      }

      const institutionType = school.settings.institution_type as InstitutionType || 'public_school';
      return getDefaultCourseNames(institutionType);
    } catch (error) {
      console.error('Error getting default courses:', error);
      return getDefaultCourseNames('public_school');
    }
  }

  // Seed default courses into the database for the school
  static async seedDefaultCourses(): Promise<void> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      const defaultCourseNames = await this.getDefaultCoursesForSchool();

      // Check if courses table exists and if we already have courses
      const { data: existingCourses, error: checkError } = await supabase
        .from('courses')
        .select('id')
        .eq('school_id', schoolId)
        .limit(1);

      if (checkError) {
        console.log('Courses table might not exist or no access:', checkError.message);
        return;
      }

      // If we already have courses, don't seed
      if (existingCourses && existingCourses.length > 0) {
        return;
      }

      // Prepare course data for insertion
      const coursesToInsert = defaultCourseNames.map(courseName => ({
        school_id: schoolId,
        name: courseName,
        is_active: true
      }));

      // Insert default courses
      const { error } = await supabase
        .from('courses')
        .insert(coursesToInsert);

      if (error) {
        console.error('Error seeding default courses:', error);
      } else {
        console.log(`Successfully seeded ${coursesToInsert.length} default courses`);
      }
    } catch (error) {
      console.error('Error in seedDefaultCourses:', error);
    }
  }

  // Add a new course
  static async addCourse(courseData: CourseFormData): Promise<SchoolCourse> {
    try {
      const schoolId = await this.getCurrentSchoolId();

      const { data, error } = await supabase
        .from('courses')
        .insert({
          school_id: schoolId,
          ...courseData,
          is_active: courseData.is_active ?? true
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error adding course:', error);
      throw error;
    }
  }

  // Get all courses with full details (for management)
  static async getAllSchoolCourses(filters?: CourseFilters): Promise<SchoolCourse[]> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      let query = supabase
        .from('courses')
        .select('*')
        .eq('school_id', schoolId);

      // Apply filters
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.level) {
        query = query.eq('level', filters.level);
      }
      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data: courses, error } = await query.order('name');

      if (error) {
        throw new Error(error.message);
      }

      return courses || [];
    } catch (error) {
      console.error('Error fetching all courses:', error);
      return [];
    }
  }

  // Update course
  static async updateCourse(courseId: string, updates: Partial<CourseFormData>): Promise<SchoolCourse> {
    try {
      const schoolId = await this.getCurrentSchoolId();

      const { data, error } = await supabase
        .from('courses')
        .update(updates)
        .eq('id', courseId)
        .eq('school_id', schoolId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  }

  // Delete course
  static async deleteCourse(courseId: string): Promise<void> {
    try {
      const schoolId = await this.getCurrentSchoolId();

      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId)
        .eq('school_id', schoolId);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  }

  // Get course categories for the school
  static async getCourseCategories(): Promise<string[]> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      const { data: courses, error } = await supabase
        .from('courses')
        .select('category')
        .eq('school_id', schoolId)
        .not('category', 'is', null);

      if (error) {
        console.error('Error fetching categories:', error);
        return [];
      }

      // Get unique categories
      const categories = [...new Set(courses.map(c => c.category).filter(Boolean))];
      return categories.sort();
    } catch (error) {
      console.error('Error getting course categories:', error);
      return [];
    }
  }

  // Get course levels for the school
  static async getCourseLevels(): Promise<string[]> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      const { data: courses, error } = await supabase
        .from('courses')
        .select('level')
        .eq('school_id', schoolId)
        .not('level', 'is', null);

      if (error) {
        console.error('Error fetching levels:', error);
        return [];
      }

      // Get unique levels
      const levels = [...new Set(courses.map(c => c.level).filter(Boolean))];
      return levels.sort();
    } catch (error) {
      console.error('Error getting course levels:', error);
      return [];
    }
  }

  // Bulk import courses from defaults
  static async importDefaultCourses(): Promise<{ success: number; errors: string[] }> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      const defaultCourses = await this.getDefaultCoursesForSchool();
      
      // Get school's institution type for proper categorization
      const { data: school } = await supabase
        .from('schools')
        .select('settings')
        .eq('id', schoolId)
        .single();

      const institutionType = school?.settings?.institution_type || 'public_school';
      const defaultCourseData = getDefaultCourses(institutionType);

      const coursesToInsert = [];
      const errors = [];

      // Convert default courses to proper format
      for (const category of defaultCourseData) {
        for (const course of category.courses) {
          coursesToInsert.push({
            school_id: schoolId,
            name: course.name,
            description: course.description,
            category: course.category,
            level: course.level,
            duration_hours: course.duration_hours,
            is_active: course.is_active
          });
        }
      }

      // Insert courses in batches
      const batchSize = 50;
      let successCount = 0;

      for (let i = 0; i < coursesToInsert.length; i += batchSize) {
        const batch = coursesToInsert.slice(i, i + batchSize);
        
        const { data, error } = await supabase
          .from('courses')
          .insert(batch)
          .select('id');

        if (error) {
          errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
        } else {
          successCount += data?.length || 0;
        }
      }

      return { success: successCount, errors };
    } catch (error) {
      console.error('Error importing default courses:', error);
      return { success: 0, errors: [error instanceof Error ? error.message : 'Unknown error'] };
    }
  }

  // Toggle course active status
  static async toggleCourseStatus(courseId: string): Promise<SchoolCourse> {
    try {
      const schoolId = await this.getCurrentSchoolId();

      // First get current status
      const { data: currentCourse, error: fetchError } = await supabase
        .from('courses')
        .select('is_active')
        .eq('id', courseId)
        .eq('school_id', schoolId)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      // Toggle the status
      const { data, error } = await supabase
        .from('courses')
        .update({ is_active: !currentCourse.is_active })
        .eq('id', courseId)
        .eq('school_id', schoolId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error toggling course status:', error);
      throw error;
    }
  }
}