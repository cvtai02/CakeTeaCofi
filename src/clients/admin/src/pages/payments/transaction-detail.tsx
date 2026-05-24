import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeftIcon,
  ExternalLinkIcon,
  ReceiptIcon,
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
import { usePaymentClient } from "@/components/containers/api-client-provider";
import { ROUTES } from "@/configs/routes";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatAmount(amount: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode || "USD",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount} ${currencyCode}`;
  }
}

function formatDateTime(iso?: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

type StatusBadgeVariant = "default" | "secondary" | "destructive" | "outline";

function statusVariant(status: string): StatusBadgeVariant {
  const s = status.toLowerCase();
  if (s.includes("paid") || s.includes("success")) return "default";
  if (s.includes("fail") || s.includes("cancel") || s.includes("reject"))
    return "destructive";
  if (s.includes("pending") || s.includes("processing")) return "secondary";
  return "outline";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="break-all text-sm">{children}</dd>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-40" />
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PaymentTransactionDetailPage() {
  const params = useParams<{ id: string; tenantSignature?: string }>();
  const tenantSignature = params.tenantSignature;
  const tenantPath = (path: string) => tenantSignature ? `/${tenantSignature}${path}` : path;
  const paymentClient = usePaymentClient();

  const parsedId = useMemo(() => {
    const raw = params.id;
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) && Number.isInteger(n) && n > 0 ? n : null;
  }, [params.id]);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["payment-transaction-admin", parsedId],
    queryFn: () => {
      if (parsedId === null) throw new Error("Invalid transaction id.");
      return paymentClient.getAdminTransactionById(parsedId);
    },
    enabled: parsedId !== null,
    staleTime: 30_000,
  });

  if (parsedId === null) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <AdminErrorState
          title="Invalid transaction id"
          description="The transaction id in the URL is not a positive integer."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" render={<Link to={tenantPath(ROUTES.orders)} />}>
            <ArrowLeftIcon data-icon="inline-start" />
            Orders
          </Button>
          <ReceiptIcon className="size-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold">
            Transaction #{parsedId}
          </h1>
          {data && (
            <Badge variant={statusVariant(String(data.status))}>
              {String(data.status)}
            </Badge>
          )}
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

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Payment transaction</CardTitle>
          <CardDescription>
            Tenant-admin view of a single payment transaction record.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isError ? (
            <AdminErrorState
              title="Failed to load transaction"
              description="The transaction could not be loaded. It may not exist in this tenant or you may not have access."
            />
          ) : isLoading || !data ? (
            <DetailSkeleton />
          ) : (
            <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <DetailRow label="Order code">
                <div className="flex items-center gap-2">
                  <span className="font-mono">{data.orderCode}</span>
                  <Button
                    variant="ghost"
                    size="xs"
                    title="Open order"
                    render={
                      <Link to={tenantPath(ROUTES.orderDetail(data.orderCode))} />
                    }
                  >
                    <ExternalLinkIcon />
                  </Button>
                </div>
              </DetailRow>
              <DetailRow label="Customer id">
                {data.customerId ? (
                  <span className="font-mono">{data.customerId}</span>
                ) : (
                  <span className="text-muted-foreground">Guest</span>
                )}
              </DetailRow>
              <DetailRow label="Amount">
                <span className="font-medium">
                  {formatAmount(data.amount, data.currencyCode)}
                </span>
              </DetailRow>
              <DetailRow label="Provider">
                <span className="capitalize">{data.provider}</span>
              </DetailRow>
              <DetailRow label="Provider payment id">
                <span className="font-mono">{data.providerPaymentId}</span>
              </DetailRow>
              <DetailRow label="Checkout URL">
                {data.checkoutUrl ? (
                  <a
                    href={data.checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Open checkout
                  </a>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </DetailRow>
              <DetailRow label="Paid at">
                {formatDateTime(data.paidAt)}
              </DetailRow>
              <DetailRow label="Cancelled at">
                {formatDateTime(data.cancelledAt)}
              </DetailRow>
              <DetailRow label="Created">
                {formatDateTime(data.created)}
              </DetailRow>
              <DetailRow label="Last modified">
                {formatDateTime(data.lastModified)}
              </DetailRow>
              {data.failureReason && (
                <div className="sm:col-span-2">
                  <DetailRow label="Failure reason">
                    <span className="text-destructive">
                      {data.failureReason}
                    </span>
                  </DetailRow>
                </div>
              )}
            </dl>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
