// Define types for Request and Response
export interface ShortenRequest {
  url: string;
}

export interface ShortenResponse {
  short_code: string;
}

export interface ApiError {
  error: string;
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = {
  shorten: async (url: string): Promise<ShortenResponse> => {
    const res = await fetch(`${API_URL}/shorten`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    if (!res.ok) {
      // Try to parse error message from server
      let errorMessage = "Failed to shorten URL";

      try {
        const errorData = await res.text();

        // If server returns plain text error (http.Error does this with \n)
        errorMessage = errorData.trim() || errorMessage;
      } catch {
        // ignore json parse error
      }
      throw new Error(errorMessage);
    }

    return res.json();
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

    const res = await fetch(`${API_URL}/${code}/qr`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Failed to generate QR code");
    }

    return res.blob();
  },
};
