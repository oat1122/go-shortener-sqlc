import { useQuery } from "@tanstack/react-query";

import { shortenerService, QROptions } from "@/services/shortenerService";

export const useGenerateQR = (
  code: string | null,
  logo: File | null,
  options: QROptions,
) => {
  return useQuery({
    queryKey: ["qr", code, logo, options],
    queryFn: () =>
      shortenerService.generateQR(code!, logo || undefined, options),
    enabled: !!code, // Only run if code is present
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
