const config = useAppConfig();

export const restAPI = {
  get: async (url: string, baseUrl: string = config.apiServer) => {
    let data = await $fetch<ResponseBody>(url, {
      method: 'GET',
      baseURL: baseUrl
    });

    return data;
  },
  useGet: async (url: string, baseUrl: string = config.apiServer) => {
    let { data: rst, error } = await useFetch<ResponseBody>(url, {
      method: 'GET',
      baseURL: baseUrl
    });

    return rst.value;
  },
  post: async (url: string, body: {} = {}, baseUrl: string = config.apiServer) => {
    let data = await $fetch<ResponseBody>(url, {
      method: 'POST',
      baseURL: baseUrl,
      body: body
    });

    return data;
  },
  usePost: async (url: string, body: {} = {}, baseUrl: string = config.apiServer) => {
    let { data: rst, error } = await useFetch<ResponseBody>(url, {
      method: 'POST',
      baseURL: baseUrl,
      body: body
    });

    return rst.value;
  },
  put: async (url: string, body: {} = {}, baseUrl: string = config.apiServer) => {
    let { data: rst, error } = await useFetch<ResponseBody>(url, {
      method: 'PUT',
      baseURL: baseUrl
    });

    return rst.value;
  },
  del: async (url: string, body: {} = {}, baseUrl: string = config.apiServer) => {
    let data = await $fetch<ResponseBody>(url, {
      method: 'DELETE',
      baseURL: baseUrl,
      body: body
    });

    return data;
  },
  useDel: async (url: string, baseUrl: string = config.apiServer) => {
    let { data: rst, error } = await useFetch<ResponseBody>(url, {
      method: 'DELETE',
      baseURL: baseUrl
    });

    return rst.value;
  }
}