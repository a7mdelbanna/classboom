#!/usr/bin/env node
// ClassBoom Status Check for Claude

import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log(`
🚀 ClassBoom Project Status
===========================
`);

// 1. Check Git Status
console.log('📁 Git Repository:');
try {
  const branch = execSync('git branch --show-current', { cwd: rootDir }).toString().trim();
  const lastCommit = execSync('git log -1 --oneline', { cwd: rootDir }).toString().trim();
  const remote = execSync('git remote get-url origin', { cwd: rootDir }).toString().trim();
  
  console.log(`   Branch: ${branch}`);
  console.log(`   Last Commit: ${lastCommit}`);
  console.log(`   Remote: ${remote}`);
} catch (e) {
  console.log('   ❌ Not a git repository');
}

// 2. Check Environment
console.log('\n🔧 Environment Setup:');
const envPath = join(rootDir, '.env');
if (existsSync(envPath)) {
  const env = readFileSync(envPath, 'utf8');
  const hasUrl = env.includes('VITE_SUPABASE_URL');
  const hasKey = env.includes('VITE_SUPABASE_ANON_KEY');
  
  console.log(`   .env file: ✅ Exists`);
  console.log(`   Supabase URL: ${hasUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Supabase Key: ${hasKey ? '✅ Set' : '❌ Missing'}`);
} else {
  console.log('   .env file: ❌ Missing');
}

// 3. Check MCP Configuration
console.log('\n🔌 MCP Configuration:');
const mcpPaths = [
  join(rootDir, '.mcp.json'),
  join(rootDir, '.mcp', 'config.json'),
];

mcpPaths.forEach(path => {
  if (existsSync(path)) {
    console.log(`   ${path}: ✅ Exists`);
  }
});

// 4. Check Database Connection
console.log('\n💾 Database Status:');
if (existsSync(envPath)) {
  try {
    const env = {};
    readFileSync(envPath, 'utf8').split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) env[key.trim()] = value.trim();
    });
    
    const supabase = createClient(
      env.VITE_SUPABASE_URL,
      env.VITE_SUPABASE_ANON_KEY
    );
    
    // Quick test
    const { error: schoolsError } = await supabase.from('schools').select('count').limit(1);
    const { data: plans, error: plansError } = await supabase.from('subscription_plans').select('*');
    
    if (schoolsError?.code === '42P01') {
      console.log('   Schools table: ❌ Does not exist (run migrations)');
    } else if (!schoolsError) {
      console.log('   Schools table: ✅ Exists');
    }
    
    if (plans && plans.length > 0) {
      console.log(`   Subscription plans: ✅ ${plans.length} plans loaded`);
    } else if (plansError?.code === '42P01') {
      console.log('   Subscription plans: ❌ Table missing (run migrations)');
    }
    
  } catch (e) {
    console.log('   Connection: ❌ Failed');
  }
} else {
  console.log('   Connection: ❌ No .env file');
}

// 5. Project Structure
console.log('\n📂 Project Structure:');
const dirs = ['src/components', 'src/features', 'src/lib', 'src/styles', 'supabase'];
dirs.forEach(dir => {
  const path = join(rootDir, dir);
  console.log(`   ${dir}: ${existsSync(path) ? '✅' : '❌'}`);
});

// 6. Next Steps
console.log('\n📋 Next Steps:');
console.log('   1. If database tables missing: Run migrations in Supabase dashboard');
console.log('   2. If MCP not working: Restart Claude Code');
console.log('   3. Continue with Phase 1: Authentication implementation');

console.log('\n📖 See CLAUDE.md for full project context');
console.log('✨ Ready to build ClassBoom!\n');