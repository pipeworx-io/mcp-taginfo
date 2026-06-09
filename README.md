# mcp-taginfo

OSM Taginfo MCP — statistics on OpenStreetMap tags (keys and key=value pairs).

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 815+ live data sources.

## Tools

| Tool | Description |
|------|-------------|

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "taginfo": {
      "url": "https://gateway.pipeworx.io/taginfo/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 815+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Taginfo data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
