import { afterEach, describe, expect, test } from 'bun:test'
import { randomUUID } from 'node:crypto'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Client } from '@modelcontextprotocol/client'
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio'

const repoRoot = `${import.meta.dir}/../..`

const inheritedEnv = Object.fromEntries(
  Object.entries(process.env).filter((entry): entry is [string, string] => entry[1] !== undefined),
)

const assertNonEmptySearchResult = (value: unknown) => {
  expect(value).toBeDefined()

  if (Array.isArray(value)) {
    expect(value.length).toBeGreaterThan(0)
    return
  }

  if (typeof value === 'object' && value !== null) {
    if ('isError' in value) {
      expect(value.isError).not.toBe(true)
    }

    if ('content' in value && Array.isArray(value.content)) {
      expect(value.content.length).toBeGreaterThan(0)
      return
    }

    expect(Object.keys(value).length).toBeGreaterThan(0)
    return
  }

  if (typeof value === 'string') {
    expect(value.length).toBeGreaterThan(0)
    return
  }

  throw new Error(`Unexpected search result type: ${typeof value}`)
}

const readTrace = async (traceFile: string) => {
  const file = Bun.file(traceFile)
  if (!(await file.exists())) return []
  const content = await file.text()
  return content
    .trim()
    .split('\n')
    .filter(Boolean)
    .map(
      (line) =>
        JSON.parse(line) as {
          body?: { method?: string; params?: { clientInfo?: { name?: string; version?: string } } }
          headers: Record<string, string>
          method: string
          url: string
        },
    )
}

describe('stdio bridge e2e', () => {
  let client: Client | undefined
  let transport: StdioClientTransport | undefined

  afterEach(async () => {
    // Bridge process calls process.exit(0) when the client closes,
    // so transport.close() may throw ConnectionClosed — expected.
    await Promise.allSettled([client?.close(), transport?.close()])
  })

  test('forwards tool listing and tool calls through the stdio bridge', async () => {
    const traceFile = join(tmpdir(), `${randomUUID()}.jsonl`)

    transport = new StdioClientTransport({
      args: ['--preload', './src/tests/fetch-preload.ts', './src/stdio-bridge.ts'],
      command: 'bun',
      cwd: repoRoot,
      env: {
        ...inheritedEnv,
        YDC_ALLOWED_TOOLS: 'you-search',
        YDC_TEST_MCP_TRACE_FILE: traceFile,
      },
      stderr: 'pipe',
    })

    client = new Client({ name: 'mcp-e2e-test', version: '1.0.0' })
    await client.connect(transport)

    const tools = await client.listTools()
    expect(tools.tools.some(({ name }) => name === 'you-search')).toBe(true)

    const result = await client.callTool({
      arguments: { query: 'OpenAI' },
      name: 'you-search',
    })

    assertNonEmptySearchResult(result)

    const trace = await readTrace(traceFile)
    expect(trace.length).toBeGreaterThan(0)
    expect(trace.every(({ url }) => url === 'https://api.you.com/mcp?tools=you-search')).toBe(true)
    expect(
      trace.some(
        ({ body }) =>
          body?.method === 'initialize' &&
          body.params?.clientInfo?.name === 'mcp-e2e-test' &&
          body.params.clientInfo.version === '1.0.0',
      ),
    ).toBe(true)
  })
})
