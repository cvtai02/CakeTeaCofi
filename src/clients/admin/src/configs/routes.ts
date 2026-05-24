// Absolute routes — single source of truth for all navigation in the admin client.
//
// System-admin routes are root-level (/tenants, /system).
// Tenant-scoped routes are prefixed by useTenantNavigate() at call time, so
// they stay as bare paths here (e.g. "/products" becomes "/<sig>/products").
export const ROUTES = {
  root: "/",
  notAuthorized: "/403",
  signin: "/signin",
  signup: "/signup",

  // System admin (root-level, no tenant prefix)
  tenants: "/tenants",
  system: "/system",

  // Tenant-scoped (bare paths; useTenantNavigate prepends /<sig>)
  products: "/products",
  productNew: "/products/new",
  productDetail: (id: string) => `/products/${id}`,
  productEdit: (id: string) => `/products/${id}/edit`,
  productCategory: "/categories",
  productCollections: "/collections",
  collectionNew: "/collections/new",
  collectionEdit: (id: number | string) => `/collections/${id}/edit`,
  productInventory: "/inventory",

  contentFiles: "/files",
  contentUnusedFiles: "/unused-files",
  contentBlogs: "/blogs",
  contentBlogNew: "/blogs/new",
  contentBlogEdit: (id: number | string) => `/blogs/${id}/edit`,
  contentBlogCollections: "/blog-collections",
  contentBlogCollectionNew: "/blog-collections/new",
  contentBlogCollectionEdit: (id: number | string) => `/blog-collections/${id}/edit`,
  contentGalleries: "/galleries",
  contentGalleryNew: "/galleries/new",
  contentGalleryEdit: (id: number | string) => `/galleries/${id}/edit`,

  customers: "/customers",
  customerNew: "/customers/new",
  customerDetail: (id: number | string) => `/customers/${id}`,

  orders: "/orders",
  orderDetail: (id: string) => `/orders/${id}`,
  orderCreate: "/orders/new",

  paymentTransactionDetail: (id: number | string) => `/payments/transactions/${id}`,

  settings: "/settings",
} as const;
