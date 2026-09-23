"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProducts, searchProducts } from "../api/products";

type Product = {
  id: number;
  title: string;
  category: string;
  price: number;
  rating: number;
  stock: number;
  thumbnail: string;
};

export default function Dashboard() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.push("/");
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");

        let data;

        if (search.trim() === "") {
          data = await getProducts(10, 0);
        } else {
          data = await searchProducts(search.trim(), 10, 0);
        }

        setProducts(data.products);
      } catch (error) {
        console.error(error);
        setError("Unable to load products.");
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [router, search]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    router.push("/");
  };

  const totalStock = products.reduce(
    (total, product) => total + product.stock,
    0
  );

  const averageRating =
    products.length > 0
      ? (
          products.reduce((total, product) => total + product.rating, 0) /
          products.length
        ).toFixed(1)
      : "0.0";

  const getCategoryStyle = (category: string) => {
    const value = category.toLowerCase();

    if (value.includes("beauty")) {
      return "bg-pink-50 text-pink-600 border-pink-100";
    }

    if (value.includes("fragrance")) {
      return "bg-purple-50 text-purple-600 border-purple-100";
    }

    if (value.includes("furniture")) {
      return "bg-orange-50 text-orange-600 border-orange-100";
    }

    if (value.includes("groceries")) {
      return "bg-emerald-50 text-emerald-600 border-emerald-100";
    }

    if (value.includes("laptop") || value.includes("computer")) {
      return "bg-blue-50 text-blue-600 border-blue-100";
    }

    return "bg-indigo-50 text-indigo-600 border-indigo-100";
  };

  const getStockStyle = (stock: number) => {
    if (stock > 50) {
      return {
        text: "text-emerald-600",
        bg: "bg-emerald-50",
        dot: "bg-emerald-500",
        label: "In Stock",
      };
    }

    if (stock > 10) {
      return {
        text: "text-amber-600",
        bg: "bg-amber-50",
        dot: "bg-amber-500",
        label: "Limited",
      };
    }

    return {
      text: "text-red-600",
      bg: "bg-red-50",
      dot: "bg-red-500",
      label: "Low Stock",
    };
  };

  return (
    <main className="min-h-screen bg-[#f5f7ff] text-slate-900">

      {/* ================================================= */}
      {/* NAVBAR */}
      {/* ================================================= */}

      <header className="sticky top-0 z-50 border-b border-white/60 bg-white/80 backdrop-blur-xl">

        <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-5 sm:px-8">

          {/* BRAND */}

          <div className="flex items-center gap-3">

            <div className="relative">

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 text-lg font-black text-white shadow-lg shadow-indigo-200">
                P
              </div>

              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />

            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight">
                ProductAdmin
              </h1>

              <p className="text-xs text-slate-400">
                Smart product management
              </p>
            </div>

          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-3">

            <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 sm:flex">

              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />

              <span className="text-xs font-semibold text-emerald-700">
                Live
              </span>

            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >

              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"
                />

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 17l5-5-5-5"
                />

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12H3"
                />

              </svg>

              Logout

            </button>

          </div>

        </div>

      </header>

      {/* ================================================= */}
      {/* MAIN */}
      {/* ================================================= */}

      <section className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8">

        {/* ================================================= */}
        {/* COLORFUL HERO */}
        {/* ================================================= */}

        <div className="relative mb-8 overflow-hidden rounded-[28px] bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 p-7 text-white shadow-2xl shadow-indigo-200 sm:p-10">

          <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full bg-white/10" />

          <div className="absolute -bottom-28 right-36 h-64 w-64 rounded-full bg-cyan-300/10" />

          <div className="absolute left-1/2 top-0 h-40 w-40 rounded-full bg-pink-300/10 blur-2xl" />

          <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">

            <div className="max-w-2xl">

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur">

                <span>✨</span>

                <span className="text-xs font-semibold tracking-wide text-white/90">
                  PRODUCT MANAGEMENT
                </span>

              </div>

              <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
                Everything your
                <br />
                products need.
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-6 text-indigo-100 sm:text-base">
                Manage your catalog, monitor inventory and keep
                track of product performance from one beautiful
                workspace.
              </p>

            </div>

            <div className="hidden lg:block">

              <div className="relative flex h-40 w-40 items-center justify-center rounded-[32px] border border-white/20 bg-white/10 shadow-2xl backdrop-blur">

                <div className="absolute inset-5 rounded-2xl bg-white/10" />

                <svg
                  className="relative h-20 w-20 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  viewBox="0 0 24 24"
                >

                  <rect
                    x="3"
                    y="4"
                    width="18"
                    height="16"
                    rx="2"
                  />

                  <path
                    strokeLinecap="round"
                    d="M7 16l3-4 2 2 3-5 2 3"
                  />

                  <circle cx="8" cy="8" r="1" />

                </svg>

              </div>

            </div>

          </div>

        </div>

        {/* ================================================= */}
        {/* STATS */}
        {/* ================================================= */}

        <div className="mb-9 grid grid-cols-1 gap-5 md:grid-cols-3">

          {/* Products */}

          <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-semibold text-indigo-500">
                  Total Products
                </p>

                <p className="mt-2 text-4xl font-black text-slate-900">
                  {loading ? "—" : products.length}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Products displayed
                </p>

              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl text-white shadow-lg shadow-indigo-200">
                📦
              </div>

            </div>

            <div className="absolute -bottom-10 -right-10 h-28 w-28 rounded-full bg-indigo-200/30" />

          </div>

          {/* Inventory */}

          <div className="relative overflow-hidden rounded-2xl border border-cyan-100 bg-gradient-to-br from-white to-cyan-50 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-semibold text-cyan-600">
                  Total Inventory
                </p>

                <p className="mt-2 text-4xl font-black text-slate-900">
                  {loading ? "—" : totalStock}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Units available
                </p>

              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-2xl text-white shadow-lg shadow-cyan-200">
                📊
              </div>

            </div>

            <div className="absolute -bottom-10 -right-10 h-28 w-28 rounded-full bg-cyan-200/30" />

          </div>

          {/* Rating */}

          <div className="relative overflow-hidden rounded-2xl border border-amber-100 bg-gradient-to-br from-white to-amber-50 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-semibold text-amber-600">
                  Average Rating
                </p>

                <p className="mt-2 text-4xl font-black text-slate-900">
                  {loading ? "—" : averageRating}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Customer ratings
                </p>

              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-2xl text-white shadow-lg shadow-amber-200">
                ⭐
              </div>

            </div>

            <div className="absolute -bottom-10 -right-10 h-28 w-28 rounded-full bg-amber-200/30" />

          </div>

        </div>

        {/* ================================================= */}
        {/* PRODUCT HEADER */}
        {/* ================================================= */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-xl text-white shadow-lg shadow-indigo-100">
                🛍️
              </div>

              <div>

                <h3 className="text-xl font-black text-slate-900">
                  Product Catalog
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Explore and manage your products.
                </p>

              </div>

            </div>

            {/* SEARCH */}

            <div className="relative w-full lg:w-96">

              <svg
                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >

                <circle cx="11" cy="11" r="7" />

                <path
                  strokeLinecap="round"
                  d="m20 20-4-4"
                />

              </svg>

              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              />

            </div>

          </div>

        </div>

        {/* ================================================= */}
        {/* LOADING */}
        {/* ================================================= */}

        {loading && (

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (

              <div
                key={item}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >

                <div className="h-48 animate-pulse bg-gradient-to-br from-slate-100 to-indigo-50" />

                <div className="space-y-3 p-4">

                  <div className="h-4 animate-pulse rounded bg-slate-100" />

                  <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />

                  <div className="h-6 w-1/2 animate-pulse rounded bg-slate-100" />

                </div>

              </div>

            ))}

          </div>

        )}

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (

          <div className="rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-rose-50 p-12 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-3xl">
              ⚠️
            </div>

            <h3 className="mt-5 text-lg font-bold text-red-800">
              Unable to load products
            </h3>

            <p className="mt-2 text-sm text-red-500">
              {error}
            </p>

          </div>

        )}

        {/* ================================================= */}
        {/* PRODUCT CARDS */}
        {/* ================================================= */}

        {!loading && !error && (

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {products.map((product) => {

              const stock = getStockStyle(product.stock);

              return (

                <article
                  key={product.id}
                  className="group overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-100/50"
                >

                  {/* IMAGE */}

                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">

                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    />

                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 transition group-hover:opacity-100" />

                    {/* CATEGORY */}

                    <div className="absolute left-3.5 top-3.5">

                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-bold capitalize shadow-sm backdrop-blur ${getCategoryStyle(
                          product.category
                        )}`}
                      >
                        {product.category}
                      </span>

                    </div>

                    {/* RATING */}

                    <div className="absolute right-3.5 top-3.5">

                      <div className="flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-md">

                        <span className="text-amber-400">
                          ★
                        </span>

                        {product.rating}

                      </div>

                    </div>

                  </div>

                  {/* CARD BODY */}

                  <div className="p-4">

                    <div className="min-h-[52px]">

                      <h4 className="line-clamp-2 text-[15px] font-bold leading-5 text-slate-900 transition group-hover:text-indigo-600">
                        {product.title}
                      </h4>

                      <p className="mt-1 text-[11px] text-slate-400">
                        Product #{product.id}
                      </p>

                    </div>

                    {/* PRICE */}

                    <div className="mt-4 flex items-end justify-between">

                      <div>

                        <p className="text-[11px] font-medium text-slate-400">
                          Price
                        </p>

                        <p className="mt-1 text-xl font-black text-slate-950">
                          ${product.price.toFixed(2)}
                        </p>

                      </div>

                      <div
                        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-bold ${stock.bg} ${stock.text}`}
                      >

                        <span
                          className={`h-1.5 w-1.5 rounded-full ${stock.dot}`}
                        />

                        {stock.label}

                      </div>

                    </div>

                    <p className="mt-2 text-[11px] text-slate-400">
                      {product.stock} units available
                    </p>

                    {/* DIVIDER */}

                    <div className="my-4 h-px bg-slate-100" />

                    {/* BUTTONS */}

                    <div className="flex gap-2">

                      <button
                        onClick={() =>
                          router.push(`/products/${product.id}`)
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-2 text-xs font-bold text-white shadow-md shadow-indigo-100 transition hover:from-indigo-700 hover:to-violet-700 hover:shadow-lg"
                      >

                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
                          />

                          <circle
                            cx="12"
                            cy="12"
                            r="2.5"
                          />

                        </svg>

                        View

                      </button>

                      <button
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 transition hover:bg-indigo-100"
                        title="Edit product"
                      >

                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 20h9"
                          />

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z"
                          />

                        </svg>

                      </button>

                      <button
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-500 transition hover:bg-rose-100"
                        title="Delete product"
                      >

                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 7h16"
                          />

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10 11v6M14 11v6"
                          />

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 7l1 14h10l1-14"
                          />

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 7V4h6v3"
                          />

                        </svg>

                      </button>

                    </div>

                  </div>

                </article>

              );

            })}

          </div>

        )}

        {/* ================================================= */}
        {/* EMPTY */}
        {/* ================================================= */}

        {!loading && !error && products.length === 0 && (

          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-4xl">
              📦
            </div>

            <h3 className="mt-6 text-xl font-bold text-slate-900">
              No products found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Your product catalog is currently empty.
            </p>

          </div>

        )}

        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <footer className="py-10 text-center">

          <div className="mb-3 flex items-center justify-center gap-2">

            <span className="h-2 w-2 rounded-full bg-indigo-500" />

            <span className="text-xs font-semibold text-slate-400">
              ProductAdmin
            </span>

          </div>

          <p className="text-xs text-slate-300">
            Product management dashboard • Powered by DummyJSON
          </p>

        </footer>

      </section>

    </main>
  );
}