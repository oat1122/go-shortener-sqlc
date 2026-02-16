import { useMutation } from "@tanstack/react-query";
import { addToast } from "@heroui/toast";

import { shortenerService } from "@/services/shortenerService";

export const useShortenUrl = () => {
  return useMutation({
    mutationFn: shortenerService.shorten,
    onError: () => {
      addToast({
        title: "Error",
        description: "Failed to shorten URL",
        color: "danger",
      });
    },
  });
};

export const useGenerateQR = () => {
  return useMutation({
    mutationFn: ({
      code,
      logo,
      options,
    }: {
      code: string;
      logo?: File;
      options?: any;
    }) => shortenerService.generateQR(code, logo, options),
  });
};
