/* paging */
export const pageSize = ref(10)
export const noItemText = ref('No Item')
export const pagenationView = ( pageSize:number, originItems: any[], filtered: any ) => {
  let items = filtered ? filtered : originItems;
  return pageSize && pageSize !== 0 ? Math.ceil(items.length / pageSize) : items.length;
}
