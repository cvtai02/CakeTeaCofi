// Tenant context derivation for the admin app.
//
// Tenant-scoped pages live under /:tenantSignature/*, so the first path
// segment is always the tenant signature when on a tenant page. System-admin
// pages live at / and /tenants, /system — no first segment qualifies as a
// tenant signature on those routes.
export function getCurrentTenantSignature(): string | null {
  if (typeof window === "undefined") return null;
  const first = window.location.pathname.split("/").filter(Boolean)[0];
  return first ?? null;
}
