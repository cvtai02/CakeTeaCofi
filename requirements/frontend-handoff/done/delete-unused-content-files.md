# Delete Unused Content Files API

Claude: add delete action for unused content files. Move this file to `requirements/frontend-handoff/done/` after implementation.

## API Client

Use `src/clients/shared/api/contracts/content.ts`.

## Methods

`contentClient.listUnusedMediaFiles(query?)`

Already exists. Use it to display selectable unused object-storage files.

`contentClient.deleteUnusedMediaFiles(input)`

Endpoint: `DELETE /api/Content/file-objects/unused`

Auth: `TenantAdminUp`

Request type: `DeleteUnusedMediaFilesRequest`

Properties:
- `keys: string[]`

Response type: `DeleteUnusedMediaFilesResponse`

Properties:
- `deletedCount: number`
- `deletedKeys: string[]`

## Behavior

The backend re-checks every selected key against `Content.Files` before deleting from object storage.

If any selected key is now registered in the database, the API returns validation error and deletes nothing.

Use selected `UnusedMediaFileResponse.key` values as request keys.
