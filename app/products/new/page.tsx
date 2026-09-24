"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addProduct} from "../../api/products";
import { getCategories } from "../../api/categories";

export default function AddProduct() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");

  const [categories, setCategories] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.push("/");
      return;
    }

    const fetchCategories = async () => {
      try {
        const data = await getCategories();

        if (Array.isArray(data)) {
          setCategories(
            data.map((item: string | { slug: string }) =>
              typeof item === "string" ? item : item.slug
            )
          );
        }
      } catch (error) {
        console.error(error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (!title.trim()) {
      setError("Product title is required.");
      return;
    }

    if (!price || Number(price) <= 0) {
      setError("Please enter a valid price.");
      return;
    }

    if (!category) {
      setError("Please select a category.");
      return;
    }

    if (!stock || Number(stock) < 0) {
      setError("Please enter a valid stock quantity.");
      return;
    }

    setLoading(true);

    try {
      await addProduct({
        title: title.trim(),
        price: Number(price),
        category,
        stock: Number(stock),
      });

      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      setError("Unable to add product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>

            Back to Products
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>

            <span className="hidden text-lg font-bold text-slate-900 sm:block">
              Product Admin
            </span>
          </div>
        </div>
      </header>

      {/* Form */}
      <section className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
          {/* Heading */}
          <div className="mb-8">
            <div className="inline-flex rounded-full bg-indigo-100 px-4 py-1.5 text-xs font-bold text-indigo-700">
              Product Management
            </div>

            <h1 className="mt-4 text-3xl font-extrabold text-slate-900">
              Add New Product
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Enter the product information below to create a new product.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-4 w-4 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>

              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Product Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Enter product title"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            {/* Price + Stock */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Price
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                    $
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-8 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Stock
                </label>

                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(event) => setStock(event.target.value)}
                  placeholder="Enter stock quantity"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Category
              </label>

              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                disabled={categoriesLoading}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm capitalize text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">
                  {categoriesLoading
                    ? "Loading categories..."
                    : "Select a category"}
                </option>

                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                disabled={loading}
                className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <svg
                      className="h-5 w-5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />

                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>

                    Adding Product...
                  </>
                ) : (
                  <>
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>

                    Add Product
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}