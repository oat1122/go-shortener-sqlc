import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addToast } from "@heroui/toast";

import { postService, UpdatePostData } from "@/services/postService";

// Query Keys
export const postKeys = {
  all: ["posts"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  list: (filters: string) => [...postKeys.lists(), { filters }] as const,
  details: () => [...postKeys.all, "detail"] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
};

// Hooks
export const usePosts = () => {
  return useQuery({
    queryKey: postKeys.lists(),
    queryFn: postService.getPosts,
  });
};

export const usePublicPosts = () => {
  return useQuery({
    queryKey: ["public-posts"],
    queryFn: postService.getPublishedPosts,
  });
};

export const usePublicPost = (slug: string) => {
  return useQuery({
    queryKey: ["public-posts", slug],
    queryFn: () => postService.getPostBySlug(slug),
    enabled: !!slug,
  });
};

export const usePost = (id: string) => {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => postService.getPost(id),
    enabled: !!id,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: import("@/services/postService").CreatePostDTO) =>
      postService.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      addToast({
        title: "Success",
        description: "Post created successfully",
        color: "success",
      });
    },
    onError: () => {
      addToast({
        title: "Error",
        description: "Failed to create post",
        color: "danger",
      });
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePostData }) =>
      postService.updatePost(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      queryClient.invalidateQueries({ queryKey: postKeys.detail(data.id) });
      addToast({
        title: "Success",
        description: "Post updated successfully",
        color: "success",
      });
    },
    onError: () => {
      addToast({
        title: "Error",
        description: "Failed to update post",
        color: "danger",
      });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postService.deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      addToast({
        title: "Success",
        description: "Post deleted successfully",
        color: "success",
      });
    },
    onError: () => {
      addToast({
        title: "Error",
        description: "Failed to delete post",
        color: "danger",
      });
    },
  });
};
