-- Fix missing generate_student_code function
-- This function was missing and breaking student creation

-- Function to generate unique student code
CREATE OR REPLACE FUNCTION generate_student_code(p_school_id uuid)
RETURNS varchar AS $$
DECLARE
    v_prefix varchar := 'STU';
    v_code varchar;
    v_exists boolean;
    v_counter integer := 1;
BEGIN
    -- Generate code with incrementing number
    LOOP
        v_code := v_prefix || LPAD(v_counter::text, 4, '0');
        
        -- Check if code exists for this school
        SELECT EXISTS (
            SELECT 1 FROM public.students 
            WHERE student_code = v_code 
            AND school_id = p_school_id
        ) INTO v_exists;
        
        EXIT WHEN NOT v_exists;
        v_counter := v_counter + 1;
    END LOOP;
    
    RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION generate_student_code(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_student_code(uuid) TO anon;