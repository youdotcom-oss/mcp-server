# @youdotcom-oss/mcp

Bin-only STDIO bridge for the hosted You.com MCP server at `https://api.you.com/mcp`.

This package does not register tools locally and does not contain REST tool logic. Its only job is to proxy STDIO MCP traffic to the hosted remote server.

## Quick start

```jsonc
// Add this to your MCP client config (Claude Desktop, Cursor, Windsurf, etc.)
// Free tier — no API key, no signup.
{
  "mcpServers": {
    "you": {
      "command": "npx",
      "args": ["@youdotcom-oss/mcp"],
      "env": { "YDC_PROFILE": "free" }
    }
  }
}
```

If your client supports remote MCP, point it at `https://api.you.com/mcp?profile=free` directly — no local process needed.

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```jsonc
{
  "mcpServers": {
    "you": {
      "command": "npx",
      "args": ["@youdotcom-oss/mcp"],
      "env": { "YDC_PROFILE": "free" }
    }
  }
}
```

Authenticated (all default tools):

```jsonc
{
  "mcpServers": {
    "you": {
      "command": "npx",
      "args": ["@youdotcom-oss/mcp"],
      "env": { "YDC_API_KEY": "<your-key>" }
    }
  }
}
```

### Claude Code

```bash
# Free tier
claude mcp add you -e YDC_PROFILE=free -- npx @youdotcom-oss/mcp

# Authenticated
claude mcp add you -e YDC_API_KEY=<your-key> -- npx @youdotcom-oss/mcp
```

### Cursor

Add to `~/.cursor/mcp.json` (or `.cursor/mcp.json` in a project):

```jsonc
{
  "mcpServers": {
    "you": {
      "command": "npx",
      "args": ["@youdotcom-oss/mcp"],
      "env": { "YDC_PROFILE": "free" }
    }
  }
}
```

### Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

```jsonc
{
  "mcpServers": {
    "you": {
      "command": "npx",
      "args": ["@youdotcom-oss/mcp"],
      "env": { "YDC_PROFILE": "free" }
    }
  }
}
```

### VS Code

Add to your user or workspace `mcp.json`:

```jsonc
{
  "servers": {
    "you": {
      "command": "npx",
      "args": ["@youdotcom-oss/mcp"],
      "env": { "YDC_PROFILE": "free" }
    }
  }
}
```

### Any MCP client (remote)

If your client speaks streamable HTTP, skip the local bridge:

```
https://api.you.com/mcp?profile=free
```

Authenticated:

```
https://api.you.com/mcp
Authorization: Bearer <your-key>
```

## Install

```bash
bun add @youdotcom-oss/mcp
```

Or run it directly:

```bash
npx @youdotcom-oss/mcp
```

## Environment

- `YDC_API_KEY`
  Optional. Sent as `Authorization: Bearer <key>`.
- `YDC_PROFILE`
  Optional. When set to `free`, routes the bridge to `https://api.you.com/mcp?profile=free`.
- `YDC_ALLOWED_TOOLS`
  Optional. Comma-separated hosted tool ids to expose through `https://api.you.com/mcp?tools=...`.

`YDC_PROFILE` takes precedence over `YDC_ALLOWED_TOOLS`.

## Tool exposure

The default hosted MCP URL exposes four tools:

- `you-search`
- `you-contents`
- `you-balance`
- `you-discover`

Two additional tools are available on request:

- `you-finance`
- `you-research`

Request additional tools explicitly with `tools`. `tools` scopes the visible tool set.

Today, `profile=free` is a search-only mode. It overrides `tools` and exposes only `you-search`.

Examples:

- Default tool set: `https://api.you.com/mcp`
- Finance only: `https://api.you.com/mcp?tools=you-finance`
- Search plus finance: `https://api.you.com/mcp?tools=you-search,you-finance`
- Research only: `https://api.you.com/mcp?tools=you-research`
- Free search profile: `https://api.you.com/mcp?profile=free`

## Links

- API keys: [you.com/platform/api-keys](https://you.com/platform/api-keys)
- Platform docs: [documentation.you.com](https://documentation.you.com)
- MCP registry listing: [`io.github.youdotcom-oss/mcp`](https://registry.modelcontextprotocol.io/?q=io.github.youdotcom-oss%2Fmcp)
- Issues: [github.com/youdotcom-oss/mcp/issues](https://github.com/youdotcom-oss/mcp/issues)
- Support: support@you.com

## Contributing

Development setup and code conventions live in [AGENTS.md](./AGENTS.md); contribution flow and PR conventions live in [CONTRIBUTING.md](./CONTRIBUTING.md). Issues and PRs welcome.

## License

MIT — see [LICENSE](./LICENSE).
