"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProductById } from "../../api/products";

type Review = {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
};

type Product = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  stock: number;
  brand?: string;
  sku?: string;
  weight?: number;
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  images: string[];
  thumbnail: string;
  reviews?: Review[];
};

export default function ProductDetails() {
  const params = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.push("/");
      return;
    }

    const productId = Number(params.id);

    if (!params.id || Number.isNaN(productId) || productId <= 0) {
      setError("Product Not Found");
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getProductById(productId);

        setProduct(data);
        setSelectedImage(data.thumbnail);
      } catch (error) {
        console.error(error);
        setError("Product Not Found");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id, router]);

  const handleBack = () => {
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="mb-6 h-10 w-32 rounded-xl bg-slate-200" />

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-[28px] bg-white p-6 shadow-sm">
              <div className="h-[420px] rounded-2xl bg-slate-200" />

              <div className="mt-5 flex gap-3">
                <div className="h-20 w-20 rounded-xl bg-slate-200" />
                <div className="h-20 w-20 rounded-xl bg-slate-200" />
                <div className="h-20 w-20 rounded-xl bg-slate-200" />
              </div>
            </div>

            <div className="rounded-[28px] bg-white p-8 shadow-sm">
              <div className="h-7 w-24 rounded-full bg-slate-200" />
              <div className="mt-5 h-10 w-3/4 rounded-lg bg-slate-200" />
              <div className="mt-4 h-5 w-full rounded bg-slate-200" />
              <div className="mt-2 h-5 w-5/6 rounded bg-slate-200" />
              <div className="mt-8 h-12 w-40 rounded-xl bg-slate-200" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-[28px] bg-white p-10 text-center shadow-xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-10 w-10 text-red-500"
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

          <h1 className="mt-6 text-2xl font-bold text-slate-900">
            Product Not Found
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            The product you are looking for does not exist or could not be
            loaded.
          </p>

          <button
            onClick={handleBack}
            className="mt-7 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:scale-[1.02]"
          >
            Back to Products
          </button>
        </div>
      </main>
    );
  }

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.thumbnail];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <button
            onClick={handleBack}
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

          <div className="hidden items-center gap-2 sm:flex">
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
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
                />
              </svg>
            </div>

            <span className="text-lg font-bold text-slate-900">
              Product Admin
            </span>
          </div>
        </div>
      </header>

      {/* Product Content */}
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Images */}
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50">
            {/* Main Image */}
            <div className="flex h-[380px] items-center justify-center overflow-hidden rounded-[22px] bg-gradient-to-br from-slate-100 to-indigo-50 p-8 sm:h-[460px]">
              <img
                src={selectedImage}
                alt={product.title}
                className="h-full w-full object-contain transition duration-500 hover:scale-105"
              />
            </div>

            {/* Thumbnails */}
            <div className="mt-5 flex gap-3 overflow-x-auto pb-1">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  onClick={() => setSelectedImage(image)}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-slate-50 p-2 transition ${
                    selectedImage === image
                      ? "border-indigo-600 shadow-md"
                      : "border-slate-200 hover:border-indigo-300"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    className="h-full w-full object-contain"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Information */}
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
            {/* Category */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-indigo-100 px-4 py-1.5 text-xs font-bold capitalize text-indigo-700">
                {product.category}
              </span>

              {product.availabilityStatus && (
                <span className="rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-bold text-emerald-700">
                  {product.availabilityStatus}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="mt-5 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2">
                <span className="text-lg">⭐</span>

                <span className="font-bold text-amber-700">
                  {product.rating.toFixed(1)}
                </span>
              </div>

              {product.reviews && product.reviews.length > 0 && (
                <span className="text-sm text-slate-500">
                  {product.reviews.length} reviews
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mt-7">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">
                Description
              </h2>

              <p className="mt-2 leading-7 text-slate-600">
                {product.description}
              </p>
            </div>

            {/* Price */}
            <div className="mt-7 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 p-5">
              <p className="text-sm font-medium text-slate-500">Price</p>

              <p className="mt-1 text-4xl font-extrabold text-indigo-700">
                ${product.price.toFixed(2)}
              </p>
            </div>

            {/* Product Details Grid */}
            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-400">Stock</p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {product.stock}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-400">Product ID</p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  #{product.id}
                </p>
              </div>

              {product.brand && (
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-400">Brand</p>
                  <p className="mt-1 truncate text-lg font-bold text-slate-900">
                    {product.brand}
                  </p>
                </div>
              )}
            </div>

            {/* Extra Information */}
            <div className="mt-7 border-t border-slate-100 pt-6">
              <h2 className="text-lg font-bold text-slate-900">
                Additional Information
              </h2>

              <div className="mt-4 space-y-3 text-sm">
                {product.sku && (
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400">SKU</span>
                    <span className="font-semibold text-slate-700">
                      {product.sku}
                    </span>
                  </div>
                )}

                {product.weight !== undefined && (
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400">Weight</span>
                    <span className="font-semibold text-slate-700">
                      {product.weight}
                    </span>
                  </div>
                )}

                {product.warrantyInformation && (
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400">Warranty</span>
                    <span className="text-right font-semibold text-slate-700">
                      {product.warrantyInformation}
                    </span>
                  </div>
                )}

                {product.shippingInformation && (
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400">Shipping</span>
                    <span className="text-right font-semibold text-slate-700">
                      {product.shippingInformation}
                    </span>
                  </div>
                )}

                {product.returnPolicy && (
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400">Return Policy</span>
                    <span className="text-right font-semibold text-slate-700">
                      {product.returnPolicy}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        {product.reviews && product.reviews.length > 0 && (
          <section className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 sm:p-8">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-indigo-600">
                  Customer Feedback
                </p>

                <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
                  Product Reviews
                </h2>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2">
                <span>⭐</span>
                <span className="font-bold text-amber-700">
                  {product.rating.toFixed(1)} / 5
                </span>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {product.reviews.map((review, index) => (
                <div
                  key={`${review.reviewerName}-${index}`}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold text-slate-900">
                        {review.reviewerName}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {new Date(review.date).toLocaleDateString()}
                      </p>
                    </div>

                    <span className="rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
                      ⭐ {review.rating}
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}