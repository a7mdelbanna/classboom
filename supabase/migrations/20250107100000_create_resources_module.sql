-- Resources/Locations Module: Comprehensive Database Schema
-- Supports physical rooms, online meeting accounts, equipment, and more

-- Resource types enum
CREATE TYPE resource_type AS ENUM (
  'physical_room',
  'online_meeting',
  'equipment',
  'vehicle',
  'sports_facility',
  'instrument',
  'software_license'
);

-- Resource status enum
CREATE TYPE resource_status AS ENUM ('available', 'occupied', 'maintenance', 'reserved', 'offline');

-- Booking status enum
CREATE TYPE resource_booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- 1. Main resources table
CREATE TABLE public.resources (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  
  -- Basic info
  resource_type resource_type NOT NULL,
  name varchar(255) NOT NULL,
  code varchar(50), -- e.g., "ROOM-101", "ZOOM-01"
  description text,
  
  -- Physical location details
  building varchar(100),
  floor varchar(50),
  room_number varchar(50),
  address text, -- For off-site locations
  
  -- Capacity and features
  capacity int DEFAULT 1,
  features jsonb DEFAULT '{}', -- {projector: true, whiteboard: true, ac: true, piano: true}
  
  -- Online resource details
  platform varchar(50), -- zoom, teams, google_meet, webex
  account_email varchar(255),
  account_password_hint text, -- Never store actual password
  meeting_url text,
  meeting_id varchar(100),
  passcode varchar(50),
  license_limit int, -- max participants for online platforms
  
  -- Availability settings
  is_active boolean DEFAULT true,
  available_from time,
  available_until time,
  days_available int[], -- 1=Monday, 7=Sunday
  
  -- Booking rules
  min_booking_duration int DEFAULT 30, -- minutes
  max_booking_duration int DEFAULT 480, -- minutes (8 hours)
  buffer_time_before int DEFAULT 0, -- prep time in minutes
  buffer_time_after int DEFAULT 15, -- cleanup time in minutes
  advance_booking_days int DEFAULT 90, -- how far in advance can book
  
  -- Approval settings
  requires_approval boolean DEFAULT false,
  approval_roles text[], -- Which staff roles can approve
  
  -- Cost tracking (if applicable)
  hourly_rate decimal(10, 2),
  currency varchar(3),
  
  -- Metadata
  image_url text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT unique_resource_code UNIQUE (school_id, code),
  CONSTRAINT valid_capacity CHECK (capacity > 0),
  CONSTRAINT valid_booking_duration CHECK (min_booking_duration > 0 AND max_booking_duration >= min_booking_duration),
  CONSTRAINT valid_buffer_times CHECK (buffer_time_before >= 0 AND buffer_time_after >= 0)
);

-- 2. Resource bookings table
CREATE TABLE public.resource_bookings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id uuid NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.sessions(id) ON DELETE CASCADE,
  
  -- Booking details
  start_datetime timestamptz NOT NULL,
  end_datetime timestamptz NOT NULL,
  
  -- Who booked it (could be for non-session use)
  booked_by uuid REFERENCES auth.users(id),
  booked_for varchar(255), -- Could be external event name if not session
  
  -- Status and approval
  status resource_booking_status DEFAULT 'pending',
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  
  -- Conflict resolution
  priority int DEFAULT 0, -- Higher priority bookings can override
  is_recurring boolean DEFAULT false,
  recurrence_group_id uuid, -- Links recurring bookings
  
  -- Usage tracking
  actual_start timestamptz,
  actual_end timestamptz,
  
  -- Notes
  booking_notes text,
  cancellation_reason text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_booking_times CHECK (end_datetime > start_datetime)
);

-- 3. Resource sets (book multiple resources together)
CREATE TABLE public.resource_sets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  
  name varchar(255) NOT NULL, -- "Science Lab Setup", "Online Class Kit", "Music Room Bundle"
  description text,
  resource_ids uuid[] NOT NULL, -- Array of resource IDs that go together
  
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT unique_set_name UNIQUE (school_id, name),
  CONSTRAINT at_least_one_resource CHECK (array_length(resource_ids, 1) > 0)
);

-- 4. Equipment checkout tracking (for moveable resources)
CREATE TABLE public.equipment_checkouts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id uuid NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  
  -- Who has it
  checked_out_to uuid NOT NULL REFERENCES auth.users(id),
  checked_out_by uuid REFERENCES auth.users(id), -- Who processed the checkout
  
  -- When
  checked_out_at timestamptz DEFAULT now(),
  expected_return timestamptz NOT NULL,
  actual_return timestamptz,
  returned_to uuid REFERENCES auth.users(id), -- Who processed the return
  
  -- Condition tracking
  condition_before text,
  condition_after text,
  damage_notes text,
  
  -- Location tracking
  current_location text,
  
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT checkout_before_return CHECK (
    actual_return IS NULL OR actual_return >= checked_out_at
  )
);

