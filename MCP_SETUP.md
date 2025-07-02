# ClassBoom MCP Server Setup Guide

## Current Issue
The MCP server configuration is set up but requires Claude to be restarted to activate the tools.

## What We've Done
1. ✅ Created `.mcp.json` in the project root
2. ✅ Configured with the official Supabase MCP server package
3. ✅ Added project reference and access token

## Current Configuration
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref=hokgyujgsvdfhpfrorsu"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_208aa30e6b741f0720c09bcc6ee26badd33f2d89"
      }
    }
  }
}
```

## Access Token Status
✅ **Confirmed**: The token `sbp_208aa30e6b741f0720c09bcc6ee26badd33f2d89` is the Personal Access Token.
This is the correct token type for the MCP server.

## To Activate MCP Server

1. **Save all work** and commit changes
2. **Restart Claude Code**
3. **After restart**, check for MCP tools by looking for:
   - Tools that start with `mcp_` or `mcp__` prefix
   - Or check the MCP status with `/mcp` command in Claude

## Alternative: Direct Database Access
If MCP doesn't work, we can still use the Supabase JavaScript SDK with the service role key for direct database operations. The migration SQL is ready at `supabase/setup-classboom.sql`.

## Verifying MCP is Working
After restart, run:
```bash
# In Claude, check if MCP tools are available
# Look for tools like:
# - mcp__supabase__create_table
# - mcp__supabase__query_data
# - mcp__supabase__manage_schema
```

## If MCP Still Doesn't Work
1. Check if you need a Personal Access Token instead of service role key
2. Try adding `--read-only` flag for safety
3. Enable specific features with `--features=database,docs`

## Next Steps After MCP Activation
Once MCP is working, we can:
1. Run database migrations directly through MCP
2. Query and manage the database
3. Create tables and schemas programmatically
4. Continue with ClassBoom authentication implementation