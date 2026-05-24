import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTenantNavigate } from "@/hooks/use-tenant-navigate";
import {
  ArrowLeftIcon,
  ClipboardListIcon,
  TruckIcon,
  XCircleIcon,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { useOrderClient } from "@/components/containers/api-client-provider";
import { AdminErrorState } from "@/components/admin/admin-page";
import { ApiError } from "@shared/api/contracts/common-types";
import { ROUTES } from "@/configs/routes";

import { OrderStatusBadge } from "./components/OrderStatusBadge";

// Statuses where the admin still has a chance to ship or cancel.
// Backend rejects invalid transitions; this just hides clearly inapplicable
// buttons (Shipped / Cancelled / Rejected).
const SHIPPABLE_STATUSES = new Set(["Placed", "Paid"]);
const CANCELLABLE_STATUSES = new Set([
  "Draft",
  "PendingInventory",
  "Placed",
  "Paid",
]);

function describeApiError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message || fallback;
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}

function LabeledValue({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm">{value ?? <span className="italic opacity-40">—</span>}</span>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id: orderCode } = useParams<{ id: string }>();
  const navigate = useTenantNavigate();
  const orderClient = useOrderClient();
  const queryClient = useQueryClient();

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["admin-order", orderCode],
    queryFn: () => orderClient.getAdminOrderByCode(orderCode!),
    enabled: !!orderCode,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-order", orderCode] });
  };

  const shipMutation = useMutation({
    mutationFn: () => {
      if (!orderCode) throw new Error("Missing order code.");
      return orderClient.shipAdminOrder(orderCode);
    },
    onSuccess: () => {
      toast.success(`Order ${orderCode} marked shipped`);
      setShipConfirmOpen(false);
      invalidate();
    },
    onError: (err) => {
      toast.error(describeApiError(err, "Failed to mark order shipped."));
    },
  });

  // The shared `CancelAdminOrderRequest` type resolves to `undefined` — the
  // OpenAPI document for POST /api/Order/orders/admin/{code}/cancel does not
  // expose a request body schema. See
  // requirements/backend-handoff/cancel-admin-order-request-schema.md.
  // Until that lands, we call `cancelAdminOrder(code)` without a body and
  // the reason textarea is disabled with an inline hint. The handler shape
  // is kept ready to forward `{ reason }` as soon as the type is generated.
  const cancelReasonSupported = false;
  const cancelMutation = useMutation({
    mutationFn: () => {
      if (!orderCode) throw new Error("Missing order code.");
      return orderClient.cancelAdminOrder(orderCode);
    },
    onSuccess: () => {
      toast.success(`Order ${orderCode} cancelled`);
      setCancelOpen(false);
      setCancelReason("");
      invalidate();
    },
    onError: (err) => {
      toast.error(describeApiError(err, "Failed to cancel order."));
    },
  });

  const [shipConfirmOpen, setShipConfirmOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const canShip = order ? SHIPPABLE_STATUSES.has(order.status) : false;
  const canCancel = order ? CANCELLABLE_STATUSES.has(order.status) : false;

  return (
    <div className="flex min-h-0 flex-col bg-muted/30">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b bg-background px-6">
        <SidebarTrigger className="-ml-2" />
        <Separator orientation="vertical" className="h-5" />
        <Button
          variant="ghost"
          size="sm"
          type="button"
          className="-ml-2 gap-1.5"
          onClick={() => navigate(ROUTES.orders)}
        >
          <ArrowLeftIcon className="size-4" />
          Orders
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <div className="flex items-center gap-2">
          <ClipboardListIcon className="size-4 text-muted-foreground" />
          {isLoading ? (
            <Skeleton className="h-4 w-24" />
          ) : (
            <h1 className="text-sm font-semibold font-mono">{order?.code}</h1>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {canShip && (
            <Button
              size="sm"
              onClick={() => setShipConfirmOpen(true)}
              disabled={shipMutation.isPending}
            >
              <TruckIcon data-icon="inline-start" />
              {shipMutation.isPending ? "Shipping…" : "Ship"}
            </Button>
          )}
          {canCancel && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setCancelOpen(true)}
              disabled={cancelMutation.isPending}
            >
              <XCircleIcon data-icon="inline-start" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto w-full max-w-3xl p-6 flex flex-col gap-6">
        {isError ? (
          <AdminErrorState
            title="Failed to load order"
            description="Could not fetch this order. It may not exist or you may not have access."
          />
        ) : isLoading ? (
          <>
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </>
        ) : order ? (
          <>
            {/* Rejection reason banner */}
            {order.status === "Rejected" && order.rejectionReason && (
              <Alert variant="destructive">
                <AlertTitle>Order Rejected</AlertTitle>
                <AlertDescription>{order.rejectionReason}</AlertDescription>
              </Alert>
            )}

            {/* Summary card */}
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold">Order Summary</h2>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <LabeledValue label="Order code" value={<code className="font-mono">{order.code}</code>} />
                <LabeledValue
                  label="Customer"
                  value={order.customerId ?? <span className="italic text-muted-foreground">Guest</span>}
                />
                <LabeledValue
                  label="Total"
                  value={
                    <span className="font-medium tabular-nums">
                      {new Intl.NumberFormat().format(Number(order.totalAmount))}{" "}
                      {order.currencyCode}
                    </span>
                  }
                />

              </div>
            </div>

            {/* Shipping address */}
            {order.shippingAddress && (
              <div className="rounded-xl border bg-card p-6">
                <h2 className="text-sm font-semibold mb-4">Shipping Address</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <LabeledValue label="Name" value={order.shippingAddress.ownerName} />
                  <LabeledValue label="Type" value={order.shippingAddress.type} />
                  <LabeledValue label="Phone" value={order.shippingAddress.phoneNumber} />
                  <LabeledValue label="Email" value={order.shippingAddress.email} />
                  <LabeledValue label="Country" value={order.shippingAddress.country} />
                  <LabeledValue label="Administrative area" value={order.shippingAddress.administrativeArea} />
                  <LabeledValue label="Locality" value={order.shippingAddress.locality} />
                  <LabeledValue label="Sub-locality" value={order.shippingAddress.subLocality} />
                  <LabeledValue label="Postal code" value={order.shippingAddress.postalCode} />
                  <LabeledValue label="Address line 1" value={order.shippingAddress.line1} />
                  <LabeledValue label="Address line 2" value={order.shippingAddress.line2} />
                </div>
              </div>
            )}

            {/* Line items */}
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h2 className="text-sm font-semibold">
                  Line Items
                  {order.lines?.length ? (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {order.lines.length}
                    </Badge>
                  ) : null}
                </h2>
              </div>
              {!order.lines?.length ? (
                <p className="px-6 py-8 text-sm text-center text-muted-foreground">
                  No line items.
                </p>
              ) : (
                <div className="divide-y">
                  {order.lines.map((line) => (
                    <div key={line.id} className="flex items-center gap-4 px-6 py-3">
                      <Avatar className="size-10 shrink-0 rounded-md">
                        <AvatarImage src={line.imageUrl ?? undefined} alt={line.productName} />
                        <AvatarFallback className="rounded-md text-xs">
                          {line.productName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{line.productName}</p>
                        <p className="text-xs text-muted-foreground truncate">{line.variantName}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm tabular-nums">
                          {new Intl.NumberFormat().format(Number(line.unitPrice))} × {line.quantity}
                        </p>
                        <p className="text-xs text-muted-foreground tabular-nums">
                          = {new Intl.NumberFormat().format(Number(line.subtotal))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="border-t px-6 py-3 flex justify-end">
                <p className="text-sm font-semibold">
                  Total:{" "}
                  <span className="tabular-nums">
                    {new Intl.NumberFormat().format(Number(order.totalAmount))}{" "}
                    {order.currencyCode}
                  </span>
                </p>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Ship confirmation */}
      <AlertDialog open={shipConfirmOpen} onOpenChange={setShipConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark order shipped?</AlertDialogTitle>
            <AlertDialogDescription>
              This marks order <code>{order?.code}</code> as shipped. Use this
              for placed COD orders and for paid online-payment orders. The
              backend will reject the request if the order is in a state that
              cannot transition to shipped.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={shipMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => shipMutation.mutate()}
              disabled={shipMutation.isPending}
            >
              {shipMutation.isPending ? "Shipping…" : "Ship"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel dialog with optional reason */}
      <Dialog
        open={cancelOpen}
        onOpenChange={(open) => {
          setCancelOpen(open);
          if (!open) setCancelReason("");
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel order {order?.code}</DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="cancel-reason">Reason (optional)</FieldLabel>
              <Textarea
                id="cancel-reason"
                rows={3}
                maxLength={2000}
                placeholder={
                  cancelReasonSupported
                    ? "Optional cancellation reason (max 2000 chars)"
                    : "Reason capture pending backend contract update"
                }
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                disabled={cancelMutation.isPending || !cancelReasonSupported}
              />
              <p className="text-xs text-muted-foreground">
                {cancelReasonSupported
                  ? "The backend rejects cancellation if the order is in a state that cannot be cancelled (e.g. already shipped). The reason is stored with the order for audit."
                  : "Reason capture requires a backend contract update — see requirements/backend-handoff/cancel-admin-order-request-schema.md. The backend still rejects cancellation if the order is in a state that cannot be cancelled (e.g. already shipped)."}
              </p>
            </Field>
          </FieldGroup>
          <DialogFooter showCloseButton>
            <Button
              variant="destructive"
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? "Cancelling…" : "Cancel order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
