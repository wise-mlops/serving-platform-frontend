const config = useAppConfig();

export const getDummyAPI = async() => {
  const { data:products, error } = await useFetch<DummyBody>(`/products`, {
    method: 'GET',
    baseURL: config.apiServer
  })

  if (error) {
    const result: DummyBody = {
      products: [],
      total: 0,
      skip: 0,
      limit: 0
    }
  }
  return products;
}