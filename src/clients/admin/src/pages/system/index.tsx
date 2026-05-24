import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CloudIcon, DatabaseIcon, ShieldAlertIcon } from "lucide-react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useSystemClient } from "@/components/containers/api-client-provider";
import { ValidationError } from "@shared/api/contracts/common-types";
import type {
  CreateDatabaseBackupResponse,
  CreateR2BucketResponse,
} from "@shared/api/types/system";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

/**
 * Validate an R2 bucket name client-side using the rules documented in the
 * R2 Bucket Management handoff:
 *  - lowercase
 *  - 3-63 chars
 *  - only letters/numbers/hyphens
 *  - start/end with letter or number
 *  - no consecutive hyphens
 *  - not an IPv4 address
 */
function validateBucketName(name: string): string | null {
  if (name.length < 3 || name.length > 63) {
    return "Bucket name must be 3-63 characters long.";
  }
  if (name !== name.toLowerCase()) {
    return "Bucket name must be lowercase.";
  }
  if (!/^[a-z0-9-]+$/.test(name)) {
    return "Bucket name can only contain lowercase letters, numbers, and hyphens.";
  }
  if (!/^[a-z0-9]/.test(name) || !/[a-z0-9]$/.test(name)) {
    return "Bucket name must start and end with a letter or number.";
  }
  if (name.includes("--")) {
    return "Bucket name must not contain consecutive hyphens.";
  }
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(name)) {
    return "Bucket name must not look like an IP address.";
  }
  return null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function R2BucketSection() {
  const systemClient = useSystemClient();
  const [bucketName, setBucketName] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);

  // The shared `CreateR2BucketRequest` type currently resolves to `undefined`
  // — the OpenAPI document for POST /api/internal/r2-buckets does not yet
  // expose a request schema. See
  // `requirements/backend-handoff/r2-bucket-request-schema.md`. Until that
  // ships, we call `createR2Bucket()` with no body and let the backend default
  // the bucket name to the current tenant signature. The custom-name input is
  // kept (disabled) so the validation helper and UX wiring are ready to flip
  // on once the request body type is generated.
  const customNameDisabled = true;

  const {
    mutate,
    data: result,
    isPending,
    isError,
    error,
    reset,
  } = useMutation({
    mutationFn: () => systemClient.createR2Bucket(),
    onSuccess: (res) => {
      toast.success(
        res.created
          ? `Bucket "${res.bucketName}" created`
          : `Bucket "${res.bucketName}" already exists`,
      );
    },
    onError: (err) => {
      if (err instanceof ValidationError) {
        toast.error(err.message);
      } else {
        toast.error(
          err instanceof Error ? err.message : "Bucket creation failed",
        );
      }
    },
  });

  function handleSubmit() {
    if (!customNameDisabled) {
      const trimmed = bucketName.trim();
      if (trimmed) {
        const validationError = validateBucketName(trimmed);
        if (validationError) {
          setClientError(validationError);
          return;
        }
      }
    }
    setClientError(null);
    reset();
    mutate();
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CloudIcon className="size-5 text-muted-foreground" />
          R2 Bucket
        </CardTitle>
        <CardDescription>
          Create a Cloudflare R2 bucket on the tenant's storage account. If the
          bucket already exists, this is a no-op that confirms it. The bucket
          name defaults to the current tenant signature.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="r2-bucket-name">
              Bucket name (optional)
            </FieldLabel>
            <Input
              id="r2-bucket-name"
              autoComplete="off"
              placeholder={
                customNameDisabled
                  ? "uses current tenant signature (custom names pending)"
                  : "leave blank to use tenant signature"
              }
              value={bucketName}
              onChange={(e) => {
                setBucketName(e.target.value);
                if (clientError) setClientError(null);
              }}
              aria-invalid={Boolean(clientError)}
              disabled={isPending || customNameDisabled}
            />
            <p className="text-xs text-muted-foreground">
              {customNameDisabled
                ? "Custom bucket names require a backend contract update — see requirements/backend-handoff/r2-bucket-request-schema.md. For now this creates a bucket named after the current tenant signature."
                : "Lowercase letters, numbers, and hyphens. 3-63 chars, no leading or trailing hyphen, no consecutive hyphens, not an IP address."}
            </p>
            {clientError && (
              <p className="text-xs text-destructive">{clientError}</p>
            )}
          </Field>
        </FieldGroup>

        <div>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? (
              <>
                <Spinner />
                Creating bucket…
              </>
            ) : (
              "Create bucket"
            )}
          </Button>
        </div>

        {isError && (
          <Alert variant="destructive">
            <AlertTitle>Bucket creation failed</AlertTitle>
            <AlertDescription>
              {error instanceof Error
                ? error.message
                : "The bucket could not be created. Please try again."}
            </AlertDescription>
          </Alert>
        )}

        {result && !isPending && <R2BucketResult result={result} />}
      </CardContent>
    </Card>
  );
}

