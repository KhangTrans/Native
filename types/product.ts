export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  stock: number;
  categoryId: number;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  canonicalUrl: string | null;
  isActive: boolean;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    username: string;
    fullName: string;
  };
  category: {
    id: number;
    name: string;
    slug: string;
    description: string;
    imageUrl: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  images: any[];
  variants: any[];
}

export interface ProductsResponse {
  success: boolean;
  count: number;
  total: number;
  totalPages: number;
  currentPage: number;
  data: Product[];
}
