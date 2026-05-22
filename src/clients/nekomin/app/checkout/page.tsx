"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { ValidationError } from "@modular-monolith/clients-shared/api/contracts";
import type {
  ShippingCountryResponse,
  ShippingAdministrativeAreaResponse,
  ShippingLocalityResponse,
} from "@modular-monolith/clients-shared/api/contracts";
import {
  useOrderClient,
  usePaymentClient,
  useShippingClient,
} from "@/app/components/api-client-provider";
import { usePaymentMethods } from "@/app/hooks/use-payment-methods";

type AddressFields = {
  ownerName: string;
  type: string;
  phoneNumber: string;
  email: string;
  country: string;
  administrativeArea: string;
  locality: string;
  subLocality: string;
  postalCode: string;
  line1: string;
  line2: string;
};

const DEFAULT_ADDRESS: AddressFields = {
  ownerName: "",
  type: "Home",
  phoneNumber: "",
  email: "",
  country: "VN",
  administrativeArea: "",
  locality: "",
  subLocality: "",
  postalCode: "",
  line1: "",
  line2: "",
};

type ResultState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "succeeded"; orderCode: string }
  | { kind: "redirecting"; checkoutUrl: string }
  | { kind: "not-implemented"; provider: string }
  | { kind: "error"; message: string };

function readItemsFromSearch(params: URLSearchParams) {
  const variantIds = params.getAll("variantId");
  const quantities = params.getAll("quantity");
  return variantIds
    .map((variantId, i) => ({
      variantId,
      quantity: Math.max(1, Number(quantities[i] ?? "1") || 1),
    }))
    .filter((it) => it.variantId);
}

export default function CheckoutPageWrapper() {
  return (
    <Suspense>
      <CheckoutPage />
    </Suspense>
  );
}

