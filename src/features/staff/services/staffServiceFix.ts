// Temporary fix for getStaffByUserId to handle RLS issues better
// This can be used to replace the existing method in staffService.ts

import { supabase } from '../../../lib/supabase';
import type { Staff } from '../types/staff.types';

export async function getStaffByUserIdFixed(userId: string): Promise<Staff | null> {
  try {
    // First, try to get the staff record without the join
    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (staffError) {
      console.error('Error fetching staff data:', staffError);
      throw new Error(`Failed to fetch staff data: ${staffError.message}`);
    }

    if (!staffData) {
      throw new Error('Staff member not found');
    }

    // Then, separately fetch the school data
    let schoolData = null;
    if (staffData.school_id) {
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .select('id, name, logo_url, address, phone, email')
        .eq('id', staffData.school_id)
        .single();

      if (schoolError) {
        console.warn('Could not fetch school data:', schoolError);
        // Don't throw here, just log the warning
      } else {
        schoolData = school;
      }
    }

    // Combine the data
    return {
      ...staffData,
      full_name: `${staffData.first_name} ${staffData.last_name}`,
      school: schoolData
    };
  } catch (error) {
    console.error('Error in getStaffByUserIdFixed:', error);
    throw error;
  }
}

// Alternative method using RPC function if RLS is still problematic
export async function getStaffByUserIdViaRPC(userId: string): Promise<Staff | null> {
  try {
    const { data, error } = await supabase.rpc('get_staff_with_school', {
      p_user_id: userId
    });

    if (error) {
      console.error('RPC error:', error);
      throw new Error(`Failed to fetch staff data: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error('Staff member not found');
    }

    const staffData = data[0];
    return {
      ...staffData,
      full_name: `${staffData.first_name} ${staffData.last_name}`
    };
  } catch (error) {
    console.error('Error in getStaffByUserIdViaRPC:', error);
    throw error;
  }
}