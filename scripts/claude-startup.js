#!/usr/bin/env node
// ClassBoom Claude Startup Script - RUN THIS FIRST!

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log(`
🚀 ClassBoom Claude Startup
===========================

Welcome back to ClassBoom! Let me check where we left off...
`);

// Show git status
console.log('📁 Git Status:');
try {
  const status = execSync('git status --short', { cwd: rootDir }).toString();
  if (status.trim()) {
    console.log('   Uncommitted changes:');
    console.log(status);
  } else {
    console.log('   ✅ All changes committed');
  }
} catch (e) {
  console.log('   ❌ Error checking git status');
}

// Run the full status check
console.log('\n📊 Running full status check...\n');
execSync('npm run claude:status', { cwd: rootDir, stdio: 'inherit' });

// Check for MCP tools
console.log(`
🔌 MCP Server Check
===================

IMPORTANT: Check if MCP tools are available!

1. Look for tools starting with 'mcp_' or 'mcp__'
2. Try using the Task tool to list all available tools
3. If MCP tools are found, you can run migrations directly!

If NOT, the user needs to manually run migrations at:
https://supabase.com/dashboard/project/hokgyujgsvdfhpfrorsu/sql/new

File to run: supabase/setup-classboom.sql
`);

// Show next steps
console.log(`
📋 Next Steps
=============

1. First, check if MCP tools are available (see above)
2. Run database migrations (via MCP or manually)
3. Verify with: npm run verify:setup
4. Once database is ready, start building authentication:
   - LoginPage.tsx
   - SignupPage.tsx
   - TrialWizard.tsx
   - Email verification
   - Theme selector

📖 Read CLAUDE.md for full context!
`);

console.log('\n✨ Ready to continue building ClassBoom!\n');