function CheckoutPage() {
  const searchParams = useSearchParams();
  const orderClient = useOrderClient();
  const paymentClient = usePaymentClient();
  const shippingClient = useShippingClient();
  const { methods, loading: methodsLoading, error: methodsError } = usePaymentMethods();

  const items = useMemo(
    () => readItemsFromSearch(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const [address, setAddress] = useState<AddressFields>(DEFAULT_ADDRESS);
  const [provider, setProvider] = useState<string>("");
  const [result, setResult] = useState<ResultState>({ kind: "idle" });

  // --- Cascading address catalog state ---
  const [countries, setCountries] = useState<ShippingCountryResponse[]>([]);
  const [adminAreas, setAdminAreas] = useState<ShippingAdministrativeAreaResponse[]>([]);
  const [localities, setLocalities] = useState<ShippingLocalityResponse[]>([]);
  // Start as loading=true so we never need a synchronous setState in the effect body.
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  // Load countries on mount — all setState calls are inside async callbacks.
  useEffect(() => {
    let cancelled = false;
    shippingClient.listShippingCountries()
      .then((res) => {
        if (cancelled) return;
        setCountries(res.countries);
        setCatalogLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setCatalogError("Failed to load country list.");
        setCatalogLoading(false);
      });
    return () => { cancelled = true; };
  }, [shippingClient]);

  // Load administrative areas when country changes — no synchronous setState.
  // Guard clause early-returns without touching state; stale list is hidden via
  // displayedAdminAreas below.
  useEffect(() => {
    if (!address.country) return;
    let cancelled = false;
    shippingClient
      .listShippingAdministrativeAreas({ Country: address.country as "VN" | "US" })
      .then((res) => {
        if (cancelled) return;
        setAdminAreas(res.administrativeAreas);
      })
      .catch(() => {
        if (!cancelled) setAdminAreas([]);
      });
    return () => { cancelled = true; };
  }, [shippingClient, address.country]);

  // Load localities when administrative area changes — no synchronous setState.
  useEffect(() => {
    if (!address.country || !address.administrativeArea) return;
    let cancelled = false;
    shippingClient
      .listShippingLocalities({
        Country: address.country as "VN" | "US",
        AdministrativeAreaCode: address.administrativeArea,
      })
      .then((res) => {
        if (cancelled) return;
        setLocalities(res.localities);
      })
      .catch(() => {
        if (!cancelled) setLocalities([]);
      });
    return () => { cancelled = true; };
  }, [shippingClient, address.country, address.administrativeArea]);

  // Derived display lists — hide stale data when a parent selection has been cleared
  // without needing any synchronous setState in the effects above.
  const displayedAdminAreas = useMemo(
    () => (address.country ? adminAreas : []),
    [address.country, adminAreas],
  );
  const displayedLocalities = useMemo(
    () => (address.country && address.administrativeArea ? localities : []),
    [address.country, address.administrativeArea, localities],
  );

  function field<K extends keyof AddressFields>(key: K) {
    return {
      value: address[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setAddress((p) => ({ ...p, [key]: e.target.value })),
    };
  }

  function selectField<K extends keyof AddressFields>(key: K) {
    return {
      value: address[key],
      onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
        const next = { ...address, [key]: e.target.value };
        // Reset downstream selections when a parent changes
        if (key === "country") {
          next.administrativeArea = "";
          next.locality = "";
          next.subLocality = "";
        } else if (key === "administrativeArea") {
          next.locality = "";
          next.subLocality = "";
        } else if (key === "locality") {
          next.subLocality = "";
        }
        setAddress(next);
      },
    };
  }

  const isSubmitting = result.kind === "submitting";

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();

    if (items.length === 0) {
      setResult({ kind: "error", message: "Your cart is empty." });
      return;
    }
    if (!provider) {
      setResult({ kind: "error", message: "Please choose a payment method." });
      return;
    }

    setResult({ kind: "submitting" });

    try {
      const order = await orderClient.createOrder({
        paymentProvider: provider,
        shippingAddress: {
          ownerName: address.ownerName,
          type: address.type,
          phoneNumber: address.phoneNumber,
          email: address.email,
          country: address.country,
          administrativeArea: address.administrativeArea || null,
          locality: address.locality || null,
          subLocality: address.subLocality || null,
          postalCode: address.postalCode || null,
          line1: address.line1,
          line2: address.line2 || null,
        },
        items,
      });

      const checkout = await paymentClient.createCheckout(order.code, {
        provider: order.paymentProvider ?? provider,
        returnUrl: null,
        cancelUrl: null,
      });

      if (checkout.checkoutUrl) {
        setResult({ kind: "redirecting", checkoutUrl: checkout.checkoutUrl });
        window.location.href = checkout.checkoutUrl;
        return;
      }

      if (
        (checkout.provider ?? "").toLowerCase() === "cashondelivery" &&
        String(checkout.status) === "Succeeded"
      ) {
        setResult({ kind: "succeeded", orderCode: order.code });
        return;
      }

      setResult({
        kind: "error",
        message: `Unexpected checkout state for ${checkout.provider}: ${checkout.status}`,
      });
    } catch (err: unknown) {
      // Show orderCode-specific validation errors near the payment action.
      if (err instanceof ValidationError) {
        const orderCodeMsgs = err.errors?.OrderCode ?? err.errors?.orderCode;
        if (orderCodeMsgs?.length) {
          setResult({ kind: "error", message: orderCodeMsgs[0] });
          return;
        }
      }
      const message = err instanceof Error ? err.message : "Order placement failed.";
      // Sepay backend currently throws NotImplementedException — surface a friendlier message.
      if (/not\s*implement/i.test(message)) {
        setResult({ kind: "not-implemented", provider });
        return;
      }
      setResult({ kind: "error", message });
    }
  }

  if (result.kind === "succeeded") {
    return (
      <main className="mx-auto max-w-2xl p-6 flex flex-col gap-3">
        <h1 className="text-2xl font-semibold">Order placed</h1>
        <p className="text-sm text-zinc-700">
          Your order <strong>{result.orderCode}</strong> has been placed and inventory reserved.
          You will pay on delivery.
        </p>
      </main>
    );
  }

  if (result.kind === "redirecting") {
    return (
      <main className="mx-auto max-w-2xl p-6 flex flex-col gap-3">
        <h1 className="text-2xl font-semibold">Redirecting…</h1>
        <p className="text-sm text-zinc-700">
          Taking you to the payment provider. If nothing happens,&nbsp;
          <a className="underline" href={result.checkoutUrl}>continue here</a>.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Checkout</h1>

      <section>
        <h2 className="text-sm font-semibold mb-2">Items</h2>
        {items.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No items in checkout. Add them to the URL: <code>?variantId=…&quantity=…</code>
          </p>
        ) : (
          <ul className="rounded-lg border divide-y">
            {items.map((it, i) => (
              <li key={`${it.variantId}-${i}`} className="flex items-center justify-between px-3 py-2 text-sm">
                <code className="font-mono text-xs">{it.variantId}</code>
                <span className="text-zinc-500">×{it.quantity}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <form onSubmit={handlePlaceOrder} className="flex flex-col gap-6">
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold">Shipping address</h2>

          {catalogError && (
            <p className="text-sm text-red-600">{catalogError}</p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input label="Name *" required {...field("ownerName")} />
            <Input label="Phone *" required {...field("phoneNumber")} />
            <Input label="Email *" type="email" required {...field("email")} />
            <Input label="Address type" {...field("type")} />
          </div>

          {/* Cascading address selects */}
          <div className="flex flex-col gap-3">
            <Select
              label="Country *"
              required
              disabled={catalogLoading || countries.length === 0}
              {...selectField("country")}
            >
              <option value="">— Select country —</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code} disabled={!c.isSupported}>
                  {c.displayName}{!c.isSupported ? " (unsupported)" : ""}
                </option>
              ))}
            </Select>

            <Select
              label="Province / City"
              disabled={displayedAdminAreas.length === 0}
              {...selectField("administrativeArea")}
            >
              <option value="">— Select province / city —</option>
              {displayedAdminAreas.map((a) => (
                <option key={a.code} value={a.code}>
                  {a.displayName}
                </option>
              ))}
            </Select>

            <Select
              label="District"
              disabled={displayedLocalities.length === 0}
              {...selectField("locality")}
            >
              <option value="">— Select district —</option>
              {displayedLocalities.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.displayName}
                </option>
              ))}
            </Select>
          </div>

          <Input label="Postal code" {...field("postalCode")} />
          <Input label="Address line 1 *" required {...field("line1")} />
          <Input label="Address line 2" {...field("line2")} />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold">Payment method</h2>
          {methodsLoading ? (
            <p className="text-sm text-zinc-500">Loading payment methods…</p>
          ) : methodsError ? (
            <p className="text-sm text-red-600">{methodsError}</p>
          ) : methods.length === 0 ? (
            <p className="text-sm text-zinc-500">No payment methods available.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {methods.map((m) => (
                <li key={m.code}>
                  <label className="flex items-center gap-3 rounded-lg border px-3 py-2 text-sm cursor-pointer hover:bg-zinc-50">
                    <input
                      type="radio"
                      name="payment-provider"
                      value={m.code}
                      checked={provider === m.code}
                      onChange={() => setProvider(m.code)}
                    />
                    <span className="flex-1">
                      <span className="font-medium">{m.displayName}</span>
                      {m.requiresRedirect && (
                        <span className="ml-2 text-xs text-zinc-500">redirect</span>
                      )}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </section>

        {result.kind === "error" && (
          <p className="text-sm text-red-600">{result.message}</p>
        )}
        {result.kind === "not-implemented" && (
          <p className="text-sm text-amber-700">
            <strong>{result.provider}</strong> is listed but not available yet. Please choose another method.
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || items.length === 0 || methods.length === 0}
          className="rounded-full bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Placing order…" : "Place order"}
        </button>
      </form>
    </main>
  );
}

function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs text-zinc-600">{label}</span>
      <input
        {...props}
        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-zinc-400"
      />
    </label>
  );
}

function Select({
  label,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs text-zinc-600">{label}</span>
      <select
        {...props}
        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-zinc-400 disabled:opacity-50"
      >
        {children}
      </select>
    </label>
  );
}
