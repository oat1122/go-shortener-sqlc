export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const api = {
  shorten: async (url: string) => {
    const res = await fetch(`${API_URL}/shorten`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    if (!res.ok) {
      throw new Error("Failed to shorten URL");
    }

    return res.json();
  },
};