function R2BucketResult({ result }: { result: CreateR2BucketResponse }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <div className="mb-3 flex items-center gap-2">
        <p className="text-sm font-medium">Bucket result</p>
        <Badge variant={result.created ? "default" : "secondary"}>
          {result.created ? "Newly created" : "Already existed"}
        </Badge>
      </div>
      <dl className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
        <div className="flex flex-col">
          <dt className="text-xs text-muted-foreground">Bucket name</dt>
          <dd className="break-all font-mono text-sm">{result.bucketName}</dd>
        </div>
        <div className="flex flex-col">
          <dt className="text-xs text-muted-foreground">Checked at</dt>
          <dd className="break-all font-mono text-sm">
            {formatDateTime(result.checkedAt)}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function BackupResult({ result }: { result: CreateDatabaseBackupResponse }) {
  const rows: { label: string; value: string }[] = [
    { label: "Bucket", value: result.bucketName },
    { label: "Object key", value: result.objectKey },
    { label: "Size", value: formatBytes(result.size) },
    { label: "Started", value: formatDateTime(result.startedAt) },
    { label: "Completed", value: formatDateTime(result.completedAt) },
    { label: "Duration", value: formatDuration(result.durationSeconds) },
  ];

  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <p className="mb-3 text-sm font-medium">Last backup</p>
      <dl className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.label} className="flex flex-col">
            <dt className="text-xs text-muted-foreground">{r.label}</dt>
            <dd className="break-all font-mono text-sm">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SystemToolsPage() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const systemClient = useSystemClient();

  const {
    mutate: runBackup,
    data: result,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: () => systemClient.createDatabaseBackup(),
    onSuccess: () => toast.success("Database backup completed"),
    onError: () => toast.error("Database backup failed"),
  });

  function handleConfirm() {
    setConfirmOpen(false);
    runBackup();
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">System</h1>
        <p className="text-sm text-muted-foreground">
          Privileged maintenance tools. Restricted to system administrators.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DatabaseIcon className="size-5 text-muted-foreground" />
            Database Backup
          </CardTitle>
          <CardDescription>
            Triggers a PostgreSQL <code>pg_dump</code> and streams it directly
            to the configured backup bucket. This is a long-running operation —
            keep this page open until it finishes.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Alert>
            <ShieldAlertIcon />
            <AlertTitle>Privileged action</AlertTitle>
            <AlertDescription>
              Backups can take several minutes depending on database size and
              add load to the database. Avoid running multiple backups
              concurrently.
            </AlertDescription>
          </Alert>

          <div>
            <Button
              onClick={() => setConfirmOpen(true)}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Spinner />
                  Backup in progress…
                </>
              ) : (
                "Create backup now"
              )}
            </Button>
          </div>

          {isError && (
            <Alert variant="destructive">
              <AlertTitle>Backup failed</AlertTitle>
              <AlertDescription>
                {error instanceof Error
                  ? error.message
                  : "The backup could not be completed. Please try again."}
              </AlertDescription>
            </Alert>
          )}

          {result && !isPending && <BackupResult result={result} />}
        </CardContent>
      </Card>

      <R2BucketSection />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create a database backup?</AlertDialogTitle>
            <AlertDialogDescription>
              This starts a full <code>pg_dump</code> and uploads it to the
              backup bucket. It may take several minutes and add load to the
              database. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Start backup
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
