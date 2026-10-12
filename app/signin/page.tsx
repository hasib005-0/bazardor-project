"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";

function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callback = params.get("callbackURL") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [socialBusy, setSocialBusy] = useState<"google" | "github" | null>(
    null
  );

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (busy || socialBusy) return;

    setBusy(true);

    try {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (result.error) {
        throw new Error(
          result.error.message || "সাইন ইন করা যায়নি। আবার চেষ্টা করুন।"
        );
      }

      toast.success("সফলভাবে সাইন ইন হয়েছে!");
      router.push(callback);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "সাইন ইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।"
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
    <main className="page-container min-h-[70vh] py-10 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition hover:text-emerald-900"
        >
          <span aria-hidden="true">←</span>
          হোমপেজে ফিরে যান
        </Link>

        <section className="mt-5 overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
          <div className="h-2 bg-emerald-700" />

          <div className="p-6 sm:p-9">
            <p className="text-sm font-bold text-emerald-700">
              আবারও স্বাগতম!
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              সাইন ইন করুন
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              আপনার BazarDor অ্যাকাউন্টে প্রবেশ করতে নিচের তথ্য দিন।
            </p>

            <form onSubmit={submit} className="mt-7 space-y-5">
              <label className="block text-sm font-semibold text-slate-700">
                ইমেইল ঠিকানা
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
                  autoComplete="current-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="আপনার পাসওয়ার্ড লিখুন"
                  disabled={busy || socialBusy !== null}
                />
              </label>

              <button
                type="submit"
                className="btn-primary w-full !rounded-xl !py-3"
                disabled={busy || socialBusy !== null}
              >
                {busy ? "সাইন ইন হচ্ছে..." : "সাইন ইন করুন"}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              অথবা অন্যভাবে সাইন ইন করুন
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                className="btn-outline w-full !rounded-xl !py-3"
                onClick={() => social("google")}
                disabled={busy || socialBusy !== null}
              >
                {socialBusy === "google" ? "অপেক্ষা করুন..." : "Google দিয়ে সাইন ইন"}
              </button>

              <button
                type="button"
                className="btn-outline w-full !rounded-xl !py-3"
                onClick={() => social("github")}
                disabled={busy || socialBusy !== null}
              >
                {socialBusy === "github" ? "অপেক্ষা করুন..." : "GitHub দিয়ে সাইন ইন"}
              </button>
            </div>

            <div className="mt-7 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
              <p className="text-sm text-slate-600">
                এখনো অ্যাকাউন্ট নেই?{" "}
                <Link
                  href="/signup"
                  className="font-bold text-emerald-700 hover:text-emerald-900"
                >
                  সাইন আপ করুন
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <main className="page-container flex min-h-[60vh] items-center justify-center">
          <p className="text-sm font-medium text-slate-500">
            সাইন ইন পেজ লোড হচ্ছে...
          </p>
        </main>
      }
    >
      <SignInForm />
    </Suspense>
  );
}