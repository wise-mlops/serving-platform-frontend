<template>
  <div>
    <PageToolbar :pageTitle="pageTitle" :toolButtons="toolButtons" />
    <div class="row">
      <div class="px-3 flex flex-col md12 xs12 lg12">
        <va-card outlined class="card">
          <va-card-title>{{ pageTitle }}</va-card-title>
          <va-card-content class="card-content">
            <va-input :label="'SearchKeyword'" v-model="filterKeyword" class="mb-4" style="width: 300px"></va-input>
            <VaDataTable class="card-table" :items="datas" :columns="servicesCol" :filter="filterKeyword"
              @filtered="filtered = $event.items;" sticky-header clickable hoverable @row:click="handleClick">
              <template #cell(creationTimestamp)="{ rowIndex, rowData }">
                <div>
                  {{ changeTime(rowData) }}
                </div>
              </template>
              <template #cell(test)="{ rowIndex, rowData }">
                <div>
                  <va-button size="small" class="px-2" @click="goTest(rowData)">TEST</va-button>
                </div>
              </template>
              <template #cell(remove)="{ rowIndex, rowData }">
                <div>
                  <va-button size="small" class="px-2" @click="removeItem(rowData)">삭제</va-button>
                </div>
              </template>
            </VaDataTable>
            <va-pagination v-model="currentPage" :pages="totalPage" :visible-pages="5" gapped />
          </va-card-content>
        </va-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { servicesCol } from '~~/composables/columns';
import { toolButtonSample } from '~~/assets/data/toolButton'
import PageToolbar from '~~/components/PageToolBar.vue'
import { SuccessResponseCode } from '~~/assets/const/HttpResponseCode'
import { useDebouncedRef } from '~~/composables/common';

const pageTitle = ref('Inference Services');
const toolButtons = ref(toolButtonSample);

const currentPage = ref(1);
const filterKeyword = useDebouncedRef("", 1000);
const datas = ref([]);
const filtered = ref("");
const totalPage = ref(1);
const pageSize = 10;
const loadedList = ref({});

watch(filterKeyword, () => {
  currentPage.value = 1;
  loadedList.value = {};
  getList();
})

const getList = async () => {
  if (currentPage.value in loadedList.value) {
    datas.value = loadedList.value[currentPage.value];
  }
  else {
    let APIurl;
    if (filterKeyword.value) {
      APIurl = `/kserve?page=${currentPage.value}&search_query=${filterKeyword.value}`;
    }
    else {
      APIurl = `/kserve?page=${currentPage.value}`;
    }
    const response = await restAPI.get(APIurl);
    if (response) {
      if (response.code === SuccessResponseCode) {
        datas.value = response.result.items;
        totalPage.value = Math.ceil(response.result.total_items / pageSize);
        loadedList.value[currentPage.value] = datas.value;
      }
      else {
        console.log(response.message);
      }
    }
  }
}

watch(currentPage, async () => {
  getList();
})


onMounted(async () => {
  try {
    getList();
  } catch (error) {
    console.error('Error loading data:', error)
  }
})

/**
 * 버튼이 아닐 시 상세보기 페이지로 이동 시키는 함수입니다.
 * @param event 이벤트
 */
const handleClick = (event: any) => {
  const className = event.event.target.className;
  if (className !== "va-button__content") {
    const name = event.item.name;
    alert(`${name} 상세보기 페이지 이동 예정!`)
    // navigateTo(`/service/${name}`)
  }
}

const changeTime = (rowData: any) => {
  const timeStamp = rowData.creationTimestamp
  return timeStamp.substring(0, 10)
}

const goTest = async (rowData: any) => {
  const name = rowData.name
  alert(`${name} 테스트 페이지 이동 예정!`)
  // navigateTo(`/service/test`)
}

const removeItem = async (rowData: any) => {
  const name = rowData.name
  const response = await restAPI.del(`/kserve/${name}`);
  if (response) {
    if (response.code === SuccessResponseCode) {
      alert(`${name} is removed!`);
      loadedList.value = {};
      getList();
    }
    else {
      console.log(response.message);
    }
  }
}

</script>
<style>
.card {
  height: 700px;
}

.card-content {
  display: flex;
  flex-direction: column;
  height: 93%;
}

.card-table {
  height: 500px !important;
}
</style>