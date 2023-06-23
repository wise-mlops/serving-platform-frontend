const config = useAppConfig();

export const restAPI = {
  get: async(url: string, baseUrl: string = config.apiServer)  => {
    let { data: rst, error } = await useFetch(url, {
      method: 'GET',
      baseURL: baseUrl
    });

    return rst.value;
  },
  post: async(url: string, baseUrl: string = config.apiServer, body: {} = {}) => {
    let { data: rst, error } = await useFetch(url, {
      method: 'POST',
      baseURL: baseUrl
    });

    return rst.value;
  },
  put: async(url: string, baseUrl: string = config.apiServer, body: {} = {}) => {
    let { data: rst, error } = await useFetch(url, {
      method: 'PUT',
      baseURL: baseUrl
    });

    return rst.value;
  },
  del: async(url: string, baseUrl: string = config.apiServer) => {
    let { data: rst, error } = await useFetch(url, {
      method: 'DELETE',
      baseURL: baseUrl
    });

    return rst.value;
  }
}