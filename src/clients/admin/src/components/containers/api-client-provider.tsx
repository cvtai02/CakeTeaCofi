/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { AdminApiClient } from "@shared/api/admin-api";
import type { IAdminApiClient } from "@shared/api/contracts/admin";
import { IdentityClient } from "@shared/api/clients";
import { appFetch } from "@/configs/appFetch";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
const API_IDENTITY_URL = import.meta.env.VITE_API_IDENTITY_URL as string;

const ApiClientContext = createContext<IAdminApiClient | null>(null);

export function ApiClientProvider({ children }: { children: ReactNode }) {
  const adminApi = useMemo<IAdminApiClient>(() => {
    const composed = new AdminApiClient(appFetch, API_BASE_URL);
    // Identity is hosted on a separate URL in this app. Until the shared
    // AdminApiClient supports a dedicated identity URL (see
    // requirements/backend-handoff/admin-api-client-identity-url.md), override
    // the identity field with an IdentityClient pointed at API_IDENTITY_URL.
    const identity = new IdentityClient(appFetch, API_IDENTITY_URL);
    return {
      account: composed.account,
      content: composed.content,
      identity,
      inventory: composed.inventory,
      order: composed.order,
      payment: composed.payment,
      productCatalog: composed.productCatalog,
      shipping: composed.shipping,
      system: composed.system,
      tenantManagement: composed.tenantManagement,
    };
  }, []);

  return <ApiClientContext.Provider value={adminApi}>{children}</ApiClientContext.Provider>;
}

function useApiClients(): IAdminApiClient {
  const ctx = useContext(ApiClientContext);
  if (!ctx) throw new Error("useApiClients must be used inside ApiClientProvider");
  return ctx;
}

export const useAdminApi = () => useApiClients();
export const useAccountClient = () => useApiClients().account;
export const useContentClient = () => useApiClients().content;
export const useIdentityClient = () => useApiClients().identity;
export const useInventoryClient = () => useApiClients().inventory;
export const useOrderClient = () => useApiClients().order;
export const usePaymentClient = () => useApiClients().payment;
export const useProductCatalogClient = () => useApiClients().productCatalog;
export const useShippingClient = () => useApiClients().shipping;
export const useSystemClient = () => useApiClients().system;
export const useTenantManagementClient = () => useApiClients().tenantManagement;
