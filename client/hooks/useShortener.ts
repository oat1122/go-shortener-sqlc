import { useMutation } from "@tanstack/react-query";

import apiClient from "@/lib/axios";

export interface ShortenResponse {
  short_code: string;
}

const shortenUrl = async (url: string): Promise<ShortenResponse> => {
  const response = await apiClient.post<ShortenResponse>("/shorten", { url });

  return response.data;
};

export const useShortenUrl = () => {
  return useMutation({
    mutationFn: shortenUrl,
  });
};
