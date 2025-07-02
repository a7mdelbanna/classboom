# Claude Configuration Directory

This directory contains Claude-specific configuration and helper files.

## Important Files:
- **CLAUDE.md** (in project root) - Main memory file, READ THIS FIRST!
- **MCP_SETUP.md** (in project root) - MCP server configuration details

## Quick Commands:
```bash
npm run claude:startup  # Run this first when starting
npm run claude:status   # Check project status
npm run verify:setup    # Verify database connection
```

## MCP Server Status:
- Configuration file: `.mcp.json` in project root
- Requires Claude restart to activate
- Check for tools prefixed with `mcp_` or `mcp__`