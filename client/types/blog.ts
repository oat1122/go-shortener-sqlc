export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export type PostStatus = "draft" | "published" | "archived";

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  meta_description?: string;
  keywords?: string;
  featured_image?: string;
  status: PostStatus;
  views: number;
  category_id: string;
  category_name?: string; // From Join
  category_slug?: string; // From Join
  published_at?: string;
  created_at: string;
  updated_at: string;
}

// Image System

export interface ImageURLs {
  original: string;
  medium: string;
  thumb: string;
}

export interface ImageItem {
  id: string;
  filename: string;
  original_name: string;
  alt_text: string;
  title: string;
  mime_type: string;
  size_bytes: number;
  width: number;
  height: number;
  urls: ImageURLs;
  created_at: string;
  updated_at: string;
}
