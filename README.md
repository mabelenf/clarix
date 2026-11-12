# Clarix

Clarix is a portfolio project exploring an AI-assisted business process diagnosis workflow. The product idea is simple: a user explains a slow or broken process, the assistant helps map the current state, identifies the biggest gaps, and proposes a more effective future process with a concrete action plan.

This repository is the MVP prototype of that idea, not a completed SaaS product. The current code focuses on the guided analysis flow, AI-generated outputs, and a landing page that captures leads.

## What problem it solves

Many teams know a process is inefficient, but they do not have a structured way to:

- describe the current process clearly
- identify bottlenecks and root causes
- define what success should look like
- turn findings into an actionable plan

Clarix attempts to replace that discovery gap with a guided, AI-assisted workflow.

## What is implemented today

The current app contains:

- a marketing landing page for Clarix
- a lead-capture form for diagnosis / consultation requests
- an analysis wizard for the process diagnosis flow
- Anthropic-powered prompts for six phases of analysis
- generated diagrams for AS-IS and TO-BE states
- a final action-plan view that can be printed for presentation

The implementation is centered in:

- `app/page.tsx` — landing page and lead capture
- `app/analyze/page.tsx` — guided diagnosis workflow
- `app/api/analyze/route.ts` — phase 1 summary
- `app/api/analyze/phase2/route.ts` — AS-IS analysis and diagrams
- `app/api/analyze/phase3/route.ts` — success vision and metrics
- `app/api/analyze/phase4/route.ts` — TO-BE proposal and timeline
- `app/api/analyze/phase5/route.ts` — gap prioritization
- `app/api/analyze/phase6/route.ts` — action plan and timeline
- `supabase/migrations/create_leads_table.sql` — basic lead storage schema

## Current status and product maturity

This repo is currently best understood as a functional prototype of a diagnosis workflow.

It does not yet include all of the product elements described in the original concept document:

- no real user authentication
- no persisted analysis sessions per user
- no Stripe billing or plan management
- no server-generated PDF export
- no complete SaaS backend around saved reports and teams

The goal of this repository is to demonstrate the product idea and validate the workflow, not to ship a final business application.

## How the analysis flow works

The product currently follows six phases:

1. Context & positioning
2. AS-IS process analysis
3. Outcome definition
4. TO-BE proposal
5. Gap analysis
6. Action plan

A complete spec comparing the original plan against the current implementation is in `docs/specs/clarix.md`.

## Tech stack

- Next.js 16
- React 19
- TypeScript
- Anthropic API
- Supabase
- Tailwind CSS

## Local setup

Requirements:

- Node.js 18+ or a compatible version
- npm
- an Anthropic API key in environment variables

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

Open http://localhost:3000

Set environment variables before running the AI flows:

```bash
export ANTHROPIC_API_KEY=your_key_here
```

## Useful files to explore

- `app/page.tsx` — landing page and conversion flow
- `app/analyze/page.tsx` — the main product flow
- `app/api/analyze/phase2/route.ts` — how the AS-IS analysis is generated
- `app/api/analyze/phase5/route.ts` — gap classification logic
- `app/api/analyze/phase6/route.ts` — action plan generation
- `docs/specs/clarix.md` — current product specification and pending decisions

## Demo idea

To understand the project without configuring the API, the easiest way is to use the UI as a mock workflow:

- choose a business process such as customer support, logistics, or operations
- describe the current pain points
- list the goals to improve
- review the generated AS-IS analysis and identified bottlenecks
- inspect the proposed TO-BE flow and the final gap list
- review the action plan and timeline

This gives a clear view of the product value even before evaluating the AI prompts or integrating production infrastructure.

## Documentation status

This README and the specification under `docs/specs/clarix.md` are part of the documentation-first PR for the project.

The documentation is intentionally explicit about:

- what the code does today
- what the original concept envisioned
- what is still undecided and requires product input

The most important open decision is the Quick Wins rule, which is documented in the specification and remains pending confirmation.

## Contributor note

This repository is organized to support a portfolio narrative: concept → prototype → specification → product decisions.

The goal is not to pretend the project is already a full SaaS; it is to show a well-documented MVP path with an honest view of what is built and what still remains to decide.
