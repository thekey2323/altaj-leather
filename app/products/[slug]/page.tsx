import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProductBySlugAsync, getAllProductsAsync } from '@/data/altajProducts';
import { LuxuryProductView } from '@/components/product/LuxuryProductView';
import { BrandHeader } from '@/components/brand/BrandHeader';
import { BrandFooter } from '@/components/brand/BrandFooter';

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const products = await getAllProductsAsync();
  return products.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlugAsync(slug);

  if (!product) {
    return {
      title: 'المنتج غير موجود | Altajleather',
    };
  }

  return {
    title: `${product.arabicName} | Altajleather — جلد طبيعي 100% مغربي`,
    description: product.seoDescription,
    openGraph: {
      title: product.seoTitle,
      description: product.seoDescription,
      images: [
        {
          url: product.featuredImage,
          width: 800,
          height: 800,
          alt: product.arabicName,
        },
      ],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlugAsync(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <BrandHeader />
      <main className="flex-1">
        <LuxuryProductView product={product} />
      </main>
      <BrandFooter />
    </div>
  );
}
