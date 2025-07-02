# ClassBoom Multi-Tenant Database Architecture

## Overview

ClassBoom uses PostgreSQL schema-based multi-tenancy for true data isolation. Each school gets its own schema named `school_[uuid]`.

## Schema Structure

### Public Schema
Used only for ClassBoom system-wide tables:
- `schools` - Registry of all ClassBoom schools
- `subscription_plans` - Available ClassBoom plans
- `features` - ClassBoom feature flags
- `system_settings` - Global ClassBoom configuration

### School Schemas (school_[uuid])
Each ClassBoom school has these tables:
- `users` - School users (admins, teachers, students, parents)
- `students` - Student profiles
- `courses` - Courses offered
- `subscriptions` - Student subscriptions
- `sessions` - Individual lessons/classes
- `attendance` - Attendance records
- `payments` - Payment records
- `messages` - In-app communication
- `settings` - School-specific settings

### Shared Schema
For ClassBoom templates and cross-school features:
- `lesson_templates` - Shareable lesson plans
- `curriculum_templates` - Standard curriculums
- `resource_library` - Educational resources

## Key Functions

```sql
-- Create new ClassBoom school schema
CREATE OR REPLACE FUNCTION create_classboom_school_schema(school_name TEXT)
RETURNS TEXT AS $$
DECLARE
  schema_name TEXT;
  school_id UUID;
BEGIN
  school_id := gen_random_uuid();
  schema_name := 'school_' || replace(school_id::TEXT, '-', '_');
  
  EXECUTE format('CREATE SCHEMA %I', schema_name);
  
  -- Create all tables in the new schema
  PERFORM create_classboom_tables(schema_name);
  
  -- Insert into registry
  INSERT INTO public.schools (id, name, schema_name, created_at)
  VALUES (school_id, school_name, schema_name, NOW());
  
  RETURN schema_name;
END;
$$ LANGUAGE plpgsql;
```

## Security

1. **RLS Policies**: Applied within each schema
2. **Schema Isolation**: Schools cannot access other schemas
3. **JWT Claims**: Include school_id and schema_name
4. **API Gateway**: Validates schema access per request

## Performance Considerations

1. **Connection Pooling**: Per-schema connection pools
2. **Query Optimization**: Schema-specific indexes
3. **Caching Strategy**: Redis cache per schema
4. **Backup Strategy**: Schema-level backups