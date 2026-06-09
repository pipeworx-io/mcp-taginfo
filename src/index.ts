interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * OSM Taginfo MCP — statistics on OpenStreetMap tags (keys and key=value pairs).
 * Keyless. https://taginfo.openstreetmap.org/api/4
 */


const BASE = 'https://taginfo.openstreetmap.org/api/4';
const UA = 'pipeworx/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'key_values',
    description:
      'OSM Taginfo: list the most common values for an OpenStreetMap key, by frequency (e.g. all amenity= values from "parking" down). Useful for understanding how features are tagged in OSM. Keyless.',
    inputSchema: {
      type: 'object',
      properties: {
        key: { type: 'string', description: 'An OSM key, e.g. "amenity", "highway", "cuisine".' },
        limit: { type: 'number', description: 'Max values to return (default 20, max 100).' },
      },
      required: ['key'],
    },
  },
  {
    name: 'tag_stats',
    description:
      'OSM Taginfo: get usage counts (all / nodes / ways / relations) for a specific OpenStreetMap key=value tag, e.g. amenity=cafe. Keyless.',
    inputSchema: {
      type: 'object',
      properties: {
        key: { type: 'string', description: 'An OSM key, e.g. "amenity".' },
        value: { type: 'string', description: 'An OSM value for that key, e.g. "cafe".' },
      },
      required: ['key', 'value'],
    },
  },
  {
    name: 'search_keys',
    description:
      'OSM Taginfo: search OpenStreetMap keys by text, ranked by total usage. Useful for discovering how features are tagged in OSM. Keyless.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Text to search keys for, e.g. "cuisine".' },
        limit: { type: 'number', description: 'Max keys to return (default 20).' },
      },
      required: ['query'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  try {
    switch (name) {
      case 'key_values': {
        const key = reqStr(args, 'key', '"amenity"');
        const limit = clampInt(args.limit, 20, 1, 100);
        const json = (await get(
          `/key/values?key=${encodeURIComponent(key)}&page=1&rp=${limit}&sortname=count&sortorder=desc`,
        )) as TaginfoResponse;
        const values = (json.data ?? []).map((d) => ({
          value: d.value,
          count: d.count,
          fraction: d.fraction,
          description: d.description,
        }));
        return { key, total: json.total, values };
      }
      case 'tag_stats': {
        const key = reqStr(args, 'key', '"amenity"');
        const value = reqStr(args, 'value', '"cafe"');
        const json = (await get(
          `/tag/stats?key=${encodeURIComponent(key)}&value=${encodeURIComponent(value)}`,
        )) as TaginfoResponse;
        const counts: Record<string, number> = { all: 0, nodes: 0, ways: 0, relations: 0 };
        for (const d of json.data ?? []) {
          if (d.type && d.type in counts) counts[d.type] = d.count ?? 0;
        }
        return { key, value, counts };
      }
      case 'search_keys': {
        const query = reqStr(args, 'query', '"cuisine"');
        const limit = clampInt(args.limit, 20, 1, 1000);
        const json = (await get(
          `/keys/all?page=1&rp=${limit}&query=${encodeURIComponent(query)}&sortname=count_all&sortorder=desc`,
        )) as TaginfoResponse;
        const keys = (json.data ?? []).map((d) => ({
          key: d.key,
          count: d.count_all,
          distinct_values: d.values_all,
          in_wiki: d.in_wiki,
        }));
        return { count: json.total, keys };
      }
      default:
        return { error: `Unknown tool: ${name}` };
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

interface TaginfoEntry {
  value?: string;
  count?: number;
  fraction?: number;
  description?: string;
  type?: string;
  key?: string;
  count_all?: number;
  values_all?: number;
  in_wiki?: boolean;
}

interface TaginfoResponse {
  total?: number;
  data?: TaginfoEntry[];
}

async function get(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: 'application/json', 'User-Agent': UA },
  });
  if (!res.ok) throw new Error(`Taginfo: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim())
    throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  return v;
}

function clampInt(v: unknown, def: number, min: number, max: number): number {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
  if (!Number.isFinite(n)) return def;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
