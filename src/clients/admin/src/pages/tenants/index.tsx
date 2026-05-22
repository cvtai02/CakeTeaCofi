import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2Icon,
  ExternalLinkIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminErrorState } from "@/components/admin/admin-page";
import { useTenantManagementClient } from "@/components/containers/api-client-provider";
import { ValidationError } from "@shared/api/contracts/common-types";
import type {
  CreateTenantRequest,
  ListTenantsQuery,
  TenantResponse,
} from "@shared/api/types/tenantmanagement";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 24;
const COUNTRY_CODES = ["VN", "US"] as const;
type CountryCode = (typeof COUNTRY_CODES)[number];

const ACTIVE_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
] as const;
type ActiveFilter = (typeof ACTIVE_FILTERS)[number]["value"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Case-insensitive lookup into a backend ValidationError errors map. */
function fieldError(
  errors: Record<string, string[]> | undefined,
  field: string,
): string | undefined {
  if (!errors) return undefined;
  const match = Object.keys(errors).find(
    (k) => k.toLowerCase() === field.toLowerCase(),
  );
  return match ? errors[match]?.[0] : undefined;
}

// ─── Tenant card ──────────────────────────────────────────────────────────────

function TenantCard({ tenant }: { tenant: TenantResponse }) {
  const [imgError, setImgError] = useState(false);
  const canRedirect = Boolean(tenant.adminDashboardUrl);

  function openDashboard() {
    if (!tenant.adminDashboardUrl) {
      toast.error("This tenant has no admin dashboard URL configured.");
      return;
    }
    window.location.href = tenant.adminDashboardUrl;
  }

  return (
    <button
      type="button"
      onClick={openDashboard}
      disabled={!canRedirect}
      className="group flex flex-col gap-3 rounded-xl border bg-card p-4 text-left transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-sm font-semibold text-muted-foreground">
          {tenant.logoUrl && !imgError ? (
            <img
              src={tenant.logoUrl}
              alt={tenant.name}
              className="size-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            initials(tenant.name) || <Building2Icon className="size-5" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium" title={tenant.name}>
              {tenant.name}
            </p>
            <Badge variant={tenant.isActive ? "default" : "secondary"}>
              {tenant.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="truncate text-sm text-muted-foreground" title={tenant.domain}>
            {tenant.domain}
          </p>
        </div>
        <ExternalLinkIcon className="size-4 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-muted-foreground" />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="uppercase">{tenant.countryCode}</span>
        <span className="font-mono">{tenant.signature}</span>
      </div>
    </button>
  );
}

function TenantSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="size-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
    </div>
  );
}

// ─── Create dialog ────────────────────────────────────────────────────────────

const EMPTY_FORM: CreateTenantRequest = {
  name: "",
  signature: "",
  domain: "",
  cdnBaseUrl: "",
  logoKey: "",
  adminDashboardUrl: "",
  countryCode: "VN",
};

function CreateTenantDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const tenantClient = useTenantManagementClient();
  const [form, setForm] = useState<CreateTenantRequest>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [prevOpen, setPrevOpen] = useState(open);

  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) {
      setForm(EMPTY_FORM);
      setFieldErrors({});
    }
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (input: CreateTenantRequest) => tenantClient.createTenant(input),
    onSuccess: () => {
      toast.success("Tenant created");
      onOpenChange(false);
      onCreated();
    },
    onError: (err) => {
      if (err instanceof ValidationError && err.errors) {
        setFieldErrors(err.errors);
        toast.error("Please fix the highlighted fields.");
      } else {
        toast.error(
          err instanceof Error ? err.message : "Failed to create tenant.",
        );
      }
    },
  });

  function set<K extends keyof CreateTenantRequest>(
    key: K,
    value: CreateTenantRequest[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit() {
    const localErrors: Record<string, string[]> = {};
    if (!form.name?.trim()) localErrors.name = ["Name is required."];
    if (!form.signature?.trim()) localErrors.signature = ["Signature is required."];
    if (!form.domain?.trim()) localErrors.domain = ["Domain is required."];
    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      return;
    }
    setFieldErrors({});
    mutate({
      ...form,
      cdnBaseUrl: form.cdnBaseUrl || null,
      logoKey: form.logoKey || null,
      adminDashboardUrl: form.adminDashboardUrl || null,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create tenant</DialogTitle>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="tenant-name">Name</FieldLabel>
            <Input
              id="tenant-name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              aria-invalid={Boolean(fieldError(fieldErrors, "name"))}
            />
            {fieldError(fieldErrors, "name") && (
              <p className="text-xs text-destructive">
                {fieldError(fieldErrors, "name")}
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="tenant-signature">Signature</FieldLabel>
            <Input
              id="tenant-signature"
              value={form.signature}
              onChange={(e) => set("signature", e.target.value)}
              aria-invalid={Boolean(fieldError(fieldErrors, "signature"))}
            />
            {fieldError(fieldErrors, "signature") && (
              <p className="text-xs text-destructive">
                {fieldError(fieldErrors, "signature")}
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="tenant-domain">Domain</FieldLabel>
            <Input
              id="tenant-domain"
              placeholder="store.example.com"
              value={form.domain}
              onChange={(e) => set("domain", e.target.value)}
              aria-invalid={Boolean(fieldError(fieldErrors, "domain"))}
            />
            {fieldError(fieldErrors, "domain") && (
              <p className="text-xs text-destructive">
                {fieldError(fieldErrors, "domain")}
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="tenant-cdn">CDN base URL (optional)</FieldLabel>
            <Input
              id="tenant-cdn"
              placeholder="https://cdn.example.com"
              value={form.cdnBaseUrl ?? ""}
              onChange={(e) => set("cdnBaseUrl", e.target.value)}
              aria-invalid={Boolean(fieldError(fieldErrors, "cdnBaseUrl"))}
            />
            {fieldError(fieldErrors, "cdnBaseUrl") && (
              <p className="text-xs text-destructive">
                {fieldError(fieldErrors, "cdnBaseUrl")}
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="tenant-logo">Logo key (optional)</FieldLabel>
            <Input
              id="tenant-logo"
              value={form.logoKey ?? ""}
              onChange={(e) => set("logoKey", e.target.value)}
              aria-invalid={Boolean(fieldError(fieldErrors, "logoKey"))}
            />
            {fieldError(fieldErrors, "logoKey") && (
              <p className="text-xs text-destructive">
                {fieldError(fieldErrors, "logoKey")}
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="tenant-admin-url">
              Admin dashboard URL (optional)
            </FieldLabel>
            <Input
              id="tenant-admin-url"
              placeholder="https://admin.example.com"
              value={form.adminDashboardUrl ?? ""}
              onChange={(e) => set("adminDashboardUrl", e.target.value)}
              aria-invalid={Boolean(fieldError(fieldErrors, "adminDashboardUrl"))}
            />
            {fieldError(fieldErrors, "adminDashboardUrl") && (
              <p className="text-xs text-destructive">
                {fieldError(fieldErrors, "adminDashboardUrl")}
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel>Country</FieldLabel>
            <Select
              value={form.countryCode ?? "VN"}
              onValueChange={(v) =>
                set("countryCode", (v as CountryCode) ?? "VN")
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_CODES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
        <DialogFooter showCloseButton>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Creating…" : "Create tenant"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TenantsPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);

  const tenantClient = useTenantManagementClient();
  const queryClient = useQueryClient();

  const params: ListTenantsQuery = {
    PageNumber: page,
    PageSize: PAGE_SIZE,
    Search: search || undefined,
    IsActive: activeFilter === "all" ? undefined : activeFilter === "active",
  };

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["tenants", params],
    queryFn: () => tenantClient.listTenants(params),
    staleTime: 30_000,
  });

  const tenants = data?.items ?? [];
  // Only `items` is documented on the wrapper, so derive paging from page length.
  const hasNextPage = tenants.length === PAGE_SIZE;
  const hasFilters = Boolean(search) || activeFilter !== "all";

  function resetToFirstPage() {
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Building2Icon className="size-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold">Tenants</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <PlusIcon data-icon="inline-start" />
            New tenant
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCwIcon className={isFetching ? "animate-spin" : ""} data-icon />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or domain…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetToFirstPage(); }}
            className="pl-9"
          />
        </div>
        <Select
          value={activeFilter}
          onValueChange={(v) => {
            setActiveFilter((v as ActiveFilter) ?? "all");
            resetToFirstPage();
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACTIVE_FILTERS.map((f) => (
              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {isError ? (
        <AdminErrorState
          title="Failed to load tenants"
          description="There was an error fetching tenants. Please try again."
        />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <TenantSkeleton key={i} />
          ))}
        </div>
      ) : tenants.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <Building2Icon className="size-12 text-muted-foreground/30" />
          <div>
            <p className="text-sm font-medium">No tenants found</p>
            <p className="text-xs text-muted-foreground">
              {hasFilters
                ? "Try adjusting your search or filters."
                : "Create a tenant to get started."}
            </p>
          </div>
          {hasFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setSearch(""); setActiveFilter("all"); resetToFirstPage(); }}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tenants.map((tenant) => (
            <TenantCard key={tenant.id} tenant={tenant} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isError && (page > 1 || hasNextPage) && (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Page {page}
            {tenants.length > 0 &&
              ` · showing ${tenants.length} tenant${tenants.length > 1 ? "s" : ""}`}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasNextPage || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <CreateTenantDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() =>
          queryClient.invalidateQueries({ queryKey: ["tenants"] })
        }
      />
    </div>
  );
}
