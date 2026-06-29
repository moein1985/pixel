import type { Metadata } from "next";

interface ProductJsonLdProps {
  name: string;
  description?: string;
  image?: string;
  price?: string;
  currency?: string;
  availability?: string;
  rating?: string;
  reviewCount?: number;
  brand?: string;
  sku?: string;
}

export function ProductJsonLd({
  name,
  description,
  image,
  price,
  currency = "IRR",
  availability = "https://schema.org/InStock",
  rating,
  reviewCount,
  brand,
  sku,
}: ProductJsonLdProps) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: description ?? name,
  };

  if (image) data.image = image;
  if (brand) data.brand = { "@type": "Brand", name: brand };
  if (sku) data.sku = sku;
  if (price) {
    data.offers = {
      "@type": "Offer",
      price,
      priceCurrency: currency,
      availability,
    };
  }
  if (rating && reviewCount) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating,
      reviewCount,
    };
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

interface ArticleJsonLdProps {
  title: string;
  description?: string;
  image?: string;
  publishedAt?: string;
  author?: string;
  url?: string;
}

export function ArticleJsonLd({
  title,
  description,
  image,
  publishedAt,
  author,
  url,
}: ArticleJsonLdProps) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: description ?? title,
  };

  if (image) data.image = image;
  if (publishedAt) data.datePublished = publishedAt;
  if (author) data.author = { "@type": "Person", name: author };
  if (url) data.mainEntityOfPage = { "@type": "WebPage", "@id": url };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

interface OrganizationJsonLdProps {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
}

export function OrganizationJsonLd({
  name = "پیکسل",
  url = "https://pixel.ir",
  logo = "https://pixel.ir/logo.png",
  description = "پلتفرم ملی تحول دیجیتال در حوزه کشاورزی ایران",
}: OrganizationJsonLdProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo,
    description,
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

interface BreadcrumbJsonLdProps {
  items: { name: string; url: string }[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
