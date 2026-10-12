import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

function DefaultAvatar() {
  return (
    <div
      className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-emerald-100 shadow-sm"
      role="img"
      aria-label="Default profile avatar"
    >
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="50" cy="50" r="50" fill="#D1FAE5" />
        <circle cx="50" cy="37" r="17" fill="#047857" />
        <path
          d="M17 96C19 74 32 62 50 62C68 62 81 74 83 96"
          fill="#047857"
        />
      </svg>
    </div>
  );
}

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin?callbackURL=%2Fmy-profile");
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
              আপনার অ্যাকাউন্ট
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
              My Profile
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              আপনার BazarDor অ্যাকাউন্টের তথ্য এখানে দেখতে পারবেন।
            </p>

            <div className="mt-7 flex flex-col items-start gap-5 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 sm:flex-row sm:items-center">
              <DefaultAvatar />

              <div className="min-w-0">
                <h2 className="break-words text-xl font-extrabold text-slate-900">
                  {session.user.name || "BazarDor User"}
                </h2>

                <p className="mt-1 break-all text-sm text-slate-500">
                  {session.user.email}
                </p>

                <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                  অ্যাকাউন্ট সক্রিয়
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-5">
              <h3 className="text-base font-bold text-slate-900">
                অ্যাকাউন্টের তথ্য
              </h3>

              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    নাম
                  </p>
                  <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                    {session.user.name || "নাম দেওয়া হয়নি"}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs font-medium text-slate-500">
                    ইমেইল ঠিকানা
                  </p>
                  <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                    {session.user.email}
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/update-profile"
              className="btn-primary mt-6 w-full !rounded-xl py-3 sm:w-auto"
            >
              তথ্য আপডেট করুন
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}