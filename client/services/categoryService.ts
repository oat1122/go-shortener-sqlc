import apiClient from "@/lib/axios";
import { Category } from "@/types/blog";

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>("/api/categories");

    return response.data;
  },
  create: async (data: { name: string; slug: string }): Promise<Category> => {
    const response = await apiClient.post<Category>("/api/categories", data);

    return response.data;
  },
  update: async ({
    id,
    data,
  }: {
    id: string;
    data: { name: string; slug: string };
  }): Promise<Category> => {
    const response = await apiClient.put<Category>(
      `/api/categories/${id}`,
      data,
    );

    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/categories/${id}`);
  },
};
