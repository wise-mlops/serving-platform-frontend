/* paging */
export const pageSize = ref(10)
export const noItemText = ref('No Item')
export const pagenationView = (pageSize: number, originItems: any[], filtered: any) => {
  let items = filtered ? filtered : originItems;
  return pageSize && pageSize !== 0 ? Math.ceil(items.length / pageSize) : items.length;
}

/* Debounce function */
export const useDebouncedRef = (value: any, delay = 200) => {
  let timeout: any;
  return customRef((track, trigger) => {
    return {
      get() {
        track()
        return value
      },
      set(newValue) {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          value = newValue
          trigger()
        }, delay)
      }
    }
  })
}

/* Current Page */
export const activeRouteName = ref('/index');
