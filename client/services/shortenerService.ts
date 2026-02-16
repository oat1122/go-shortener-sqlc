import apiClient from "@/lib/axios";

export interface ShortenResponse {
  short_code: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const shortenerService = {
  shorten: async (url: string): Promise<ShortenResponse> => {
    const res = await apiClient.post<ShortenResponse>("/shorten", { url });
    return res.data;
  },

  generateQR: async (
    code: string,
    logo?: File,
    options?: {
      logoSize?: number;
      borderRadius?: number;
      fgColor?: string;
      bgColor?: string;
      gradientStart?: string;
      gradientEnd?: string;
    },
  ): Promise<Blob> => {
    const formData = new FormData();

    if (logo) {
      formData.append("logo", logo);
    }

    if (options?.logoSize) {
      formData.append("logo_size", options.logoSize.toString());
    }

    if (options?.borderRadius !== undefined) {
      formData.append("border_radius", options.borderRadius.toString());
    }

    if (options?.fgColor) {
      formData.append("fg_color", options.fgColor);
    }

    if (options?.bgColor) {
      formData.append("bg_color", options.bgColor);
    }

    if (options?.gradientStart) {
      formData.append("gradient_start", options.gradientStart);
    }

    if (options?.gradientEnd) {
      formData.append("gradient_end", options.gradientEnd);
    }

    const res = await apiClient.post(`${API_URL}/${code}/qr`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      responseType: "blob",
    });

    return res.data;
  },
};
