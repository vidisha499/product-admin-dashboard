"use client";

import {
    useEffect,
    useState,
    useRef,
    type ChangeEvent,
    type FormEvent,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    getProducts,
    searchProducts,
    updateProduct,
    deleteProduct,
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

// =================================================
// LOCAL STORAGE HELPERS
// =================================================

const ADDED_PRODUCTS_KEY = "addedProducts";
const UPDATED_PRODUCTS_KEY = "updatedProducts";
const DELETED_PRODUCTS_KEY = "deletedProductIds";

const getLocalProducts = (): Product[] => {
    try {
        const data = JSON.parse(
            localStorage.getItem(ADDED_PRODUCTS_KEY) || "[]"
        );

        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
};

const getUpdatedProducts = (): Product[] => {
    try {
        const data = JSON.parse(
            localStorage.getItem(UPDATED_PRODUCTS_KEY) || "[]"
        );

        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
};

const getDeletedProductIds = (): number[] => {
    try {
        const data = JSON.parse(
            localStorage.getItem(DELETED_PRODUCTS_KEY) || "[]"
        );

        return Array.isArray(data)
            ? data.filter(
                  (id): id is number =>
                      typeof id === "number"
              )
            : [];
    } catch {
        return [];
    }
};

const saveAddedProducts = (products: Product[]) => {
    localStorage.setItem(
        ADDED_PRODUCTS_KEY,
        JSON.stringify(products)
    );
};

const saveUpdatedProducts = (products: Product[]) => {
    localStorage.setItem(
        UPDATED_PRODUCTS_KEY,
        JSON.stringify(products)
    );
};

const saveDeletedProductIds = (ids: number[]) => {
    localStorage.setItem(
        DELETED_PRODUCTS_KEY,
        JSON.stringify(ids)
    );
};

// =================================================
// URL HELPERS
// =================================================

const getInitialPage = (value: string | null) => {
    const parsedPage = Number(value);

    if (
        value &&
        Number.isInteger(parsedPage) &&
        parsedPage >= 1
    ) {
        return parsedPage;
    }

    return 1;
};

const getInitialLimit = (value: string | null) => {
    const parsedLimit = Number(value);

    if (
        parsedLimit === 10 ||
        parsedLimit === 20 ||
        parsedLimit === 50
    ) {
        return parsedLimit;
    }

    return 10;
};

const getInitialSort = (value: string | null) => {
    if (!value) {
        return {
            sortBy: "default",
            sortOrder: "asc",
        };
    }

    const [field, order] = value.split("-");

    const validFields = [
        "price",
        "rating",
        "title",
    ];

    const validOrders = ["asc", "desc"];

    if (
        validFields.includes(field) &&
        validOrders.includes(order)
    ) {
        return {
            sortBy: field,
            sortOrder: order,
        };
    }

    return {
        sortBy: "default",
        sortOrder: "asc",
    };
};

export default function Dashboard() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // =================================================
    // INITIAL VALUES FROM URL
    // =================================================

    const initialSearch =
        searchParams.get("search") || "";

    const initialCategory =
        searchParams.get("category") || "";

    const initialSort = getInitialSort(
        searchParams.get("sort")
    );

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<string[]>([]);

    const [loading, setLoading] = useState(true);
    const [categoryLoading, setCategoryLoading] = useState(true);

    const [error, setError] = useState("");
    const [categoryError, setCategoryError] = useState("");

    // =================================================
    // SEARCH
    // =================================================

    const [searchInput, setSearchInput] =
        useState(initialSearch);

    const [search, setSearch] =
        useState(initialSearch);

    const [selectedCategory, setSelectedCategory] =
        useState(initialCategory);

    // =================================================
    // PAGINATION
    // =================================================

    const [page, setPage] = useState(
        getInitialPage(searchParams.get("page"))
    );

    const [limit, setLimit] = useState(
        getInitialLimit(searchParams.get("limit"))
    );

    const [totalProducts, setTotalProducts] =
        useState(0);

    // =================================================
    // SORTING
    // =================================================

    const [sortBy, setSortBy] = useState(
        initialSort.sortBy
    );

    const [sortOrder, setSortOrder] = useState(
        initialSort.sortOrder
    );

    const skip = (page - 1) * limit;

    // =================================================
    // EDIT PRODUCT
    // =================================================

    const [showEditModal, setShowEditModal] =
        useState(false);

    const [editingProduct, setEditingProduct] =
        useState<Product | null>(null);

    const [editTitle, setEditTitle] = useState("");
    const [editCategory, setEditCategory] =
        useState("");
    const [editPrice, setEditPrice] = useState("");
    const [editStock, setEditStock] = useState("");

    const [editLoading, setEditLoading] =
        useState(false);

    const [editError, setEditError] =
        useState("");

    const [editSuccess, setEditSuccess] =
        useState("");

    // =================================================
    // DELETE PRODUCT
    // =================================================

    // Stores the ID of the product currently being deleted.
    // This prevents another delete request from starting
    // while the current delete operation is running.
    const [deletingProductId, setDeletingProductId] =
        useState<number | null>(null);

    // useRef gives us an immediate synchronous guard.
    // This protects against very fast repeated clicks
    // before React finishes updating state.
    const deleteInProgressRef =
        useRef<number | null>(null);

    // =================================================
    // AUTHENTICATION + LOAD CATEGORIES
    // =================================================

    useEffect(() => {
        const token =
            localStorage.getItem("accessToken");

        if (!token) {
            router.push("/");
            return;
        }

        const fetchCategories = async () => {
            try {
                setCategoryLoading(true);
                setCategoryError("");

                const data = await getCategories();

                let categoryNames: string[] = [];

                if (Array.isArray(data)) {
                    categoryNames = data
                        .map((category) => {
                            if (
                                typeof category ===
                                "string"
                            ) {
                                return category;
                            }

                            return (
                                category.slug ||
                                category.name ||
                                ""
                            );
                        })
                        .filter(Boolean);
                }

                // =================================================
                // INCLUDE CATEGORIES FROM LOCAL PRODUCTS
                // =================================================

                const localProducts =
                    getLocalProducts();

                const updatedProducts =
                    getUpdatedProducts();

                const localCategories = [
                    ...localProducts,
                    ...updatedProducts,
                ]
                    .map(
                        (product) =>
                            product.category
                    )
                    .filter(Boolean);

                const mergedCategories = Array.from(
                    new Set([
                        ...categoryNames,
                        ...localCategories,
                    ])
                );

                setCategories(
                    mergedCategories
                );
            } catch (error) {
                console.error(error);
                setCategoryError(
                    "Unable to load categories."
                );
            } finally {
                setCategoryLoading(false);
            }
        };

        fetchCategories();
    }, [router]);

    // =================================================
    // SEARCH DEBOUNCE
    // =================================================

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput.trim());
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, [searchInput]);

    // =================================================
    // URL STATE
    // =================================================

    useEffect(() => {
        const params = new URLSearchParams();

        // Page
        if (page !== 1) {
            params.set("page", String(page));
        }

        // Page size
        if (limit !== 10) {
            params.set("limit", String(limit));
        }

        // Search
        if (search.trim() !== "") {
            params.set("search", search.trim());
        }

        // Category
        if (selectedCategory) {
            params.set(
                "category",
                selectedCategory
            );
        }

        // Sort
        if (sortBy !== "default") {
            params.set(
                "sort",
                `${sortBy}-${sortOrder}`
            );
        }

        const queryString = params.toString();

        const newUrl = queryString
            ? `/dashboard?${queryString}`
            : "/dashboard";

        const currentQuery =
            searchParams.toString();

        const currentUrl = currentQuery
            ? `/dashboard?${currentQuery}`
            : "/dashboard";

        if (currentUrl !== newUrl) {
            router.replace(newUrl, {
                scroll: false,
            });
        }
    }, [
        page,
        limit,
        search,
        selectedCategory,
        sortBy,
        sortOrder,
        router,
        searchParams,
    ]);

    // =================================================
    // SORT PRODUCTS
    // =================================================

    const sortProducts = (
        productList: Product[]
    ) => {
        if (sortBy === "default") {
            return productList;
        }

        return [...productList].sort((a, b) => {
            let comparison = 0;

            if (sortBy === "price") {
                comparison =
                    a.price - b.price;
            } else if (sortBy === "rating") {
                comparison =
                    a.rating - b.rating;
            } else if (sortBy === "title") {
                comparison =
                    a.title.localeCompare(
                        b.title
                    );
            }

            return sortOrder === "asc"
                ? comparison
                : -comparison;
        });
    };

    // =================================================
    // MERGE API + LOCAL PRODUCTS
    // =================================================

    const mergeProducts = (
        apiProducts: Product[]
    ): Product[] => {
        const addedProducts =
            getLocalProducts();

        const updatedProducts =
            getUpdatedProducts();

        const deletedProductIds =
            getDeletedProductIds();

        const deletedSet = new Set(
            deletedProductIds
        );

        const productMap = new Map<
            number,
            Product
        >();

        // =================================================
        // ADD API PRODUCTS
        // =================================================

        apiProducts.forEach((product) => {
            if (!deletedSet.has(product.id)) {
                productMap.set(
                    product.id,
                    product
                );
            }
        });

        // =================================================
        // APPLY SAVED EDITS
        // =================================================

        updatedProducts.forEach(
            (updatedProduct) => {
                if (
                    !deletedSet.has(
                        updatedProduct.id
                    )
                ) {
                    productMap.set(
                        updatedProduct.id,
                        updatedProduct
                    );
                }
            }
        );

        // =================================================
        // ADD LOCALLY CREATED PRODUCTS
        // =================================================

        addedProducts.forEach(
            (localProduct) => {
                if (
                    !deletedSet.has(
                        localProduct.id
                    )
                ) {
                    productMap.set(
                        localProduct.id,
                        localProduct
                    );
                }
            }
        );

        return Array.from(
            productMap.values()
        );
    };

    // =================================================
    // LOAD PRODUCTS
    // =================================================

    useEffect(() => {
        const token =
            localStorage.getItem("accessToken");

        if (!token) {
            router.push("/");
            return;
        }

        let cancelled = false;

        const loadProducts = async () => {
            try {
                setLoading(true);
                setError("");

                let apiProductList: Product[] = [];

                // =================================================
                // CATEGORY + SEARCH
                // =================================================

                if (
                    selectedCategory &&
                    search.trim() !== ""
                ) {
                    const data =
                        await searchProducts(
                            search.trim(),
                            0,
                            0
                        );

                    if (cancelled) {
                        return;
                    }

                    apiProductList =
                        data.products || [];
                }

                // =================================================
                // ONLY CATEGORY
                // =================================================

                else if (selectedCategory) {
                    const allProducts =
                        await getProducts(0, 0);

                    if (cancelled) {
                        return;
                    }

                    apiProductList =
                        allProducts.products || [];
                }

                // =================================================
                // ONLY SEARCH
                // =================================================

                else if (
                    search.trim() !== ""
                ) {
                    const data =
                        await searchProducts(
                            search.trim(),
                            0,
                            0
                        );

                    if (cancelled) {
                        return;
                    }

                    apiProductList =
                        data.products || [];
                }

                // =================================================
                // NO SEARCH + NO CATEGORY
                // =================================================

                else {
                    const data =
                        await getProducts(
                            0,
                            0
                        );

                    if (cancelled) {
                        return;
                    }

                    apiProductList =
                        data.products || [];
                }

                // =================================================
                // MERGE API + LOCAL PRODUCTS
                // =================================================

                let allProducts =
                    mergeProducts(
                        apiProductList
                    );

                // =================================================
                // LOCAL SEARCH
                // =================================================

                if (search.trim() !== "") {
                    const searchValue =
                        search
                            .trim()
                            .toLowerCase();

                    allProducts =
                        allProducts.filter(
                            (product) =>
                                product.title
                                    .toLowerCase()
                                    .includes(
                                        searchValue
                                    ) ||
                                product.category
                                    .toLowerCase()
                                    .includes(
                                        searchValue
                                    )
                        );
                }

                // =================================================
                // LOCAL CATEGORY FILTER
                // =================================================

                if (selectedCategory) {
                    allProducts =
                        allProducts.filter(
                            (product) =>
                                product.category
                                    .toLowerCase() ===
                                selectedCategory.toLowerCase()
                        );
                }

                if (cancelled) {
                    return;
                }

                // =================================================
                // SORT
                // =================================================

                const sortedProducts =
                    sortProducts(
                        allProducts
                    );

                // =================================================
                // TOTAL
                // =================================================

                setTotalProducts(
                    sortedProducts.length
                );

                // =================================================
                // INVALID PAGE HANDLING
                // =================================================

                const totalPages =
                    Math.max(
                        1,
                        Math.ceil(
                            sortedProducts.length /
                                limit
                        )
                    );

                if (
                    page > totalPages &&
                    sortedProducts.length > 0
                ) {
                    setPage(totalPages);
                    return;
                }

                // =================================================
                // PAGINATION
                // =================================================

                setProducts(
                    sortedProducts.slice(
                        skip,
                        skip + limit
                    )
                );
            } catch (error) {
                if (cancelled) {
                    return;
                }

                console.error(error);

                setError(
                    "Unable to load products."
                );

                setProducts([]);
                setTotalProducts(0);
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
        router,
        search,
        selectedCategory,
        page,
        limit,
        skip,
        sortBy,
        sortOrder,
    ]);

    // =================================================
    // LOGOUT
    // =================================================

    const handleLogout = () => {
        localStorage.removeItem(
            "accessToken"
        );

        router.push("/");
    };

    // =================================================
    // PAGE SIZE
    // =================================================

    const handleLimitChange = (
        event: ChangeEvent<HTMLSelectElement>
    ) => {
        setLimit(
            Number(event.target.value)
        );

        setPage(1);
    };

    // =================================================
    // SORT CHANGE
    // =================================================

    const handleSortChange = (
        event: ChangeEvent<HTMLSelectElement>
    ) => {
        const value =
            event.target.value;

        if (value === "default") {
            setSortBy("default");
            setSortOrder("asc");
        } else {
            const [field, order] =
                value.split("-");

            setSortBy(field);
            setSortOrder(order);
        }

        setPage(1);
    };

    // =================================================
    // OPEN EDIT MODAL
    // =================================================

    const handleEditClick = (
        product: Product
    ) => {
        setEditingProduct(product);

        setEditTitle(product.title);
        setEditCategory(product.category);
        setEditPrice(
            String(product.price)
        );
        setEditStock(
            String(product.stock)
        );

        setEditError("");
        setEditSuccess("");

        setShowEditModal(true);
    };

    // =================================================
    // CLOSE EDIT MODAL
    // =================================================

    const closeEditModal = () => {
        if (editLoading) {
            return;
        }

        setShowEditModal(false);
        setEditingProduct(null);

        setEditTitle("");
        setEditCategory("");
        setEditPrice("");
        setEditStock("");

        setEditError("");
    };

    // =================================================
    // UPDATE PRODUCT
    // =================================================

    const handleUpdateProduct = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (editLoading) {
            return;
        }

        setEditError("");
        setEditSuccess("");

        if (!editingProduct) {
            setEditError(
                "No product selected."
            );

            return;
        }

        const title =
            editTitle.trim();

        const category =
            editCategory.trim();

        const price =
            Number(editPrice);

        const stock =
            Number(editStock);

        // =================================================
        // VALIDATION
        // =================================================

        if (!title) {
            setEditError(
                "Product title is required."
            );

            return;
        }

        if (!category) {
            setEditError(
                "Product category is required."
            );

            return;
        }

        if (
            editPrice.trim() === "" ||
            Number.isNaN(price) ||
            price <= 0
        ) {
            setEditError(
                "Price must be greater than 0."
            );

            return;
        }

        if (
            editStock.trim() === "" ||
            Number.isNaN(stock) ||
            stock < 0 ||
            !Number.isInteger(stock)
        ) {
            setEditError(
                "Stock must be a whole number greater than or equal to 0."
            );

            return;
        }

        try {
            setEditLoading(true);

            // =================================================
            // UPDATE API PRODUCT
            // =================================================

            const updatedData =
                await updateProduct(
                    editingProduct.id,
                    {
                        title,
                        price,
                        category,
                        stock,
                    }
                );

            const updatedProduct: Product = {
                ...editingProduct,

                id:
                    updatedData.id ??
                    editingProduct.id,

                title:
                    updatedData.title ??
                    title,

                category:
                    updatedData.category ??
                    category,

                price: Number(
                    updatedData.price ??
                        price
                ),

                stock: Number(
                    updatedData.stock ??
                        stock
                ),

                rating: Number(
                    updatedData.rating ??
                        editingProduct.rating
                ),

                thumbnail:
                    updatedData.thumbnail ??
                    editingProduct.thumbnail,
            };

            // =================================================
            // CHECK IF PRODUCT WAS CREATED LOCALLY
            // =================================================

            const addedProducts =
                getLocalProducts();

            const isLocalProduct =
                addedProducts.some(
                    (product) =>
                        product.id ===
                        editingProduct.id
                );

            if (isLocalProduct) {
                // =================================================
                // UPDATE LOCALLY CREATED PRODUCT
                // =================================================

                const updatedLocalProducts =
                    addedProducts.map(
                        (product) =>
                            product.id ===
                            editingProduct.id
                                ? updatedProduct
                                : product
                    );

                saveAddedProducts(
                    updatedLocalProducts
                );
            } else {
                // =================================================
                // SAVE API PRODUCT EDIT LOCALLY
                // =================================================

                const updatedProducts =
                    getUpdatedProducts();

                const updatedProductExists =
                    updatedProducts.some(
                        (product) =>
                            product.id ===
                            updatedProduct.id
                    );

                let newUpdatedProducts: Product[];

                if (
                    updatedProductExists
                ) {
                    newUpdatedProducts =
                        updatedProducts.map(
                            (product) =>
                                product.id ===
                                updatedProduct.id
                                    ? updatedProduct
                                    : product
                        );
                } else {
                    newUpdatedProducts = [
                        ...updatedProducts,
                        updatedProduct,
                    ];
                }

                saveUpdatedProducts(
                    newUpdatedProducts
                );
            }

            // =================================================
            // REMOVE DELETED MARKER IF PRESENT
            // =================================================

            const deletedProductIds =
                getDeletedProductIds();

            if (
                deletedProductIds.includes(
                    updatedProduct.id
                )
            ) {
                saveDeletedProductIds(
                    deletedProductIds.filter(
                        (id) =>
                            id !==
                            updatedProduct.id
                    )
                );
            }

            // =================================================
            // UPDATE CURRENT UI
            // =================================================

            setProducts(
                (currentProducts) =>
                    currentProducts.map(
                        (product) =>
                            product.id ===
                            updatedProduct.id
                                ? updatedProduct
                                : product
                    )
            );

            setEditSuccess(
                "Product updated successfully."
            );

            setTimeout(() => {
                setShowEditModal(false);
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

    // =================================================
    // DELETE PRODUCT
    // =================================================

    const handleDeleteProduct = async (
        product: Product
    ) => {
        // =================================================
        // PREVENT DUPLICATE DELETE REQUESTS
        // =================================================

        if (
            deleteInProgressRef.current !== null
        ) {
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete "${product.title}"?`
        );

        if (!confirmed) {
            return;
        }

        // Set the synchronous guard immediately.
        deleteInProgressRef.current =
            product.id;

        // Keep React state in sync.
        setDeletingProductId(product.id);

        try {
            const addedProducts =
                getLocalProducts();

            const isLocalProduct =
                addedProducts.some(
                    (item) =>
                        item.id === product.id
                );

            // =================================================
            // LOCAL PRODUCT
            // =================================================

            if (isLocalProduct) {
                const remainingProducts =
                    addedProducts.filter(
                        (item) =>
                            item.id !==
                            product.id
                    );

                saveAddedProducts(
                    remainingProducts
                );

                // If a locally created product somehow
                // has an edit override, remove it too.
                const updatedProducts =
                    getUpdatedProducts();

                saveUpdatedProducts(
                    updatedProducts.filter(
                        (item) =>
                            item.id !==
                            product.id
                    )
                );

                // Make sure any old deleted marker
                // for this local product is removed.
                const deletedIds =
                    getDeletedProductIds();

                saveDeletedProductIds(
                    deletedIds.filter(
                        (id) =>
                            id !==
                            product.id
                    )
                );
            }

            // =================================================
            // API PRODUCT
            // =================================================

            else {
                // DummyJSON accepts the DELETE request.
                // The API itself does not permanently
                // persist the deletion, so we also save
                // the ID locally below.
                await deleteProduct(
                    product.id
                );

                // =================================================
                // SAVE DELETED ID
                // =================================================

                const deletedIds =
                    getDeletedProductIds();

                if (
                    !deletedIds.includes(
                        product.id
                    )
                ) {
                    saveDeletedProductIds([
                        ...deletedIds,
                        product.id,
                    ]);
                }

                // =================================================
                // REMOVE LOCAL UPDATE OVERRIDE
                // =================================================

                const updatedProducts =
                    getUpdatedProducts();

                saveUpdatedProducts(
                    updatedProducts.filter(
                        (item) =>
                            item.id !==
                            product.id
                    )
                );
            }

            // =================================================
            // REMOVE FROM CURRENT UI
            // =================================================

            setProducts(
                (currentProducts) =>
                    currentProducts.filter(
                        (item) =>
                            item.id !==
                            product.id
                    )
            );

            setTotalProducts(
                (currentTotal) =>
                    Math.max(
                        0,
                        currentTotal - 1
                    )
            );
        } catch (error) {
            console.error(error);

            setError(
                "Unable to delete product. Please try again."
            );
        } finally {
            // Clear both guards after the request
            // finishes, whether it succeeded or failed.
            deleteInProgressRef.current =
                null;

            setDeletingProductId(null);
        }
    };

    // =================================================
    // STATS
    // =================================================

    const totalStock =
        products.reduce(
            (total, product) =>
                total + product.stock,
            0
        );

    const averageRating =
        products.length > 0
            ? (
                  products.reduce(
                      (
                          total,
                          product
                      ) =>
                          total +
                          product.rating,
                      0
                  ) /
                  products.length
              ).toFixed(1)
            : "0.0";

    // =================================================
    // CATEGORY STYLE
    // =================================================

    const getCategoryStyle = (
        category: string
    ) => {
        const value =
            category.toLowerCase();

        if (
            value.includes("beauty")
        ) {
            return "bg-pink-50 text-pink-600 border-pink-100";
        }

        if (
            value.includes(
                "fragrance"
            )
        ) {
            return "bg-purple-50 text-purple-600 border-purple-100";
        }

        if (
            value.includes(
                "furniture"
            )
        ) {
            return "bg-orange-50 text-orange-600 border-orange-100";
        }

        if (
            value.includes(
                "groceries"
            )
        ) {
            return "bg-emerald-50 text-emerald-600 border-emerald-100";
        }

        if (
            value.includes("laptop") ||
            value.includes("computer")
        ) {
            return "bg-blue-50 text-blue-600 border-blue-100";
        }

        return "bg-indigo-50 text-indigo-600 border-indigo-100";
    };

    // =================================================
    // STOCK STYLE
    // =================================================

    const getStockStyle = (
        stock: number
    ) => {
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
                            onClick={
                                handleLogout
                            }
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
                                <span>
                                    ✨
                                </span>

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
                                Manage your catalog, monitor inventory and
                                keep track of product performance from one
                                beautiful workspace.
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

                                    <circle
                                        cx="8"
                                        cy="8"
                                        r="1"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ================================================= */}
                {/* STATS */}
                {/* ================================================= */}

                <div className="mb-9 grid grid-cols-1 gap-5 md:grid-cols-3">

                    {/* PRODUCTS */}

                    <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-indigo-500">
                                    Total Products
                                </p>

                                <p className="mt-2 text-4xl font-black text-slate-900">
                                    {loading
                                        ? "—"
                                        : totalProducts}
                                </p>

                                <p className="mt-2 text-xs text-slate-400">
                                    Products available
                                </p>
                            </div>

                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl text-white shadow-lg shadow-indigo-200">
                                📦
                            </div>
                        </div>

                        <div className="absolute -bottom-10 -right-10 h-28 w-28 rounded-full bg-indigo-200/30" />
                    </div>

                    {/* INVENTORY */}

                    <div className="relative overflow-hidden rounded-2xl border border-cyan-100 bg-gradient-to-br from-white to-cyan-50 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-cyan-600">
                                    Total Inventory
                                </p>

                                <p className="mt-2 text-4xl font-black text-slate-900">
                                    {loading
                                        ? "—"
                                        : totalStock}
                                </p>

                                <p className="mt-2 text-xs text-slate-400">
                                    Units displayed
                                </p>
                            </div>

                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-2xl text-white shadow-lg shadow-cyan-200">
                                📊
                            </div>
                        </div>

                        <div className="absolute -bottom-10 -right-10 h-28 w-28 rounded-full bg-cyan-200/30" />
                    </div>

                    {/* RATING */}

                    <div className="relative overflow-hidden rounded-2xl border border-amber-100 bg-gradient-to-br from-white to-amber-50 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-amber-600">
                                    Average Rating
                                </p>

                                <p className="mt-2 text-4xl font-black text-slate-900">
                                    {loading
                                        ? "—"
                                        : averageRating}
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

                    <div className="flex flex-col gap-5">

                        {/* TITLE + ADD BUTTON */}

                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

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

                            {/* ADD PRODUCT BUTTON */}

                            <button
                                onClick={() =>
                                    router.push(
                                        "/products/new"
                                    )
                                }
                                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl"
                            >
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 5v14M5 12h14"
                                    />
                                </svg>

                                Add Product
                            </button>
                        </div>

                        {/* SEARCH + CATEGORY + SORT */}

                        <div className="flex w-full flex-col gap-3 xl:flex-row">

                            {/* SEARCH */}

                            <div className="relative w-full xl:flex-1">
                                <svg
                                    className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        cx="11"
                                        cy="11"
                                        r="7"
                                    />

                                    <path
                                        strokeLinecap="round"
                                        d="m20 20-4-4"
                                    />
                                </svg>

                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={
                                        searchInput
                                    }
                                    onChange={(
                                        event
                                    ) => {
                                        setSearchInput(
                                            event
                                                .target
                                                .value
                                        );

                                        setPage(1);
                                    }}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                                />
                            </div>

                            {/* CATEGORY */}

                            <div className="relative w-full sm:w-full xl:w-56">
                                <select
                                    value={
                                        selectedCategory
                                    }
                                    onChange={(
                                        event
                                    ) => {
                                        setSelectedCategory(
                                            event
                                                .target
                                                .value
                                        );

                                        setPage(1);
                                    }}
                                    disabled={
                                        categoryLoading
                                    }
                                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-10 text-sm font-medium text-slate-600 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <option value="">
                                        {categoryLoading
                                            ? "Loading categories..."
                                            : "All Categories"}
                                    </option>

                                    {categories.map(
                                        (
                                            category
                                        ) => (
                                            <option
                                                key={
                                                    category
                                                }
                                                value={
                                                    category
                                                }
                                            >
                                                {category
                                                    .replace(
                                                        /-/g,
                                                        " "
                                                    )
                                                    .replace(
                                                        /\b\w/g,
                                                        (
                                                            char
                                                        ) =>
                                                            char.toUpperCase()
                                                    )}
                                            </option>
                                        )
                                    )}
                                </select>

                                <svg
                                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m6 9 6 6 6-6"
                                    />
                                </svg>
                            </div>

                            {/* SORT */}

                            <div className="relative w-full sm:w-full xl:w-56">
                                <select
                                    value={
                                        sortBy ===
                                        "default"
                                            ? "default"
                                            : `${sortBy}-${sortOrder}`
                                    }
                                    onChange={
                                        handleSortChange
                                    }
                                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-10 text-sm font-medium text-slate-600 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                                >
                                    <option value="default">
                                        Sort: Default
                                    </option>

                                    <option value="price-asc">
                                        Price: Low to High
                                    </option>

                                    <option value="price-desc">
                                        Price: High to Low
                                    </option>

                                    <option value="rating-asc">
                                        Rating: Low to High
                                    </option>

                                    <option value="rating-desc">
                                        Rating: High to Low
                                    </option>

                                    <option value="title-asc">
                                        Title: A to Z
                                    </option>

                                    <option value="title-desc">
                                        Title: Z to A
                                    </option>
                                </select>

                                <svg
                                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m6 9 6 6 6-6"
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* CATEGORY ERROR */}

                        {categoryError && (
                            <p className="text-xs font-medium text-red-500">
                                {
                                    categoryError
                                }
                            </p>
                        )}
                    </div>
                </div>

                {/* ================================================= */}
                {/* LOADING */}
                {/* ================================================= */}

                {loading && (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                        {[
                            1,
                            2,
                            3,
                            4,
                            5,
                            6,
                            7,
                            8,
                        ].map((item) => (
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

                {!loading &&
                    !error && (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                            {products.map(
                                (product) => {
                                    const stock =
                                        getStockStyle(
                                            product.stock
                                        );

                                    return (
                                        <article
                                            key={
                                                product.id
                                            }
                                            className="group overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-100/50"
                                        >

                                            {/* IMAGE */}

                                            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">

                                                <img
                                                    src={
                                                        product.thumbnail
                                                    }
                                                    alt={
                                                        product.title
                                                    }
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
                                                        {
                                                            product.category
                                                        }
                                                    </span>
                                                </div>

                                                {/* RATING */}

                                                <div className="absolute right-3.5 top-3.5">
                                                    <div className="flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-md">

                                                        <span className="text-amber-400">
                                                            ★
                                                        </span>

                                                        {
                                                            product.rating
                                                        }
                                                    </div>
                                                </div>
                                            </div>

                                            {/* CARD BODY */}

                                            <div className="p-4">

                                                <div className="min-h-[52px]">
                                                    <h4 className="line-clamp-2 text-[15px] font-bold leading-5 text-slate-900 transition group-hover:text-indigo-600">
                                                        {
                                                            product.title
                                                        }
                                                    </h4>

                                                    <p className="mt-1 text-[11px] text-slate-400">
                                                        Product #
                                                        {
                                                            product.id
                                                        }
                                                    </p>
                                                </div>

                                                {/* PRICE */}

                                                <div className="mt-4 flex items-end justify-between">

                                                    <div>
                                                        <p className="text-[11px] font-medium text-slate-400">
                                                            Price
                                                        </p>

                                                        <p className="mt-1 text-xl font-black text-slate-950">
                                                            $
                                                            {product.price.toFixed(
                                                                2
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div
                                                        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-bold ${stock.bg} ${stock.text}`}
                                                    >
                                                        <span
                                                            className={`h-1.5 w-1.5 rounded-full ${stock.dot}`}
                                                        />

                                                        {
                                                            stock.label
                                                        }
                                                    </div>
                                                </div>

                                                <p className="mt-2 text-[11px] text-slate-400">
                                                    {
                                                        product.stock
                                                    }{" "}
                                                    units available
                                                </p>

                                                {/* DIVIDER */}

                                                <div className="my-4 h-px bg-slate-100" />

                                                {/* BUTTONS */}

                                                <div className="flex gap-2">

                                                    {/* VIEW */}

                                                    <button
                                                        onClick={() =>
                                                            router.push(
                                                                `/products/${product.id}`
                                                            )
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

                                                    {/* EDIT */}

                                                    <button
                                                        onClick={() =>
                                                            handleEditClick(
                                                                product
                                                            )
                                                        }
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

                                                    {/* DELETE */}

                                                    <button
                                                        onClick={() =>
                                                            handleDeleteProduct(
                                                                product
                                                            )
                                                        }
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
                                }
                            )}
                        </div>
                    )}

                {/* ================================================= */}
                {/* EMPTY */}
                {/* ================================================= */}

                {!loading &&
                    !error &&
                    products.length === 0 && (
                        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">

                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-4xl">
                                📦
                            </div>

                            <h3 className="mt-6 text-xl font-bold text-slate-900">
                                No products found
                            </h3>

                            <p className="mt-2 text-sm text-slate-500">
                                Try changing your search or category filter.
                            </p>
                        </div>
                    )}

                {/* ================================================= */}
                {/* PAGINATION */}
                {/* ================================================= */}

                {!loading &&
                    !error &&
                    products.length > 0 && (
                        <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">

                            {/* PAGE SIZE */}

                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-slate-500">
                                    Products per page
                                </span>

                                <select
                                    value={
                                        limit
                                    }
                                    onChange={
                                        handleLimitChange
                                    }
                                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                                >
                                    <option value={10}>
                                        10
                                    </option>

                                    <option value={20}>
                                        20
                                    </option>

                                    <option value={50}>
                                        50
                                    </option>
                                </select>
                            </div>

                            {/* PREVIOUS + NEXT */}

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() =>
                                        setPage(
                                            (
                                                current
                                            ) =>
                                                current -
                                                1
                                        )
                                    }
                                    disabled={
                                        page ===
                                        1
                                    }
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    ← Previous
                                </button>

                                <div className="flex h-9 min-w-9 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3 text-sm font-bold text-white shadow-md shadow-indigo-100">
                                    {page}
                                </div>

                                <button
                                    onClick={() =>
                                        setPage(
                                            (
                                                current
                                            ) =>
                                                current +
                                                1
                                        )
                                    }
                                    disabled={
                                        page *
                                            limit >=
                                        totalProducts
                                    }
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next →
                                </button>
                            </div>
                        </div>
                    )}

                {/* ================================================= */}
                {/* EDIT PRODUCT MODAL */}
                {/* ================================================= */}

                {showEditModal &&
                    editingProduct && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

                            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/60 bg-white shadow-2xl">

                                {/* MODAL HEADER */}

                                <div className="flex items-center justify-between border-b border-slate-100 p-6">

                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                                            Product Management
                                        </p>

                                        <h3 className="mt-1 text-2xl font-black text-slate-900">
                                            Edit Product
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Update the product information below.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={
                                            closeEditModal
                                        }
                                        disabled={
                                            editLoading
                                        }
                                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <svg
                                            className="h-5 w-5"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M6 6l12 12M18 6L6 18"
                                            />
                                        </svg>
                                    </button>
                                </div>

                                {/* FORM */}

                                <form
                                    onSubmit={
                                        handleUpdateProduct
                                    }
                                    className="space-y-5 p-6"
                                >

                                    {/* TITLE */}

                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-slate-700">
                                            Product Title
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                editTitle
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setEditTitle(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="Enter product title"
                                            disabled={
                                                editLoading
                                            }
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
                                        />
                                    </div>

                                    {/* CATEGORY */}

                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-slate-700">
                                            Category
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                editCategory
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setEditCategory(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="Enter category"
                                            disabled={
                                                editLoading
                                            }
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
                                        />
                                    </div>

                                    {/* PRICE + STOCK */}

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                        <div>
                                            <label className="mb-2 block text-sm font-bold text-slate-700">
                                                Price
                                            </label>

                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                                                    $
                                                </span>

                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={
                                                        editPrice
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        setEditPrice(
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    placeholder="0.00"
                                                    disabled={
                                                        editLoading
                                                    }
                                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-8 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-bold text-slate-700">
                                                Stock
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                step="1"
                                                value={
                                                    editStock
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setEditStock(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                placeholder="0"
                                                disabled={
                                                    editLoading
                                                }
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
                                            />
                                        </div>
                                    </div>

                                    {/* ERROR */}

                                    {editError && (
                                        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                                            {
                                                editError
                                            }
                                        </div>
                                    )}

                                    {/* SUCCESS */}

                                    {editSuccess && (
                                        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-600">
                                            ✓{" "}
                                            {
                                                editSuccess
                                            }
                                        </div>
                                    )}

                                    {/* BUTTONS */}

                                    <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">

                                        <button
                                            type="button"
                                            onClick={
                                                closeEditModal
                                            }
                                            disabled={
                                                editLoading
                                            }
                                            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={
                                                editLoading
                                            }
                                            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {editLoading ? (
                                                <>
                                                    <svg
                                                        className="h-4 w-4 animate-spin"
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

                                                    Saving...
                                                </>
                                            ) : (
                                                <>
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
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>

                                                    Save Changes
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
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