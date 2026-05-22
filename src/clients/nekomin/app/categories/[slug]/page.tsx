import Image from "next/image";
import Link from "next/link";
import { ProductCatalogClient } from "@modular-monolith/clients-shared/api/clients";
import { appFetch } from "@/app/configs/appFetch";
import { ProductGallery } from "@/app/components/product-gallery";
import { RevealOnScroll } from "@/app/components/reveal-on-scroll";
import { apiCall, ApiErrorResult } from "@/app/lib/api-call";
import "../../landing.css";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const client = new ProductCatalogClient(appFetch, process.env.NEXT_PUBLIC_API_BASE_URL ?? "");

  const category = await apiCall(client.getCustomerCategoryBySlug(decodedSlug));
  const products = category && !(category instanceof ApiErrorResult)
    ? await apiCall(client.listCustomerProduct({ categoryName: category.name, pageSize: 100 }))
    : null;

  if (!category || category instanceof ApiErrorResult) {
    return (
      <div className="landing-root" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--brown-md)" }}>
          {category instanceof ApiErrorResult ? category.title : "Category not found."}
        </p>
      </div>
    );
  }

  const productsError = products instanceof ApiErrorResult ? products.title : null;
  const items = products instanceof ApiErrorResult ? [] : (products?.items ?? []);

  return (
    <div className="landing-root">
      <div className="site-logo-bar">
        <Link href="/" className="site-logo">
          <Image src="/nekomin.svg" alt="Nekomin" width={108} height={108} />
        </Link>
        <span className="site-section-label">{category.name}</span>
      </div>

      <section className="shop" style={{ paddingTop: 120 }}>
        {category.description && (
          <p style={{ marginBottom: 48, fontSize: "0.95rem", color: "var(--brown-md)", maxWidth: 560, lineHeight: 1.7 }}>
            {category.description}
          </p>
        )}

        {productsError ? (
          <p className="api-error-msg">{productsError}</p>
        ) : items.length > 0 ? (
          <RevealOnScroll>
            <ProductGallery products={items} />
          </RevealOnScroll>
        ) : (
          <p style={{ color: "var(--brown-md)", fontSize: "0.9rem" }}>
            No products in this category yet.
          </p>
        )}
      </section>
    </div>
  );
}
