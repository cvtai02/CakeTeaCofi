import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArchiveIcon,
  Building2Icon,
  CloudIcon,
  ImageIcon,
  KeyRoundIcon,
  MailIcon,
  PencilIcon,
  PlusIcon,
  PowerIcon,
  PowerOffIcon,
  RefreshCwIcon,
  SearchIcon,
  SettingsIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { FileUploader } from "@/components/ui/file-uploader";
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
import { TenantOperationsSheet } from "./operations-sheet";
import { urlToMediaKey } from "@/lib/media";
import { useIdentityStore } from "@/stores/identity";
import { ValidationError } from "@shared/api/contracts/common-types";
import type {
  CreateTenantAdminAccountRequest,
  CreateTenantRequest,
  ListTenantsQuery,
  TenantResponse,
  UpdateTenantRequest,
} from "@shared/api/types/tenantmanagement";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 24;
// Currently supported country codes for create. Existing tenants may still
// have other values (e.g. "US") which we surface read-only on cards.
const CREATE_COUNTRY_CODES = ["VN"] as const;
const EDIT_COUNTRY_CODES = ["VN", "US"] as const;
type CountryCode = (typeof EDIT_COUNTRY_CODES)[number];

const ACTIVE_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
] as const;
type ActiveFilter = (typeof ACTIVE_FILTERS)[number]["value"];

const TENANTS_QUERY_KEY = ["tenants"] as const;

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

// Tenant responses can include an optional adminEmail. The generated type may
// not surface it depending on openapi generation timing, so read defensively.
function tenantAdminEmail(tenant: TenantResponse): string | null {
  const value = (tenant as TenantResponse & { adminEmail?: string | null })
    .adminEmail;
  return value ?? null;
}

// ─── Tenant card ──────────────────────────────────────────────────────────────

