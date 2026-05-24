import { Route } from "react-router-dom";
import { type ReactNode } from "react";
import AppLayout from "@/components/containers/app-layout";
import { PrivateRoute } from "@/components/containers/private-route";
import { LazyPage } from "@/components/containers/lazy-page";
import { ROUTES } from "@/configs/routes";
import ErrorPage from "@/pages/common/error";
import Unauthorize from "./pages/common/403";

// Lazy load all pages
const Signup = LazyPage(() => import("@/pages/signup"));
const Login = LazyPage(() => import("@/pages/login"));
const NotFound = LazyPage(() => import("@/pages/common/404"));
const Products = LazyPage(() => import("@/pages/products"));
const AddProduct = LazyPage(() => import("@/pages/products/add"));
const EditProduct = LazyPage(() => import("@/pages/products/edit"));
const ViewProduct = LazyPage(() => import("@/pages/products/view"));
const Categories = LazyPage(() => import("@/pages/categories"));
const ContentFilesPage = LazyPage(() => import("@/pages/content/files"));
const ContentUnusedFilesPage = LazyPage(() => import("@/pages/content/unused-files"));
const Inventory = LazyPage(() => import("@/pages/products/inventory"));
const Collections = LazyPage(() => import("@/pages/collections"));
const AddCollection = LazyPage(() => import("@/pages/collections/add"));
const EditCollection = LazyPage(() => import("@/pages/collections/edit"));
const BlogPostCollections = LazyPage(() => import("@/pages/content/blog-post-collections"));
const AddBlogPostCollection = LazyPage(() => import("@/pages/content/blog-post-collections/add"));
const EditBlogPostCollection = LazyPage(() => import("@/pages/content/blog-post-collections/edit"));
const AdminBlogsPage = LazyPage(() => import("@/pages/content/blogs"));
const AddBlogPostPage = LazyPage(() => import("@/pages/content/blogs/add"));
const EditBlogPostPage = LazyPage(() => import("@/pages/content/blogs/edit"));
const AdminGalleriesPage = LazyPage(() => import("@/pages/content/galleries"));
const AddGalleryPage = LazyPage(() => import("@/pages/content/galleries/add"));
const EditGalleryPage = LazyPage(() => import("@/pages/content/galleries/edit"));
const Orders = LazyPage(() => import("@/pages/orders"));
const OrderDetail = LazyPage(() => import("@/pages/orders/detail"));
const AdminCreateOrder = LazyPage(() => import("@/pages/orders/create"));
const SystemTools = LazyPage(() => import("@/pages/system"));
const Tenants = LazyPage(() => import("@/pages/tenants"));
const PaymentTransactionDetail = LazyPage(
  () => import("@/pages/payments/transaction-detail"),
);
const Customers = LazyPage(() => import("@/pages/customers"));
const AddCustomer = LazyPage(() => import("@/pages/customers/add"));
const CustomerDetail = LazyPage(() => import("@/pages/customers/detail"));
const TenantDashboard = LazyPage(() => import("@/pages/dashboard"));

const AppRoutes: ReactNode =
  <Route errorElement={<ErrorPage />}>
    {/* Public routes */}
    <Route path={ROUTES.signin} element={<Login />} />
    <Route path={ROUTES.signup} element={<Signup />} />
    <Route path={ROUTES.notAuthorized} element={<Unauthorize />} />

    <Route element={<PrivateRoute />}>
      {/* System-admin routes (no tenant prefix) */}
      <Route element={<AppLayout />}>
        <Route index element={<Tenants />} errorElement={<ErrorPage />} />
        <Route path={ROUTES.tenants} element={<Tenants />} errorElement={<ErrorPage />} />
        <Route path={ROUTES.system} element={<SystemTools />} errorElement={<ErrorPage />} />
      </Route>

      {/* Tenant-scoped routes — all live under /:tenantSignature */}
      <Route path="/:tenantSignature" element={<AppLayout />}>
        <Route index element={<TenantDashboard />} errorElement={<ErrorPage />} />
        <Route path="products" element={<Products />} errorElement={<ErrorPage />} />
        <Route path="products/new" element={<AddProduct />} errorElement={<ErrorPage />} />
        <Route path="products/:id" element={<ViewProduct />} errorElement={<ErrorPage />} />
        <Route path="products/:id/edit" element={<EditProduct />} errorElement={<ErrorPage />} />
        <Route path="inventory" element={<Inventory />} errorElement={<ErrorPage />} />
        <Route path="categories" element={<Categories />} errorElement={<ErrorPage />} />
        <Route path="collections" element={<Collections />} errorElement={<ErrorPage />} />
        <Route path="collections/new" element={<AddCollection />} errorElement={<ErrorPage />} />
        <Route path="collections/:id/edit" element={<EditCollection />} errorElement={<ErrorPage />} />
        <Route path="files" element={<ContentFilesPage />} errorElement={<ErrorPage />} />
        <Route path="unused-files" element={<ContentUnusedFilesPage />} errorElement={<ErrorPage />} />
        <Route path="blog-collections" element={<BlogPostCollections />} errorElement={<ErrorPage />} />
        <Route path="blog-collections/new" element={<AddBlogPostCollection />} errorElement={<ErrorPage />} />
        <Route path="blog-collections/:id/edit" element={<EditBlogPostCollection />} errorElement={<ErrorPage />} />
        <Route path="blogs" element={<AdminBlogsPage />} errorElement={<ErrorPage />} />
        <Route path="blogs/new" element={<AddBlogPostPage />} errorElement={<ErrorPage />} />
        <Route path="blogs/:id/edit" element={<EditBlogPostPage />} errorElement={<ErrorPage />} />
        <Route path="galleries" element={<AdminGalleriesPage />} errorElement={<ErrorPage />} />
        <Route path="galleries/new" element={<AddGalleryPage />} errorElement={<ErrorPage />} />
        <Route path="galleries/:id/edit" element={<EditGalleryPage />} errorElement={<ErrorPage />} />
        <Route path="orders" element={<Orders />} errorElement={<ErrorPage />} />
        <Route path="orders/new" element={<AdminCreateOrder />} errorElement={<ErrorPage />} />
        <Route path="orders/:id" element={<OrderDetail />} errorElement={<ErrorPage />} />
        <Route path="customers" element={<Customers />} errorElement={<ErrorPage />} />
        <Route path="customers/new" element={<AddCustomer />} errorElement={<ErrorPage />} />
        <Route path="customers/:id" element={<CustomerDetail />} errorElement={<ErrorPage />} />
        <Route path="payments/transactions/:id" element={<PaymentTransactionDetail />} errorElement={<ErrorPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Route>
  </Route>

export default AppRoutes;
