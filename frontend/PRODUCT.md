# PRODUCT

## Product

A single-deal reconciliation workspace prototype for a UK motor finance payout team.

## Register

product

## Primary users

- Payout administrator: triage exceptions, raise PAS queries, move deals to payout.

## Secondary users

- Accounts funding reviewer: spot bank/VAT/invoice issues before funding.

## Core jobs to be done

- Decide quickly if a deal is safe to pay out.
- If blocked, understand exactly what failed and why.
- Communicate the exact request back to the broker/dealer (PAS) with evidence.
- Mark items resolved and re-run only what changed (simulated in prototype).

## Product principles

- Exceptions-first: collapse passed checks, pull failures to the top.
- Evidence-first: show side-by-side source values and originating document.
- Explainability: every check shows its rule and evaluation outcome.
- Minimal rework: don’t force “re-check everything” loops.

## Scope constraints (important)

- Single deal only (AF-2026-00417).
- One main screen, optional document drawer.
- No auth, no backend, no real PAS integration.

## Tone

Calm, clear, professional. Short labels, no fluff.

## Brand cues

Match Advantage Finance’s visual feel: light theme, confident navy text, blue accents, friendly but not playful.

## Inputs

Use the repo’s `docs/` markdown documents as the source of truth for the sample deal.
