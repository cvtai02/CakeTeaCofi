# Frontend-code Role

Use this role for frontend implementation, frontend tests, UI behavior, styling, and client workflows.

## Ownership

You may work in:

- `src/clients/`.
- `src/clients/shared/api/contracts/` for API client interfaces and API types.
- `requirements/`.
- `src/Modules/*/DTOs/*.cs` read-only for API type details.

Claude project settings also allow:

- `npm run *`.
- `npm install *`.
- `npx tsc *`.
- `npx turbo *`.
- `npx eslint *`.
- `gh api *`.
- `WebFetch` for `github.com` and `raw.githubusercontent.com`.
- `Skill(shadcn)` and `Skill(shadcn:*)`.

Do not read, edit, move, delete, format, lint, test, or generate backend-owned files under:

- `src/AppHost/`.
- `src/Infrastructure/`.
- `src/Intermediary/`.
- `src/Modules/` except `src/Modules/*/DTOs/*.cs` read-only.
- `src/SharedKernel/`.

Do not read from project paths denied by Claude settings:

- `.git/**`.
- `.github/**`.
- `.vscode/**`.
- `**/bin/**`.
- `**/obj/**`.
- `**/node_modules/**`.
- `**/assets/**`.
- `**/*.log`.
- `**/package-lock.json`.
- `**/openapi-types.ts`.

Do not read, edit, move, delete, format, lint, test, or generate shared API client implementation files:

- `src/clients/shared/api/clients/**`.
- Any other frontend API client implementation files under `src/clients/shared/api/` that are not contract/type declarations.

Do not write:

- `src/Modules/*/DTOs/**`.

## Settings Alignment

- Claude settings are tool permissions, not ownership permissions.
- A globally allowed backend command does not permit frontend roles to read or edit backend source.
- If a command output would expose denied backend implementation files, stop and write a backend handoff instead.
- The project enables all configured MCP servers and the `nekomin-app-agent`; use them only within frontend ownership boundaries.
- Prompt suggestions are enabled through `CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION=1`.

## Handoff Workflow

1. Start from the relevant handoff document under `requirements/frontend-handoff/`.
2. Treat the handoff as the source of frontend behavior, UX expectations, API behavior, and API client methods.
3. Implement the frontend using the listed categorized API contract paths and method names.
4. If backend response data or shared contracts are missing, write a backend handoff under `requirements/backend-handoff/` instead of inventing temporary frontend API types.
5. After implementation, move the handoff document to `requirements/frontend-handoff/done/` with a short completion summary.

## API Client And Types

- Use API client interfaces from `src/clients/shared/api/contracts/`.
- Prefer categorized contracts:
  - `src/clients/shared/api/contracts/admin/`
  - `src/clients/shared/api/contracts/customer/`
- Treat shared API client implementations as backend-owned. Do not read or edit `src/clients/shared/api/clients/**`.
- Do not rely on backend implementation details beyond allowed DTO read-only files.
- Do not create temporary API types unless the handoff explicitly identifies a missing shared contract.

## Frontend Stack

- React.
- TypeScript.
- Vite.
- shadcn/ui.
- TanStack Query.
- Zustand.

## Implementation Rules

- Use existing frontend patterns and components first.
- Break UI into reusable components when it reduces real duplication or clarifies behavior.
- Keep forms and mutation state explicit: loading, success, validation error, and empty states.
- Invalidate or refresh affected TanStack Query queries after successful mutations.
- Surface validation errors from the API in relevant form fields where possible.
- Keep feature behavior aligned with the handoff; avoid unrelated frontend scope.

## shadcn/ui Rules

- Use existing shadcn components before custom markup.
- Use semantic color tokens, built-in variants, and CSS variables instead of raw Tailwind colors.
- Use `gap-*`, not `space-x-*` or `space-y-*`.
- Use `size-*` when width and height are equal.
- Use `truncate` instead of manual overflow truncation classes.
- Use `cn()` for conditional classes.
- Forms use `FieldGroup` and `Field`.
- Input adornments use `InputGroup`, `InputGroupInput`, and `InputGroupAddon`.
- Option sets use `ToggleGroup`.
- Dialog, Sheet, and Drawer must always include a title.
- Empty states use `Empty`.
- Callouts use `Alert`.
- Toast notifications use `sonner`.
- Loading buttons use `Spinner` plus `disabled`; do not use `isLoading` or `isPending` props on `Button`.
- Icons must use the project configured icon library. Icons inside buttons use `data-icon`.

## Verification

- Run `npm run lint` after large changes and fix problems.
- Use the current project package runner.
- Keep patches scoped to frontend-owned files and shared contracts only when required.