function TenantCard({
  tenant,
  canManage,
  onEdit,
  onProvisionAdmin,
  onUpdateLogo,
  onToggleActive,
  onArchive,
  onOpenOperations,
}: {
  tenant: TenantResponse;
  canManage: boolean;
  onEdit: (tenant: TenantResponse) => void;
  onProvisionAdmin: (tenant: TenantResponse) => void;
  onUpdateLogo: (tenant: TenantResponse) => void;
  onToggleActive: (tenant: TenantResponse) => void;
  onArchive: (tenant: TenantResponse) => void;
  onOpenOperations: (tenant: TenantResponse) => void;
}) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const adminEmail = tenantAdminEmail(tenant);

  function openDashboard() {
    navigate(`/${tenant.signature}`);
  }

  return (
    <div
      className="flex flex-col gap-3 rounded-xl border bg-card p-4 cursor-pointer transition-shadow hover:shadow-md"
      onClick={openDashboard}
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
          {tenant.domain ? (
            <p
              className="truncate text-sm text-muted-foreground"
              title={tenant.domain}
            >
              {tenant.domain}
            </p>
          ) : (
            <p className="truncate text-sm italic text-muted-foreground/60">
              No domain set
            </p>
          )}
          {adminEmail ? (
            <p
              className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground"
              title={adminEmail}
            >
              <MailIcon className="size-3 shrink-0" />
              {adminEmail}
            </p>
          ) : null}
          {tenant.cdnBaseUrl ? (
            <p
              className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground"
              title={tenant.cdnBaseUrl}
            >
              <CloudIcon className="size-3 shrink-0" />
              {tenant.cdnBaseUrl}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="uppercase">{tenant.countryCode}</span>
        <span className="font-mono">{tenant.signature}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t pt-3" onClick={(e) => e.stopPropagation()}>
        {canManage && (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onOpenOperations(tenant)}
              title="Provisioning status, R2 bucket, admin users"
            >
              <SettingsIcon data-icon="inline-start" />
              Manage
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(tenant)}
              title="Edit tenant"
            >
              <PencilIcon data-icon="inline-start" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onUpdateLogo(tenant)}
              title="Upload or replace tenant logo"
            >
              <ImageIcon data-icon="inline-start" />
              Logo
            </Button>
            {!adminEmail && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onProvisionAdmin(tenant)}
                title="Provision tenant admin account"
              >
                <KeyRoundIcon data-icon="inline-start" />
                Provision admin
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onArchive(tenant)}
              title="Soft-archive tenant"
            >
              <ArchiveIcon data-icon="inline-start" />
              Archive
            </Button>
            <div className="ml-auto">
              <Button
                size="sm"
                variant={tenant.isActive ? "ghost" : "default"}
                onClick={() => onToggleActive(tenant)}
                title={tenant.isActive ? "Deactivate tenant" : "Activate tenant"}
              >
                {tenant.isActive ? (
                  <>
                    <PowerOffIcon data-icon="inline-start" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <PowerIcon data-icon="inline-start" />
                    Activate
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
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
      <Skeleton className="h-8 w-full" />
    </div>
  );
}

// ─── Create tenant wizard (two-step) ──────────────────────────────────────────

type CreateFormState = {
  name: string;
  signature: string;
  domain: string;
  countryCode: CountryCode;
  email: string;
  password: string;
};

const EMPTY_CREATE_FORM: CreateFormState = {
  name: "",
  signature: "",
  domain: "",
  countryCode: "VN",
  email: "",
  password: "",
};

function createFormToWireBody(form: CreateFormState) {
  return {
    name: form.name,
    signature: form.signature,
    // domain is now optional on create; send null when blank
    domain: form.domain.trim() || null,
    countryCode: form.countryCode,
    email: form.email,
    password: form.password,
  };
}

function CreateTenantWizard({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const tenantClient = useTenantManagementClient();
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<CreateFormState>(EMPTY_CREATE_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [createdTenant, setCreatedTenant] = useState<TenantResponse | null>(null);
  const [logoUrls, setLogoUrls] = useState<string[]>([]);
  const [prevOpen, setPrevOpen] = useState(open);

  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) {
      setStep(1);
      setForm(EMPTY_CREATE_FORM);
      setFieldErrors({});
      setCreatedTenant(null);
      setLogoUrls([]);
    }
  }

  const createMutation = useMutation({
    mutationFn: (body: ReturnType<typeof createFormToWireBody>) =>
      tenantClient.createTenant(body as CreateTenantRequest),
    onSuccess: (tenant) => {
      toast.success(`Tenant "${tenant.name}" created`);
      setCreatedTenant(tenant);
      setStep(2);
      onSaved();
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

  const logoMutation = useMutation({
    mutationFn: (input: { logoKey: string }) => {
      if (!createdTenant) throw new Error("No tenant to update.");
      // updateTenantLogo's request type is `UpdateTenantLogoRequest`.
      return tenantClient.updateTenantLogo(createdTenant.id, input);
    },
    onSuccess: () => {
      toast.success("Tenant logo saved");
      onOpenChange(false);
      onSaved();
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to save tenant logo.",
      );
    },
  });

  function set<K extends keyof CreateFormState>(
    key: K,
    value: CreateFormState[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleCreate() {
    const localErrors: Record<string, string[]> = {};
    if (!form.name.trim()) localErrors.name = ["Name is required."];
    if (!form.signature.trim())
      localErrors.signature = ["Signature is required."];
    if (!form.email.trim()) localErrors.email = ["Admin email is required."];
    if (!form.password.trim())
      localErrors.password = ["Admin password is required."];
    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      return;
    }
    setFieldErrors({});
    createMutation.mutate(createFormToWireBody(form));
  }

  function handleLogoSave() {
    const url = logoUrls[0];
    if (!url) {
      toast.error("Upload a logo image first, or skip this step.");
      return;
    }
    const logoKey = urlToMediaKey(url);
    if (!logoKey) {
      toast.error("Could not derive a logo key from the uploaded URL.");
      return;
    }
    logoMutation.mutate({ logoKey });
  }

  function handleSkipLogo() {
    onOpenChange(false);
  }

  const isStep1Pending = createMutation.isPending;
  const isStep2Pending = logoMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === 1
              ? "Create tenant — step 1 of 2"
              : `Add a logo for ${createdTenant?.name ?? "tenant"} — step 2 of 2`}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="create-name">Name</FieldLabel>
                <Input
                  id="create-name"
                  maxLength={200}
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
                <FieldLabel htmlFor="create-signature">Signature</FieldLabel>
                <Input
                  id="create-signature"
                  maxLength={100}
                  value={form.signature}
                  onChange={(e) => set("signature", e.target.value)}
                  aria-invalid={Boolean(fieldError(fieldErrors, "signature"))}
                />
                <p className="text-xs text-muted-foreground">
                  An R2 bucket is provisioned at this signature; the CDN URL
                  becomes <code>https://cdn-&lt;signature&gt;.nekomin.com</code>
                  . Provisioning failures surface here as a signature error.
                </p>
                {fieldError(fieldErrors, "signature") && (
                  <p className="text-xs text-destructive">
                    {fieldError(fieldErrors, "signature")}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="create-domain">
                  Domain (optional)
                </FieldLabel>
                <Input
                  id="create-domain"
                  maxLength={255}
                  placeholder="store.example.com"
                  value={form.domain}
                  onChange={(e) => set("domain", e.target.value)}
                  aria-invalid={Boolean(fieldError(fieldErrors, "domain"))}
                />
                <p className="text-xs text-muted-foreground">
                  Domain can be set later via Edit. Uniqueness is validated
                  only when provided.
                </p>
                {fieldError(fieldErrors, "domain") && (
                  <p className="text-xs text-destructive">
                    {fieldError(fieldErrors, "domain")}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel>Country</FieldLabel>
                <Select
                  value={form.countryCode}
                  onValueChange={(v) =>
                    set("countryCode", (v as CountryCode) ?? "VN")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CREATE_COUNTRY_CODES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Only VN is currently supported for new tenants.
                </p>
              </Field>

              <Field>
                <FieldLabel htmlFor="create-email">Admin email</FieldLabel>
                <Input
                  id="create-email"
                  type="email"
                  maxLength={256}
                  autoComplete="off"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  aria-invalid={Boolean(fieldError(fieldErrors, "email"))}
                />
                {fieldError(fieldErrors, "email") && (
                  <p className="text-xs text-destructive">
                    {fieldError(fieldErrors, "email")}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="create-password">
                  Admin initial password
                </FieldLabel>
                <Input
                  id="create-password"
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  aria-invalid={Boolean(fieldError(fieldErrors, "password"))}
                />
                <p className="text-xs text-muted-foreground">
                  Must satisfy backend password rules. Backend creates a
                  TenantAdmin login with this email/password; the password is
                  not stored on the tenant record.
                </p>
                {fieldError(fieldErrors, "password") && (
                  <p className="text-xs text-destructive">
                    {fieldError(fieldErrors, "password")}
                  </p>
                )}
              </Field>
            </FieldGroup>
            <DialogFooter showCloseButton>
              <Button onClick={handleCreate} disabled={isStep1Pending}>
                {isStep1Pending ? "Creating…" : "Create tenant"}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 2 && (
          <>
            <FieldGroup>
              <Field>
                <FieldLabel>Tenant logo (optional)</FieldLabel>
                <FileUploader
                  category="avatar"
                  multiple={false}
                  value={logoUrls}
                  onChange={setLogoUrls}
                  disabled={isStep2Pending}
                />
                <p className="text-xs text-muted-foreground">
                  Upload an image; we'll save the resulting key on the
                  tenant. You can skip this step and upload later via the
                  Logo action on the tenant card.
                </p>
              </Field>
            </FieldGroup>
            <DialogFooter showCloseButton>
              <Button
                variant="ghost"
                onClick={handleSkipLogo}
                disabled={isStep2Pending}
              >
                Skip
              </Button>
              <Button
                onClick={handleLogoSave}
                disabled={isStep2Pending || logoUrls.length === 0}
              >
                {isStep2Pending ? "Saving…" : "Save logo"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit tenant dialog ───────────────────────────────────────────────────────

type EditFormState = {
  name: string;
  signature: string;
  domain: string;
  cdnBaseUrl: string;
  countryCode: CountryCode;
};

function tenantToEditState(tenant: TenantResponse): EditFormState {
  return {
    name: tenant.name,
    signature: tenant.signature,
    domain: tenant.domain ?? "",
    cdnBaseUrl: tenant.cdnBaseUrl ?? "",
    countryCode: (tenant.countryCode as CountryCode) ?? "VN",
  };
}

function editFormToWireBody(form: EditFormState) {
  return {
    name: form.name,
    signature: form.signature,
    // Empty domain means "keep current" per the handoff; send null so the
    // backend keeps the existing value rather than treating "" as a clear.
    domain: form.domain.trim() || null,
    cdnBaseUrl: form.cdnBaseUrl || null,
    countryCode: form.countryCode,
  };
}

function EditTenantDialog({
  tenant,
  onOpenChange,
  onSaved,
}: {
  tenant: TenantResponse | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const tenantClient = useTenantManagementClient();
  const open = tenant !== null;
  const [form, setForm] = useState<EditFormState>(() =>
    tenant ? tenantToEditState(tenant) : {
      name: "",
      signature: "",
      domain: "",
      cdnBaseUrl: "",
      countryCode: "VN",
    },
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [prevTenantId, setPrevTenantId] = useState<number | null>(
    tenant?.id ?? null,
  );

  if (prevTenantId !== (tenant?.id ?? null)) {
    setPrevTenantId(tenant?.id ?? null);
    setFieldErrors({});
    if (tenant) setForm(tenantToEditState(tenant));
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (body: ReturnType<typeof editFormToWireBody>) => {
      if (!tenant) throw new Error("No tenant selected.");
      return tenantClient.updateTenant(tenant.id, body as UpdateTenantRequest);
    },
    onSuccess: () => {
      toast.success("Tenant updated");
      onOpenChange(false);
      onSaved();
    },
    onError: (err) => {
      if (err instanceof ValidationError && err.errors) {
        setFieldErrors(err.errors);
        toast.error("Please fix the highlighted fields.");
      } else {
        toast.error(
          err instanceof Error ? err.message : "Failed to update tenant.",
        );
      }
    },
  });

  function set<K extends keyof EditFormState>(
    key: K,
    value: EditFormState[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit() {
    const localErrors: Record<string, string[]> = {};
    if (!form.name.trim()) localErrors.name = ["Name is required."];
    if (!form.signature.trim())
      localErrors.signature = ["Signature is required."];
    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      return;
    }
    setFieldErrors({});
    mutate(editFormToWireBody(form));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit tenant</DialogTitle>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="edit-name">Name</FieldLabel>
            <Input
              id="edit-name"
              maxLength={200}
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
            <FieldLabel htmlFor="edit-signature">Signature</FieldLabel>
            <Input
              id="edit-signature"
              maxLength={100}
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
            <FieldLabel htmlFor="edit-domain">Domain (optional)</FieldLabel>
            <Input
              id="edit-domain"
              maxLength={255}
              placeholder="store.example.com"
              value={form.domain}
              onChange={(e) => set("domain", e.target.value)}
              aria-invalid={Boolean(fieldError(fieldErrors, "domain"))}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to keep the current value. Providing a new domain
              validates uniqueness.
            </p>
            {fieldError(fieldErrors, "domain") && (
              <p className="text-xs text-destructive">
                {fieldError(fieldErrors, "domain")}
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="edit-cdn">CDN base URL (optional)</FieldLabel>
            <Input
              id="edit-cdn"
              placeholder="https://cdn.example.com"
              value={form.cdnBaseUrl}
              onChange={(e) => set("cdnBaseUrl", e.target.value)}
              aria-invalid={Boolean(fieldError(fieldErrors, "cdnBaseUrl"))}
            />
            <p className="text-xs text-muted-foreground">
              On create, this is auto-provisioned from the tenant signature;
              editing here updates the persisted value.
            </p>
            {fieldError(fieldErrors, "cdnBaseUrl") && (
              <p className="text-xs text-destructive">
                {fieldError(fieldErrors, "cdnBaseUrl")}
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel>Country</FieldLabel>
            <Select
              value={form.countryCode}
              onValueChange={(v) =>
                set("countryCode", (v as CountryCode) ?? "VN")
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EDIT_COUNTRY_CODES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
        <DialogFooter showCloseButton>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Update logo dialog ───────────────────────────────────────────────────────

function UpdateLogoDialog({
  tenant,
  onOpenChange,
  onSaved,
}: {
  tenant: TenantResponse | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const tenantClient = useTenantManagementClient();
  const open = tenant !== null;
  const [logoUrls, setLogoUrls] = useState<string[]>([]);
  const [prevTenantId, setPrevTenantId] = useState<number | null>(
    tenant?.id ?? null,
  );

  if (prevTenantId !== (tenant?.id ?? null)) {
    setPrevTenantId(tenant?.id ?? null);
    setLogoUrls([]);
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (input: { logoKey: string }) => {
      if (!tenant) throw new Error("No tenant selected.");
      return tenantClient.updateTenantLogo(tenant.id, input);
    },
    onSuccess: () => {
      toast.success("Tenant logo updated");
      onOpenChange(false);
      onSaved();
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to update tenant logo.",
      );
    },
  });

  function handleSave() {
    const url = logoUrls[0];
    if (!url) {
      toast.error("Upload a logo image first.");
      return;
    }
    const logoKey = urlToMediaKey(url);
    if (!logoKey) {
      toast.error("Could not derive a logo key from the uploaded URL.");
      return;
    }
    mutate({ logoKey });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Update logo for {tenant?.name ?? "tenant"}
          </DialogTitle>
        </DialogHeader>
        <FieldGroup>
          {tenant?.logoUrl && (
            <Field>
              <FieldLabel>Current logo</FieldLabel>
              <img
                src={tenant.logoUrl}
                alt={`${tenant.name} current logo`}
                className="size-20 rounded-lg border object-cover"
              />
            </Field>
          )}
          <Field>
            <FieldLabel>New logo</FieldLabel>
            <FileUploader
              category="avatar"
              multiple={false}
              value={logoUrls}
              onChange={setLogoUrls}
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              Upload an image; the new file key is saved on the tenant via
              <code> PUT /api/TenantManagement/tenants/&#123;id&#125;/logo</code>.
            </p>
          </Field>
        </FieldGroup>
        <DialogFooter showCloseButton>
          <Button
            onClick={handleSave}
            disabled={isPending || logoUrls.length === 0}
          >
            {isPending ? "Saving…" : "Save logo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Provision tenant admin dialog (legacy tenants without an admin) ──────────

function ProvisionAdminDialog({
  tenant,
  onOpenChange,
  onSaved,
}: {
  tenant: TenantResponse | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const tenantClient = useTenantManagementClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [prevTenantId, setPrevTenantId] = useState<number | null>(null);

  const open = tenant !== null;
  if (prevTenantId !== (tenant?.id ?? null)) {
    setPrevTenantId(tenant?.id ?? null);
    setEmail("");
    setPassword("");
    setFieldErrors({});
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (input: CreateTenantAdminAccountRequest) => {
      if (!tenant) throw new Error("No tenant selected.");
      return tenantClient.createTenantAdminAccount(tenant.id, input);
    },
    onSuccess: () => {
      toast.success("Tenant admin account provisioned");
      onOpenChange(false);
      onSaved();
    },
    onError: (err) => {
      if (err instanceof ValidationError && err.errors) {
        setFieldErrors(err.errors);
        toast.error("Please fix the highlighted fields.");
      } else {
        toast.error(
          err instanceof Error ? err.message : "Failed to provision admin.",
        );
      }
    },
  });

  function handleSubmit() {
    const localErrors: Record<string, string[]> = {};
    if (!email.trim()) localErrors.email = ["Email is required."];
    if (!password.trim()) localErrors.password = ["Password is required."];
    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      return;
    }
    setFieldErrors({});
    mutate({ email, password });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Provision admin for {tenant?.name ?? "tenant"}
          </DialogTitle>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="provision-email">Email</FieldLabel>
            <Input
              id="provision-email"
              type="email"
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(fieldError(fieldErrors, "email"))}
            />
            {fieldError(fieldErrors, "email") && (
              <p className="text-xs text-destructive">
                {fieldError(fieldErrors, "email")}
              </p>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="provision-password">
              Initial password
            </FieldLabel>
            <Input
              id="provision-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(fieldError(fieldErrors, "password"))}
            />
            {fieldError(fieldErrors, "password") && (
              <p className="text-xs text-destructive">
                {fieldError(fieldErrors, "password")}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Must satisfy backend password rules. Share this credential with
              the tenant admin securely; it is not stored.
            </p>
          </Field>
        </FieldGroup>
        <DialogFooter showCloseButton>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Provisioning…" : "Provision admin"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Activate/deactivate confirm ──────────────────────────────────────────────

function ToggleActiveConfirm({
  tenant,
  onOpenChange,
  onSaved,
}: {
  tenant: TenantResponse | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const tenantClient = useTenantManagementClient();
  const open = tenant !== null;
  const targetActive = tenant ? !tenant.isActive : true;

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      if (!tenant) throw new Error("No tenant selected.");
      return tenant.isActive
        ? tenantClient.deactivateTenant(tenant.id)
        : tenantClient.activateTenant(tenant.id);
    },
    onSuccess: () => {
      toast.success(targetActive ? "Tenant activated" : "Tenant deactivated");
      onOpenChange(false);
      onSaved();
    },
    onError: (err) => {
      toast.error(
        err instanceof Error
          ? err.message
          : targetActive
            ? "Failed to activate tenant."
            : "Failed to deactivate tenant.",
      );
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {targetActive ? "Activate tenant?" : "Deactivate tenant?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {tenant
              ? targetActive
                ? `${tenant.name} will be available to its admin and customers.`
                : `${tenant.name} will be hidden from its admin and customers. Existing data is retained.`
              : ""}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => mutate()} disabled={isPending}>
            {isPending
              ? targetActive
                ? "Activating…"
                : "Deactivating…"
              : targetActive
                ? "Activate"
                : "Deactivate"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Archive confirm ──────────────────────────────────────────────────────────

function ArchiveConfirm({
  tenant,
  onOpenChange,
  onSaved,
}: {
  tenant: TenantResponse | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const tenantClient = useTenantManagementClient();
  const open = tenant !== null;

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      if (!tenant) throw new Error("No tenant selected.");
      return tenantClient.archiveTenant(tenant.id);
    },
    onSuccess: () => {
      toast.success("Tenant archived");
      onOpenChange(false);
      onSaved();
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to archive tenant.",
      );
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archive tenant?</AlertDialogTitle>
          <AlertDialogDescription>
            {tenant
              ? `${tenant.name} will be soft-archived and deactivated. The tenant is excluded from the default list; toggle "Include archived" to view it again.`
              : ""}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => mutate()} disabled={isPending}>
            {isPending ? "Archiving…" : "Archive"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TenantsPage() {
  const role = useIdentityStore((s) => s.role);
  const canManage = role === "SystemAdmin";

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TenantResponse | null>(null);
  const [logoTarget, setLogoTarget] = useState<TenantResponse | null>(null);
  const [provisionTarget, setProvisionTarget] =
    useState<TenantResponse | null>(null);
  const [toggleTarget, setToggleTarget] = useState<TenantResponse | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<TenantResponse | null>(null);
  const [operationsTarget, setOperationsTarget] = useState<TenantResponse | null>(null);
  const [includeArchived, setIncludeArchived] = useState(false);

  const tenantClient = useTenantManagementClient();
  const queryClient = useQueryClient();

  const params: ListTenantsQuery = {
    PageNumber: page,
    PageSize: PAGE_SIZE,
    Search: search || undefined,
    IsActive: activeFilter === "all" ? undefined : activeFilter === "active",
    IncludeArchived: includeArchived || undefined,
  };

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: [...TENANTS_QUERY_KEY, params],
    queryFn: () => tenantClient.listTenants(params),
    staleTime: 30_000,
  });

  const tenants = data?.items ?? [];
  // Only `items` is documented on the wrapper, so derive paging from page length.
  const hasNextPage = tenants.length === PAGE_SIZE;
  const hasFilters = Boolean(search) || activeFilter !== "all" || includeArchived;

  function resetToFirstPage() {
    setPage(1);
  }

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: TENANTS_QUERY_KEY });
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
          {canManage && (
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <PlusIcon data-icon="inline-start" />
              New tenant
            </Button>
          )}
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
            onChange={(e) => {
              setSearch(e.target.value);
              resetToFirstPage();
            }}
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
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <Checkbox
            checked={includeArchived}
            onCheckedChange={(v) => {
              setIncludeArchived(Boolean(v));
              resetToFirstPage();
            }}
          />
          Include archived
        </label>
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
                : canManage
                  ? "Create a tenant to get started."
                  : "Ask a system administrator to create one."}
            </p>
          </div>
          {hasFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setActiveFilter("all");
                setIncludeArchived(false);
                resetToFirstPage();
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tenants.map((tenant) => (
            <TenantCard
              key={tenant.id}
              tenant={tenant}
              canManage={canManage}
              onEdit={setEditTarget}
              onProvisionAdmin={setProvisionTarget}
              onUpdateLogo={setLogoTarget}
              onToggleActive={setToggleTarget}
              onArchive={setArchiveTarget}
              onOpenOperations={setOperationsTarget}
            />
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

      {canManage && (
        <>
          <CreateTenantWizard
            open={createOpen}
            onOpenChange={setCreateOpen}
            onSaved={invalidate}
          />
          <EditTenantDialog
            tenant={editTarget}
            onOpenChange={(open) => { if (!open) setEditTarget(null); }}
            onSaved={invalidate}
          />
          <UpdateLogoDialog
            tenant={logoTarget}
            onOpenChange={(open) => { if (!open) setLogoTarget(null); }}
            onSaved={invalidate}
          />
          <ProvisionAdminDialog
            tenant={provisionTarget}
            onOpenChange={(open) => { if (!open) setProvisionTarget(null); }}
            onSaved={invalidate}
          />
          <ToggleActiveConfirm
            tenant={toggleTarget}
            onOpenChange={(open) => { if (!open) setToggleTarget(null); }}
            onSaved={invalidate}
          />
          <ArchiveConfirm
            tenant={archiveTarget}
            onOpenChange={(open) => { if (!open) setArchiveTarget(null); }}
            onSaved={invalidate}
          />
          <TenantOperationsSheet
            tenant={operationsTarget}
            onOpenChange={(open) => { if (!open) setOperationsTarget(null); }}
          />
        </>
      )}
    </div>
  );
}
