-- Fix null settings for existing schools
-- This will set default settings for schools that have null settings

UPDATE public.schools
SET settings = jsonb_build_object(
  'institution_type', 'public_school',
  'age_group', 'kids',
  'language', 'en',
  'timezone', 'America/New_York',
  'currency', 'USD',
  'academic_year_start', 'september',
  'academic_hour_minutes', 60,
  'default_session_duration', 60,
  'terminology', jsonb_build_object(
    'student', 'Student',
    'students', 'Students',
    'teacher', 'Teacher',
    'teachers', 'Teachers',
    'class', 'Class',
    'classes', 'Classes',
    'course', 'Course',
    'courses', 'Courses',
    'parent', 'Parent',
    'parents', 'Parents',
    'grade', 'Grade',
    'session', 'Session',
    'enrollment', 'Enrollment',
    'attendance', 'Attendance'
  ),
  'theme', jsonb_build_object(
    'name', 'warm-inviting',
    'primary', '#F97316',
    'secondary', '#3B82F6',
    'font', 'modern'
  ),
  'enabled_features', ARRAY['attendance', 'grades', 'assignments']::text[],
  'pricing_models', ARRAY['monthly_subscription']::text[],
  'locations', jsonb_build_array(
    jsonb_build_object(
      'id', gen_random_uuid(),
      'name', 'Main Location',
      'is_primary', true
    )
  ),
  'payment_accounts', jsonb_build_array(
    jsonb_build_object(
      'id', gen_random_uuid(),
      'name', 'Default Account',
      'type', 'bank',
      'is_default', true
    )
  )
)
WHERE settings IS NULL;

-- Also ensure that new schools always have settings
ALTER TABLE public.schools 
ALTER COLUMN settings 
SET DEFAULT jsonb_build_object(
  'institution_type', 'public_school',
  'age_group', 'kids',
  'language', 'en',
  'timezone', 'America/New_York',
  'currency', 'USD',
  'academic_year_start', 'september',
  'academic_hour_minutes', 60,
  'default_session_duration', 60,
  'terminology', jsonb_build_object(
    'student', 'Student',
    'students', 'Students',
    'teacher', 'Teacher',
    'teachers', 'Teachers',
    'class', 'Class',
    'classes', 'Classes',
    'course', 'Course',
    'courses', 'Courses',
    'parent', 'Parent',
    'parents', 'Parents',
    'grade', 'Grade',
    'session', 'Session',
    'enrollment', 'Enrollment',
    'attendance', 'Attendance'
  ),
  'theme', jsonb_build_object(
    'name', 'warm-inviting',
    'primary', '#F97316',
    'secondary', '#3B82F6',
    'font', 'modern'
  ),
  'enabled_features', ARRAY['attendance', 'grades', 'assignments']::text[],
  'pricing_models', ARRAY['monthly_subscription']::text[],
  'locations', jsonb_build_array(
    jsonb_build_object(
      'id', gen_random_uuid(),
      'name', 'Main Location',
      'is_primary', true
    )
  ),
  'payment_accounts', jsonb_build_array(
    jsonb_build_object(
      'id', gen_random_uuid(),
      'name', 'Default Account',
      'type', 'bank',
      'is_default', true
    )
  )
);