# Codex Collaboration Rules

This repository is shared between Codex and Claude.

Codex owns backend work. Claude owns frontend work.

## Codex Scope

Codex may work in these backend areas:

- `src/AppHost/` (limited)
- `src/Infrastructure/` (limited)
- `src/Intermediary/`
- `src/Modules/`
- `src/SharedKernel/` (readonly, ask me if changes)

Codex may read and edit `src/clients/shared/` only when backend contract work requires shared generated types, API clients, or cross-boundary documentation.

## Planning Requests

- When the user asks for a plan, create or update a descriptive plan file under `requirements/` before doing any implementation or other work.

## .NET Build And Run Safety
- Codex may run `dotnet` commands only outside the sandbox with explicit escalation/approval. Do not run `dotnet` inside the sandbox.
- EF Core migration work belongs to Codex. If a Codex task changes entities, DbContext configuration, or anything else that requires an EF migration, Codex should create/update the EF migration itself using the repository devtools outside the sandbox with explicit escalation/approval.
- Do not create migration handoff files for normal EF migration work.

## Codex Denied Paths

Codex must not read, edit, move, delete, format, lint, test, or generate files in:

- `src/clients/admin/`
- any future folder under `src/clients/` except `src/clients/shared/`
- `requirements/*/done`

Codex must not manually edit `src/clients/shared/api/lib/openapi-types.ts`. When backend API contracts change, Codex may regenerate this file by running the repository OpenAPI TypeScript generator script.

If backend work needs a frontend change, Codex should document the required change for Claude instead of editing frontend files.

## Run migration when there is changes in dbcontext or entity
- Make sure you run module migration after update any changes in <Module>DbContext order Entities, or DbContext Configuration.
- Use devtools to add migrations and update db.

## Handoff Rules
- Backend API or contract changes must describe the affected endpoints, request/response shapes, validation behavior, and any shared types changed under `src/clients/shared/`.
- Keep shared contract files stable and reviewable. Do not mix backend refactors with frontend-facing contract changes unless needed.
- Do not override work from the other assistant. If a file appears outside the allowed scope, leave it untouched and note the handoff needed.
- Files under `requirements/` are primarily Claude-facing frontend implementation documents. Write them so Claude can implement the frontend from the requirement/handoff plus `src/clients/shared/api/api-types.ts`, without needing to read backend code.
- Do not centralize frontend contract property shapes in one generic requirement file. Put the full request/response properties directly in the specific Claude-facing requirement or handoff document for that feature.
