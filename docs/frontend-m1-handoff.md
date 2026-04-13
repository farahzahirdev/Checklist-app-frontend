# Frontend Milestone 1 Handoff

## Goal
Ship a handoff-ready frontend structure for Milestone 1 where the next developer can continue implementation with minimal ambiguity.

## Scope Included
- Customer routes: dashboard, assessment shell, reports shell, resources.
- Admin routes: checklist schema management tree (checklist -> sections -> questions).
- Shared checklist schema contracts and API service stubs.
- Evidence upload UX constraints: pdf/png/jpg up to 25MB, note optional, evidence optional.

## Priority Order
1. Admin checklist schema management (core).
2. Customer assessment shell.
3. Reports shell and resources.

## Core Contracts
- `src/lib/checklist-types.ts` contains canonical schema and enums.
- `src/lib/checklist-api.ts` contains typed async stubs. Replace mock returns with real API calls without changing method signatures.
- `src/lib/checklist-mocks.ts` provides placeholder data while backend endpoints are being completed.
- `src/lib/upload-rules.ts` defines evidence constraints.

## Required Question Fields
- `securityLevel`
- `questionId`
- `auditType`
- `legalRequirement`
- `explanation`
- `expectedImplementation`
- `points`
- `customerAnswerStatus`

Optional fields:
- `note`
- `evidence`

## Route Map
### Customer
- `/dashboard`
- `/assessment`
- `/reports`
- `/resources`

### Admin
- `/admin/checklists`
- `/admin/checklists/new`
- `/admin/checklists/[checklistId]`
- `/admin/checklists/[checklistId]/sections/new`
- `/admin/checklists/[checklistId]/sections/[sectionId]`
- `/admin/checklists/[checklistId]/sections/[sectionId]/questions/new`
- `/admin/checklists/[checklistId]/sections/[sectionId]/questions/[questionId]`

## Backend Touchpoints (Planned)
- Checklist list/create/update/delete.
- Section list/create/update/delete/reorder.
- Question list/create/update/delete/reorder.
- Report summary/findings/export.
- Assessment answer/evidence save endpoints.

## Implementation Notes
- Keep all form and table states typed with `checklist-types.ts`.
- Add real validation (zod or equivalent) where comments indicate required fields.
- Keep upload constraints in one place (`upload-rules.ts`) and reuse everywhere.
- Add loading/error/empty states before production release.

## Quick Smoke Checklist
1. Every route loads without runtime error.
2. Admin flow can navigate checklist -> section -> question pages.
3. Reports page renders all requested sections with mock data.
4. Assessment page shows section sidebar, current question, and evidence rules.
