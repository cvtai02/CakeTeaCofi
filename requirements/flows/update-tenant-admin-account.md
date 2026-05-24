# Update Tenant Admin Account

1. System admin opens a tenant account management view.
2. System admin submits changes for the tenant admin account.
3. Backend checks that the tenant exists and is not archived.
4. Backend updates only the provided account fields: email, password, enabled state, and display name.
5. Backend keeps tenant admin email metadata in sync when the login email changes.
6. Backend returns the updated tenant admin account details.
