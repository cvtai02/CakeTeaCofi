import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CopyIcon,
  DownloadIcon,
  ExternalLinkIcon,
  FileIcon,
  ImageIcon,
  InfoIcon,
  RefreshCwIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminErrorState } from "@/components/admin/admin-page";
import { useContentClient } from "@/components/containers/api-client-provider";
import { toastApiError } from "@/lib/form-error";
import type {
  ListUnusedMediaFilesQuery,
  UnusedMediaFileResponse,
} from "@shared/api/types/content";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;

const SORT_OPTIONS = [
  { value: "lastModified", label: "Last modified" },
  { value: "size", label: "Size" },
  { value: "key", label: "Key" },
] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isImage(contentType: string): boolean {
  return contentType.startsWith("image/");
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="size-10 rounded-md" /></TableCell>
      <TableCell><Skeleton className="h-4 w-64" /></TableCell>
      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
    </TableRow>
  );
}

function FileThumbnail({ file }: { file: UnusedMediaFileResponse }) {
  const [imgError, setImgError] = useState(false);
  if (isImage(file.contentType) && !imgError) {
    return (
      <img
        src={file.url}
        alt={file.key}
        className="size-10 rounded-md object-cover"
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div className="flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground/50">
      {isImage(file.contentType)
        ? <ImageIcon className="size-5" />
        : <FileIcon className="size-5" />}
    </div>
  );
}

function UnusedFileRow({
  file,
  onRemoved,
}: {
  file: UnusedMediaFileResponse;
  onRemoved: (key: string) => void;
}) {
  const contentClient = useContentClient();
  const [importing, setImporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function copyKey() {
    try {
      await navigator.clipboard.writeText(file.key);
      toast.success("Object key copied");
    } catch {
      toast.error("Could not copy key");
    }
  }

  async function handleImport() {
    setImporting(true);
    try {
      await contentClient.importUnusedMediaFiles({ keys: [file.key] });
      toast.success("File imported into content library");
      onRemoved(file.key);
    } catch (err) {
      toastApiError(err, "Import failed");
    } finally {
      setImporting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await contentClient.deleteUnusedMediaFiles({ keys: [file.key] });
      toast.success("File deleted from storage");
      onRemoved(file.key);
    } catch (err) {
      toastApiError(err, "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  const busy = importing || deleting;

  return (
    <TableRow>
      <TableCell><FileThumbnail file={file} /></TableCell>
      <TableCell>
        <span className="block max-w-[28rem] truncate font-mono text-xs" title={file.key}>
          {file.key}
        </span>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="capitalize">{file.category}</Badge>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">{file.contentType}</TableCell>
      <TableCell className="text-sm">{formatBytes(file.size)}</TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatDate(file.lastModified)}
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleImport}
            disabled={busy}
            title="Import into content library"
          >
            <DownloadIcon className={importing ? "animate-pulse" : ""} />
            {importing ? "Importing…" : "Import"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={busy}
            title="Delete from storage"
            className="text-destructive hover:text-destructive"
          >
            <Trash2Icon className={deleting ? "animate-pulse" : ""} />
          </Button>
          <Button variant="ghost" size="sm" onClick={copyKey} title="Copy object key">
            <CopyIcon />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title="Open file"
            render={
              <a href={file.url} target="_blank" rel="noopener noreferrer" />
            }
          >
            <ExternalLinkIcon />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContentUnusedFilesPage() {
  const [search, setSearch] = useState("");
  const [prefix, setPrefix] = useState("");
  const [sortBy, setSortBy] = useState<string>("lastModified");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [removedKeys, setRemovedKeys] = useState<Set<string>>(new Set());

  const contentClient = useContentClient();

  const params: ListUnusedMediaFilesQuery = {
    PageNumber: page,
    PageSize: PAGE_SIZE,
    Search: search || undefined,
    Prefix: prefix || undefined,
    SortBy: sortBy,
    SortDirection: sortDirection,
  };

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["content-unused-files", params],
    queryFn: () => contentClient.listUnusedMediaFiles(params),
    staleTime: 30_000,
  });

  const allFiles = data?.items ?? [];
  // Optimistically hide rows that were imported or deleted this session.
  const files = allFiles.filter((f) => !removedKeys.has(f.key));
  // The wrapper response only documents `items`, so derive paging from the
  // returned page length rather than relying on undocumented total fields.
  const hasNextPage = allFiles.length === PAGE_SIZE;

  function resetToFirstPage() {
    setPage(1);
  }

  function handleRemoved(key: string) {
    setRemovedKeys((prev) => new Set([...prev, key]));
  }

  function toggleSortDirection() {
    setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    resetToFirstPage();
  }

  const hasFilters = Boolean(search || prefix);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Unused Media Files</h1>
          <p className="text-sm text-muted-foreground">
            Storage objects that were uploaded but never confirmed into the
            content library.
          </p>
        </div>
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

      <Alert>
        <InfoIcon />
        <AlertTitle>About this list</AlertTitle>
        <AlertDescription>
          These objects exist in tenant object storage but have no matching
          record in the content <code>Files</code> table — usually orphaned
          uploads from interrupted flows. Review them before removing the
          underlying objects from storage.
        </AlertDescription>
      </Alert>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by key…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetToFirstPage(); }}
            className="pl-9"
          />
        </div>

        <Input
          placeholder="Prefix (e.g. product/)"
          value={prefix}
          onChange={(e) => { setPrefix(e.target.value); resetToFirstPage(); }}
          className="w-56"
        />

        <Select
          value={sortBy}
          onValueChange={(v) => { setSortBy(v ?? "lastModified"); resetToFirstPage(); }}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" onClick={toggleSortDirection}>
          {sortDirection === "asc" ? "Ascending" : "Descending"}
        </Button>
      </div>

      {/* Table */}
      {isError ? (
        <AdminErrorState
          title="Failed to load unused files"
          description="There was an error fetching unused media files. Please try again."
        />
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14" />
                <TableHead>Key</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Last modified</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => <RowSkeleton key={i} />)
              ) : files.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-16 text-center">
                    <p className="text-sm font-medium">No unused files found</p>
                    <p className="text-xs text-muted-foreground">
                      {hasFilters
                        ? "Try adjusting your search or prefix filter."
                        : "Every uploaded object is confirmed in the content library."}
                    </p>
                    {hasFilters && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => { setSearch(""); setPrefix(""); resetToFirstPage(); }}
                      >
                        Clear filters
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                files.map((file) => (
                  <UnusedFileRow key={file.key} file={file} onRemoved={handleRemoved} />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {!isError && (page > 1 || hasNextPage) && (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Page {page}
            {files.length > 0 && ` · showing ${files.length} object${files.length > 1 ? "s" : ""}`}
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
    </div>
  );
}
