"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import {
  getCategories,
  type Category,
  getProducts,
  formatMoney,
  changeLabel,
} from "@/lib/api";
import toast from "react-hot-toast";

type TickerProduct = {
  id?: string | number;
  slug?: string;
  emoji?: string;
  name?: string;
  price?: number;
  unit?: string;
  changePercent?: number;
};

function DefaultAvatar() {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-emerald-200 bg-emerald-100">
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="50" cy="50" r="50" fill="#D1FAE5" />
        <circle cx="50" cy="36" r="17" fill="#047857" />
        <path
          d="M17 96C19 74 32 62 50 62C68 62 81 74 83 96"
          fill="#047857"
        />
      </svg>
    </span>
  );
}

export default function Navbar() {
  const path = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const [cats, setCats] = useState<Category[]>([]);
  const [products, setProducts] = useState<TickerProduct[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const { data: session } = authClient.useSession();

  useEffect(() => {
    getCategories().then(setCats).catch(() => {});
    getProducts().then(setProducts).catch(() => {});
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [path]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function signOut() {
    if (signingOut) return;

    setSigningOut(true);

    try {
      const result = await authClient.signOut();

      if (result.error) {
        throw new Error(result.error.message || "সাইন আউট করা যায়নি");
      }

      setMenuOpen(false);
      toast.success("সফলভাবে সাইন আউট হয়েছে");
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "সাইন আউট ব্যর্থ হয়েছে"
      );
    } finally {
      setSigningOut(false);
    }
  }

  const date = new Intl.DateTimeFormat("bn-BD", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const userName = session?.user?.name?.trim() || "ব্যবহারকারী";

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-100 bg-white/95 backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-4">
        {/* Main navigation */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 py-3 md:grid-cols-[180px_minmax(0,1fr)_160px] md:gap-x-4">
          {/* Brand: left */}
          <Link href="/" className="min-w-0 justify-self-start leading-tight">
            <span className="flex items-center gap-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-lg text-white">
                🛒
              </span>

              <span className="min-w-0">
                <span className="block whitespace-nowrap text-lg font-black text-slate-900 sm:text-xl">
                  বাজার দর
                </span>
                <span className="mt-0.5 hidden whitespace-nowrap text-[10px] text-slate-500 sm:block">
                  প্রতিদিনের বাজারদর, এক নজরে
                </span>
              </span>
            </span>

            <span className="mt-1.5 hidden text-[10px] text-slate-500 sm:block">
              {date}
            </span>
          </Link>

          {/* Account: right */}
          <div className="col-start-2 row-start-1 justify-self-end md:col-start-3">
            {session?.user ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  aria-label="প্রোফাইল মেনু"
                  className="flex items-center gap-2 rounded-full px-1.5 py-1 transition hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                >
                  <DefaultAvatar />

                  <span className="hidden max-w-[100px] truncate text-left text-sm font-semibold text-slate-800 sm:block">
                    {userName}
                  </span>

                  <svg
                    viewBox="0 0 20 20"
                    className={`h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform ${
                      menuOpen ? "rotate-180" : ""
                    }`}
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.22 7.22a.75.75 0 0 1 1.06 0L10 10.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.28a.75.75 0 0 1 0-1.06Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-emerald-100 bg-white p-2 shadow-xl shadow-slate-900/10"
                  >
                    <div className="flex items-center gap-3 border-b border-slate-100 px-3 py-3">
                      <DefaultAvatar />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {userName}
                        </p>
                        <p className="break-all text-xs text-slate-500">
                          {session.user.email}
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/my-profile"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-800"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                        <svg
                          viewBox="0 0 24 24"
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="8" r="4" />
                          <path
                            d="M4.5 20a7.5 7.5 0 0 1 15 0"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                      <span>
                        <span className="block">প্রোফাইল তথ্য</span>
                        <span className="mt-0.5 block text-xs font-normal text-slate-500">
                          আপনার অ্যাকাউন্ট দেখুন
                        </span>
                      </span>
                    </Link>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={signOut}
                      disabled={signingOut}
                      className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100">
                        <svg
                          viewBox="0 0 24 24"
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M10 17l5-5-5-5M15 12H3" />
                          <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
                        </svg>
                      </span>
                      {signingOut ? "সাইন আউট হচ্ছে..." : "সাইন আউট"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link className="btn-outline !px-3 !py-2" href="/signin">
                  সাইন ইন
                </Link>
                <Link className="btn-primary !px-3 !py-2" href="/signup">
                  সাইন আপ
                </Link>
              </div>
            )}
          </div>

          {/* Categories: centered between brand and account */}
          <nav
            aria-label="পণ্যের ক্যাটাগরি"
            className="col-span-2 row-start-2 flex min-w-0 items-center justify-start gap-1 overflow-x-auto pb-1 text-xs md:col-span-1 md:col-start-2 md:row-start-1 md:justify-center"
          >
            {cats.map((category: Category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                title={category.name}
                className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-2 transition ${
                  path === `/category/${category.slug}`
                    ? "bg-emerald-700 text-white"
                    : "text-slate-700 hover:bg-emerald-50"
                }`}
              >
                <span>{category.emoji}</span>
                <span className="font-semibold">{category.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Market ticker */}
      <div className="ticker">
        <div className="ticker-track">
          {[...products, ...products].map((product, index) => (
            <span
              key={`${product.id ?? product.slug ?? product.name ?? "product"}-${index}`}
              className="mx-6 inline-flex items-center gap-2"
            >
              <span>
                {product.emoji} {product.name}
              </span>

              <b>
                {formatMoney(Number(product.price ?? 0))}/
                {product.unit ?? "কেজি"}
              </b>

              <span
                className={
                  Number(product.changePercent ?? 0) > 0
                    ? "text-rose-700"
                    : Number(product.changePercent ?? 0) < 0
                      ? "text-emerald-700"
                      : "text-slate-500"
                }
              >
                {changeLabel(Number(product.changePercent ?? 0))}
              </span>
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}