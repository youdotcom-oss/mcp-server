---
description: Maintainer guide for @youdotcom-oss/mcp.
globs: "*.ts, *.tsx, *.js, *.jsx, package.json, AGENTS.md"
alwaysApply: false
---

# @youdotcom-oss/mcp

You.com MCP STDIO bridge for the hosted You.com MCP server.

---

## Behavioral Guidelines

### Think Before Coding

State assumptions. Surface tradeoffs. If multiple interpretations exist,
present them instead of picking silently. If the repo already answers the
question, use the codebase as the source of truth.

### Simplicity First

Make the smallest change that solves the request. Do not add abstractions,
fallbacks, or cleanup outside the task unless the change requires them.

### Surgical Changes

Touch only the files the task needs. Match existing style. Remove imports or
variables you orphan, but leave unrelated code alone.

### Goal-Driven Execution

Turn work into verifiable outcomes. For behavior-changing feature or fix work,
use the `tdd` skill and work in red-green-refactor slices. For docs-only or
instruction-only edits, targeted doc validation is enough.

### Validate Before Handoff

Run the narrowest checks that prove the change. If you skip executable tests,
say why. Before trusting repo docs, verify the current state with `rg`, `find`,
`git log`, or the relevant workflow/package files.

---

## Commands

### Setup

```bash
bun install
cp .env.example .env
source .env
```

### Development

```bash
bun run build
bun run check
bun run check:write
bun test
bun run test:watch
bun run dev
```

`bun run check` runs Biome lint/format and TypeScript type-checking.

---

## Code Rules

- Use relative imports.
- Use explicit `.ts` extensions on local imports.
- Keep public APIs documented with TSDoc.
- Prefer Bun-native APIs and Bun-first commands where practical.
- Use `type` over `interface` for type definitions.
- Use arrow functions (`const fn = () =>`) over function declarations.
- No `any` types — use `unknown` with type guards.
- Object params when >2 args.

---

## Git and GitHub Rules

- Use conventional commits.
- Use `gh` for PRs, issues, comments, and release inspection.

Useful commands:

```bash
gh pr view <number>
gh pr diff <number>
gh issue view <number>
```

---

## CI and Publishing

### Key Workflows

- `ci.yml` builds, checks, and tests on push/PR to main
- `publish-mcp.yml` publishes to npm with provenance, creates a GitHub release, and publishes to the MCP registry
- `droid-review.yml` handles automated PR review
- `semgrep-ci.yml` runs security scanning

### Publishing Rules

- Package releases are triggered through `publish-mcp.yml` workflow dispatch.
- The workflow computes the next version, updates `package.json`, publishes to npm, and creates a GitHub release tag in the form `mcp@v{version}`.
- Non-`main` branches automatically publish prereleases as `x.y.z-next.N`.
- Stable releases also publish `server.json` to the official MCP registry.

---

## Skills

- `tdd` for behavior-changing feature and fix work
- `review-guidelines` for code review conventions
