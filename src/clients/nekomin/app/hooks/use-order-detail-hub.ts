"use client";

import { useEffect, useLayoutEffect, useRef, useCallback } from "react";
import * as SignalR from "@microsoft/signalr";

import { ORDER_HUB_URL } from "@/app/lib/order-hub";
import type { OrderNotification } from "@/app/lib/order-hub";
import { getAccessToken } from "@/app/lib/auth";

// Use on the order detail page alongside useMyOrdersHub in the layout.
// Deduplicate with the session-wide hook via the notificationKey before acting.
// Pass guestEmail for anonymous order tracking (no auth token available).
export function useOrderDetailHub(
  orderCode: string,
  onNotification: (notification: OrderNotification) => void,
  guestEmail?: string,
) {
  const onNotificationRef = useRef(onNotification);
  useLayoutEffect(() => { onNotificationRef.current = onNotification; });

  const handleNotification = useCallback((n: OrderNotification) => {
    onNotificationRef.current(n);
  }, []);

  useEffect(() => {
    if (!orderCode) return;

    let mounted = true;
    let connection: SignalR.HubConnection | null = null;

    async function start() {
      const token = await getAccessToken();
      if (!mounted) return;
      if (!token && !guestEmail) return;

      connection = new SignalR.HubConnectionBuilder()
        .withUrl(
          ORDER_HUB_URL,
          token ? { accessTokenFactory: () => token } : {},
        )
        .withAutomaticReconnect()
        .configureLogging(SignalR.LogLevel.Warning)
        .build();

      connection.on("OrderNotification", handleNotification);

      try {
        await connection.start();
        if (!mounted) { await connection.stop(); return; }
        if (token) {
          await connection.invoke("JoinOrder", orderCode);
        } else {
          await connection.invoke("JoinGuestOrder", orderCode, guestEmail);
        }
      } catch {
        // User does not own this order or server unreachable.
      }
    }

    start();

    return () => {
      mounted = false;
      if (connection) {
        connection.invoke("LeaveOrder", orderCode).catch(() => {});
        connection.stop().catch(() => {});
      }
    };
  }, [orderCode, handleNotification, guestEmail]);
}
