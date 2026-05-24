# API-code Role

Use this role for backend API implementation and backend contract work.

## Ownership

You may work in:

- `src/AppHost/` only when the API task truly requires host wiring.
- `src/Infrastructure/` only when the API task truly requires infrastructure work.
- `src/Intermediary/`.
- `src/Modules/`.
- `src/SharedKernel/` read-only unless the user explicitly approves changes.
- `src/clients/shared/` only for backend contract work.
- `requirements/flows/`, `requirements/frontend-handoff/`, and `requirements/backend-handoff/`.

Do not read, edit, move, delete, format, lint, test, or generate files in:

- `src/clients/admin/`.
- Any future folder under `src/clients/` except `src/clients/shared/`.
- `requirements/*/done`.
- `src/clients/shared/api/lib/openapi-types.ts` manually.

## Settings Alignment

- This role follows repository backend ownership even if a Claude global setting allows broad commands such as `dotnet run`, `dotnet build`, or EF devtool scripts.
- Claude frontend-local settings deny backend reads. Do not use a frontend-role chat for API-code work.
- The global Claude settings include some .NET and EF commands, but those are tool permissions, not permission to mix frontend and backend ownership in one chat.
- For Codex sessions, follow the active environment permission policy for `dotnet` and EF commands.

## API Workflow

1. Create or update a simple system flow under `requirements/flows/` before implementation.
2. Add or update DTOs under `src/Modules/<ModuleName>/DTOs/**`.
3. Add or update API endpoints and use cases under `src/Modules/<ModuleName>/Api/**` using the module's existing style.
4. Update `src/Modules/<ModuleName>/Api/api.md` with concise endpoint summaries only:
   - route and method
   - auth requirement
   - DTO file paths
   - short behavior notes
5. When DTOs or controllers change, regenerate shared API types through the repository generator. Do not manually edit generated OpenAPI types.
6. Update shared frontend contracts when backend API shape changes:
   - type aliases: `src/clients/shared/api/types/<modulename>.ts`
   - shared client implementation: `src/clients/shared/api/clients/<modulename>.ts`
   - module-level backend-maintained contracts: `src/clients/shared/api/contracts/<modulename>.ts`
   - frontend-facing admin contracts: `src/clients/shared/api/contracts/admin/`
   - frontend-facing customer contracts: `src/clients/shared/api/contracts/customer/`
7. Write a frontend handoff under `requirements/frontend-handoff/` when frontend work is required.

## Contract Rules

- Frontend-facing API client interfaces must be consumed through categorized contract folders only:
  - `src/clients/shared/api/contracts/admin/`
  - `src/clients/shared/api/contracts/customer/`
- Do not instruct frontend code to import API client interfaces from module-level contract files or the root contracts index.
- Comments above shared contract methods should reference the exact backend DTO `.cs` file and describe the method behavior briefly.

## Build And Migration Safety

- Run `dotnet` and EF migration commands only according to the active environment permission rules.
- If an entity, DbContext, or DbContext configuration changes, create or update the module EF migration and update the database through repository devtools.
- Do not create migration handoff files for normal EF migration work.
