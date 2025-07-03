import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixSchoolSettings() {
  console.log('🔧 Fixing schools with null settings...');

  try {
    // Find schools with null settings
    const { data: schools, error: fetchError } = await supabase
      .from('schools')
      .select('id, name, settings')
      .is('settings', null);

    if (fetchError) {
      console.error('❌ Error fetching schools:', fetchError);
      return;
    }

    if (!schools || schools.length === 0) {
      console.log('✅ No schools with null settings found');
      return;
    }

    console.log(`📊 Found ${schools.length} schools with null settings`);

    // Update each school with default settings
    for (const school of schools) {
      console.log(`  Updating school: ${school.name} (${school.id})`);
      
      const { error: updateError } = await supabase
        .from('schools')
        .update({ 
          settings: {
            institution_type: 'public_school',
            age_group: 'both',
            theme: 'orange',
            academic_config: {
              hours_per_class: 1,
              pricing_model: ['per_month']
            }
          }
        })
        .eq('id', school.id);

      if (updateError) {
        console.error(`  ❌ Error updating school ${school.id}:`, updateError);
      } else {
        console.log(`  ✅ Updated school ${school.id}`);
      }
    }

    console.log('✅ Finished fixing school settings');
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the fix
fixSchoolSettings();