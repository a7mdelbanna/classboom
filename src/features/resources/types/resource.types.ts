// Resource types and interfaces

export type ResourceType = 
  | 'physical_room' 
  | 'online_meeting' 
  | 'equipment' 
  | 'vehicle' 
  | 'sports_facility' 
  | 'instrument' 
  | 'software_license';

export type ResourceStatus = 'available' | 'occupied' | 'maintenance' | 'reserved' | 'offline';

export type ResourceBookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export type MaintenanceType = 'cleaning' | 'repair' | 'inspection' | 'upgrade';

// Main resource interface
export interface Resource {
  id: string;
  school_id: string;
  
  // Basic info
  resource_type: ResourceType;
  name: string;
  code?: string;
  description?: string;
  
  // Physical location details
  building?: string;
  floor?: string;
  room_number?: string;
  address?: string;
  
  // Capacity and features
  capacity: number;
  features: Record<string, boolean | string | number>; // e.g., { projector: true, whiteboard: true, pianos: 2 }
  
  // Online resource details
  platform?: string; // zoom, teams, google_meet, webex
  account_email?: string;
  account_password_hint?: string;
  meeting_url?: string;
  meeting_id?: string;
  passcode?: string;
  license_limit?: number;
  
  // Availability settings
  is_active: boolean;
  available_from?: string; // time format HH:MM:SS
  available_until?: string;
  days_available?: number[]; // 1=Monday, 7=Sunday
  
  // Booking rules
  min_booking_duration: number; // minutes
  max_booking_duration: number; // minutes
  buffer_time_before: number; // prep time in minutes
  buffer_time_after: number; // cleanup time in minutes
  advance_booking_days: number;
  
  // Approval settings
  requires_approval: boolean;
  approval_roles?: string[];
  
  // Cost tracking
  hourly_rate?: number;
  currency?: string;
  
  // Metadata
  image_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// Resource booking interface
export interface ResourceBooking {
  id: string;
  resource_id: string;
  session_id?: string;
  
  // Booking details
  start_datetime: string;
  end_datetime: string;
  
  // Who booked it
  booked_by?: string;
  booked_for?: string; // Could be external event name
  
  // Status and approval
  status: ResourceBookingStatus;
  approved_by?: string;
  approved_at?: string;
  
  // Conflict resolution
  priority: number;
  is_recurring: boolean;
  recurrence_group_id?: string;
  
  // Usage tracking
  actual_start?: string;
  actual_end?: string;
  
  // Notes
  booking_notes?: string;
  cancellation_reason?: string;
  
  created_at: string;
  updated_at: string;
  
  // Joined data
  resource?: Resource;
  session?: {
    id: string;
    title: string;
    scheduled_date: string;
    start_time: string;
    end_time: string;
  };
}

// Resource set interface
export interface ResourceSet {
  id: string;
  school_id: string;
  name: string;
  description?: string;
  resource_ids: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Joined data
  resources?: Resource[];
}

// Equipment checkout interface
export interface EquipmentCheckout {
  id: string;
  resource_id: string;
  
  // Who has it
  checked_out_to: string;
  checked_out_by?: string;
  
  // When
  checked_out_at: string;
  expected_return: string;
  actual_return?: string;
  returned_to?: string;
  
  // Condition tracking
  condition_before?: string;
  condition_after?: string;
  damage_notes?: string;
  
  // Location tracking
  current_location?: string;
  
  created_at: string;
  
  // Joined data
  resource?: Resource;
  user?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

// Resource maintenance interface
export interface ResourceMaintenance {
  id: string;
  resource_id: string;
  
  // Maintenance window
  start_datetime: string;
  end_datetime: string;
  
  // Details
  maintenance_type?: MaintenanceType;
  description?: string;
  performed_by?: string;
  
  // Recurrence
  is_recurring: boolean;
  recurrence_rule?: string; // RRULE format
  
  // Status
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  completed_at?: string;
  completion_notes?: string;
  
  created_at: string;
  created_by?: string;
  
  // Joined data
  resource?: Resource;
}

// Form data interfaces
export interface ResourceFormData {
  resource_type: ResourceType;
  name: string;
  code?: string;
  description?: string;
  
  // Physical location
  building?: string;
  floor?: string;
  room_number?: string;
  address?: string;
  
  // Capacity and features
  capacity?: number;
  features?: Record<string, boolean | string | number>;
  
