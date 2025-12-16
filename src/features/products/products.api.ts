import axios from "axios";

const BASE = "https://dummyjson.com";

export type Product = {
  id: number;
  title: string;
  price: number;
  category: string;
  description?: string;
  thumbnail?: string;
  images?: string[];
};

export type ProductsResponse = {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
};

export type CreateProductPayload = {
  title: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
};

export type UpdateProductPayload = {
  title: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
};

export async function fetchProducts(args: {
  q?: string;
  limit: number;
  skip: number;
}): Promise<ProductsResponse> {
  const q = (args.q ?? "").trim();

  const url = q ? `${BASE}/products/search` : `${BASE}/products`;

  const res = await axios.get(url, {
    params: { q: q || undefined, limit: args.limit, skip: args.skip },
  });

  return res.data as ProductsResponse;
}

export async function getProduct(id: number): Promise<Product> {
  const res = await axios.get(`${BASE}/products/${id}`);
  return res.data as Product;
}

// DummyJSON: POST /products/add
export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  const res = await axios.post(
    `${BASE}/products/add`,
    {
      title: payload.title,
      price: payload.price,
      description: payload.description,
      category: payload.category,
      // DummyJSON may ignore images, but we keep it for UI
      thumbnail: payload.imageUrl,
      images: [payload.imageUrl],
    },
    { headers: { "Content-Type": "application/json" } }
  );
  return res.data as Product;
}

// DummyJSON: PUT /products/:id
export async function updateProduct(args: {
  id: number;
  payload: UpdateProductPayload;
}): Promise<Product> {
  const res = await axios.put(
    `${BASE}/products/${args.id}`,
    {
      title: args.payload.title,
      price: args.payload.price,
      description: args.payload.description,
      category: args.payload.category,
      thumbnail: args.payload.imageUrl,
      images: [args.payload.imageUrl],
    },
    { headers: { "Content-Type": "application/json" } }
  );
  return res.data as Product;
}

// DummyJSON: DELETE /products/:id
export async function deleteProduct(id: number): Promise<{ id: number; isDeleted: boolean }> {
  const res = await axios.delete(`${BASE}/products/${id}`);
  return res.data as { id: number; isDeleted: boolean };
}
