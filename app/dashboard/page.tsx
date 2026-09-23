"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.push("/");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    router.push("/");
  };
  
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              ProductAdmin
            </h1>
            <p className="text-sm text-slate-500">
              Product Management Dashboard
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-red-50 text-red-600 font-medium hover:bg-red-100 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900">
            Welcome to your Dashboard 👋
          </h2>

          <p className="text-slate-500 mt-2">
            You have successfully logged in.
          </p>
        </div>
      </section>
    </main>
  );
}