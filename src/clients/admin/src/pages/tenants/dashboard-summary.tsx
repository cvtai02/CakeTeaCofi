import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangleIcon,
  Building2Icon,
  CheckCircle2Icon,
  ImageIcon,
  KeyRoundIcon,
  Link2Icon,
  PowerOffIcon,
  RefreshCwIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminErrorState } from "@/components/admin/admin-page";
import { useTenantManagementClient } from "@/components/containers/api-client-provider";
import type { TenantResponse } from "@shared/api/types/tenantmanagement";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  return new Intl.NumberFormat().format(n);
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatTile({
  label,
  value,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "neutral" | "good" | "warn" | "bad";
}) {
  const toneClass =
    tone === "good"
      ? "text-emerald-600"
      : tone === "warn"
        ? "text-amber-600"
        : tone === "bad"
          ? "text-red-600"
          : "text-muted-foreground";
  return (
    <div className="flex flex-col gap-1 rounded-lg border bg-card p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className={`size-3.5 ${toneClass}`} />
        {label}
      </div>
      <span className="text-xl font-semibold tabular-nums">
        {formatNumber(value)}
      </span>
    </div>
  );
}

function RecentTenantRow({ tenant }: { tenant: TenantResponse }) {
  return (
    <li className="flex items-center justify-between gap-2 py-1.5 text-sm">
      <span className="min-w-0 flex-1 truncate" title={tenant.name}>
        {tenant.name}
      </span>
      <span
        className="hidden truncate text-xs text-muted-foreground sm:inline sm:max-w-[18ch]"
        title={tenant.domain ?? undefined}
      >
        {tenant.domain ?? <span className="italic opacity-60">no domain</span>}
      </span>
      <Badge
        variant={tenant.isActive ? "default" : "secondary"}
        className="shrink-0"
      >
        {tenant.isActive ? "Active" : "Inactive"}
      </Badge>
      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
        {formatDate(tenant.created)}
      </span>
    </li>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardSummary() {
  const tenantClient = useTenantManagementClient();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["tenants", "summary"],
    queryFn: () => tenantClient.getSystemAdminDashboardSummary(),
    staleTime: 30_000,
  });

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Building2Icon className="size-4 text-muted-foreground" />
            Tenant operations overview
          </CardTitle>
          <CardDescription>
            System-admin counters across all tenants.
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCwIcon
            className={isFetching ? "animate-spin" : ""}
            data-icon
          />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {isError ? (
          <AdminErrorState
            title="Failed to load summary"
            description="Could not fetch the system-admin tenant summary. Try refreshing."
          />
        ) : isLoading || !data ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile
                label="Total"
                value={data.totalTenants}
                icon={Building2Icon}
              />
              <StatTile
                label="Active"
                value={data.activeTenants}
                icon={CheckCircle2Icon}
                tone="good"
              />
              <StatTile
                label="Inactive"
                value={data.inactiveTenants}
                icon={PowerOffIcon}
                tone="warn"
              />
              <StatTile
                label="Archived"
                value={data.archivedTenants}
                icon={AlertTriangleIcon}
                tone="neutral"
              />
              <StatTile
                label="Missing logo"
                value={data.tenantsMissingLogo}
                icon={ImageIcon}
                tone="warn"
              />
              <StatTile
                label="Missing domain"
                value={data.tenantsMissingDomain}
                icon={Link2Icon}
                tone="warn"
              />
              <StatTile
                label="Missing admin"
                value={data.tenantsMissingAdminAccount}
                icon={KeyRoundIcon}
                tone="bad"
              />
            </div>

            {data.recentTenants && data.recentTenants.length > 0 && (
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Recent tenants
                </p>
                <ul className="divide-y">
                  {data.recentTenants.map((t) => (
                    <RecentTenantRow key={t.id} tenant={t} />
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
