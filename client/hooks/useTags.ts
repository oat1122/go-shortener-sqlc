import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/lib/axios";
import { Tag } from "@/types/blog";

// Query Keys
export const tagKeys = {
  all: ["tags"] as const,
  lists: () => [...tagKeys.all, "list"] as const,
  list: (filters: string) => [...tagKeys.lists(), { filters }] as const,
  details: () => [...tagKeys.all, "detail"] as const,
  detail: (id: string) => [...tagKeys.details(), id] as const,
};

// API Functions
const fetchTags = async (): Promise<Tag[]> => {
  const response = await apiClient.get<Tag[]>("/api/tags");

  return response.data;
};

const createTag = async (data: {
  name: string;
  slug: string;
}): Promise<Tag> => {
  const response = await apiClient.post<Tag>("/api/tags", data);

  return response.data;
};

const updateTag = async ({
  id,
  data,
}: {
  id: string;
  data: { name: string; slug: string };
}): Promise<Tag> => {
  const response = await apiClient.put<Tag>(`/api/tags/${id}`, data);

  return response.data;
};

const deleteTag = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/tags/${id}`);
};

// Hooks
export const useTags = () => {
  return useQuery({
    queryKey: tagKeys.lists(),
    queryFn: fetchTags,
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
    },
  });
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
    },
  });
};
