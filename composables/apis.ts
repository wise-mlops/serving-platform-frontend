const config = useAppConfig();

export const restAPI = {
  get: async (url: string, baseUrl: string = config.apiServer) => {
    let { data: rst, error } = await useFetch<APIResponseType>(url, {
      method: 'GET',
      baseURL: baseUrl
    });

    return rst.value;
  },
  post: async (url: string, body: {} = {}, baseUrl: string = config.apiServer) => {
    let { data: rst, error } = await useFetch<APIResponseType>(url, {
      method: 'POST',
      baseURL: baseUrl,
      body: body
    });

    return rst.value;
  },
  put: async (url: string, body: {} = {}, baseUrl: string = config.apiServer) => {
    let { data: rst, error } = await useFetch<APIResponseType>(url, {
      method: 'PUT',
      baseURL: baseUrl
    });

    return rst.value;
  },
  del: async (url: string, baseUrl: string = config.apiServer) => {
    let { data: rst, error } = await useFetch<APIResponseType>(url, {
      method: 'DELETE',
      baseURL: baseUrl
    });

    return rst.value;
  }
}