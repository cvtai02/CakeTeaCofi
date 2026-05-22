"use client";

import { isConnectionError } from "./lib/api-call";
import { MaintenancePage } from "./components/maintenance-page";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  if (isConnectionError(error)) {
    return <MaintenancePage />;
  }

  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "var(--brown-md, #8b6f5a)", fontSize: "0.95rem" }}>
        Đã xảy ra lỗi. Vui lòng thử lại sau.
      </p>
    </div>
  );
}
