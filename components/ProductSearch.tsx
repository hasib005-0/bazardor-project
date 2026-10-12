
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/api";

export default function ProductSearch({
  products,
}: {
  products: Product[];
}) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const results = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();

    if (!search) return [];

    return products
      .filter((product) => {
        const searchableText = [
          product.name,
          product.categoryName,
          product.category,
          product.slug,
        ]
          .join(" ")
          .toLocaleLowerCase();

        return searchableText.includes(search);
      })
      .slice(0, 6);
  }, [products, query]);

  const showResults = focused && query.trim().length > 0;

  return (
    <div className="relative mt-5 w-full max-w-xl">
      <form
        onSubmit={(event) => {
          event.preventDefault();

          if (results.length > 0) {
            window.location.href = `/product/${results[0].slug}`;
          } else {
            setFocused(true);
          }
        }}
        role="search"
        className="flex items-center gap-2 rounded-xl border border-[#cbded0] bg-white p-1.5 shadow-sm transition focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-100"
      >
        <span className="pl-3 text-xl text-emerald-700" aria-hidden="true">
          ⌕
        </span>

        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            window.setTimeout(() => setFocused(false), 150);
          }}
          placeholder="কোন পণ্যের দাম জানতে চান?"
          aria-label="পণ্য খুঁজুন"
          aria-expanded={showResults}
          className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
        />

        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="সার্চ মুছুন"
            className="rounded-full px-2 py-1 text-slate-400 hover:bg-slate-100"
          >
            ✕
          </button>
        )}

        <button
          type="submit"
          className="shrink-0 rounded-lg bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
        >
          খুঁজুন
        </button>
      </form>

      {showResults && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-[#e0e9e1] bg-white shadow-xl">
          {results.length > 0 ? (
            <ul>
              {results.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/product/${product.slug}`}
                    className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 hover:bg-emerald-50"
                    onClick={() => setFocused(false)}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-2xl">
                      {product.emoji}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-slate-800">
                        {product.name}
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {product.categoryName}
                      </span>
                    </span>

                    <span className="shrink-0 text-sm font-bold text-emerald-800">
                      {new Intl.NumberFormat("bn-BD").format(product.price)} টাকা
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-5 text-center text-sm text-slate-500">
              এই নামে কোনো পণ্য পাওয়া যায়নি।
            </p>
          )}
        </div>
      )}
    </div>
  );
}
