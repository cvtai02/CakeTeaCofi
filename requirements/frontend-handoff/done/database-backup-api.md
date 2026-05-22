# Database Backup API

Claude: wire this only into a protected system/admin action if needed. Move this file to `requirements/frontend-handoff/done/` after implementation.

## API Client

Use `src/clients/shared/api/contracts/system.ts`.

Method: `systemClient.createDatabaseBackup()`

Endpoint: `POST /api/internal/database-backups`

Auth: `AdminOnly` / SystemAdmin.

Request: no body.

Response type: `CreateDatabaseBackupResponse`

Properties:
- `bucketName: string`
- `objectKey: string`
- `size: number`
- `startedAt: string`
- `completedAt: string`
- `durationSeconds: number`

## Behavior

The endpoint triggers a PostgreSQL `pg_dump` backup and streams it directly to the configured R2 bucket. It returns after the backup upload finishes. Treat this as a privileged, long-running operation and show loading/error states.

---

## Completion Summary (2026-05-18)

Implemented in the admin client:

- `src/components/containers/api-client-provider.tsx`: wired `SystemClient` /
  `ISystemClient` into the API client context and exported a
  `useSystemClient()` hook.
- `src/pages/system/index.tsx`: new "System" page (protected by the existing
  `PrivateRoute`; the endpoint is additionally `AdminOnly`/SystemAdmin enforced
  server-side). A "Database Backup" card triggers
  `systemClient.createDatabaseBackup()` behind an explicit confirmation dialog
  (privileged action). Shows a long-running in-progress state (spinner +
  "Backup in progress…", button disabled), a destructive error alert on
  failure, and a success result panel rendering bucket name, object key, size,
  started/completed timestamps, and duration from
  `CreateDatabaseBackupResponse`.
- `src/configs/routes.ts`: added `system: "/system"`.
- `src/routes.tsx`: lazy route wired to the new page.
- `src/components/containers/app-layout.tsx`: added a top-level "System" nav
  item.

`npm run lint` (admin): 0 errors. `tsc` clean for the changed/added files
(pre-existing project-wide TS errors in unrelated files are out of scope).
