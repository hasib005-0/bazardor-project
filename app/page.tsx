
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import ProductSearch from "@/components/ProductSearch";
import { getProducts, getCategories } from "@/lib/api";

export const revalidate = 300;

export default async function HomePage() {
  let products: Awaited<ReturnType<typeof getProducts>> = [];
  let categories: Awaited<ReturnType<typeof getCategories>> = [];

  try {
    [products, categories] = await Promise.all([
      getProducts(),
      getCategories(),
    ]);
  } catch {
    // Keep the page available if the API is temporarily unavailable.
  }

  const risers = [...products]
    .filter((product) => product.changePercent > 0)
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 6);

  const fallers = [...products]
    .filter((product) => product.changePercent < 0)
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, 6);

  return (
    <main className="min-h-screen bg-[#f0f5f0]">
      {/* Hero section */}
      <section className="px-4 pb-7 pt-6 sm:pt-8">
        <div className="mx-auto grid max-w-5xl items-center gap-6 rounded-2xl border border-[#e3ebe3] bg-white p-5 shadow-sm sm:p-7 md:grid-cols-[1.35fr_0.65fr] md:gap-8 md:p-9">
          <div>
            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 sm:text-sm">
              বাজারদর, এক নজরে প্রতিদিন
            </span>

            <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-[#173b2b] sm:text-4xl md:text-5xl">
              আজকের বাজারের দাম
              <br />
              <span className="text-emerald-700">এক নজরে</span>
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
              চাল, ডাল, তেল, সবজি, মাছ ও নিত্যপ্রয়োজনীয় পণ্যের দাম দেখুন।
              বাজারে যাওয়ার আগে জেনে নিন কোন পণ্যের দাম বাড়ছে আর কোনটির কমছে।
            </p>

            {/* Search bar */}
            <ProductSearch products={products} />
          </div>

          {/* Basket illustration */}
          <div
            className="relative flex min-h-40 items-center justify-center overflow-hidden rounded-xl bg-[#f0f6ef] p-5 sm:min-h-48 md:min-h-56"
            role="img"
            aria-label="বাজারের নিত্যপ্রয়োজনীয় পণ্য"
          >
            <div className="absolute -right-5 -top-8 h-28 w-28 rounded-full bg-emerald-100/80" />
            <div className="absolute -bottom-8 -left-5 h-28 w-28 rounded-full bg-lime-100/80" />

            <div className="relative text-center">
              <div className="text-7xl drop-shadow-sm sm:text-8xl">
                🧺
              </div>

              <div className="mt-1 text-2xl sm:text-3xl" aria-hidden="true">
                🥬 🍅 🍆 🥕
              </div>

              <p className="mt-2 text-xs font-semibold text-emerald-800">
                প্রতিদিনের বাজারদর
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-9 px-4 pb-12 pt-2 sm:space-y-11">
        {/* Products with increasing prices */}
        {risers.length > 0 && (
          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="section-title text-lg sm:text-xl">
                  <span className="mr-1 text-red-500">▲</span>
                  আজ দাম বেড়েছে
                </h2>

                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  যেসব পণ্যের দাম বেড়েছে
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                দাম বৃদ্ধি
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
              {risers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Products with decreasing prices */}
        {fallers.length > 0 && (
          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="section-title text-lg sm:text-xl">
                  <span className="mr-1 text-emerald-600">▼</span>
                  আজ দাম কমেছে
                </h2>

                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  সাশ্রয়ী দামের পণ্যগুলো দেখুন
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                দাম হ্রাস
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
              {fallers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* All products */}
        <section id="সব-পণ্য" className="scroll-mt-36">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <h2 className="section-title text-xl sm:text-2xl">
                <span className="mr-1 text-emerald-700">▾</span>
                সব পণ্য
              </h2>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                পণ্য খুঁজুন এবং বাজারদর তুলনা করুন
              </p>
            </div>

            <span className="shrink-0 rounded-lg border border-[#e1eae2] bg-white px-3 py-2 text-xs font-semibold text-slate-600 sm:text-sm">
              মোট {products.length}টি পণ্য
            </span>
          </div>

          {/* Category filters */}
          <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
            <Link
              href="/"
              className="shrink-0 rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white sm:text-sm"
            >
              সব পণ্য
            </Link>

            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="shrink-0 rounded-full border border-[#dfe8e0] bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-500 hover:bg-emerald-50 sm:text-sm"
              >
                {category.emoji} {category.name}
              </Link>
            ))}
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#cbdccf] bg-white px-5 py-12 text-center">
              <p className="text-5xl" aria-hidden="true">
                🧺
              </p>

              <h3 className="mt-4 text-lg font-bold text-[#173b2b]">
                পণ্যের তথ্য লোড করা যায়নি
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                API সংযোগ পরীক্ষা করুন অথবা কিছুক্ষণ পরে আবার চেষ্টা করুন।
              </p>

              <p className="mt-3 text-xs text-slate-400">
                API: BAZARDOR_API_URL/products
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
