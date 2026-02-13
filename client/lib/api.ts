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

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

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
      } catch (e) {
        // ignore json parse error
      }
      throw new Error(errorMessage);
    }

    return res.json();
  },
};
