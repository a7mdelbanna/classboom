import { supabase } from '../lib/supabase';

export interface Activity {
  id: string;
  school_id: string;
  user_id: string;
  user_name: string;
  action_type: string;
  entity_type?: string;
  entity_id?: string;
  entity_name?: string;
  description: string;
  metadata?: any;
  created_at: string;
}

export class ActivityService {
  static async logActivity(data: {
    action_type: string;
    entity_type?: string;
    entity_id?: string;
    entity_name?: string;
    description: string;
    metadata?: any;
  }): Promise<void> {
    try {
      console.log('📝 Logging activity:', data);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ No user for activity logging');
        return;
      }

      // Get user's school
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (schoolError || !school) {
        console.error('❌ Error getting school for activity:', schoolError);
        return;
      }

      console.log('🏫 Logging activity for school:', school.id);

      // Log the activity using RPC
      const { data: result, error: rpcError } = await supabase.rpc('log_activity', {
        p_school_id: school.id,
        p_user_id: user.id,
        p_user_name: user.user_metadata?.full_name || user.email || 'Unknown',
        p_action_type: data.action_type,
        p_entity_type: data.entity_type || null,
        p_entity_id: data.entity_id || null,
        p_entity_name: data.entity_name || null,
        p_description: data.description,
        p_metadata: data.metadata || {}
      });

      if (rpcError) {
        console.error('❌ RPC error logging activity:', rpcError);
        
        // Fallback: Try direct insert
        console.log('🔄 Trying direct insert...');
        const { error: insertError } = await supabase
          .from('activities')
          .insert({
            school_id: school.id,
            user_id: user.id,
            user_name: user.user_metadata?.full_name || user.email || 'Unknown',
            action_type: data.action_type,
            entity_type: data.entity_type || null,
            entity_id: data.entity_id || null,
            entity_name: data.entity_name || null,
            description: data.description,
            metadata: data.metadata || {}
          });
        
        if (insertError) {
          console.error('❌ Direct insert error:', insertError);
        } else {
          console.log('✅ Activity logged via direct insert');
        }
      } else {
        console.log('✅ Activity logged via RPC:', result);
      }
    } catch (error) {
      console.error('❌ Error logging activity:', error);
      // Don't throw - we don't want activity logging to break the app
    }
  }

  static async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    try {
      console.log('🔍 Fetching recent activities...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ No user found');
        return [];
      }

      // Get user's school
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (schoolError) {
        console.error('❌ Error fetching school:', schoolError);
        return [];
      }

      if (!school) {
        console.log('❌ No school found for user');
        return [];
      }

      console.log('📊 Fetching activities for school:', school.id);

      // Get recent activities for this school only
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('school_id', school.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error fetching activities:', error);
        return [];
      }

      console.log('✅ Activities fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Error in getRecentActivities:', error);
      return [];
    }
  }

  static getActivityIcon(actionType: string): string {
    const iconMap: { [key: string]: string } = {
      'student_added': '👤',
      'student_updated': '✏️',
      'student_deleted': '🗑️',
      'student_invited': '✉️',
      'class_created': '📚',
      'class_updated': '📝',
      'class_deleted': '❌',
      'payment_received': '💰',
      'settings_updated': '⚙️'
    };
    return iconMap[actionType] || '📌';
  }

  static formatActivityTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }
}