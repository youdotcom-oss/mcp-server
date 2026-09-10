#!/usr/bin/env node
import { StreamableHTTPClientTransport, type Transport } from '@modelcontextprotocol/client'
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio'

const url = new URL('https://api.you.com/mcp')
const headers: Record<string, string> = {}

if (process.env.YDC_API_KEY) {
  headers.Authorization = `Bearer ${process.env.YDC_API_KEY}`
}

if (process.env?.YDC_PROFILE === 'free') {
  url.searchParams.set('profile', process.env?.YDC_PROFILE)
} else if (process.env?.YDC_ALLOWED_TOOLS) {
  url.searchParams.set('tools', process.env.YDC_ALLOWED_TOOLS)
}

const createBridge = (stdio: Transport, http: Transport): void => {
  let closing = false

  const shutdown = (): void => {
    if (closing) return
    closing = true
    void Promise.allSettled([stdio.close(), http.close()]).then(() => process.exit(0))
  }

  const terminate =
    (label: string) =>
    (error: unknown): void => {
      if (closing) return
      process.stderr.write(`${label} error: ${error}\n`)
      closing = true
      void Promise.allSettled([stdio.close(), http.close()]).then(() => process.exit(1))
    }

  stdio.onmessage = (message) => {
    void http.send(message).catch(terminate('HTTP send'))
  }
  http.onmessage = (message) => {
    void stdio.send(message).catch(terminate('STDIO send'))
  }

  stdio.onerror = terminate('STDIO') as (error: Error) => void
  http.onerror = terminate('HTTP') as (error: Error) => void

  http.onclose = shutdown
  stdio.onclose = shutdown
}

try {
  const stdio = new StdioServerTransport()
  const http = new StreamableHTTPClientTransport(url, { requestInit: { headers } })

  createBridge(stdio, http)

  await http.start()
  await stdio.start()
} catch (error) {
  process.stderr.write(`Failed to start STDIO bridge: ${error}\n`)
  process.exit(1)
}
