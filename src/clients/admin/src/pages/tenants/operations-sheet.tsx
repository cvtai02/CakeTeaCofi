import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  CloudIcon,
  KeyRoundIcon,
  MailIcon,
  PencilIcon,
  PowerIcon,
  PowerOffIcon,
  RefreshCwIcon,
  ShieldAlertIcon,
  UsersIcon,
  XCircleIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminErrorState } from "@/components/admin/admin-page";
import {
  useSystemClient,
  useTenantManagementClient,
} from "@/components/containers/api-client-provider";
import type {
  TenantAdminUserResponse,
  TenantResponse,
  UpdateTenantAdminAccountRequest,
} from "@shared/api/types/tenantmanagement";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDateTime(iso?: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function BoolBadge({
  value,
  trueLabel = "Yes",
  falseLabel = "No",
}: {
  value: boolean | null | undefined;
  trueLabel?: string;
  falseLabel?: string;
}) {
  if (value === null || value === undefined) {
    return <Badge variant="outline">Unknown</Badge>;
  }
  return value ? (
    <Badge>{trueLabel}</Badge>
  ) : (
    <Badge variant="secondary">{falseLabel}</Badge>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="break-all text-sm">{children}</dd>
    </div>
  );
}

// ─── Provisioning section ────────────────────────────────────────────────────

function ProvisioningSection({ tenant }: { tenant: TenantResponse }) {
  const tenantClient = useTenantManagementClient();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["tenant-provisioning", tenant.id],
    queryFn: () => tenantClient.getTenantProvisioningStatus(tenant.id),
    staleTime: 15_000,
  });

  function invalidate() {
    queryClient.invalidateQueries({
      queryKey: ["tenant-provisioning", tenant.id],
    });
    queryClient.invalidateQueries({
      queryKey: ["r2-bucket-status", tenant.id],
    });
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Provisioning</h3>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCwIcon className={isFetching ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {isError ? (
        <AdminErrorState
          title="Failed to load provisioning status"
          description="The status check failed. Try refreshing or check the bucket directly in the R2 section."
        />
      ) : isLoading || !data ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded" />
          ))}
        </div>
      ) : (
        <>
          {!data.customDomainAttached && (
            <Alert>
              <AlertTriangleIcon />
              <AlertTitle>Custom domain not attached</AlertTitle>
              <AlertDescription>
                The R2 custom domain <code>{data.customDomain}</code> is not
                yet attached to bucket <code>{data.bucketName}</code>. Use the
                Retry button in the R2 section below.
              </AlertDescription>
            </Alert>
          )}

          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DetailRow label="Domain">
              {data.domain ?? (
                <span className="italic text-muted-foreground">
                  Not set
                </span>
              )}
            </DetailRow>
            <DetailRow label="CDN base URL">
              <span className="font-mono text-xs">{data.cdnBaseUrl}</span>
            </DetailRow>
            <DetailRow label="Bucket name">
              <span className="font-mono text-xs">{data.bucketName}</span>
            </DetailRow>
            <DetailRow label="Custom domain">
              <span className="font-mono text-xs">{data.customDomain}</span>
            </DetailRow>
            <DetailRow label="Has logo">
              <BoolBadge value={data.hasLogo} />
            </DetailRow>
            <DetailRow label="Has admin account">
              <BoolBadge value={data.hasAdminAccount} />
            </DetailRow>
            <DetailRow label="Bucket exists">
              <BoolBadge value={data.bucketExists} />
            </DetailRow>
            <DetailRow label="Domain attached">
              <BoolBadge value={data.customDomainAttached} />
            </DetailRow>
            <DetailRow label="Domain status">
              {data.customDomainStatus ?? (
                <span className="italic text-muted-foreground">—</span>
              )}
            </DetailRow>
            <DetailRow label="Checked at">
              {formatDateTime(data.checkedAt)}
            </DetailRow>
          </dl>
        </>
      )}

      <R2BucketSection
        bucketName={data?.bucketName}
        customDomain={data?.customDomain}
        onChanged={invalidate}
      />
    </section>
  );
}

// ─── R2 bucket section ───────────────────────────────────────────────────────

