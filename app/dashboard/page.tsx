"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  deleteProduct,
  getProducts,
  searchProducts,
  updateProduct,
} from "../api/products";
import { getCategories } from "../api/categories";

type Product = {
  id: number;
  title: string;
  category: string;
  price: number;
  rating: number;
  stock: number;
  thumbnail: string;
};

type SortOption =
  | "default"
  | "price-low"
  | "price-high"
  | "rating-low"
  | "rating-high"
  | "title-az"
  | "title-za";

export default function Dashboard() {
  const router = useRouter();

  // =========================
  // Authentication
  // =========================

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.push("/");
    }
  }, [router]);

  // =========================
  // Product states
  // =========================

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);

  const [error, setError] = useState("");
  const [categoryError, setCategoryError] = useState("");

  // =========================
  // Filters
  // =========================

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");

  // =========================
  // Pagination
  // =========================

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);

  const skip = (page - 1) * limit;

  // =========================
  // Edit states
  // =========================

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");

  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  // =========================
  // Delete states
  // =========================

  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState("");

  // =========================
  // Load Categories
  // =========================

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoryLoading(true);
        setCategoryError("");

        const data = await getCategories();

        const categoryList = data.map((category: unknown) => {
          if (typeof category === "string") {
            return category;
          }

          if (
            typeof category === "object" &&
            category !== null &&
            "slug" in category
          ) {
            return String(
              (category as { slug: string }).slug
            );
          }

          return "";
        });

        setCategories(categoryList.filter(Boolean));
      } catch (error) {
        console.error(error);
        setCategoryError("Unable to load categories.");
      } finally {
        setCategoryLoading(false);
      }
    };

    loadCategories();
  }, []);

  // =========================
  // Load Products
  // =========================

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        /*
          Small debounce for search.
          This prevents an API request on every single keystroke.
        */
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (cancelled) {
          return;
        }

        let data;

        // ---------------------------------
        // Search + Category
        // ---------------------------------

        if (selectedCategory && search.trim()) {
          const searchData = await searchProducts(
            search.trim(),
            0,
            0
          );

          if (cancelled) {
            return;
          }

          const filteredProducts = searchData.products.filter(
            (product: Product) =>
              product.category === selectedCategory
          );

          data = {
            products: filteredProducts,
            total: filteredProducts.length,
          };
        }

        // ---------------------------------
        // Category only
        // ---------------------------------

        else if (selectedCategory) {
          const allProducts = await getProducts(0, 0);

          if (cancelled) {
            return;
          }

          const filteredProducts = allProducts.products.filter(
            (product: Product) =>
              product.category === selectedCategory
          );

          data = {
            products: filteredProducts,
            total: filteredProducts.length,
          };
        }

        // ---------------------------------
        // Search only
        // ---------------------------------

        else if (search.trim()) {
          data = await searchProducts(
            search.trim(),
            0,
            0
          );
        }

        // ---------------------------------
        // All products
        // ---------------------------------

        else {
          data = await getProducts(0, 0);
        }

        if (cancelled) {
          return;
        }

        let productList: Product[] = data.products || [];

        // =========================
        // Sorting
        // =========================

        if (sortBy === "price-low") {
          productList.sort((a, b) => a.price - b.price);
        }

        if (sortBy === "price-high") {
          productList.sort((a, b) => b.price - a.price);
        }

        if (sortBy === "rating-low") {
          productList.sort((a, b) => a.rating - b.rating);
        }

        if (sortBy === "rating-high") {
          productList.sort((a, b) => b.rating - a.rating);
        }

        if (sortBy === "title-az") {
          productList.sort((a, b) =>
            a.title.localeCompare(b.title)
          );
        }

        if (sortBy === "title-za") {
          productList.sort((a, b) =>
            b.title.localeCompare(a.title)
          );
        }

        // =========================
        // Pagination
        // =========================

        const total = productList.length;

        const paginatedProducts = productList.slice(
          skip,
          skip + limit
        );

        setProducts(paginatedProducts);
        setTotalProducts(total);

        /*
          If current page becomes invalid after deleting/filtering,
          move the user back to page 1.
        */
        const totalPages = Math.max(
          1,
          Math.ceil(total / limit)
        );

        if (page > totalPages) {
          setPage(1);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(error);
        setError("Unable to load products. Please try again.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [
    search,
    selectedCategory,
    sortBy,
    page,
    limit,
  ]);

  // =========================
  // Logout
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    router.push("/");
  };

  // =========================
  // Search
  // =========================

  const handleSearchChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setSearch(event.target.value);
    setPage(1);
  };

  // =========================
  // Category
  // =========================

  const handleCategoryChange = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedCategory(event.target.value);
    setPage(1);
  };

  // =========================
  // Sorting
  // =========================

  const handleSortChange = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    setSortBy(event.target.value as SortOption);
    setPage(1);
  };

  // =========================
  // Page size
  // =========================

  const handleLimitChange = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    setLimit(Number(event.target.value));
    setPage(1);
  };

  // =========================
  // Edit Product
  // =========================

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);

    setEditTitle(product.title);
    setEditCategory(product.category);
    setEditPrice(String(product.price));
    setEditStock(String(product.stock));

    setEditError("");
    setEditSuccess("");
  };

  const handleEditSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setEditError("");
    setEditSuccess("");

    // -------------------------
    // Validation
    // -------------------------

    if (!editTitle.trim()) {
      setEditError("Product title is required.");
      return;
    }

    if (!editCategory.trim()) {
      setEditError("Category is required.");
      return;
    }

    const price = Number(editPrice);
    const stock = Number(editStock);

    if (Number.isNaN(price) || price <= 0) {
      setEditError("Price must be greater than 0.");
      return;
    }

    if (Number.isNaN(stock) || stock < 0) {
      setEditError("Stock cannot be negative.");
      return;
    }

    if (!editingProduct) {
      return;
    }

    try {
      setEditLoading(true);

      const updatedProduct = await updateProduct(
        editingProduct.id,
        {
          title: editTitle.trim(),
          category: editCategory.trim(),
          price,
          stock,
        }
      );

      /*
        DummyJSON simulates update requests.
        We update our local dashboard state so the user
        can immediately see the change.
      */

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === editingProduct.id
            ? {
                ...product,
                title: updatedProduct.title ?? editTitle.trim(),
                category:
                  updatedProduct.category ??
                  editCategory.trim(),
                price: updatedProduct.price ?? price,
                stock: updatedProduct.stock ?? stock,
              }
            : product
        )
      );

      setEditSuccess(
        "Product updated successfully."
      );

      setTimeout(() => {
        setEditingProduct(null);
        setEditSuccess("");
      }, 800);
    } catch (error) {
      console.error(error);
      setEditError(
        "Unable to update product. Please try again."
      );
    } finally {
      setEditLoading(false);
    }
  };

  // =========================
  // Delete Product
  // =========================

  const handleDeleteProduct = async (
    product: Product
  ) => {
    /*
      Prevent multiple delete requests at the same time.
    */
    if (deleteLoading !== null) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteLoading(product.id);
      setDeleteSuccess("");
      setError("");

      await deleteProduct(product.id);

      /*
        DummyJSON DELETE is simulated.
        Therefore we remove the product from our
        local state to immediately update the UI.
      */

      setProducts((currentProducts) =>
        currentProducts.filter(
          (item) => item.id !== product.id
        )
      );

      setTotalProducts((currentTotal) =>
        Math.max(0, currentTotal - 1)
      );

      setDeleteSuccess(
        `"${product.title}" deleted successfully.`
      );

      setTimeout(() => {
        setDeleteSuccess("");
      }, 2500);
    } catch (error) {
      console.error(error);

      setError(
        "Unable to delete product. Please try again."
      );
    } finally {
      setDeleteLoading(null);
    }
  };

  // =========================
  // Pagination calculations
  // =========================

  const totalPages = Math.max(
    1,
    Math.ceil(totalProducts / limit)
  );

  const startItem =
    totalProducts === 0 ? 0 : skip + 1;

  const endItem =
    totalProducts === 0
      ? 0
      : Math.min(skip + products.length, totalProducts);

  // =========================
  // Dashboard
  // =========================

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* =========================
          Header
      ========================= */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              ProductAdmin
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Product management dashboard
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Logout
          </button>

        </div>
      </header>

      {/* =========================
          Main Content
      ========================= */}

      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* Hero */}

        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 p-8 text-white shadow-xl">

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-indigo-100">
                Admin Dashboard
              </p>

              <h2 className="mt-2 text-3xl font-bold md:text-4xl">
                Manage your products
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100 md:text-base">
                Search, filter, sort, edit and delete products
                using the DummyJSON API.
              </p>
            </div>

            <button
              onClick={() => router.push("/products/new")}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-lg transition hover:bg-indigo-50"
            >
              + Add Product
            </button>

          </div>
        </section>

        {/* =========================
            Stats
        ========================= */}

        <section className="mt-6 grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Products displayed
            </p>

            <p className="mt-2 text-3xl font-bold">
              {totalProducts}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Stock on current page
            </p>

            <p className="mt-2 text-3xl font-bold">
              {products.reduce(
                (total, product) =>
                  total + product.stock,
                0
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Average rating
            </p>

            <p className="mt-2 text-3xl font-bold">
              {products.length
                ? (
                    products.reduce(
                      (total, product) =>
                        total + product.rating,
                      0
                    ) / products.length
                  ).toFixed(1)
                : "0.0"}
            </p>
          </div>

        </section>

        {/* =========================
            Filters
        ========================= */}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_1fr]">

            {/* Search */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Search products
              </label>

              <div className="relative">

                <input
                  type="text"
                  value={search}
                  onChange={handleSearchChange}
                  placeholder="Search by product name..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />

                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  🔍
                </span>

              </div>
            </div>

            {/* Category */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Category
              </label>

              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                disabled={categoryLoading}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">
                  All Categories
                </option>

                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}
              </select>

              {categoryError && (
                <p className="mt-1 text-xs text-red-500">
                  {categoryError}
                </p>
              )}
            </div>

            {/* Sort */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Sort
              </label>

              <select
                value={sortBy}
                onChange={handleSortChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              >
                <option value="default">
                  Default
                </option>

                <option value="price-low">
                  Price: Low to High
                </option>

                <option value="price-high">
                  Price: High to Low
                </option>

                <option value="rating-low">
                  Rating: Low to High
                </option>

                <option value="rating-high">
                  Rating: High to Low
                </option>

                <option value="title-az">
                  Title: A-Z
                </option>

                <option value="title-za">
                  Title: Z-A
                </option>
              </select>
            </div>

            {/* Page size */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Per page
              </label>

              <select
                value={limit}
                onChange={handleLimitChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

          </div>
        </section>

        {/* =========================
            Success messages
        ========================= */}

        {deleteSuccess && (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            ✓ {deleteSuccess}
          </div>
        )}

        {/* =========================
            Error
        ========================= */}

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* =========================
            Products
        ========================= */}

        <section className="mt-6">

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

              <p className="mt-4 text-sm text-slate-500">
                Loading products...
              </p>

            </div>
          ) : products.length === 0 ? (

            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

              <div className="text-5xl">
                📦
              </div>

              <h3 className="mt-4 text-lg font-bold">
                No products found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Try changing your search or filter.
              </p>

            </div>
          ) : (

            <div className="space-y-4">

              {products.map((product) => (

                <article
                  key={product.id}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >

                  <div className="flex flex-col gap-5 md:flex-row md:items-center">

                    {/* Image */}

                    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">

                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="h-full w-full object-cover"
                      />

                    </div>

                    {/* Product information */}

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-2">

                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                          {product.category}
                        </span>

                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                          ⭐ {product.rating}
                        </span>

                      </div>

                      <h3 className="mt-3 truncate text-lg font-bold text-slate-900">
                        {product.title}
                      </h3>

                      <div className="mt-3 flex flex-wrap gap-5 text-sm">

                        <div>
                          <span className="text-slate-500">
                            Price
                          </span>

                          <p className="font-bold text-slate-900">
                            ${product.price}
                          </p>
                        </div>

                        <div>
                          <span className="text-slate-500">
                            Stock
                          </span>

                          <p
                            className={
                              product.stock > 0
                                ? "font-bold text-emerald-600"
                                : "font-bold text-red-600"
                            }
                          >
                            {product.stock > 0
                              ? `${product.stock} available`
                              : "Out of stock"}
                          </p>
                        </div>

                      </div>

                    </div>

                    {/* Actions */}

                    <div className="flex gap-2 md:flex-col">

                      {/* View */}

                      <button
                        onClick={() =>
                          router.push(
                            `/products/${product.id}`
                          )
                        }
                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        View
                      </button>

                      {/* Edit */}

                      <button
                        onClick={() =>
                          handleEditClick(product)
                        }
                        className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                      >
                        Edit
                      </button>

                      {/* Delete */}

                      <button
                        onClick={() =>
                          handleDeleteProduct(product)
                        }
                        disabled={
                          deleteLoading === product.id
                        }
                        className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deleteLoading === product.id ? (
                          <span className="flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
                            Deleting...
                          </span>
                        ) : (
                          "Delete"
                        )}
                      </button>

                    </div>

                  </div>

                </article>

              ))}

            </div>
          )}

        </section>

        {/* =========================
            Pagination
        ========================= */}

        {!loading && totalProducts > 0 && (
          <section className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">

            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-900">
                {startItem}-{endItem}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900">
                {totalProducts}
              </span>{" "}
              products
            </p>

            <div className="flex items-center gap-2">

              <button
                onClick={() =>
                  setPage((current) =>
                    Math.max(1, current - 1)
                  )
                }
                disabled={page === 1}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <div className="rounded-xl bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700">
                Page {page} of {totalPages}
              </div>

              <button
                onClick={() =>
                  setPage((current) =>
                    Math.min(
                      totalPages,
                      current + 1
                    )
                  )
                }
                disabled={page >= totalPages}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>

            </div>

          </section>
        )}

      </div>

      {/* =========================
          Edit Modal
      ========================= */}

      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">

          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">

            <div className="flex items-start justify-between">

              <div>
                <h2 className="text-2xl font-bold">
                  Edit Product
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Update product information below.
                </p>
              </div>

              <button
                onClick={() =>
                  setEditingProduct(null)
                }
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>

            </div>

            <form
              onSubmit={handleEditSubmit}
              className="mt-6 space-y-4"
            >

              {/* Title */}

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Product Title
                </label>

                <input
                  type="text"
                  value={editTitle}
                  onChange={(event) =>
                    setEditTitle(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Category */}

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Category
                </label>

                <input
                  type="text"
                  value={editCategory}
                  onChange={(event) =>
                    setEditCategory(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Price */}

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Price
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editPrice}
                  onChange={(event) =>
                    setEditPrice(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Stock */}

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Stock
                </label>

                <input
                  type="number"
                  min="0"
                  value={editStock}
                  onChange={(event) =>
                    setEditStock(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Error */}

              {editError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {editError}
                </div>
              )}

              {/* Success */}

              {editSuccess && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  ✓ {editSuccess}
                </div>
              )}

              {/* Buttons */}

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={() =>
                    setEditingProduct(null)
                  }
                  disabled={editLoading}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={editLoading}
                  className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {editLoading
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </main>
  );
}