import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toast } from "sonner";

import { ApiError, ValidationError } from "@shared/api/contracts/common-types";

/**
 * Shows a toast for any API call error.
 * - Non-ApiError (network failure, DNS, etc.) → "Cannot connect to server"
 * - ApiError / ValidationError → uses the error message
 */
export function toastApiError(err: unknown, fallback = "Something went wrong"): void {
  if (!(err instanceof ApiError)) {
    toast.error("Cannot connect to server");
    return;
  }
  toast.error(err.message || fallback);
}

/**
 * Handles a ValidationError (400) by binding field messages to the form and
 * showing a toast. Returns true if the error was a ValidationError, false
 * otherwise — so callers can re-throw non-validation errors.
 *
 * fieldMap: override PascalCase API key → form field name when they differ
 * (e.g. { PhysicalProduct: "isPhysical" }).
 */
export function applyValidationErrors<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>,
  fieldMap: Partial<Record<string, Path<T>>> = {}
): boolean {
  if (!(err instanceof ValidationError)) return false;

  Object.entries(err.errors ?? {}).forEach(([rawKey, messages]) => {
    const camel = (rawKey.charAt(0).toLowerCase() + rawKey.slice(1)) as Path<T>;
    const field = fieldMap[rawKey] ?? camel;
    if (messages[0]) setError(field, { message: messages[0] });
  });

  toast.error(err.message || "Please fix the validation errors.");
  return true;
}
