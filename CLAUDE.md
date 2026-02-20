# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

n8n community node package that provides a "Dynamic Node" — a wrapper node that accepts arbitrary n8n node JSON at runtime, constructs a sub-workflow around it, and executes it. This allows users to parameterize node configuration with expressions (`{{ $json.xxx }}`).

## Build & Lint Commands

```bash
npm run build        # tsc && gulp build:icons (compiles TS + copies SVG/PNG to dist/)
npm run lint         # eslint on nodes/**/*.{ts,js} and package.json
npm run lint:fix     # eslint with --fix
```

No test framework is configured. Validation is done via `npm run lint` and manual testing in an n8n instance.

## Architecture

The entire node lives in `nodes/DynamicNode/`:

- **DynamicNode.node.ts** — Single `INodeType` implementation. The `execute()` method:
  1. Enforces exactly 1 input item per call
  2. Parses the `nodeJson` parameter (string or object), extracts `raw.nodes[0]` if given a full workflow export
  3. Strips `connections`, `pinData`, `meta` from the node JSON
  4. Appends `" - Dynamic Node"` to the node name, assigns a UUID `id`
  5. Deep-clones `subWorkflowTemplate.json`, pushes the target node in, wires Execute Workflow Trigger → target node
  6. Calls `this.executeWorkflow({ code: template }, items)` to run the sub-workflow
  7. Normalizes the result (handles array, `{ data: [...] }`, null, or unexpected shapes)

- **subWorkflowTemplate.json** — Minimal workflow skeleton: an Execute Workflow Trigger node connected to a `__PLACEHOLDER__` node name that gets replaced at runtime.

## Code Style

- Tabs (2-space width), single quotes, semicolons, trailing commas
- Prettier config in `.prettierrc`; ESLint 9.x flat config in `eslint.config.cjs`
- Uses `eslint-plugin-n8n-nodes-base` for community node validation rules
- Target: ES2022, CommonJS modules, strict TypeScript

## Key Constraints

- n8n API version 1 (`package.json` → `n8n.n8nNodesApiVersion`)
- `n8n-workflow` is a peer/dev dependency (provided by n8n at runtime, not bundled)
- Node engine >=20
- Published to npm as public package; only `dist/` is included in the package
- Deployed via GitHub Actions with npm OIDC Trusted Publisher (tokenless auth)
