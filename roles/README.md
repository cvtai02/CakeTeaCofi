# Role Instructions

Use one role per chat session. Pick the role that matches the ownership boundary for the work, then keep that role stable for the session.

Available roles:

- [API-code](API-code.md): backend API, DTOs, contracts, migrations, and backend-to-frontend handoffs.
- [Frontend-code](Frontend-code.md): shared frontend role for client apps, handoffs, UI behavior, and frontend verification.
- [frontend-admin-code](frontend-admin-code.md): admin client implementation under `src/clients/admin/`.
- [frontend-nekomin-code](frontend-nekomin-code.md): Nekomin storefront implementation under `src/clients/nekomin/`.

Shared collaboration rule:

- Stop at ownership boundaries. If a required change belongs to another role, write a handoff under `requirements/` instead of crossing into that role's source.
- Tool allow-lists in Claude settings do not override role ownership. A command may be technically allowed but still inappropriate if it reads or changes another role's files.

Instruction sources:

- Repository collaboration rules: `AGENTS.md`.
- AI ownership map: `docs/ai-collaboration.md`.
- Claude project rules: `.claude/CLAUDE.md`.
- Claude project permissions: `.claude/settings.local.json`.
- Claude global permissions: `C:\Users\TaiChuVan\.claude\settings.json`.
- Claude skills: `.claude/skills/**`.
