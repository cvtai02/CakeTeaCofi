# R2 Bucket Management

Move this file to `requirements/frontend-handoff/done/` after frontend implementation.

## Endpoint

- `POST /api/internal/r2-buckets`
- Auth: `SystemAdmin` / `Policies.AdminOnly`
- Creates a Cloudflare R2 bucket or returns the existing bucket result.

## Request

DTO: `src/AppHost/DTOs/R2Buckets/CreateR2BucketRequest.cs`

```ts
{
  bucketName?: string | null
}
```

If `bucketName` is empty, backend uses the current tenant signature as the bucket name.

## Response

DTO: `src/AppHost/DTOs/R2Buckets/R2BucketResponse.cs`

```ts
{
  bucketName: string
  created: boolean
  checkedAt: string
}
```

`created = false` means the bucket already exists.

## Shared Client

Use:

- `AdminApiClient.system.createR2Bucket(input)`
- `SystemClient.createR2Bucket(input)`

Contract files:

- `src/clients/shared/api/clients/system.ts`
- `src/clients/shared/api/contracts/system.ts`
- `src/clients/shared/api/types/system.ts`

## Validation

Bucket names must be lowercase, 3-63 chars, only letters/numbers/hyphens, start/end with letter or number, not contain consecutive hyphens, and not be an IP address.

---

## Completion Summary (2026-05-19)

Wired into the existing admin System page (`src/clients/admin/src/pages/system/index.tsx`):

- New `R2BucketSection` card next to the Database Backup card. Calls
  `systemClient.createR2Bucket()` and surfaces the response
  (`bucketName`, `created`, `checkedAt`) with a badge for "Newly created"
  vs. "Already existed", plus failure / pending states (toast + inline
  alert).
- A `validateBucketName` helper implementing every rule in the handoff
  (lowercase, 3-63 chars, allowed character set, start/end character,
  no consecutive hyphens, not an IPv4 literal). It is wired to the
  custom-name input.

**Backend contract gap logged** in
`requirements/backend-handoff/r2-bucket-request-schema.md`:

- The shared `CreateR2BucketRequest` type currently resolves to
  `undefined` because the OpenAPI document for
  `POST /api/internal/r2-buckets` does not expose a request body schema.
  TypeScript therefore refuses to accept `{ bucketName }`.
- Workaround until the request schema is generated: the custom-name input
  is rendered but disabled with an inline hint pointing at the backend
  handoff, and the mutation calls `createR2Bucket()` with no body so the
  backend defaults the bucket name to the current tenant signature. As
  soon as the request body type is generated, flipping
  `customNameDisabled` to `false` (and switching `mutationFn` to forward
  the input) re-enables the rest of the UX with zero rewrite.

`npm run lint` (admin): 0 errors. `tsc -b`: clean for changed files.
