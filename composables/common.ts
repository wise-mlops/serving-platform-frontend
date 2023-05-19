/* paging */
export const pageSize = ref(10)
export const noItemText = ref('No Item')
export const pagenationView = ( pageSize:number, items: any[] ) => {
  console.log(items)
  return pageSize && pageSize !== 0 ? Math.ceil(items.length / pageSize) : items.length;
}
