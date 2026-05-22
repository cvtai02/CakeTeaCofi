// Absolute routes — single source of truth for all navigation in the admin client.
export const ROUTES = {
  root: "/",
  notAuthorized: "/403",
  signin: "/signin",
  signup: "/signup",
  dashboard: "/dashboard",

  // Products
  products: "/products",
  productNew: "/products/new",
  productDetail: (id: string) => `/products/${id}`,
  productEdit: (id: string) => `/products/${id}/edit`,
  productCategory: "/categories",
  productCollections: "/collections",
  collectionNew: "/collections/new",
  collectionEdit: (id: number | string) => `/collections/${id}/edit`,
  productInventory: "/inventory",
  productPurchaseOrders: "/products/purchase-orders",

  // Content
  content: "/content",
  contentFiles: "/files",
  contentUnusedFiles: "/unused-files",
  contentMenus: "/menus",
  contentBlogs: "/blogs",
  contentMetaobjects: "/metaobjects",
  contentBlogNew: "/blogs/new",
  contentBlogEdit: (id: number | string) => `/blogs/${id}/edit`,
  contentBlogCollections: "/blog-collections",
  contentBlogCollectionNew: "/blog-collections/new",
  contentBlogCollectionEdit: (id: number | string) => `/blog-collections/${id}/edit`,
  contentGalleries: "/galleries",
  contentGalleryNew: "/galleries/new",
  contentGalleryEdit: (id: number | string) => `/galleries/${id}/edit`,

  // Customers
  customers: "/customers",
  customerNew: "/customers/new",
  customerDetail: (id: number | string) => `/customers/${id}`,

  // Marketing
  marketing: "/marketing",
  marketingCampaigns: "/marketing/campaigns",
  marketingAttribution: "/marketing/attribution",
  marketingAutomation: "/marketing/automation",

  // Promotion
  promotion: "/promotion",

  // Analytics
  analytics: "/analytics",
  analyticsReports: "/analytics/reports",
  analyticsLive: "/analytics/live",

  // Orders & Settings
  orders: "/orders",
  orderDetail: (id: string) => `/orders/${id}`,
  orderCreate: "/orders/new",
  settings: "/settings",

  // System
  system: "/system",
  tenants: "/tenants",
  tenantDetail: (id: number | string) => `/tenants/${id}`,

  // Legacy — kept to avoid breaking existing references
  categories: "/categories",
  contents: "/contents",
  inventory: "/inventory",
  promotions: "/promotions",
  reviews: "/reviews",
} as const;
