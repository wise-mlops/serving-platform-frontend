<template>
  <div>
    <div class="row">
      <va-navbar color="backgroundPrimary">
        <template #left>
          <PageTitle :pageTitle="pageTitle"/>
        </template>
      </va-navbar>
    </div>
    <div class="row">
      <div class="px-3 flex flex-col md12 xs12 lg12">
        <va-card outlined>
          <va-card-title>{{ pageTitle }}</va-card-title>
          <va-card-content>
            <va-input :label="'SearchKeyword'" v-model="filterKeyword" class="mb-4"></va-input>

            <va-data-table
              :items="datas?.products"
              :no-data-html="noItemText"
              :no-data-filtered-html="noItemText"
              :columns="productsCol"
              :per-page="pageSize"
              :current-page="currentPage"
              :filter="filterKeyword" 
              sticky-header
            >
              <template #cell(detail)="{ rowIndex, rowData }">
                <div>
                  <va-button size="small" class="px-2" @click="getDetail(rowData)">확인</va-button>
                </div>
              </template>

              <template #bodyAppend>
                <tr>
                  <td colspan="10">
                    <div class="page-view">
                      <va-pagination 
                        v-model="currentPage" 
                        :pages="pagenationView(pageSize, datas?.products)" 
                        :visible-pages="5"
                        gapped
                      />
                    </div>
                  </td>
                </tr>
              </template> 

            </va-data-table>
          </va-card-content>
        </va-card>
      </div>
    </div>
  </div> 
</template>

<script setup lang="ts">
import { getDummyAPI } from '~~/composables/apis';
import { productsCol } from '~~/composables/colums';

const pageTitle = ref('Cluster Nodes')

const currentPage = ref(1)
const filterKeyword = ref("")
const datas = await getDummyAPI()

const getDetail = ( rowData: any) => {
  alert(rowData.title);
}


</script>