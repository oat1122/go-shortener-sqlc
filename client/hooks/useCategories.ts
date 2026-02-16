import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/lib/axios";
import { Category } from "@/types/blog";

// Query Keys
export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (filters: string) => [...categoryKeys.lists(), { filters }] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

// API Functions
const fetchCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get<Category[]>("/api/categories");

  return response.data;
};

const createCategory = async (data: {
  name: string;
  slug: string;
}): Promise<Category> => {
  const response = await apiClient.post<Category>("/api/categories", data);

  return response.data;
};

const updateCategory = async ({
  id,
  data,
}: {
  id: string;
  data: { name: string; slug: string };
}): Promise<Category> => {
  const response = await apiClient.put<Category>(`/api/categories/${id}`, data);

  return response.data;
};

const deleteCategory = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/categories/${id}`);
};

// Hooks
export const useCategories = () => {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: fetchCategories,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
};
