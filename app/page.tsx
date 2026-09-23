"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "./api/auth";

export default function Home() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (!username || !password) {
      setError("Please enter username and password.");
      return;
    }

    setLoading(true);

 try {
  const data = await loginUser(username, password);

  localStorage.setItem("accessToken", data.accessToken);

  router.push("/dashboard");
} catch (error) {
      console.error(error);
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl min-h-[680px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        
        {/* LEFT SIDE */}
        <section className="relative lg:w-1/2 bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 text-white p-8 sm:p-12 lg:p-14 flex flex-col justify-between overflow-hidden">
          
          {/* Decorative circles */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full" />
          <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-white/10 rounded-full" />

          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-14">
              <div className="w-11 h-11 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                <span className="text-2xl">◆</span>
              </div>

              <span className="text-2xl font-bold tracking-tight">
                Product<span className="text-indigo-200">Admin</span>
              </span>
            </div>

            {/* Heading */}
            <div className="max-w-lg">
              <p className="text-indigo-200 font-medium mb-4">
                PRODUCT MANAGEMENT
              </p>

              <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
                Your Products,
                <span className="block text-indigo-200">
                  Our Priority.
                </span>
              </h1>

              <p className="mt-6 text-indigo-100 text-base sm:text-lg leading-7 max-w-md">
                A simple and powerful dashboard to manage your products,
                inventory and business — all in one place.
              </p>
            </div>

            {/* Features */}
            <div className="mt-10 space-y-5">
              <Feature
                icon="▣"
                title="Manage Products"
                description="Add, edit and delete products easily"
              />

              <Feature
                icon="▥"
                title="Track Inventory"
                description="Keep your stock information up to date"
              />

              <Feature
                icon="✓"
                title="Secure Access"
                description="Only authorized users can access your dashboard"
              />
            </div>
          </div>

          {/* Bottom text */}
          <div className="relative z-10 mt-10">
            <p className="text-indigo-200 text-sm">
              Better Management • Bigger Opportunities
            </p>
          </div>
        </section>

        {/* RIGHT SIDE */}
        <section className="lg:w-1/2 bg-white flex items-center justify-center p-6 sm:p-10 lg:p-14">
          <div className="w-full max-w-md">

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                <span className="text-white text-3xl">◆</span>
              </div>
            </div>

            {/* Heading */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900">
                Welcome Back
              </h2>

              <p className="text-slate-500 mt-2">
                Sign in to your Product Admin Dashboard
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-semibold text-slate-800 mb-2"
                >
                  Username
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    👤
                  </span>

                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Enter your username"
                    className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-800 mb-2"
                >
                  Password
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    🔒
                  </span>

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-12 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                  <p className="text-sm text-red-600">
                    {error}
                  </p>
                </div>
              )}

              {/* Sign In */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-200 transition hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign In  →"}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-7">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-sm text-slate-400">
                Demo Access
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Demo Credentials */}
            <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4">
              <div className="flex gap-3">
                <div className="text-indigo-600 text-lg">
                  🔐
                </div>

                <div>
                  <p className="font-semibold text-slate-800 text-sm">
                    Demo Credentials
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Username:{" "}
                    <span className="font-medium text-slate-700">
                      emilys
                    </span>
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Password:{" "}
                    <span className="font-medium text-slate-700">
                      emilyspass
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-slate-400 mt-8">
              Product Admin Dashboard
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

/* Feature component */
function Feature({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-lg">
        {icon}
      </div>

      <div>
        <h3 className="font-semibold text-white">
          {title}
        </h3>

        <p className="text-sm text-indigo-200 mt-0.5">
          {description}
        </p>
      </div>
    </div>
  );
}