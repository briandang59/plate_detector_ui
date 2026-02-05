const BASE_URL = "/api";

interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
  ok: boolean;
}

interface RequestConfig extends RequestInit {
  token?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {},
  ): Promise<ApiResponse<T>> {
    let url = `${this.baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    const headers = new Headers({
      Accept: "application/json",
      ...config.headers,
    });

    if (config.token) {
      headers.set("Authorization", `Bearer ${config.token}`);
    }

    let body = config.body;
    if (body && !(body instanceof FormData) && typeof body === "object") {
      body = JSON.stringify(body);
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
    }

    try {
      const response = await fetch(url, {
        ...config,
        headers,
        body,
        credentials: "include",
      });
      console.log(url);
      let data: any;
      const contentType = response.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        data = await response.json().catch(() => null);
      } else if (contentType?.includes("text")) {
        data = await response.text().catch(() => null);
      } else {
        data = null;
      }

      const result: ApiResponse<T> = {
        data: response.ok ? (data as T) : undefined,
        error: response.ok
          ? undefined
          : data?.message || data?.error || `Lỗi ${response.status}`,
        status: response.status,
        ok: response.ok,
      };

      if (!response.ok) {
        console.error(
          `API Error [${config.method || "GET"} ${endpoint}]:`,
          result.error,
        );
      }

      return result;
    } catch (err: any) {
      console.error(`Network/API Error [${endpoint}]:`, err);
      return {
        error: err.message || "Không thể kết nối đến server",
        status: 0,
        ok: false,
      };
    }
  }

  async get<T>(endpoint: string, config: RequestConfig = {}) {
    return this.request<T>(endpoint, { ...config, method: "GET" });
  }

  async post<T>(endpoint: string, body?: any, config: RequestConfig = {}) {
    return this.request<T>(endpoint, { ...config, method: "POST", body });
  }

  async put<T>(endpoint: string, body?: any, config: RequestConfig = {}) {
    return this.request<T>(endpoint, { ...config, method: "PUT", body });
  }

  async patch<T>(endpoint: string, body?: any, config: RequestConfig = {}) {
    return this.request<T>(endpoint, { ...config, method: "PATCH", body });
  }

  async delete<T>(endpoint: string, config: RequestConfig = {}) {
    return this.request<T>(endpoint, { ...config, method: "DELETE" });
  }

  async upload<T>(
    endpoint: string,
    formData: FormData,
    config: RequestConfig = {},
  ) {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      body: formData,
      headers: {
        ...config.headers,
      },
    });
  }
}

export const api = new ApiClient();

export const createApiClient = (baseUrl: string) => new ApiClient(baseUrl);