function R2BucketSection({
  bucketName,
  customDomain,
  onChanged,
}: {
  bucketName: string | undefined;
  customDomain: string | undefined;
  onChanged: () => void;
}) {
  const systemClient = useSystemClient();
  const enabled = Boolean(bucketName);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["r2-bucket-status", bucketName, customDomain],
    queryFn: () => {
      if (!bucketName) throw new Error("Missing bucket name.");
      return systemClient.getR2BucketStatus(bucketName, {
        customDomain,
      });
    },
    enabled,
    staleTime: 15_000,
  });

  const retry = useMutation({
    mutationFn: () => {
      if (!bucketName || !customDomain) {
        throw new Error("Bucket name and custom domain are required.");
      }
      return systemClient.retryR2CustomDomain(bucketName, { customDomain });
    },
    onSuccess: () => {
      toast.success("Custom domain attach retried");
      refetch();
      onChanged();
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Retry failed.",
      );
    },
  });

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="flex items-center gap-2 text-sm font-medium">
          <CloudIcon className="size-4 text-muted-foreground" />
          R2 bucket status
        </h4>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => refetch()}
            disabled={!enabled || isFetching}
          >
            <RefreshCwIcon className={isFetching ? "animate-spin" : ""} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="xs"
            onClick={() => retry.mutate()}
            disabled={
              !enabled ||
              !customDomain ||
              retry.isPending ||
              (data?.customDomainAttached ?? false)
            }
            title={
              !customDomain
                ? "No custom domain configured"
                : data?.customDomainAttached
                  ? "Custom domain already attached"
                  : "Retry attaching the custom domain"
            }
          >
            {retry.isPending ? "Retrying…" : "Retry attach"}
          </Button>
        </div>
      </div>

      {!enabled ? (
        <p className="text-xs text-muted-foreground">
          Bucket name not available yet.
        </p>
      ) : isError ? (
        <AdminErrorState
          title="Failed to read bucket status"
          description="Could not query R2 for this bucket. Try refreshing."
        />
      ) : isLoading || !data ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 rounded" />
          ))}
        </div>
      ) : (
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DetailRow label="Bucket name">
            <span className="font-mono text-xs">{data.bucketName}</span>
          </DetailRow>
          <DetailRow label="Custom domain">
            <span className="font-mono text-xs">
              {data.customDomain ?? "—"}
            </span>
          </DetailRow>
          <DetailRow label="Bucket exists">
            <BoolBadge value={data.bucketExists} />
          </DetailRow>
          <DetailRow label="Domain attached">
            <BoolBadge value={data.customDomainAttached} />
          </DetailRow>
          <DetailRow label="Domain enabled">
            <BoolBadge value={data.customDomainEnabled} />
          </DetailRow>
          <DetailRow label="Domain status">
            {data.customDomainStatus ?? (
              <span className="italic text-muted-foreground">—</span>
            )}
          </DetailRow>
          <DetailRow label="Checked at">
            {formatDateTime(data.checkedAt)}
          </DetailRow>
        </dl>
      )}
    </div>
  );
}

// ─── Admin users section ─────────────────────────────────────────────────────

