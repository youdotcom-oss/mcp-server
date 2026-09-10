import { createMcpHandler, McpServer } from '@modelcontextprotocol/server'
import * as z from 'zod'

const createTestServer = () => {
  const mcp = new McpServer(
    { name: 'test-mcp-server', version: '1.0.0' },
    { capabilities: { tools: { listChanged: false } } },
  )

  mcp.registerTool('you-search', { inputSchema: z.object({ query: z.string() }) }, async (args) => {
    const query = (args as { query?: string })?.query

    if (query === 'tool-error') {
      return {
        content: [{ text: 'Error: tool failed', type: 'text' as const }],
        isError: true,
      }
    }

    return {
      content: [{ text: JSON.stringify({ ok: true }), type: 'text' as const }],
      structuredContent: { ok: true },
    }
  })

  return mcp
}

const handler = createMcpHandler(createTestServer, { legacy: 'stateless' })

const mockedFetch: typeof fetch = Object.assign(
  async (input: string | URL | Request, init?: RequestInit | BunFetchRequestInit) => {
    const request =
      input instanceof Request
        ? new Request(input, init)
        : new Request(input instanceof URL ? input.toString() : input, init)
    const traceFile = process.env.YDC_TEST_MCP_TRACE_FILE

    if (traceFile) {
      const body = parseJsonBody(await request.clone().text())
      const { appendFileSync } = await import('node:fs')
      appendFileSync(
        traceFile,
        `${JSON.stringify({ body, headers: Object.fromEntries(request.headers.entries()), method: request.method, url: request.url })}\n`,
      )
    }

    return handler.fetch(request)
  },
  {
    preconnect: globalThis.fetch.preconnect.bind(globalThis.fetch),
  },
)

globalThis.fetch = mockedFetch

const parseJsonBody = (value: string): unknown => {
  if (!value) return undefined
  try {
    return JSON.parse(value) as unknown
  } catch {
    return undefined
  }
}
