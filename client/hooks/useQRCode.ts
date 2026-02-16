import { useQuery } from "@tanstack/react-query";

import apiClient from "@/lib/axios";

export interface QROptions {
  logoSize?: number;
  borderRadius?: number;
  fgColor?: string;
  bgColor?: string;
  gradientStart?: string;
  gradientEnd?: string;
}

const generateQR = async (
  code: string,
  logo?: File | null,
  options?: QROptions,
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

  const response = await apiClient.post(`/${code}/qr`, formData, {
    responseType: "blob",
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const useGenerateQR = (
  code: string | null,
  logo: File | null,
  options: QROptions,
) => {
  return useQuery({
    queryKey: ["qr", code, logo, options],
    queryFn: () => generateQR(code!, logo, options),
    enabled: !!code, // Only run if code is present
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