function AdminUserCard({
  tenantId,
  user,
}: {
  tenantId: number;
  user: TenantAdminUserResponse;
}) {
  const tenantClient = useTenantManagementClient();
  const queryClient = useQueryClient();

  const [resetOpen, setResetOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editEnabled, setEditEnabled] = useState(false);

  function invalidate() {
    queryClient.invalidateQueries({
      queryKey: ["tenant-admin-users", tenantId],
    });
    queryClient.invalidateQueries({ queryKey: ["tenants"] });
  }

  const resetPwd = useMutation({
    mutationFn: (input: { newPassword: string }) =>
      tenantClient.resetTenantAdminPassword(tenantId, input),
    onSuccess: () => {
      toast.success("Password reset");
      setResetOpen(false);
      setNewPassword("");
      invalidate();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to reset password.");
    },
  });

  const changeEmail = useMutation({
    mutationFn: (input: { email: string }) =>
      tenantClient.changeTenantAdminEmail(tenantId, input),
    onSuccess: () => {
      toast.success("Email changed");
      setEmailOpen(false);
      setNewEmail("");
      invalidate();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to change email.");
    },
  });

  const setEnabled = useMutation({
    mutationFn: (enabled: boolean) =>
      tenantClient.setTenantAdminEnabled(tenantId, { enabled }),
    onSuccess: (_data, enabled) => {
      toast.success(enabled ? "Admin enabled" : "Admin disabled");
      invalidate();
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to update admin state.",
      );
    },
  });

  const updateAccount = useMutation({
    mutationFn: (input: UpdateTenantAdminAccountRequest) =>
      tenantClient.updateTenantAdminAccount(tenantId, input),
    onSuccess: () => {
      toast.success("Admin account updated");
      setEditOpen(false);
      invalidate();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update admin account.");
    },
  });

  function openEdit() {
    setEditEmail(user.email ?? "");
    setEditPassword("");
    setEditDisplayName(user.displayName ?? "");
    setEditEnabled(user.enabled);
    setEditOpen(true);
    setResetOpen(false);
    setEmailOpen(false);
  }

  function handleUpdate() {
    const patch: UpdateTenantAdminAccountRequest = { enabled: editEnabled };
    if (editEmail.trim()) patch.email = editEmail.trim();
    if (editPassword.trim()) patch.password = editPassword.trim();
    if (editDisplayName.trim()) patch.displayName = editDisplayName.trim();
    updateAccount.mutate(patch);
  }

  // eslint-disable-next-line react-hooks/purity
  const lockedOut = user.lockoutEnd && new Date(user.lockoutEnd).getTime() > Date.now();

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-medium">
              {user.email ?? user.userName ?? user.identityUserId}
            </p>
            <Badge variant={user.enabled ? "default" : "secondary"}>
              {user.enabled ? "Enabled" : "Disabled"}
            </Badge>
            <Badge variant={user.emailConfirmed ? "outline" : "secondary"}>
              {user.emailConfirmed ? "Email confirmed" : "Email pending"}
            </Badge>
            {lockedOut && (
              <Badge variant="destructive">
                Locked until {formatDateTime(user.lockoutEnd)}
              </Badge>
            )}
          </div>
          {user.displayName && (
            <p className="text-xs text-muted-foreground">
              {user.displayName}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant={editOpen ? "secondary" : "ghost"}
            size="xs"
            onClick={() => (editOpen ? setEditOpen(false) : openEdit())}
            title="Edit admin account"
          >
            <PencilIcon />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => {
              setResetOpen((v) => !v);
              setEmailOpen(false);
              setEditOpen(false);
            }}
            title="Reset password"
          >
            <KeyRoundIcon />
            Reset pwd
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => {
              setEmailOpen((v) => !v);
              setResetOpen(false);
              setEditOpen(false);
              if (!emailOpen) setNewEmail(user.email ?? "");
            }}
            title="Change email"
          >
            <MailIcon />
            Email
          </Button>
          <Button
            variant={user.enabled ? "ghost" : "default"}
            size="xs"
            onClick={() => setEnabled.mutate(!user.enabled)}
            disabled={setEnabled.isPending}
            title={user.enabled ? "Disable login" : "Enable login"}
          >
            {user.enabled ? <PowerOffIcon /> : <PowerIcon />}
            {user.enabled ? "Disable" : "Enable"}
          </Button>
        </div>
      </div>

      {editOpen && (
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor={`edit-email-${user.identityUserId}`}>Email</FieldLabel>
            <Input
              id={`edit-email-${user.identityUserId}`}
              type="email"
              autoComplete="off"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              disabled={updateAccount.isPending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`edit-pwd-${user.identityUserId}`}>
              New password{" "}
              <span className="text-muted-foreground font-normal">(leave blank to keep current)</span>
            </FieldLabel>
            <Input
              id={`edit-pwd-${user.identityUserId}`}
              type="password"
              autoComplete="new-password"
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
              disabled={updateAccount.isPending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`edit-name-${user.identityUserId}`}>Display name</FieldLabel>
            <Input
              id={`edit-name-${user.identityUserId}`}
              value={editDisplayName}
              onChange={(e) => setEditDisplayName(e.target.value)}
              disabled={updateAccount.isPending}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <Checkbox
              checked={editEnabled}
              onCheckedChange={(v) => setEditEnabled(Boolean(v))}
              disabled={updateAccount.isPending}
            />
            Account enabled
          </label>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditOpen(false)}
              disabled={updateAccount.isPending}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleUpdate}
              disabled={updateAccount.isPending}
            >
              {updateAccount.isPending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </FieldGroup>
      )}

      {resetOpen && (
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor={`reset-${user.identityUserId}`}>
              New password
            </FieldLabel>
            <Input
              id={`reset-${user.identityUserId}`}
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={resetPwd.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Must satisfy backend password rules. Share securely; the
              password is not stored on the tenant record.
            </p>
          </Field>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setResetOpen(false);
                setNewPassword("");
              }}
              disabled={resetPwd.isPending}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (!newPassword.trim()) {
                  toast.error("Password is required.");
                  return;
                }
                resetPwd.mutate({ newPassword });
              }}
              disabled={resetPwd.isPending}
            >
              {resetPwd.isPending ? "Resetting…" : "Reset password"}
            </Button>
          </div>
        </FieldGroup>
      )}

      {emailOpen && (
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor={`email-${user.identityUserId}`}>
              New email
            </FieldLabel>
            <Input
              id={`email-${user.identityUserId}`}
              type="email"
              autoComplete="off"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              disabled={changeEmail.isPending}
            />
          </Field>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEmailOpen(false);
                setNewEmail("");
              }}
              disabled={changeEmail.isPending}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (!newEmail.trim()) {
                  toast.error("Email is required.");
                  return;
                }
                changeEmail.mutate({ email: newEmail });
              }}
              disabled={changeEmail.isPending}
            >
              {changeEmail.isPending ? "Saving…" : "Change email"}
            </Button>
          </div>
        </FieldGroup>
      )}
    </div>
  );
}

