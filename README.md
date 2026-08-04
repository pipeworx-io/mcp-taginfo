# mcp-taginfo

OSM Taginfo MCP — statistics on OpenStreetMap tags (keys and key=value pairs).

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `key_values` | OSM Taginfo: list the most common values for an OpenStreetMap key, by frequency (e.g. all amenity= values from "parking" down). Useful for understanding how features are tagged in OSM. Keyless. |
| `tag_stats` | OSM Taginfo: get usage counts (all / nodes / ways / relations) for a specific OpenStreetMap key=value tag, e.g. amenity=cafe. Keyless. |
| `search_keys` | OSM Taginfo: search OpenStreetMap keys by text, ranked by total usage. Useful for discovering how features are tagged in OSM. Keyless. |

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

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

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
