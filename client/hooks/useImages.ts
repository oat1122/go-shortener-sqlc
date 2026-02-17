import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addToast } from "@heroui/toast";

import { imageService, UpdateImageData } from "@/services/imageService";

// Query Keys
export const imageKeys = {
  all: ["images"] as const,
  lists: () => [...imageKeys.all, "list"] as const,
  details: () => [...imageKeys.all, "detail"] as const,
  detail: (id: string) => [...imageKeys.details(), id] as const,
};

// Hooks

export const useImages = () => {
  return useQuery({
    queryKey: imageKeys.lists(),
    queryFn: imageService.getAll,
  });
};

export const useImage = (id: string) => {
  return useQuery({
    queryKey: imageKeys.detail(id),
    queryFn: () => imageService.getById(id),
    enabled: !!id,
  });
};

export const useUploadImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      altText,
      title,
    }: {
      file: File;
      altText: string;
      title: string;
    }) => imageService.upload(file, altText, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: imageKeys.lists() });
      addToast({
        title: "Success",
        description: "Image uploaded successfully",
        color: "success",
      });
    },
    onError: () => {
      addToast({
        title: "Error",
        description: "Failed to upload image",
        color: "danger",
      });
    },
  });
};

export const useUpdateImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateImageData }) =>
      imageService.updateMeta(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: imageKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: imageKeys.detail(variables.id),
      });
      addToast({
        title: "Success",
        description: "Image updated successfully",
        color: "success",
      });
    },
    onError: () => {
      addToast({
        title: "Error",
        description: "Failed to update image",
        color: "danger",
      });
    },
  });
};

export const useDeleteImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => imageService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: imageKeys.lists() });
      addToast({
        title: "Success",
        description: "Image deleted successfully",
        color: "success",
      });
    },
    onError: () => {
      addToast({
        title: "Error",
        description: "Failed to delete image",
        color: "danger",
      });
    },
  });
};