function AdminUsersSection({ tenant }: { tenant: TenantResponse }) {
  const tenantClient = useTenantManagementClient();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["tenant-admin-users", tenant.id],
    queryFn: () => tenantClient.listTenantAdminUsers(tenant.id),
    staleTime: 15_000,
  });

  const users = data?.items ?? [];

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <UsersIcon className="size-4 text-muted-foreground" />
          Admin users
        </h3>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCwIcon className={isFetching ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {isError ? (
        <AdminErrorState
          title="Failed to load admin users"
          description="Could not list the tenant's admin identity users."
        />
      ) : isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <Alert>
          <ShieldAlertIcon />
          <AlertTitle>No admin users</AlertTitle>
          <AlertDescription>
            This tenant has no admin identity users yet. Use "Provision admin"
            on the tenant card to create one.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="flex flex-col gap-2">
          {users.map((user) => (
            <AdminUserCard
              key={user.identityUserId}
              tenantId={tenant.id}
              user={user}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Sheet entry ─────────────────────────────────────────────────────────────

export function TenantOperationsSheet({
  tenant,
  onOpenChange,
}: {
  tenant: TenantResponse | null;
  onOpenChange: (open: boolean) => void;
}) {
  const open = tenant !== null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-2xl overflow-y-auto sm:max-w-2xl"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {tenant?.name ?? "Tenant"}
            {tenant && (
              <Badge variant={tenant.isActive ? "default" : "secondary"}>
                {tenant.isActive ? "Active" : "Inactive"}
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription className="flex flex-wrap items-center gap-2">
            {tenant && (
              <>
                <span className="font-mono text-xs">{tenant.signature}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-xs">
                  {tenant.domain ?? (
                    <span className="italic">no domain</span>
                  )}
                </span>
                {tenant.isActive ? (
                  <CheckCircle2Icon className="size-3 text-emerald-600" />
                ) : (
                  <XCircleIcon className="size-3 text-muted-foreground" />
                )}
              </>
            )}
          </SheetDescription>
        </SheetHeader>

        {tenant && (
          <div className="flex flex-col gap-6 px-4 pb-6">
            <ProvisioningSection tenant={tenant} />
            <Separator />
            <AdminUsersSection tenant={tenant} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
