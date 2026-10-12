
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import {
  getProduct,
  formatMoney,
  changeLabel,
} from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Require login before showing product details.
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect(
      `/signin?callbackURL=${encodeURIComponent(`/product/${slug}`)}`
    );
  }

  const p = await getProduct(slug);

  if (!p) {
    notFound();
  }

  // Calculate summary using available market prices.
  const validMarkets = p.markets
    .map((market) => {
      const low =
        market.min !== undefined && market.min > 0
          ? market.min
          : market.price > 0
            ? market.price
            : 0;

      const high =
        market.max !== undefined && market.max > 0
          ? market.max
          : market.price > 0
            ? market.price
            : 0;

      const average =
        market.price > 0
          ? market.price
          : low > 0 && high > 0
            ? (low + high) / 2
            : low || high;

      return {
        name: market.name,
        division: market.division,
        low,
        high,
        average,
      };
    })
    .filter(
      (market) =>
        market.low > 0 ||
        market.high > 0 ||
        market.average > 0
    );

  const minimumPrices = validMarkets
    .map((market) => market.low)
    .filter((price) => price > 0);

  const maximumPrices = validMarkets
    .map((market) => market.high)
    .filter((price) => price > 0);

  const min = minimumPrices.length
    ? Math.min(...minimumPrices)
    : p.price;

  const max = maximumPrices.length
    ? Math.max(...maximumPrices)
    : p.price;

  const avg = validMarkets.length
    ? validMarkets.reduce(
        (sum, market) => sum + market.average,
        0
      ) / validMarkets.length
    : p.price;

  const change = p.changePercent;

  return (
    <main className="min-h-screen bg-[#f0f5f0]">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
        <Link
          href="/"
          className="text-sm font-bold text-emerald-800 hover:text-emerald-600"
        >
          ← হোম পেজ
        </Link>

        {/* Product overview */}
        <section className="mt-5 rounded-2xl border border-[#e1eae2] bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-4xl sm:h-20 sm:w-20 sm:text-5xl">
                {p.emoji}
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  হোম › {p.categoryName} › {p.name}
                </p>

                <h1 className="mt-2 text-xl font-black text-[#173b2b] sm:text-2xl">
                  {p.name}
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  {p.categoryName} · প্রতি {p.unit}
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {p.description}
                </p>
              </div>
            </div>

            <div className="shrink-0 rounded-xl bg-[#f0f6f0] px-5 py-4 sm:min-w-40 sm:text-right">
              <p className="text-xs text-slate-500">
                আজকের বাজারদর
              </p>

              <p className="mt-1 text-2xl font-black text-[#173b2b]">
                {formatMoney(p.price)}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                আগের দাম: {formatMoney(p.previousPrice)}
              </p>

              <span
                className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-bold ${
                  change > 0
                    ? "bg-rose-50 text-rose-600"
                    : change < 0
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                }`}
              >
                {changeLabel(change)}
              </span>
            </div>
          </div>
        </section>

        {/* Price summary */}
        <section className="mt-6">
          <h2 className="text-lg font-black text-[#173b2b]">
            দামের সারসংক্ষেপ
          </h2>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              {
                label: "সর্বনিম্ন দাম",
                value: min,
                description: "বাজারগুলোর সর্বনিম্ন মূল্য",
                emoji: "📉",
              },
              {
                label: "সর্বোচ্চ দাম",
                value: max,
                description: "বাজারগুলোর সর্বোচ্চ মূল্য",
                emoji: "📈",
              },
              {
                label: "গড় দাম",
                value: avg,
                description: "উপলব্ধ বাজারদরের গড়",
                emoji: "📊",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-[#e1eae2] bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-slate-500">
                    {item.label}
                  </p>
                  <span>{item.emoji}</span>
                </div>

                <p className="mt-3 text-xl font-black text-emerald-800 sm:text-2xl">
                  {formatMoney(item.value)}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Market-wise prices */}
        <section className="mt-7">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-lg font-black text-[#173b2b] sm:text-xl">
                বাজারভিত্তিক আজকের দাম
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                বিভিন্ন বাজারের দামের তুলনা করুন
              </p>
            </div>

            <span className="text-xs text-slate-500">
              মোট {validMarkets.length}টি বাজারে দাম পাওয়া গেছে
            </span>
          </div>

          {validMarkets.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-[#dce5dd] bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] border-collapse text-sm">
                  <thead className="bg-[#e8f5ec] text-[#173b2b]">
                    <tr>
                      <th className="border border-[#d5dfd6] px-4 py-3 text-left font-bold">
                        বাজার
                      </th>

                      <th className="border border-[#d5dfd6] px-4 py-3 text-left font-bold">
                        বিভাগ
                      </th>

                      <th className="border border-[#d5dfd6] px-4 py-3 text-right font-bold">
                        সর্বনিম্ন
                      </th>

                      <th className="border border-[#d5dfd6] px-4 py-3 text-right font-bold">
                        সর্বোচ্চ
                      </th>

                      <th className="border border-[#d5dfd6] px-4 py-3 text-right font-bold">
                        গড় দাম
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {validMarkets.map((market, index) => (
                      <tr
                        key={`${market.name}-${index}`}
                        className={
                          index % 2 === 0
                            ? "bg-white"
                            : "bg-[#f0f5f0]"
                        }
                      >
                        <td className="border border-[#d5dfd6] px-4 py-3 font-medium text-slate-700">
                          {market.name}
                        </td>

                        <td className="border border-[#d5dfd6] px-4 py-3 text-slate-600">
                          {market.division || "—"}
                        </td>

                        <td className="border border-[#d5dfd6] px-4 py-3 text-right">
                          {market.low > 0
                            ? formatMoney(market.low)
                            : "—"}
                        </td>

                        <td className="border border-[#d5dfd6] px-4 py-3 text-right">
                          {market.high > 0
                            ? formatMoney(market.high)
                            : "—"}
                        </td>

                        <td className="border border-[#d5dfd6] px-4 py-3 text-right font-bold text-emerald-800">
                          {market.average > 0
                            ? formatMoney(market.average)
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#cbd8cd] bg-white p-6 text-center">
              <p className="text-3xl">🛒</p>

              <h3 className="mt-3 font-bold text-[#173b2b]">
                বাজারভিত্তিক দাম পাওয়া যায়নি
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                API-তে বাজারের দাম পাওয়া গেলে এখানে দেখানো হবে।
                বর্তমান পণ্যের দাম: {formatMoney(p.price)}।
              </p>
            </div>
          )}
        </section>

        <div className="mt-6">
          <Link href="/" className="btn-primary">
            ← আরও পণ্য দেখুন
          </Link>
        </div>
      </div>
    </main>
  );
}
