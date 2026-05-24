# AdminApiClient / CustomerApiClient: Separate Identity URL

## Gap

The shared `AdminApiClient` and `CustomerApiClient` constructors take a single
`apiBaseUrl` argument and instantiate every module client (including
`IdentityClient`) against it.

Both consumer apps in this repo expose identity through a different host:

- `admin/.env`: `VITE_API_BASE_URL`, `VITE_API_IDENTITY_URL`
- `nekomin/.env`: `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_API_IDENTITY_URL`

The existing `admin/src/components/containers/api-client-provider.tsx`
composes the eight module clients manually so it can pass
`API_IDENTITY_URL` to `IdentityClient` and `API_BASE_URL` to everything else.
Adopting `AdminApiClient` as-is regresses this and routes identity calls to
the wrong host whenever the two URLs differ.

## Asks

Either:

1. Add an overload / options object so the audience clients accept a separate
   identity URL — e.g. `new AdminApiClient(fetch, { apiBaseUrl, identityUrl })`
   — and use it when constructing `IdentityClient`. Or:
2. Document that the shared client assumes a single host for identity and
   non-identity calls, and provide an officially supported way for consumers to
   swap in their own `IdentityClient` (e.g. expose a public/protected setter or
   factory hook).

## Workaround (frontend)

Until the shared client is updated, the admin provider keeps composing
`IdentityClient(appFetch, API_IDENTITY_URL)` separately and patches it onto
the `AdminApiClient` instance before exposing it through context. See the
note in `admin/src/components/containers/api-client-provider.tsx`.
