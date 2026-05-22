# Unused Content Files API

Claude: implement an admin media cleanup view/action using the shared content client. Move this file to `requirements/frontend-handoff/done/` after implementation.

## API

Use `src/clients/shared/api/contracts/content.ts`.

Method: `contentClient.listUnusedMediaFiles(query?)`

Endpoint: `GET /api/Content/file-objects/unused`

Auth: `TenantAdminUp`

Query type: `ListUnusedMediaFilesQuery`

Properties:
- `PageNumber?: number`
- `PageSize?: number`
- `Prefix?: string | null`
- `Search?: string | null`
- `SortBy?: string | null`
- `SortDirection?: string | null`

Response type: `ListUnusedMediaFilesResponse`

Response item type: `UnusedMediaFileResponse`

Properties:
- `key: string`
- `url: string`
- `category: string`
- `contentType: string`
- `size: number`
- `lastModified?: string | null`

## Behavior

The API lists objects from tenant object storage and returns only keys that are not present in the Content module `Files` table. Use it to help admins find uploaded R2 objects that were never confirmed into the database.

---

## Completion Summary (2026-05-18)

Implemented in the admin client:

- `src/pages/content/unused-files.tsx`: new admin page. Lists unused storage
  objects in a table (thumbnail, key, category, content type, size, last
  modified) via `contentClient.listUnusedMediaFiles(query)`. Supports search,
  prefix filter, sort field (last modified / size / key) and sort direction,
  refresh, and loading / error / empty states. Per-row actions: copy object
  key and open the file in a new tab. Includes an info banner explaining what
  the list represents.
- `src/configs/routes.ts`: added `contentUnusedFiles: "/content/unused-files"`.
- `src/routes.tsx`: lazy route wired to the new page.
- `src/components/containers/app-layout.tsx`: added "Unused Files" sub-item
  under the Content nav group.

Scope note: pagination uses Previous/Next driven by the returned page length
because the handoff only documents the `items` array of the wrapper response
(no total-count / total-pages fields documented). No delete action was added —
this handoff provides no delete-by-key contract, and the existing
`deleteMediaFiles` contract operates on DB ids that orphaned objects do not
have. The page is intentionally a review/inspection view per the handoff
("Use it to help admins find … objects that were never confirmed").

`npm run lint` (admin): 0 errors. `tsc` clean for the changed/added files
(pre-existing project-wide TS errors in unrelated collections/blog files are
out of scope).
