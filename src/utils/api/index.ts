interface RequestOptions extends RequestInit {
  data?: any;
}

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', data, headers: customHeaders, ...rest } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...customHeaders,
    },
    ...rest,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.');
    throw error;
  }

  return response.json();
}

export const api = {
  get: <T>(url: string, options?: RequestOptions) => request<T>(url, { ...options, method: 'GET' }),
  post: <T>(url: string, data: any, options?: RequestOptions) => request<T>(url, { ...options, method: 'POST', data }),
  delete: <T>(url: string, options?: RequestOptions) => request<T>(url, { ...options, method: 'DELETE' }),
};
