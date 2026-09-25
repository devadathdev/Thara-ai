---
name: archify
description: Create polished, validated architecture, workflow, sequence, data-flow, and lifecycle/state diagrams as explorable standalone HTML with motion and crisp export. Use when THARA needs system architecture, workflow, sequence, data-flow, or lifecycle visualization.
license: MIT
metadata:
  version: "2.13"
  author: tt-a1i
---
# Archify for THARA

Archify is integrated as THARA's architecture-visualization skill. The upstream project is a local Node.js renderer that turns typed JSON IR into self-contained interactive HTML.

## THARA usage
- Architecture: map THARA components, trust boundaries, services and gateways.
- Workflow: visualize mission planning, approval and execution gates.
- Sequence: visualize API/auth/tool call chains.
- Data Flow: visualize research, datasets, memory and telemetry lineage.
- Lifecycle: visualize mission and device states.

## Source
Upstream: https://github.com/tt-a1i/archify
License: MIT.

## Local rendering
The repository CI workflow installs the upstream renderer into a temporary workspace and runs:
`node archify/bin/archify.mjs validate <type> <candidate.json> --quality showcase --json`
followed by:
`node archify/bin/archify.mjs deliver <type> <candidate.json> <output.html> --quality showcase --json`

Do not claim an Archify artifact exists until validation/delivery has completed successfully.

## Safety
Architecture diagrams are descriptive. They must not imply physical execution, authorization, production ownership, security posture, or live infrastructure unless those facts are explicitly represented in the source evidence.
