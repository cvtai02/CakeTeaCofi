import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  BoxIcon,
  ClipboardListIcon,
  LayoutDashboardIcon,
  PlusIcon,
  UsersIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  useOrderClient,
  useProductCatalogClient,
  useAccountClient,
} from "@/components/containers/api-client-provider";
import { ROUTES } from "@/configs/routes";
import { useTenantNavigate } from "@/hooks/use-tenant-navigate";
import { OrderStatusBadge } from "@/pages/orders/components/OrderStatusBadge";
import type { OrderSummaryResponse } from "@shared/api/types/order";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  isLoading,
}: {
  label: string;
  value: string | number | undefined;
  icon: React.ComponentType<{ className?: string }>;
  isLoading?: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="size-5 text-primary" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">{label}</span>
          {isLoading ? (
            <Skeleton className="h-6 w-16" />
          ) : (
            <span className="text-xl font-semibold tabular-nums">{value ?? "—"}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Recent orders table ──────────────────────────────────────────────────────

function RecentOrderRow({
  order,
  onView,
}: {
  order: OrderSummaryResponse;
  onView: (code: string) => void;
}) {
  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => onView(order.code)}
    >
      <TableCell className="font-mono text-xs">{order.code}</TableCell>
      <TableCell>
        <OrderStatusBadge status={order.status as string} />
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {formatCurrency((order as OrderSummaryResponse & { total?: number }).total)}
      </TableCell>
      <TableCell className="text-muted-foreground text-xs">
        {order.createdAt ? formatDate(order.createdAt) : "—"}
      </TableCell>
    </TableRow>
  );
}

// ─── Quick-action card ────────────────────────────────────────────────────────

function QuickAction({
  label,
  description,
  icon: Icon,
  onClick,
}: {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-start gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="size-4 text-primary" />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TenantDashboardPage() {
  const { tenantSignature } = useParams<{ tenantSignature: string }>();
  const navigate = useTenantNavigate();
  const orderClient = useOrderClient();
  const productCatalogClient = useProductCatalogClient();
  const accountClient = useAccountClient();

  const recentOrders = useQuery({
    queryKey: ["dashboard-recent-orders", tenantSignature],
    queryFn: () => orderClient.listAdminOrders({ pageNumber: 1, pageSize: 8 }),
    staleTime: 30_000,
  });

  const productStats = useQuery({
    queryKey: ["dashboard-product-count", tenantSignature],
    queryFn: () => productCatalogClient.listProduct({ pageNumber: 1, pageSize: 1 }),
    staleTime: 60_000,
  });

  const customerStats = useQuery({
    queryKey: ["dashboard-customer-count", tenantSignature],
    queryFn: () => accountClient.listAdminProfiles({ pageNumber: 1, pageSize: 1 }),
    staleTime: 60_000,
  });

  const orders = recentOrders.data?.items ?? [];
  const totalOrders = recentOrders.data?.totalCount;
  const totalProducts = productStats.data?.totalCount;
  const totalCustomers = customerStats.data?.totalCount;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <LayoutDashboardIcon className="size-5 text-muted-foreground" />
          <div>
            <h1 className="text-xl font-semibold capitalize">{tenantSignature}</h1>
            <p className="text-sm text-muted-foreground">Tenant dashboard</p>
          </div>
        </div>
        <Button size="sm" onClick={() => navigate(ROUTES.orderCreate)}>
          <PlusIcon data-icon="inline-start" />
          New order
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total orders"
          value={totalOrders}
          icon={ClipboardListIcon}
          isLoading={recentOrders.isLoading}
        />
        <StatCard
          label="Products"
          value={totalProducts}
          icon={BoxIcon}
          isLoading={productStats.isLoading}
        />
        <StatCard
          label="Customers"
          value={totalCustomers}
          icon={UsersIcon}
          isLoading={customerStats.isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Recent orders</CardTitle>
              <CardDescription>Latest 8 orders across all statuses.</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTES.orders)}
            >
              View all
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recentOrders.isError ? (
              <div className="px-6 pb-4">
                <AdminErrorState
                  title="Failed to load orders"
                  description="Could not fetch recent orders."
                />
              </div>
            ) : recentOrders.isLoading ? (
              <div className="flex flex-col gap-2 px-6 pb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <ClipboardListIcon className="size-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No orders yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <RecentOrderRow
                      key={order.code}
                      order={order}
                      onView={(code) => navigate(ROUTES.orderDetail(code))}
                    />
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-muted-foreground">Quick actions</p>
          <QuickAction
            label="Add product"
            description="Create a new product listing"
            icon={BoxIcon}
            onClick={() => navigate(ROUTES.productNew)}
          />
          <QuickAction
            label="New order"
            description="Place an order for a customer"
            icon={ClipboardListIcon}
            onClick={() => navigate(ROUTES.orderCreate)}
          />
          <QuickAction
            label="Add customer"
            description="Register a new customer profile"
            icon={UsersIcon}
            onClick={() => navigate(ROUTES.customerNew)}
          />
          <QuickAction
            label="All products"
            description="Browse and manage your catalog"
            icon={BoxIcon}
            onClick={() => navigate(ROUTES.products)}
          />
        </div>
      </div>
    </div>
  );
}