  // Online resource
  platform?: string;
  account_email?: string;
  account_password_hint?: string;
  meeting_url?: string;
  meeting_id?: string;
  passcode?: string;
  license_limit?: number;
  
  // Availability
  is_active?: boolean;
  available_from?: string;
  available_until?: string;
  days_available?: number[];
  
  // Booking rules
  min_booking_duration?: number;
  max_booking_duration?: number;
  buffer_time_before?: number;
  buffer_time_after?: number;
  advance_booking_days?: number;
  
  // Approval
  requires_approval?: boolean;
  approval_roles?: string[];
  
  // Cost
  hourly_rate?: number;
  currency?: string;
  
  // Other
  image_url?: string;
  notes?: string;
}

export interface ResourceBookingFormData {
  resource_id: string;
  session_id?: string;
  start_datetime: string;
  end_datetime: string;
  booked_for?: string;
  booking_notes?: string;
  priority?: number;
  is_recurring?: boolean;
}

export interface EquipmentCheckoutFormData {
  resource_id: string;
  checked_out_to: string;
  expected_return: string;
  condition_before?: string;
  current_location?: string;
}

// Filter interfaces
export interface ResourceFilters {
  resource_type?: ResourceType;
  is_active?: boolean;
  building?: string;
  capacity_min?: number;
  capacity_max?: number;
  features?: string[]; // Feature keys to filter by
  search?: string;
}

export interface ResourceBookingFilters {
  resource_id?: string;
  session_id?: string;
  status?: ResourceBookingStatus;
  date_from?: string;
  date_to?: string;
  booked_by?: string;
}

// Availability check interfaces
export interface ResourceAvailabilityCheck {
  resource_id: string;
  start_datetime: string;
  end_datetime: string;
  exclude_booking_id?: string;
}

export interface ResourceAvailabilityResult {
  is_available: boolean;
  conflicting_bookings: Array<{
    id?: string;
    start?: string;
    end?: string;
    session_id?: string;
    booked_for?: string;
    reason?: string;
  }>;
}

// Resource statistics
export interface ResourceStats {
  total_resources: number;
  by_type: Record<ResourceType, number>;
  active_resources: number;
  total_capacity: number;
  utilization_rate: number;
  upcoming_bookings: number;
  maintenance_scheduled: number;
}

// Helper interfaces
export interface ResourceWithAvailability extends Resource {
  next_available?: string;
  is_available_now: boolean;
  current_booking?: ResourceBooking;
}

export interface ResourceConflict {
  resource_id: string;
  resource_name: string;
  conflict_type: 'booking' | 'maintenance' | 'availability';
  message: string;
  conflicting_item?: ResourceBooking | ResourceMaintenance;
}

// Institution-specific resource defaults
export const INSTITUTION_RESOURCE_TYPES: Record<string, ResourceType[]> = {
  'public_school': ['physical_room', 'sports_facility', 'equipment'],
  'private_school': ['physical_room', 'sports_facility', 'equipment', 'online_meeting'],
  'language_center': ['physical_room', 'online_meeting', 'equipment'],
  'fitness_center': ['physical_room', 'sports_facility', 'equipment'],
  'yoga_studio': ['physical_room', 'equipment', 'online_meeting'],
  'music_school': ['physical_room', 'instrument', 'equipment'],
  'cooking_school': ['physical_room', 'equipment'],
  'martial_arts_dojo': ['physical_room', 'sports_facility', 'equipment'],
  'online_school': ['online_meeting', 'software_license'],
  'private_tutor': ['physical_room', 'online_meeting'],
  'daycare_preschool': ['physical_room', 'equipment', 'vehicle']
};

// Common resource features by type
export const RESOURCE_FEATURES: Record<ResourceType, string[]> = {
  'physical_room': ['projector', 'whiteboard', 'smart_board', 'ac', 'heating', 'windows', 'sound_system'],
  'online_meeting': ['screen_sharing', 'recording', 'breakout_rooms', 'whiteboard', 'polls'],
  'equipment': ['portable', 'requires_training', 'consumable', 'fragile'],
  'vehicle': ['seats', 'ac', 'gps', 'first_aid_kit', 'child_locks'],
  'sports_facility': ['indoor', 'outdoor', 'lighting', 'scoreboard', 'seating', 'locker_rooms'],
  'instrument': ['tuned', 'amplified', 'portable', 'beginner_friendly'],
  'software_license': ['multi_user', 'cloud_based', 'offline_capable', 'mobile_app']
};