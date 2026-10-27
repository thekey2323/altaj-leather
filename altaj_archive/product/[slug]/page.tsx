import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getProductBySlug, getProducts } from "@/lib/db/store";
import { ProductDetailView } from "@/components/product/ProductDetailView";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = getProductBySlug(resolvedParams.slug);

  if (!product) {
    return {
      title: "Produit non trouvé — ALTAJLEATHER",
    };
  }

  return {
    title: `${product.name} | ALTAJLEATHER Maroc`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.tagline,
      images: [product.featuredImage],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const product = getProductBySlug(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  const allProducts = getProducts();
  const relatedProducts = allProducts.filter(
    (p) => p.id !== product.id && p.status === "ACTIVE"
  ).slice(0, 3);

  // Technical SEO Schema (Product JSON-LD)
  const productJsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: product.images.map((img) => img.url),
    description: product.description,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: "ALTAJLEATHER",
    },
    offers: {
      "@type": "Offer",
      url: `https://altajleather.ma/product/${product.slug}`,
      priceCurrency: "MAD",
      price: product.price,
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductDetailView product={product} relatedProducts={relatedProducts} />
    </>
  );
}
