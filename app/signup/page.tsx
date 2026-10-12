"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";

function SignUpForm() {
  const router = useRouter();
  const params = useSearchParams();

  const callback = params.get("callbackURL") || "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [socialBusy, setSocialBusy] = useState<"google" | "github" | null>(
    null
  );

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (busy || socialBusy) return;

    if (password.length < 8) {
      toast.error("পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("দুটি পাসওয়ার্ড মিলছে না");
      return;
    }

    setBusy(true);

    try {
      const result = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (result.error) {
        throw new Error(
          result.error.message || "রেজিস্ট্রেশন করা যায়নি"
        );
      }

      toast.success("অ্যাকাউন্ট তৈরি হয়েছে!");

      router.push(
        `/signin?callbackURL=${encodeURIComponent(callback)}`
      );
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "সাইন আপ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।"
      );
    } finally {
      setBusy(false);
    }
  }

  async function social(provider: "google" | "github") {
    if (busy || socialBusy) return;

    setSocialBusy(provider);

    try {
      await authClient.signIn.social({
        provider,
        callbackURL: callback,
      });
    } catch {
      toast.error(
        `${provider === "google" ? "Google" : "GitHub"} login configuration পরীক্ষা করুন।`
      );
      setSocialBusy(null);
    }
  }

  return (
    <main className="page-container flex min-h-[70vh] items-center justify-center py-10 sm:py-14">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
          <div className="h-2 bg-emerald-700" />

          <div className="p-6 sm:p-8">
            <div className="text-center">
              <Link
                href="/"
                className="mx-auto inline-flex items-center gap-2"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-lg text-white">
                  🛒
                </span>
                <span className="text-xl font-black text-slate-900">
                  বাজার দর
                </span>
              </Link>

              <h1 className="mt-5 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                অ্যাকাউন্ট তৈরি করুন
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                বাজারের দাম জানুন এবং প্রতিদিনের কেনাকাটায় সচেতন সিদ্ধান্ত নিন।
              </p>
            </div>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <label className="block text-sm font-semibold text-slate-700">
                নাম
                <input
                  className="input mt-2"
                  type="text"
                  autoComplete="name"
                  required
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="আপনার নাম"
                  disabled={busy || socialBusy !== null}
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                ইমেইল
                <input
                  className="input mt-2"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={busy || socialBusy !== null}
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                পাসওয়ার্ড
                <input
                  className="input mt-2"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="কমপক্ষে ৮ অক্ষর"
                  disabled={busy || socialBusy !== null}
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                পাসওয়ার্ড নিশ্চিত করুন
                <input
                  className="input mt-2"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="পাসওয়ার্ড আবার লিখুন"
                  disabled={busy || socialBusy !== null}
                />
              </label>

              <button
                type="submit"
                className="btn-primary w-full !rounded-xl !py-3"
                disabled={busy || socialBusy !== null}
              >
                {busy ? "অ্যাকাউন্ট তৈরি হচ্ছে..." : "অ্যাকাউন্ট তৈরি করুন"}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              অথবা
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                className="btn-outline w-full !rounded-xl !py-3"
                onClick={() => social("google")}
                disabled={busy || socialBusy !== null}
              >
                {socialBusy === "google"
                  ? "অপেক্ষা করুন..."
                  : "Google দিয়ে সাইন আপ"}
              </button>

              <button
                type="button"
                className="btn-outline w-full !rounded-xl !py-3"
                onClick={() => social("github")}
                disabled={busy || socialBusy !== null}
              >
                {socialBusy === "github"
                  ? "অপেক্ষা করুন..."
                  : "GitHub দিয়ে সাইন আপ"}
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
              <p className="text-sm text-slate-600">
                আগে থেকেই অ্যাকাউন্ট আছে?{" "}
                <Link
                  className="font-bold text-emerald-700 hover:text-emerald-900"
                  href={`/signin?callbackURL=${encodeURIComponent(callback)}`}
                >
                  সাইন ইন করুন
                </Link>
              </p>
            </div>

            <p className="mt-5 text-center text-xs text-slate-400">
              <Link href="/" className="hover:text-emerald-700">
                ← হোমপেজে ফিরে যান
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <main className="page-container flex min-h-[60vh] items-center justify-center">
          <p className="text-sm text-slate-500">
            সাইন আপ পেজ লোড হচ্ছে...
          </p>
        </main>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}