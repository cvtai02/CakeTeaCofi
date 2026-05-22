# Import And Delete Content Files API

Claude: update the content file manager to import unused storage files and delete registered files by key. Move this file to `requirements/frontend-handoff/done/` after implementation.

## API Client

Use `src/clients/shared/api/contracts/content.ts`.

## Import Unused Files

Method: `contentClient.importUnusedMediaFiles(input)`

Endpoint: `POST /api/Content/file-objects/unused/import`

Auth: `TenantAdminUp`

Request type: `ImportUnusedMediaFilesRequest`

Properties:
- `keys: string[]`

Response type: `ImportUnusedMediaFilesResponse`

Properties:
- `files: UploadResponse[]`

Behavior:
- Use selected `UnusedMediaFileResponse.key` values.
- Backend reads metadata from object storage and creates `Content.Files` rows for keys missing in the database.
- Existing imported keys are returned as normal file responses and are not duplicated.

## Delete Registered Files By Key

Method: `contentClient.deleteMediaFilesByKeys(input)`

Endpoint: `DELETE /api/Content/file-objects/by-keys`

Auth: `TenantAdminUp`

Request type: `DeleteMediaFilesByKeysRequest`

Properties:
- `keys: string[]`

Response type: `DeleteMediaFilesByKeysResponse`

Properties:
- `deletedCount: number`
- `deletedKeys: string[]`

Behavior:
- Use keys from registered media files, not unused files.
- Backend rejects deletion if any selected key is still referenced by blog/gallery/content usage checkers.
- When accepted, backend deletes objects from storage and removes the `Content.Files` rows.

## Existing Delete Unused Files

Use `contentClient.deleteUnusedMediaFiles(input)` for R2-only files that are not in `Content.Files`.
