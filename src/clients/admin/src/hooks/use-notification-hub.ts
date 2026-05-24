import { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { useIdentityStore } from "@/stores/identity";
import { useAccountClient } from "@/components/containers/api-client-provider";
import { getCurrentTenantSignature } from "@/lib/tenant-context";
import type { NotificationResponse } from "@shared/api/types/account";

const HUB_URL_BASE = `${import.meta.env.VITE_API_BASE_URL}/hubs/notifications`;

/**
 * Browser WebSocket flows can't reliably attach custom request headers, so
 * tenant context for SignalR connections is passed as a query parameter
 * (`?tenantSignature=<signature>`) per the admin-domain-tenant-context
 * handoff.
 */
function buildHubUrl(): string {
  const signature = getCurrentTenantSignature();
  if (!signature) return HUB_URL_BASE;
  const separator = HUB_URL_BASE.includes("?") ? "&" : "?";
  return `${HUB_URL_BASE}${separator}tenantSignature=${encodeURIComponent(signature)}`;
}

export type { NotificationResponse };

export function useNotificationHub() {
  const accessToken = useIdentityStore((s) => s.accessToken);
  const accountClient = useAccountClient();
  // Keep a ref so the SignalR callback always sees the latest client without
  // needing it in the effect dependency array (which would reconnect on every render).
  const accountClientRef = useRef(accountClient);
  // eslint-disable-next-line react-hooks/refs
  accountClientRef.current = accountClient; // intentional: keeps ref in sync without re-subscribing SignalR

  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // ── Fetch all notifications on mount / token change ─────────────────────────
  useEffect(() => {
    if (!accessToken) return;
    accountClientRef.current
      .listAdminNotifications({ pageSize: 20 })
      .then((res) => {
        const items = res.items ?? [];
        setNotifications(items);
        setUnreadCount(items.filter((n) => !n.isRead).length);
      })
      .catch(() => {});
  }, [accessToken]);

  // ── SignalR: realtime push ───────────────────────────────────────────────────
  useEffect(() => {
    if (!accessToken) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(buildHubUrl(), { accessTokenFactory: () => accessToken })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on("NotificationReceived", () => {
      // Refetch so we get the persisted record with its real id.
      accountClientRef.current
        .listAdminNotifications({ pageSize: 20 })
        .then((res) => {
          const items = res.items ?? [];
          setNotifications(items);
          setUnreadCount(items.filter((n) => !n.isRead).length);
        })
        .catch(() => {});
    });

    let stopped = false;
    connection.start().then(() => {
      if (stopped) connection.stop().catch(() => {});
    }).catch(() => {});

    return () => {
      stopped = true;
      connection.stop().catch(() => {});
    };
  }, [accessToken]);

  // ── Actions ──────────────────────────────────────────────────────────────────

  /** Called when the dropdown opens — hides the red dot without hitting the API. */
  const markAllRead = () => setUnreadCount(0);

  /** "Clear all" button — marks all unread as read via API and clears the list. */
  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    accountClientRef.current.markAllAdminNotificationsRead().catch(() => {});
  };

  /** Called when the user clicks an individual notification item. */
  const markOneRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => n.id === id ? { ...n, isRead: true } : n)
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    accountClientRef.current.markAdminNotificationRead(id).catch(() => {});
  };

  return { notifications, unreadCount, markAllRead, markOneRead, clearAll };
}
