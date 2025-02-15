export const servicesCol = ref([
  { label: 'Name', key: 'name', sortable: true, width: '16%' },
  { label: 'Model Format', key: 'modelFormat', sortable: true, width: '14%' },
  { label: 'Created at', key: 'creationTimestamp', sortable: true, width: '12%' },
  { label: 'Status', key: 'status', sortable: true, width: '7%' },
  { label: 'Test', key: 'test', sortable: false, width: '5%' },
  { label: 'Remove', key: 'remove', sortable: false, width: '5%' }
])

export const overviewCol = ref([
  { label: 'Status', key: 'status', width: '4%' },
  { label: 'Type', key: 'type', width: '11%' },
  { label: 'Last Transition Time', key: 'lastTransitionTime', width: '11%' },
  { label: 'Serverity', key: 'severity', width: '8%' },
])

export const storageCol = ref([
  { label: 'Name', key: '_object_name', sortable: true, width: '32%' },
  { label: 'Size', key: '_size', sortable: true, width: '28%' },
  { label: 'Last Modified', key: '_last_modified', sortable: true, width: '28%' },
  { label: 'Share', key: 'share', sortable: false, width: '17%' }
])

export const columnOptionTitle = {
  status: "Status",
  api_url: "API URL",
  storage_uri: "Storage URI",
  model_format: "Model Format",
  name: "Name",
  namespace: "Namespace",
  url: "URL",
  annotations: "Annotations",
  creation_timestamp: "Created At",
  service_account: "Service Account"
}