-- 5. Resource maintenance schedule
CREATE TABLE public.resource_maintenance (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id uuid NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  
  -- Maintenance window
  start_datetime timestamptz NOT NULL,
  end_datetime timestamptz NOT NULL,
  
  -- Details
  maintenance_type varchar(100), -- 'cleaning', 'repair', 'inspection', 'upgrade'
  description text,
  performed_by varchar(255),
  
  -- Recurrence
  is_recurring boolean DEFAULT false,
  recurrence_rule text, -- RRULE format for complex patterns
  
  -- Status
  status varchar(50) DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
  completed_at timestamptz,
  completion_notes text,
  
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create indexes for performance
CREATE INDEX idx_resources_school_type ON public.resources(school_id, resource_type);
CREATE INDEX idx_resources_active ON public.resources(is_active) WHERE is_active = true;
CREATE INDEX idx_resource_bookings_resource_date ON public.resource_bookings(resource_id, start_datetime);
CREATE INDEX idx_resource_bookings_session ON public.resource_bookings(session_id);
CREATE INDEX idx_resource_bookings_status ON public.resource_bookings(status);
CREATE INDEX idx_resource_bookings_datetime ON public.resource_bookings(start_datetime, end_datetime);
CREATE INDEX idx_equipment_checkouts_resource ON public.equipment_checkouts(resource_id);
CREATE INDEX idx_equipment_checkouts_user ON public.equipment_checkouts(checked_out_to);
CREATE INDEX idx_equipment_not_returned ON public.equipment_checkouts(expected_return) 
  WHERE actual_return IS NULL;

-- Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_checkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_maintenance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for resources
CREATE POLICY "Users can view resources from their school" ON public.resources
  FOR SELECT USING (
    school_id IN (
      SELECT id FROM public.schools WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage resources for their school" ON public.resources
  FOR ALL USING (
    school_id IN (
      SELECT id FROM public.schools WHERE owner_id = auth.uid()
    )
  );

-- RLS for resource_bookings (need to check via resource)
CREATE POLICY "Users can view bookings for their school resources" ON public.resource_bookings
  FOR SELECT USING (
    resource_id IN (
      SELECT id FROM public.resources WHERE school_id IN (
        SELECT id FROM public.schools WHERE owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage bookings for their school resources" ON public.resource_bookings
  FOR ALL USING (
    resource_id IN (
      SELECT id FROM public.resources WHERE school_id IN (
        SELECT id FROM public.schools WHERE owner_id = auth.uid()
      )
    )
  );

-- Similar policies for other tables
CREATE POLICY "School owners can manage resource_sets" ON public.resource_sets
  FOR ALL USING (
    school_id IN (
      SELECT id FROM public.schools WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "School owners can manage equipment_checkouts" ON public.equipment_checkouts
  FOR ALL USING (
    resource_id IN (
      SELECT id FROM public.resources WHERE school_id IN (
        SELECT id FROM public.schools WHERE owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "School owners can manage resource_maintenance" ON public.resource_maintenance
  FOR ALL USING (
    resource_id IN (
      SELECT id FROM public.resources WHERE school_id IN (
        SELECT id FROM public.schools WHERE owner_id = auth.uid()
      )
    )
  );

-- Function to check resource availability
CREATE OR REPLACE FUNCTION check_resource_availability(
  p_resource_id uuid,
  p_start_datetime timestamptz,
  p_end_datetime timestamptz,
  p_exclude_booking_id uuid DEFAULT NULL
)
RETURNS TABLE (
  is_available boolean,
  conflicting_bookings jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_conflicts jsonb;
  v_resource resources;
  v_day_of_week int;
  v_start_time time;
  v_end_time time;
BEGIN
  -- Get resource details
  SELECT * INTO v_resource FROM public.resources WHERE id = p_resource_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, '[]'::jsonb;
    RETURN;
  END IF;
  
  -- Check if resource is active
  IF NOT v_resource.is_active THEN
    RETURN QUERY SELECT false, '[{"reason": "Resource is not active"}]'::jsonb;
    RETURN;
  END IF;
  
  -- Check day availability
  v_day_of_week := EXTRACT(ISODOW FROM p_start_datetime);
  IF v_resource.days_available IS NOT NULL AND 
     NOT (v_day_of_week = ANY(v_resource.days_available)) THEN
    RETURN QUERY SELECT false, '[{"reason": "Resource not available on this day"}]'::jsonb;
    RETURN;
  END IF;
  
  -- Check time availability
  v_start_time := p_start_datetime::time;
  v_end_time := p_end_datetime::time;
  
  IF v_resource.available_from IS NOT NULL AND v_start_time < v_resource.available_from THEN
    RETURN QUERY SELECT false, '[{"reason": "Booking starts before resource available time"}]'::jsonb;
    RETURN;
  END IF;
  
  IF v_resource.available_until IS NOT NULL AND v_end_time > v_resource.available_until THEN
    RETURN QUERY SELECT false, '[{"reason": "Booking ends after resource available time"}]'::jsonb;
    RETURN;
  END IF;
  
  -- Check for conflicting bookings (including buffer times)
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', rb.id,
      'start', rb.start_datetime,
      'end', rb.end_datetime,
      'session_id', rb.session_id,
      'booked_for', rb.booked_for
    )
  )
  INTO v_conflicts
  FROM public.resource_bookings rb
  WHERE rb.resource_id = p_resource_id
    AND rb.status IN ('confirmed', 'pending')
    AND (p_exclude_booking_id IS NULL OR rb.id != p_exclude_booking_id)
    AND (
      -- Check with buffer times
      (rb.start_datetime - (v_resource.buffer_time_before || ' minutes')::interval, 
       rb.end_datetime + (v_resource.buffer_time_after || ' minutes')::interval) 
      OVERLAPS 
      (p_start_datetime, p_end_datetime)
    );
  
  IF v_conflicts IS NULL THEN
    v_conflicts := '[]'::jsonb;
  END IF;
  
  -- Check maintenance windows
  IF EXISTS (
    SELECT 1 FROM public.resource_maintenance rm
    WHERE rm.resource_id = p_resource_id
      AND rm.status IN ('scheduled', 'in_progress')
      AND (rm.start_datetime, rm.end_datetime) OVERLAPS (p_start_datetime, p_end_datetime)
  ) THEN
    v_conflicts := v_conflicts || '[{"reason": "Resource under maintenance during this time"}]'::jsonb;
  END IF;
  
  RETURN QUERY SELECT 
    jsonb_array_length(v_conflicts) = 0,
    v_conflicts;
END;
$$;

-- Function to find alternative resources
CREATE OR REPLACE FUNCTION find_alternative_resources(
  p_resource_id uuid,
  p_start_datetime timestamptz,
  p_end_datetime timestamptz
)
RETURNS TABLE (
  resource_id uuid,
  resource_name text,
  resource_type resource_type,
  capacity int,
  features jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_resource resources;
BEGIN
  -- Get the original resource details
  SELECT * INTO v_resource FROM public.resources WHERE id = p_resource_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Find similar resources
  RETURN QUERY
  SELECT 
    r.id,
    r.name,
    r.resource_type,
    r.capacity,
    r.features
  FROM public.resources r
  WHERE r.school_id = v_resource.school_id
    AND r.id != p_resource_id
    AND r.resource_type = v_resource.resource_type
    AND r.is_active = true
    AND (v_resource.capacity IS NULL OR r.capacity >= v_resource.capacity)
    AND NOT EXISTS (
      -- No conflicting bookings
      SELECT 1 FROM public.resource_bookings rb
      WHERE rb.resource_id = r.id
        AND rb.status IN ('confirmed', 'pending')
        AND (rb.start_datetime, rb.end_datetime) OVERLAPS (p_start_datetime, p_end_datetime)
    )
  ORDER BY 
    -- Prefer resources with similar features
    (SELECT COUNT(*) FROM jsonb_each(r.features) f 
     WHERE v_resource.features ? f.key) DESC,
    r.capacity ASC;
END;
$$;

-- Add triggers for updated_at
CREATE TRIGGER set_resources_updated_at BEFORE UPDATE ON public.resources 
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_resource_bookings_updated_at BEFORE UPDATE ON public.resource_bookings 
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_resource_sets_updated_at BEFORE UPDATE ON public.resource_sets 
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Add helpful comments
COMMENT ON TABLE public.resources IS 'School resources including rooms, equipment, and online meeting accounts';
COMMENT ON TABLE public.resource_bookings IS 'Tracks resource reservations for sessions and other events';
COMMENT ON TABLE public.resource_sets IS 'Groups of resources that are commonly booked together';
COMMENT ON TABLE public.equipment_checkouts IS 'Tracks portable equipment loans to staff/students';
COMMENT ON TABLE public.resource_maintenance IS 'Scheduled and completed maintenance for resources';