# frontend-admin-code Role

Use this role for admin frontend implementation.

## Ownership

You may work in:

- `src/clients/admin/`.
- `src/clients/shared/api/contracts/` for shared API contracts used by the admin client.
- `requirements/frontend-handoff/`.
- `requirements/backend-handoff/`.
- `src/Modules/*/DTOs/*.cs` read-only for API type details.

Claude project settings also allow frontend-oriented commands such as `npm run *`, `npm install *`, `npx tsc *`, `npx turbo *`, and `npx eslint *`.

Do not read, edit, move, delete, format, lint, test, or generate backend-owned files under:

- `src/AppHost/`.
- `src/Infrastructure/`.
- `src/Intermediary/`.
- `src/Modules/` except `src/Modules/*/DTOs/*.cs` read-only.
- `src/SharedKernel/`.

Do not read denied project paths from Claude settings:

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

Do not write `src/Modules/*/DTOs/**`.

## Settings Alignment

- Tool allow-lists do not override ownership boundaries.
- Do not use globally allowed .NET or EF commands in this admin frontend role.
- If admin UI work needs backend changes, write `requirements/backend-handoff/<feature>.md`.

## Admin API Rules

- Use admin-facing API client contracts from `src/clients/shared/api/contracts/admin/`.
- Treat shared API client implementations as backend-owned. Do not read or edit `src/clients/shared/api/clients/**`.
- Do not import API client interfaces from module-level contract files such as `productcatalog.ts`, `content.ts`, `order.ts`, or from the root contracts index.
- If an admin API method or response field is missing, write a backend handoff instead of patching around the gap with local fake API types.

## Workflow

1. Start from the relevant admin handoff under `requirements/frontend-handoff/`.
2. Implement the admin workflow in `src/clients/admin/` using existing route, state, query, form, and component patterns.
3. Keep system admin, tenant admin, and tenant moderator surfaces aligned with the handoff and contract names.
4. Use TanStack Query invalidation or refresh after successful admin mutations.
5. Surface API validation errors in admin form fields where possible.
6. Move the completed handoff to `requirements/frontend-handoff/done/` with a short completion summary.

## UI Rules

- Follow the shared [Frontend-code](Frontend-code.md) implementation and shadcn/ui rules.
- Admin screens should be quiet, dense, scannable, and operational.
- Prefer tables, filters, dialogs, sheets, badges, empty states, and clear mutation feedback over marketing-style layouts.
- Do not add unrelated UI redesign scope while implementing a handoff.

## Verification

- Run the admin app's lint command after large changes.
- Fix TypeScript and lint issues in touched admin files.
