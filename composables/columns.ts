export const servicesCol = ref([
  { label: 'Status', key: 'status', sortable: true, width: '10%' },
  { label: 'Name', key: 'name', sortable: true, width: '18%' },
  { label: 'Model Format', key: 'modelFormat', sortable: true, width: '13%' },
  { label: 'Created', key: 'creationTimestamp', sortable: true, width: '10%' },
  { label: 'Test', key: 'test', sortable: false, width: '5%' },
  { label: 'Remove', key: 'remove', sortable: false, width: '5%' }
])

export const overviewCol = ref([
  { label: 'Status', key: 'status', width: '4%' },
  { label: 'Type', key: 'type', width: '11%' },
  { label: 'Last Transition Time', key: 'lastTransitionTime', width: '11%' },
  { label: 'Serverity', key: 'severity', width: '8%' },
])