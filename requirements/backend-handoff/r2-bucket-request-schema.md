# R2 Bucket: Missing Request Body In OpenAPI

## Gap

The shared TS contract declares
`SystemClient.createR2Bucket(input?: CreateR2BucketRequest)`, but
`CreateR2BucketRequest` (generated in
`src/clients/shared/api/types/system.ts` via
`JsonRequestBody<...>`) resolves to `undefined`. That means TypeScript
treats the only allowed argument as `undefined` and rejects any object
literal, including the documented `{ bucketName?: string | null }`.

The handoff (`requirements/frontend-handoff/r2-bucket-management.md`)
references the request DTO at
`src/AppHost/DTOs/R2Buckets/CreateR2BucketRequest.cs` with a
`bucketName?: string | null` property, so the backend definitely accepts a
body — only the OpenAPI document (or the openapi-fetch types it generates)
does not currently expose a request schema for `POST
/api/internal/r2-buckets`.

## Asks

1. Update the OpenAPI document for `POST /api/internal/r2-buckets` so the
   request body schema matches `CreateR2BucketRequest.cs` (`bucketName?:
   string | null`, optional body allowed).
2. Re-run the TS client codegen so
   `JsonRequestBody<CreateR2BucketOperation>` resolves to that shape.

## Workaround (frontend)

`src/pages/system/index.tsx` calls `systemClient.createR2Bucket()` with no
arguments, which lets the backend default the bucket name to the current
tenant signature. The "custom bucket name" input is disabled with an inline
"backend contract pending" hint. The validation helper and result rendering
are already in place and will become live as soon as the request body type
is generated.
