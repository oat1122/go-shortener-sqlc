import axios from "axios";

/**
 * Recursively converts Go sql.NullString/NullInt/NullFloat objects
 * like {String: "value", Valid: true} into plain values.
 * This handles the mismatch between Go's database/sql nullable types
 * and what the frontend expects.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeNullableFields(data: any): any {
  if (data === null || data === undefined) return data;

  // Check if this is a sql.NullString-like object: {String: "...", Valid: bool}
  if (
    typeof data === "object" &&
    !Array.isArray(data) &&
    "Valid" in data &&
    Object.keys(data).length === 2
  ) {
    if ("String" in data) return data.Valid ? data.String : "";
    if ("Int64" in data) return data.Valid ? data.Int64 : 0;
    if ("Float64" in data) return data.Valid ? data.Float64 : 0;
    if ("Int32" in data) return data.Valid ? data.Int32 : 0;
    if ("Bool" in data) return data.Valid ? data.Bool : false;
    if ("Time" in data) return data.Valid ? data.Time : null;
  }

  if (Array.isArray(data)) {
    return data.map(normalizeNullableFields);
  }

  if (typeof data === "object") {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(data)) {
      result[key] = normalizeNullableFields(data[key]);
    }
    return result;
  }

  return data;
}

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  withCredentials: true, // Important for cookie-based auth
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if not using cookies
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Normalize Go sql.Null* types to plain values
    response.data = normalizeNullableFields(response.data);
    return response;
  },
  (error) => {
    // Handle global errors (e.g., 401 Unauthorized)
    if (error.response && error.response.status === 401) {
      // Redirect to login or refresh token logic
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
