import { useNavigate, useParams, type NavigateOptions } from "react-router-dom";

export function useTenantNavigate() {
  const navigate = useNavigate();
  const { tenantSignature } = useParams<{ tenantSignature?: string }>();
  return (path: string, options?: NavigateOptions) =>
    navigate(tenantSignature ? `/${tenantSignature}${path}` : path, options);
}
