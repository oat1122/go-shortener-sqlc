import apiClient from "@/lib/axios";
import { ImageItem } from "@/types/blog";

export interface UpdateImageData {
  alt_text: string;
  title: string;
}

export const imageService = {
  getAll: async (): Promise<ImageItem[]> => {
    const res = await apiClient.get<ImageItem[]>("/api/images");

    return res.data;
  },

  getById: async (id: string): Promise<ImageItem> => {
    const res = await apiClient.get<ImageItem>(`/api/images/${id}`);

    return res.data;
  },

  upload: async (
    file: File,
    altText: string,
    title: string,
  ): Promise<ImageItem> => {
    const formData = new FormData();

    formData.append("image", file);
    formData.append("alt_text", altText);
    formData.append("title", title);

    const res = await apiClient.post<ImageItem>("/api/admin/images", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  },

  updateMeta: async (id: string, data: UpdateImageData): Promise<void> => {
    await apiClient.put(`/api/admin/images/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/admin/images/${id}`);
  },
};
