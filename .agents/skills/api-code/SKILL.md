---
name: api-code
description: Implement/Update API endpoints.
---

# Important
- If you are Codex, run `dotnet` and EF migration commands only outside the sandbox with explicit escalation/approval.

# Context
- `src/Modules/*/Api/` for API implementation
- `src/Modules/*/DTOs/` for request/response DTOs. Do not place DTOs under `Core`.
- `src/Modules/*/Api/api.md` for concise API summaries only.
- `src/Intermediary/**` for intermediary services / integration events between modules
- `src/Infrastructure/**` and `src/AppHost/**` are limited-scope areas; touch them only when the API task truly requires it.
- `src/SharedKernel/**` is read-only unless the user explicitly approves changes.
- `src/clients/shared/**` may be edited only for backend contract work.
- Frontend-facing API client interfaces are categorized under:
  - `src/clients/shared/api/contracts/admin/` for system admin, tenant admin, and tenant moderator surfaces
  - `src/clients/shared/api/contracts/customer/` for storefront/customer/public-safe surfaces
- Do not tell Claude/frontend to import API client interfaces from module-level contract files such as `src/clients/shared/api/contracts/productcatalog.ts`, `content.ts`, `order.ts`, or from `src/clients/shared/api/contracts/index.ts`. Those files are backend-maintained composition details for the categorized facades.

# Frontend Boundary
- Do not read, edit, move, delete, format, lint, test, or generate files in:
  - any future folder under `src/clients/` except `src/clients/shared/`
  - `src/clients/shared/api/lib/`
- If backend work needs a frontend implementation change, write a frontend-handoff document under `requirements/frontend-handoff/` instead of editing frontend files.

# API Flow
1. Create or update an simple system flow under `requirements/flows/` before implementation.
   - Do not write detailed implementation steps, internal code notes, or frontend UI instructions in the backend plan.
   - Ex: 1. User click Buy -> 2. Add Order -> 2. reserve inventory -> ...
2. Implement APIs:
   - Add or update DTOs under `src/Modules/<ModuleName>/DTOs/**`.
   - Add or update use cases/controllers under `src/Modules/<ModuleName>/Api/**` using the module's existing style.
3. Update `src/Modules/<ModuleName>/Api/api.md` with endpoint summaries only:
   - route and method
   - auth requirement
   - DTO links by file path
   - short behavior notes
   - do not inline full request/response property details
4. If there is any changes in DTOs, Controllers:
   1. run the project with http port
   2. run the api-typescript.ps1 in devtools at workspace folder.
   3. stop the project

5. Update API clients for frontend when backend API shape changes:
   - type aliases live in `src/clients/shared/api/types/<modulename>.ts`
   - shared client implementation lives in `src/clients/shared/api/clients/<modulename>.ts`
   - module-level interface contracts live in `src/clients/shared/api/contracts/<modulename>.ts` only as backend-maintained building blocks
   - frontend-facing categorized interface contracts live in `src/clients/shared/api/contracts/admin/` and `src/clients/shared/api/contracts/customer/`
   - comments above each interface method should point to the exact backend DTO `.cs` file for each request/response type
   - comments above added or changed interface methods should also mention the contract method name and short behavior note
   - when adding/removing methods, update the categorized admin/customer facade contracts when the method belongs to that audience
   - do not edit `src/clients/shared/api/lib/**`
   - check if there is any typescript warning/error in updated files.

6. Write a Frontend-handoff document under `requirements/frontend-handoff/`.
   - Use the title format `<feature>.md`.
   - Keep these handoffs focused on API behavior and frontend UX.
   - Mention only categorized API client contract paths for frontend imports: `src/clients/shared/api/contracts/admin/` or `src/clients/shared/api/contracts/customer/`.
   - Mention which categorized client methods should be used.
   - Tell Claude to move the file to `requirements/frontend-handoff/done/` after implementation.
   - Do not edit files already under a `done/` folder.
