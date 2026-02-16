import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addToast } from "@heroui/toast";

import apiClient from "@/lib/axios";
import { Post } from "@/types/blog";

// Query Keys
export const postKeys = {
  all: ["posts"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  list: (filters: string) => [...postKeys.lists(), { filters }] as const,
  details: () => [...postKeys.all, "detail"] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
};

// API Functions
const fetchPosts = async (): Promise<Post[]> => {
  const response = await apiClient.get<Post[]>("/api/admin/posts");

  return response.data;
};

const fetchPublicPosts = async (): Promise<Post[]> => {
  const response = await apiClient.get<Post[]>("/api/blog");

  return response.data;
};

const fetchPublicPost = async (slug: string): Promise<Post> => {
  const response = await apiClient.get<Post>(`/api/blog/${slug}`);

  return response.data;
};

// Workaround for missing "Get Post by ID" endpoint in backend
// We fetch all posts and find the one we need.
// Ideally, backend should support GET /api/admin/posts/:id
const fetchPost = async (id: string): Promise<Post> => {
  // Try to get specific post if endpoint existed
  // const response = await apiClient.get<Post>(`/api/admin/posts/${id}`);
  // return response.data;

  // Fallback: Fetch all and find
  const posts = await fetchPosts();
  const post = posts.find((p) => p.id === id);

  if (!post) throw new Error("Post not found");

  return post;
};

const createPost = async (data: Partial<Post>): Promise<Post> => {
  const response = await apiClient.post<Post>("/api/admin/posts", data);

  return response.data;
};

const updatePost = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<Post>;
}): Promise<Post> => {
  const response = await apiClient.put<Post>(`/api/admin/posts/${id}`, data);

  return response.data;
};

const deletePost = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/admin/posts/${id}`);
};

// Hooks
export const usePosts = () => {
  return useQuery({
    queryKey: postKeys.lists(),
    queryFn: fetchPosts,
  });
};

export const usePublicPosts = () => {
  return useQuery({
    queryKey: ["public-posts"],
    queryFn: fetchPublicPosts,
  });
};

export const usePublicPost = (slug: string) => {
  return useQuery({
    queryKey: ["public-posts", slug],
    queryFn: () => fetchPublicPost(slug),
    enabled: !!slug,
  });
};

export const usePost = (id: string) => {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => fetchPost(id),
    enabled: !!id,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
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
    mutationFn: updatePost,
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
    mutationFn: deletePost,
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
