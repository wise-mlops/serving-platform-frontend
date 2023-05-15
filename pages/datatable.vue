<template>
  <div>
      <h1>DataTable</h1>

      <va-input :label="'SearchKeyword'" v-model="filterKeyword"></va-input>

      <va-data-table :items="datas" :no-data-html="noItemText"
                     :no-data-filtered-html="noItemText"
                     :columns="columns" :per-page="pageSize" :current-page="currentPage"
                     :filter="filterKeyword" @filtered="filtered = $event.items"
                     :loading="loading" sticky-header>

          <template #cell(DETAIL)="{ rowIndex, rowData }">
              <va-button preset="secondary">
                  <va-icon name="search" v-on:click="getDetail(rowData)"></va-icon>
              </va-button>
          </template>

          <!--   페이징 UI   -->
          <template #bodyAppend>
              <tr>
                  <td colspan="7">
                      <div class="table-pagination">
                          <va-pagination v-model="currentPage" :pages="pageView()" input/>
                      </div>
                  </td>
              </tr>
          </template>
      </va-data-table>
  </div>
</template>

<script setup lang="ts">
import { DataTableItem } from "vuestic-ui";

onMounted( () => {
    createData(30);
});

const loading: globalThis.Ref<boolean> = ref(false);
const pageSize: globalThis.Ref<number> = ref(10);
const currentPage: globalThis.Ref<number> = ref(1);
const filterKeyword: globalThis.Ref<string> = ref("");
const noItemText: globalThis.Ref<string> = ref("No Item");
const pageView = () => {
    console.log(pageSize.value);
    console.log(datas.value);
    return pageSize.value && pageSize.value !== 0 ? Math.ceil(filtered.value.length / pageSize.value) : filtered.value.length;
}

const COLUMNS_NAME = ref(["CPU", "GPU", "MEMORY", "PRICE", "BUY_DATE", "DETAIL"]);
const columns = [
    {key: COLUMNS_NAME.value[0], label: "CPU", sortable: true},
    {key: COLUMNS_NAME.value[1], label: "GPU", sortable: true},
    {key: COLUMNS_NAME.value[2], label: "MEMORY", sortable: true},
    {key: COLUMNS_NAME.value[3], label: "PRICE", sortable: true},
    {key: COLUMNS_NAME.value[4], label: "BUY_DATE", sortable: false},
    {key: COLUMNS_NAME.value[5], label: "DETAIL", sortable: false}
];
const datas: globalThis.Ref<DataTableItem> = ref([]);
const filtered: globalThis.Ref<DataTableItem> = ref([]);

const createData = (size: number) => {
    for (let idx=1; idx<=size; idx++) {
        let json: any = {};
        json[COLUMNS_NAME.value[0]] = "INTEL_i" +idx;
        json[COLUMNS_NAME.value[1]] = "Nvidia Geforce " +idx+ " Series";
        json[COLUMNS_NAME.value[2]] = idx+ "GB";
        json[COLUMNS_NAME.value[3]] = "￦" +Math.ceil((Math.random() % idx) * 1000000);
        json[COLUMNS_NAME.value[4]] = new Date();
        json[COLUMNS_NAME.value[5]] = "INTEL_i" +idx;
        datas.value.push(json);
        filtered.value.push(json);
    }
}

const getDetail = (rowData: any) => {
    alert(rowData[COLUMNS_NAME.value[5]]);
}

</script>

<style scoped>
h1 {
    font-size: 20pt;
    margin-bottom: 20px;
}
.table-pagination {
    display: flex;
    justify-content: center;
}
</style>