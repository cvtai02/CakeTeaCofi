import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { DatabaseIcon, ShieldAlertIcon } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useSystemClient } from "@/components/containers/api-client-provider";
import type { CreateDatabaseBackupResponse } from "@shared/api/types/system";

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

// ─── Sub-components ───────────────────────────────────────────────────────────

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
