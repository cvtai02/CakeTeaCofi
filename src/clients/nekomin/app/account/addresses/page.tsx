"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  ShippingCountryResponse,
  ShippingAdministrativeAreaResponse,
  ShippingLocalityResponse,
} from "@modular-monolith/clients-shared/api/contracts";
import {
  useAccountClient,
  useShippingClient,
} from "@/app/components/api-client-provider";

// ---- Local types matching handoff spec ----
type Address = {
  ownerName: string;
  type: string;
  phoneNumber: string;
  email: string;
  country: "VN" | "US";
  administrativeArea?: string | null;
  locality?: string | null;
  subLocality?: string | null;
  postalCode?: string | null;
  line1: string;
  line2?: string | null;
};

type AddressItem = {
  id: number;
  accountProfileId: number;
  address: Address;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
};

// ---- Form state ----
type FormFields = {
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
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
};

const DEFAULT_FORM: FormFields = {
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
  isDefaultShipping: false,
  isDefaultBilling: false,
};

function itemToForm(item: AddressItem): FormFields {
  const a = item.address;
  return {
    ownerName: a.ownerName,
    type: a.type,
    phoneNumber: a.phoneNumber,
    email: a.email,
    country: a.country,
    administrativeArea: a.administrativeArea ?? "",
    locality: a.locality ?? "",
    subLocality: a.subLocality ?? "",
    postalCode: a.postalCode ?? "",
    line1: a.line1,
    line2: a.line2 ?? "",
    isDefaultShipping: item.isDefaultShipping,
    isDefaultBilling: item.isDefaultBilling,
  };
}

type PageMode =
  | { kind: "list" }
  | { kind: "create" }
  | { kind: "edit"; item: AddressItem };

