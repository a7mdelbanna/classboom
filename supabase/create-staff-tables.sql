-- Create comprehensive staff management system
-- This includes staff profiles, compensation models, and payroll tracking

-- Create staff table with comprehensive employment and compensation details
CREATE TABLE IF NOT EXISTS public.staff (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id),
    
    -- Basic Information
    staff_code varchar(50) UNIQUE NOT NULL,
    first_name varchar(100) NOT NULL,
    last_name varchar(100) NOT NULL,
    email varchar(255) NOT NULL,
    phone varchar(50),
    
    -- Employment Details
    role varchar(50) NOT NULL CHECK (role IN ('teacher', 'manager', 'admin', 'support', 'custodian')),
    department varchar(100),
    employment_type varchar(50) CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'volunteer')),
    hire_date date NOT NULL,
    contract_end_date date,
    
    -- Compensation (Critical for financial planning)
    compensation_model varchar(50) CHECK (compensation_model IN ('monthly_salary', 'per_session', 'hourly', 'volunteer')),
    base_salary decimal(10,2),
    hourly_rate decimal(10,2),
    session_rate decimal(10,2),
    currency varchar(3) DEFAULT 'USD',
    payment_account_id uuid, -- Where to pay from (will reference payment_accounts later)
    
    -- Teaching Specific
    specializations text[], -- ['Math', 'Physics', 'Chemistry']
    certifications jsonb,
    max_weekly_hours integer,
    min_weekly_hours integer,
    
    -- Availability
    availability jsonb DEFAULT '{}', -- Weekly schedule template
    
    -- Portal Access
    portal_access_enabled boolean DEFAULT false,
    portal_access_token uuid,
    portal_access_created_at timestamp with time zone,
    last_login_at timestamp with time zone,
    permissions jsonb DEFAULT '{}',
    
    -- Personal Details
    date_of_birth date,
    gender varchar(20),
    nationality varchar(100),
    national_id varchar(100),
    address jsonb,
    emergency_contact jsonb,
    
    -- Status and Metadata
    status varchar(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'terminated')),
    avatar_url text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

-- Create indexes for performance
CREATE INDEX idx_staff_school_id ON public.staff(school_id);
CREATE INDEX idx_staff_email ON public.staff(email);
CREATE INDEX idx_staff_role ON public.staff(role);
CREATE INDEX idx_staff_status ON public.staff(status);

-- Staff-Course Teaching Assignments
CREATE TABLE IF NOT EXISTS public.staff_course_assignments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id uuid NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    is_primary boolean DEFAULT false,
    can_substitute boolean DEFAULT true,
    assigned_at timestamp with time zone DEFAULT now(),
    assigned_by uuid REFERENCES auth.users(id),
    UNIQUE(staff_id, course_id)
);

-- Create index for quick lookups
CREATE INDEX idx_staff_course_staff ON public.staff_course_assignments(staff_id);
CREATE INDEX idx_staff_course_course ON public.staff_course_assignments(course_id);

-- Payroll Management
CREATE TABLE IF NOT EXISTS public.payroll (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    staff_id uuid NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    period_start date NOT NULL,
    period_end date NOT NULL,
    
    -- Calculation Details
    base_amount decimal(10,2) NOT NULL,
    hours_worked decimal(5,2),
    sessions_taught integer,
    overtime_hours decimal(5,2) DEFAULT 0,
    overtime_amount decimal(10,2) DEFAULT 0,
    bonuses jsonb DEFAULT '[]', -- Array of {type, amount, description}
    deductions jsonb DEFAULT '[]', -- Array of {type, amount, description}
    
    -- Totals
    gross_amount decimal(10,2) NOT NULL,
    net_amount decimal(10,2) NOT NULL,
    currency varchar(3) NOT NULL,
    
    -- Payment Details
    payment_status varchar(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'approved', 'processing', 'paid', 'cancelled')),
    payment_date date,
    payment_method varchar(50),
    payment_reference varchar(255),
    payment_account_id uuid, -- Will reference payment_accounts
    
    -- Metadata
    notes text,
    calculation_details jsonb, -- Detailed breakdown
    
    -- Approval workflow
    submitted_at timestamp with time zone DEFAULT now(),
    submitted_by uuid REFERENCES auth.users(id),
    approved_at timestamp with time zone,
    approved_by uuid REFERENCES public.staff(id),
    paid_at timestamp with time zone,
    paid_by uuid REFERENCES auth.users(id),
    
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes for payroll
CREATE INDEX idx_payroll_school_id ON public.payroll(school_id);
CREATE INDEX idx_payroll_staff_id ON public.payroll(staff_id);
CREATE INDEX idx_payroll_period ON public.payroll(period_start, period_end);
CREATE INDEX idx_payroll_status ON public.payroll(payment_status);

-- Payroll items (for detailed tracking)
CREATE TABLE IF NOT EXISTS public.payroll_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    payroll_id uuid NOT NULL REFERENCES public.payroll(id) ON DELETE CASCADE,
    item_type varchar(50) NOT NULL CHECK (item_type IN ('earning', 'deduction')),
    category varchar(50) NOT NULL, -- 'base_salary', 'overtime', 'bonus', 'tax', 'insurance', etc.
    description varchar(255),
    quantity decimal(10,2) DEFAULT 1,
    rate decimal(10,2),
    amount decimal(10,2) NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_course_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for staff
CREATE POLICY "Users can view staff from their school" ON public.staff
    FOR SELECT USING (
        auth.uid() IN (
            SELECT owner_id FROM public.schools WHERE id = staff.school_id
        )
        OR 
        auth.uid() = user_id
    );

