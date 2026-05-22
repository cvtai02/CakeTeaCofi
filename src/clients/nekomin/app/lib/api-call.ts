import { ApiError } from "@modular-monolith/clients-shared/api/contracts";

const CONNECTION_ERROR_SENTINEL = "nekomin:connection-error";

export class ApiErrorResult {
  constructor(public readonly title: string) {}
}

export type ApiCallResult<T> = T | ApiErrorResult | null;

export async function apiCall<T>(promise: Promise<T>): Promise<ApiCallResult<T>> {
  try {
    return await promise;
  } catch (err) {
    if (err instanceof TypeError) {
      // fetch() itself threw — backend unreachable
      throw new Error(CONNECTION_ERROR_SENTINEL);
    }
    if (err instanceof ApiError && err.statusCode > 400) {
      return new ApiErrorResult(err.message);
    }
    console.error(err);
    return null;
  }
}

export function isConnectionError(error: Error): boolean {
  return error.message === CONNECTION_ERROR_SENTINEL;
}
