import apiClient from "@/lib/axios";
import { Post, PostStatus } from "@/types/blog";

export interface UpdatePostData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  meta_description?: string;
  keywords?: string;
  featured_image: string;
  status: PostStatus;
  category_id: string;
  tags?: string[];
}

export interface CreatePostDTO {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string;
  status: PostStatus;
  category_id: string;
}

export const postService = {
  // Get all posts (for admin list)
  getPosts: async (): Promise<Post[]> => {
    const res = await apiClient.get<Post[]>("/api/admin/posts");

    return res.data;
  },

  // Get single post by ID (Optimized)
  getPost: async (id: string): Promise<Post> => {
    const res = await apiClient.get<Post>(`/api/admin/posts/${id}`);

    return res.data;
  },

  // Get public published posts
  getPublishedPosts: async (): Promise<Post[]> => {
    const res = await apiClient.get<Post[]>("/api/blog");

    return res.data;
  },

  // Get public post by slug
  getPostBySlug: async (slug: string): Promise<Post> => {
    const res = await apiClient.get<Post>(`/api/blog/${slug}`);

    return res.data;
  },

  // Create post
  createPost: async (data: CreatePostDTO): Promise<void> => {
    await apiClient.post("/api/admin/posts", data);
  },

  // Update post
  updatePost: async (id: string, data: UpdatePostData): Promise<Post> => {
    const res = await apiClient.put<Post>(`/api/admin/posts/${id}`, data);

    return res.data;
  },

  // Delete post
  deletePost: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/admin/posts/${id}`);
  },
};
