-- Create enrollments table with pricing model support
-- This table handles student enrollments in courses with various pricing models

-- Create enrollment status enum
CREATE TYPE enrollment_status AS ENUM ('active', 'pending', 'completed', 'cancelled', 'suspended');

-- Create payment status enum
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'partial', 'overdue', 'refunded');

-- Create the enrollments table
CREATE TABLE IF NOT EXISTS public.enrollments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    
    -- Enrollment details
    enrollment_date date NOT NULL DEFAULT CURRENT_DATE,
    start_date date NOT NULL,
    end_date date,
    status enrollment_status NOT NULL DEFAULT 'pending',
    
    -- Pricing information
    pricing_model varchar(50) NOT NULL, -- 'per_session', 'monthly', 'quarterly', 'semester', 'annual', 'package'
    price_amount decimal(10, 2) NOT NULL,
    currency varchar(3) NOT NULL DEFAULT 'USD',
    
    -- Package-specific fields
    total_sessions integer, -- For package pricing
    sessions_used integer DEFAULT 0, -- Track used sessions
    sessions_remaining integer GENERATED ALWAYS AS (
        CASE 
            WHEN total_sessions IS NOT NULL THEN total_sessions - COALESCE(sessions_used, 0)
            ELSE NULL
        END
    ) STORED,
    
    -- Payment tracking
    payment_status payment_status NOT NULL DEFAULT 'pending',
    total_paid decimal(10, 2) DEFAULT 0,
    balance_due decimal(10, 2) GENERATED ALWAYS AS (price_amount - COALESCE(total_paid, 0)) STORED,
    next_payment_date date,
    
    -- Additional information
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT unique_active_enrollment UNIQUE (student_id, course_id, status) 
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date >= start_date),
    CONSTRAINT valid_sessions CHECK (
        (pricing_model = 'package' AND total_sessions IS NOT NULL AND total_sessions > 0) OR
        (pricing_model != 'package' AND total_sessions IS NULL)
    ),
    CONSTRAINT valid_sessions_used CHECK (sessions_used >= 0),
    CONSTRAINT valid_price CHECK (price_amount >= 0),
    CONSTRAINT valid_payment CHECK (total_paid >= 0)
);

-- Create trigger to enforce unique active enrollment
CREATE OR REPLACE FUNCTION check_unique_active_enrollment()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'active' THEN
        IF EXISTS (
            SELECT 1 FROM public.enrollments
            WHERE student_id = NEW.student_id
            AND course_id = NEW.course_id
            AND status = 'active'
            AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
        ) THEN
            RAISE EXCEPTION 'Student already has an active enrollment in this course';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_unique_active_enrollment
    BEFORE INSERT OR UPDATE ON public.enrollments
    FOR EACH ROW
    EXECUTE FUNCTION check_unique_active_enrollment();

-- Create function to calculate next payment date
CREATE OR REPLACE FUNCTION calculate_next_payment_date(
    p_pricing_model varchar,
    p_start_date date,
    p_last_payment_date date DEFAULT NULL
)
RETURNS date AS $$
DECLARE
    base_date date;
    months_to_add integer;
BEGIN
    -- Use last payment date if available, otherwise use start date
    base_date := COALESCE(p_last_payment_date, p_start_date);
    
    CASE p_pricing_model
        WHEN 'monthly' THEN
            months_to_add := 1;
        WHEN 'quarterly' THEN
            months_to_add := 3;
        WHEN 'semester' THEN
            months_to_add := 6;
        WHEN 'annual' THEN
            months_to_add := 12;
        ELSE
            -- For per_session and package, no recurring payment
            RETURN NULL;
    END CASE;
    
    RETURN base_date + (months_to_add || ' months')::interval;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update timestamps
CREATE TRIGGER update_enrollments_updated_at 
    BEFORE UPDATE ON public.enrollments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy for SELECT: Users can view enrollments from their school
CREATE POLICY "Users can view enrollments from their school" ON public.enrollments
    FOR SELECT USING (
        school_id IN (
            SELECT id FROM public.schools 
            WHERE owner_id = auth.uid()
        )
    );

-- Policy for INSERT: Users can create enrollments for their school
CREATE POLICY "Users can create enrollments for their school" ON public.enrollments
    FOR INSERT WITH CHECK (
        school_id IN (
            SELECT id FROM public.schools 
            WHERE owner_id = auth.uid()
        )
    );

-- Policy for UPDATE: Users can update enrollments from their school
CREATE POLICY "Users can update enrollments from their school" ON public.enrollments
    FOR UPDATE USING (
        school_id IN (
            SELECT id FROM public.schools 
            WHERE owner_id = auth.uid()
        )
    );

-- Policy for DELETE: Users can delete enrollments from their school
CREATE POLICY "Users can delete enrollments from their school" ON public.enrollments
    FOR DELETE USING (
        school_id IN (
            SELECT id FROM public.schools 
            WHERE owner_id = auth.uid()
        )
    );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_enrollments_school_id ON public.enrollments(school_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON public.enrollments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_payment_status ON public.enrollments(payment_status);
CREATE INDEX IF NOT EXISTS idx_enrollments_dates ON public.enrollments(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_enrollments_next_payment ON public.enrollments(next_payment_date) WHERE next_payment_date IS NOT NULL;

-- Add helpful comments
COMMENT ON TABLE public.enrollments IS 'Student enrollments in courses with pricing model support';
COMMENT ON COLUMN public.enrollments.pricing_model IS 'Type of pricing: per_session, monthly, quarterly, semester, annual, package';
COMMENT ON COLUMN public.enrollments.total_sessions IS 'Total sessions included in package (only for package pricing)';
COMMENT ON COLUMN public.enrollments.sessions_used IS 'Number of sessions already used (for package pricing)';
COMMENT ON COLUMN public.enrollments.sessions_remaining IS 'Calculated field: sessions remaining in package';
COMMENT ON COLUMN public.enrollments.balance_due IS 'Calculated field: amount still owed';
COMMENT ON COLUMN public.enrollments.next_payment_date IS 'Next payment due date for recurring subscriptions';