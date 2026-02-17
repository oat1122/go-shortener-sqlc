import apiClient from "@/lib/axios";
import { Tag } from "@/types/blog";

export const tagService = {
  getAll: async (): Promise<Tag[]> => {
    const response = await apiClient.get<Tag[]>("/api/tags");

    return response.data;
  },
  create: async (data: { name: string; slug: string }): Promise<Tag> => {
    const response = await apiClient.post<Tag>("/api/tags", data);

    return response.data;
  },
  update: async ({
    id,
    data,
  }: {
    id: string;
    data: { name: string; slug: string };
  }): Promise<Tag> => {
    const response = await apiClient.put<Tag>(`/api/tags/${id}`, data);

    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/tags/${id}`);
  },
};
