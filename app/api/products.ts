import api from "./axios";

export const getProducts = async (limit: number, skip: number) => {
  const response = await api.get("/products", {
    params: {
      limit,
      skip,
    },
  });

  return response.data;
};

export const searchProducts = async (
  query: string,
  limit: number,
  skip: number
) => {
  const response = await api.get("/products/search", {
    params: {
      q: query,
      limit,
      skip,
    },
  });

  return response.data;
};

export const getProductById = async (id: number) => {
  const response = await api.get(`/products/${id}`);

  return response.data;
};

export const addProduct = async (product: {
  title: string;
  price: number;
  category: string;
  stock: number;
}) => {
  const response = await api.post("/products/add", product);

  return response.data;
};