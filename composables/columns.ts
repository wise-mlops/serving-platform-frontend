export const servicesCol = ref([
  { label: 'Name', key: 'name', sortable: true, width: '15%' },
  { label: 'Model Format', key: 'modelFormat', sortable: true, width: '15%' },
  { label: 'Created', key: 'creationTimestamp', sortable: true, width: '10%' },
  { label: 'Status', key: 'status', sortable: true, width: '6%' },
  { label: 'Test', key: 'test', sortable: false, width: '6%' },
  { label: 'Remove', key: 'remove', sortable: false, width: '6%' }
])

export const overviewCol = ref([
  { label: 'Status', key: 'status', width: '4%' },
  { label: 'Type', key: 'type', width: '11%' },
  { label: 'Last Transition Time', key: 'lastTransitionTime', width: '11%' },
  { label: 'Serverity', key: 'severity', width: '8%' },
])