export default function AddressesPage() {
  const accountClient = useAccountClient();
  const shippingClient = useShippingClient();

  // ---- Address list ----
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // ---- Page mode ----
  const [mode, setMode] = useState<PageMode>({ kind: "list" });

  // ---- Form ----
  const [form, setForm] = useState<FormFields>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ---- Cascading address catalog ----
  const [countries, setCountries] = useState<ShippingCountryResponse[]>([]);
  const [adminAreas, setAdminAreas] = useState<ShippingAdministrativeAreaResponse[]>([]);
  const [localities, setLocalities] = useState<ShippingLocalityResponse[]>([]);
  // Start as true so we never need a synchronous setState in the effect body.
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  // Load addresses
  useEffect(() => {
    let cancelled = false;
    accountClient.listMyAddresses()
      .then((res) => {
        if (cancelled) return;
        // Handle both array and paginated response shapes from the API.
        const items: AddressItem[] = Array.isArray(res)
          ? (res as AddressItem[])
          : ((res as { items?: AddressItem[] }).items ?? []);
        setAddresses(items);
        setListLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setListError("Failed to load addresses. You may need to sign in.");
          setListLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [accountClient]);

  // Load countries on mount — all setState calls inside async callbacks.
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
  useEffect(() => {
    if (!form.country) return;
    let cancelled = false;
    shippingClient
      .listShippingAdministrativeAreas({ Country: form.country as "VN" | "US" })
      .then((res) => {
        if (cancelled) return;
        setAdminAreas(res.administrativeAreas);
      })
      .catch(() => {
        if (!cancelled) setAdminAreas([]);
      });
    return () => { cancelled = true; };
  }, [shippingClient, form.country]);

  // Load localities when administrative area changes — no synchronous setState.
  useEffect(() => {
    if (!form.country || !form.administrativeArea) return;
    let cancelled = false;
    shippingClient
      .listShippingLocalities({
        Country: form.country as "VN" | "US",
        AdministrativeAreaCode: form.administrativeArea,
      })
      .then((res) => {
        if (cancelled) return;
        setLocalities(res.localities);
      })
      .catch(() => {
        if (!cancelled) setLocalities([]);
      });
    return () => { cancelled = true; };
  }, [shippingClient, form.country, form.administrativeArea]);

  // Derived display lists — hide stale data when a parent selection is cleared.
  const displayedAdminAreas = useMemo(
    () => (form.country ? adminAreas : []),
    [form.country, adminAreas],
  );
  const displayedLocalities = useMemo(
    () => (form.country && form.administrativeArea ? localities : []),
    [form.country, form.administrativeArea, localities],
  );

  // ---- Field helpers ----
  function field<K extends keyof FormFields>(key: K) {
    return {
      value: form[key] as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((p) => ({ ...p, [key]: e.target.value })),
    };
  }

  function selectField<K extends keyof FormFields>(key: K) {
    return {
      value: form[key] as string,
      onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
        const next = { ...form, [key]: e.target.value };
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
        setForm(next);
      },
    };
  }

  // ---- Mode transitions ----
  function openCreate() {
    setForm(DEFAULT_FORM);
    setFormError(null);
    setMode({ kind: "create" });
  }

  function openEdit(item: AddressItem) {
    setForm(itemToForm(item));
    setFormError(null);
    setMode({ kind: "edit", item });
  }

  function cancel() {
    setMode({ kind: "list" });
    setFormError(null);
  }

  // ---- Submit ----
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    const payload = {
      address: {
        ownerName: form.ownerName,
        type: form.type,
        phoneNumber: form.phoneNumber,
        email: form.email,
        country: form.country as "VN" | "US",
        administrativeArea: form.administrativeArea || null,
        locality: form.locality || null,
        subLocality: form.subLocality || null,
        postalCode: form.postalCode || null,
        line1: form.line1,
        line2: form.line2 || null,
      },
      isDefaultShipping: form.isDefaultShipping,
      isDefaultBilling: form.isDefaultBilling,
    };

    try {
      if (mode.kind === "create") {
        const created = await accountClient.createMyAddress(payload);
        setAddresses((prev) => [...prev, created as unknown as AddressItem]);
      } else if (mode.kind === "edit") {
        const updated = await accountClient.updateMyAddress(mode.item.id, payload);
        setAddresses((prev) =>
          prev.map((a) => (a.id === mode.item.id ? (updated as unknown as AddressItem) : a)),
        );
      }
      setMode({ kind: "list" });
    } catch {
      setFormError("Failed to save address. Please check your inputs and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ---- Delete ----
  async function handleDelete(id: number) {
    try {
      await accountClient.deleteMyAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setListError("Failed to delete address.");
    }
  }

  // ---- Form view ----
  if (mode.kind !== "list") {
    const isEdit = mode.kind === "edit";
    return (
      <main className="mx-auto max-w-2xl p-6 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <button
            onClick={cancel}
            className="text-sm text-zinc-500 hover:text-zinc-800"
          >
            ← Back
          </button>
          <h1 className="text-xl font-semibold">
            {isEdit ? "Edit address" : "Add address"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Name *" required {...field("ownerName")} />
            <Input label="Phone *" required {...field("phoneNumber")} />
            <Input label="Email *" type="email" required {...field("email")} />
            <Input label="Address type" {...field("type")} />
          </div>

          {catalogError && (
            <p className="text-sm text-red-600">{catalogError}</p>
          )}

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

          <Input label="Postal code" {...field("postalCode")} />
          <Input label="Address line 1 *" required {...field("line1")} />
          <Input label="Address line 2" {...field("line2")} />

          <div className="flex flex-col gap-2 pt-1">
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.isDefaultShipping}
                onChange={(e) =>
                  setForm((p) => ({ ...p, isDefaultShipping: e.target.checked }))
                }
              />
              Default shipping address
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.isDefaultBilling}
                onChange={(e) =>
                  setForm((p) => ({ ...p, isDefaultBilling: e.target.checked }))
                }
              />
              Default billing address
            </label>
          </div>

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Saving…" : "Save address"}
            </button>
            <button
              type="button"
              onClick={cancel}
              className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    );
  }

  // ---- List view ----
  return (
    <main className="mx-auto max-w-2xl p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Saved addresses</h1>
        <button
          onClick={openCreate}
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          + Add address
        </button>
      </div>

      {listLoading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : listError ? (
        <p className="text-sm text-red-600">{listError}</p>
      ) : addresses.length === 0 ? (
        <p className="text-sm text-zinc-500">No saved addresses yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {addresses.map((item) => (
            <li
              key={item.id}
              className="rounded-lg border border-zinc-200 px-4 py-3 flex flex-col gap-1"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm flex flex-col gap-0.5">
                  <p className="font-medium">
                    {item.address.ownerName} · {item.address.phoneNumber}
                  </p>
                  <p className="text-zinc-600">
                    {item.address.line1}
                    {item.address.line2 ? `, ${item.address.line2}` : ""}
                  </p>
                  {(item.address.locality || item.address.administrativeArea) && (
                    <p className="text-zinc-500">
                      {[
                        item.address.locality,
                        item.address.administrativeArea,
                        item.address.country,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                  {(item.isDefaultShipping || item.isDefaultBilling) && (
                    <div className="flex gap-2 mt-1">
                      {item.isDefaultShipping && (
                        <span className="text-xs rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-600">
                          Default shipping
                        </span>
                      )}
                      {item.isDefaultBilling && (
                        <span className="text-xs rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-600">
                          Default billing
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 shrink-0">
                  <button
                    onClick={() => openEdit(item)}
                    className="text-xs text-zinc-500 hover:text-zinc-800 underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-xs text-red-500 hover:text-red-700 underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
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
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  children: React.ReactNode;
}) {
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