CREATE POLICY "School owners can manage their staff" ON public.staff
    FOR ALL USING (
        auth.uid() IN (
            SELECT owner_id FROM public.schools WHERE id = staff.school_id
        )
    );

-- RLS Policies for staff_course_assignments
CREATE POLICY "Users can view course assignments from their school" ON public.staff_course_assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.staff s 
            WHERE s.id = staff_course_assignments.staff_id 
            AND s.school_id IN (
                SELECT id FROM public.schools WHERE owner_id = auth.uid()
            )
        )
    );

CREATE POLICY "School owners can manage course assignments" ON public.staff_course_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.staff s 
            WHERE s.id = staff_course_assignments.staff_id 
            AND s.school_id IN (
                SELECT id FROM public.schools WHERE owner_id = auth.uid()
            )
        )
    );

-- RLS Policies for payroll
CREATE POLICY "Staff can view their own payroll" ON public.payroll
    FOR SELECT USING (
        staff_id IN (
            SELECT id FROM public.staff WHERE user_id = auth.uid()
        )
        OR
        auth.uid() IN (
            SELECT owner_id FROM public.schools WHERE id = payroll.school_id
        )
    );

CREATE POLICY "School owners can manage payroll" ON public.payroll
    FOR ALL USING (
        auth.uid() IN (
            SELECT owner_id FROM public.schools WHERE id = payroll.school_id
        )
    );

-- RLS Policies for payroll_items
CREATE POLICY "View payroll items" ON public.payroll_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.payroll p
            WHERE p.id = payroll_items.payroll_id
            AND (
                p.staff_id IN (SELECT id FROM public.staff WHERE user_id = auth.uid())
                OR
                auth.uid() IN (SELECT owner_id FROM public.schools WHERE id = p.school_id)
            )
        )
    );

CREATE POLICY "Manage payroll items" ON public.payroll_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.payroll p
            WHERE p.id = payroll_items.payroll_id
            AND auth.uid() IN (SELECT owner_id FROM public.schools WHERE id = p.school_id)
        )
    );

-- Function to generate unique staff code
CREATE OR REPLACE FUNCTION generate_staff_code(p_school_id uuid, p_role varchar)
RETURNS varchar AS $$
DECLARE
    v_prefix varchar;
    v_code varchar;
    v_exists boolean;
    v_counter integer := 1;
BEGIN
    -- Set prefix based on role
    CASE p_role
        WHEN 'teacher' THEN v_prefix := 'TCH';
        WHEN 'manager' THEN v_prefix := 'MGR';
        WHEN 'admin' THEN v_prefix := 'ADM';
        WHEN 'support' THEN v_prefix := 'SUP';
        ELSE v_prefix := 'STF';
    END CASE;
    
    -- Generate code with incrementing number
    LOOP
        v_code := v_prefix || LPAD(v_counter::text, 4, '0');
        
        -- Check if code exists for this school
        SELECT EXISTS (
            SELECT 1 FROM public.staff 
            WHERE staff_code = v_code 
            AND school_id = p_school_id
        ) INTO v_exists;
        
        EXIT WHEN NOT v_exists;
        v_counter := v_counter + 1;
    END LOOP;
    
    RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate payroll
CREATE OR REPLACE FUNCTION calculate_staff_payroll(
    p_staff_id uuid,
    p_period_start date,
    p_period_end date
) RETURNS jsonb AS $$
DECLARE
    v_staff record;
    v_base_amount decimal(10,2) := 0;
    v_sessions_count integer := 0;
    v_hours_worked decimal(5,2) := 0;
    v_gross_amount decimal(10,2) := 0;
    v_deductions decimal(10,2) := 0;
    v_net_amount decimal(10,2) := 0;
BEGIN
    -- Get staff details
    SELECT * INTO v_staff FROM public.staff WHERE id = p_staff_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Staff member not found';
    END IF;
    
    -- Calculate based on compensation model
    CASE v_staff.compensation_model
        WHEN 'monthly_salary' THEN
            v_base_amount := v_staff.base_salary;
            
        WHEN 'per_session' THEN
            -- Count sessions taught in period (will be implemented with sessions table)
            v_sessions_count := 0; -- Placeholder
            v_base_amount := v_sessions_count * COALESCE(v_staff.session_rate, 0);
            
        WHEN 'hourly' THEN
            -- Calculate hours worked (will be implemented with attendance/timesheet)
            v_hours_worked := 0; -- Placeholder
            v_base_amount := v_hours_worked * COALESCE(v_staff.hourly_rate, 0);
            
        WHEN 'volunteer' THEN
            v_base_amount := 0;
    END CASE;
    
    -- Calculate gross (before deductions)
    v_gross_amount := v_base_amount; -- + bonuses - will be added later
    
    -- Calculate deductions (placeholder - will be configurable)
    v_deductions := v_gross_amount * 0.1; -- 10% placeholder
    
    -- Calculate net
    v_net_amount := v_gross_amount - v_deductions;
    
    RETURN jsonb_build_object(
        'base_amount', v_base_amount,
        'sessions_count', v_sessions_count,
        'hours_worked', v_hours_worked,
        'gross_amount', v_gross_amount,
        'deductions', v_deductions,
        'net_amount', v_net_amount,
        'currency', v_staff.currency
    );
END;
$$ LANGUAGE plpgsql;

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON public.staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payroll_updated_at BEFORE UPDATE ON public.payroll
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();