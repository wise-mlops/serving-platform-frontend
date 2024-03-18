<template>
  <div class="inference-card">
    <VaNavbar color="backgroundPrimary">
      <template #left>
        <h4 class="va-h5">
          {{ pageTitle }}
        </h4>
      </template>

      <template #right>
        <VaButton @click="goAdd()" class="ml-2" icon="add">
          add
        </VaButton>
      </template>
    </VaNavbar>
    <div class="px-3 md12 xs12 lg12 inference-card-content">
      <VaInnerLoading :loading="!isValid" class="inference-card-loading">
        <VaCard outlined class="services-card">
          <VaCardTitle />
          <VaCardContent class="services-card-content">
            <div class="services-card-top" v-if="mode === 'debounce'">
              <VaSelect v-model="selectedColumn" :options="columnSearchOptions" placeholder="전체"
                class="select-column" />
              <VaInput :label="'Search Keyword'" v-model="filterKeyword" class="search-input" />
            </div>
            <div class="services-card-top" v-else-if="mode === 'button'">
              <VaSelect v-model="selectedColumn" :options="columnSearchOptions" placeholder="전체"
                class="select-column" />
              <VaInput :label="'Search Keyword'" v-model="filterKeyword" class="search-input" @keyup.enter="search" />
              <VaButton class="search-button" @click="search">검색</VaButton>
            </div>
            <VaDataTable class="services-card-table" :items="datas" :columns="servicesCol" sticky-header clickable
              hoverable @row:click="goDetail" @columnSorted="sortList">
              <template #cell(status)="{ rowIndex, rowData }">
                <VaPopover message="InferenceService is Ready" placement="left-bottom" color="#154ec19e"
                  v-if="rowData.status === 'True'">
                  <VaIcon name="check_circle" color="success" />
                </VaPopover>
                <VaPopover :message=popoverStatusMsg(rowData.name) placement="left-bottom" color="#154ec19e" v-else>
                  <VaProgressCircle :size="20" :thickness="0.3" indeterminate style="display: inline-block;" />
                </VaPopover>
              </template>

              <template #cell(creationTimestamp)="{ rowIndex, rowData }">
                <VaPopover :message="popoverTimeMsg(rowData.creationTimestamp)" color="primary">{{ changeTime(rowData)
                  }}
                </VaPopover>
              </template>

              <template #cell(test)="{ rowIndex, rowData }">
                <VaButton size="small" class="px-2" @click="goTest(rowData.name, rowData.status, rowData.modelFormat)">
                  TEST</VaButton>
              </template>

              <template #cell(remove)="{ rowIndex, rowData }">
                <VaButton size="small" class="px-2" @click="removeItem(rowData.name)">삭제</VaButton>
              </template>
            </VaDataTable>
            <VaPagination v-model="currentPage" :pages="totalPage" :visible-pages="5" gapped class="pagination" />
          </VaCardContent>
        </VaCard>
      </VaInnerLoading>
    </div>
  </div>
</template>

<script setup lang="ts">
import { servicesCol } from '~~/composables/columns';
import { NotFoundErrorResponseCode, SuccessResponseCode } from '~~/assets/const/HttpResponseCode'
import { useDebouncedRef } from '~~/composables/common';

const router = useRouter();
const route = useRoute();

const pageTitle = ref<string>('Inference Services');
const currentPage = ref<number>(1);
const datas = ref<InferenceServiceDetail[]>([]);
const totalPage = ref<number>(1);
const pageSize: number = 10;
const loadedList = ref<{ [key: number]: InferenceServiceDetail[] }>({});
const isValid = ref<boolean>(true);
const selectedColumn = ref<string>("전체")
const sortedOption = ref<string>("");

const columnSearchOptions: string[] = [
  "전체",
  "Status",
  "Name",
  "Model Format",
  "Created Date"
]

const columnOptionValue: { [key: string]: string } = {
  Status: "status",
  Name: "name",
  "Model Format": "modelFormat",
  "Created Date": "creationTimestamp"
}

const popoverStatusMsg = (name: string): string => {
  return `Configuration "${name}-predictor" does not have any ready Revision.`
}

const popoverTimeMsg = (time: string): string => {
  const msg = `Local:  ${new Date(time)}
  UTC:  ${time}`
  return msg
}

/**
 * 현재 시각과 UTC 시각의 차이를 반환합니다.
 */
const changeTime = (rowData: any): string => {
  const timeStamp: string = rowData.creationTimestamp;
  const date = new Date(timeStamp);
  const timeDiff = nowTimeDiff(date);
  return timeDiff
}

/**
 * 페이지가 로드될 때 Inference Service의 리스트를 가져옵니다.
 */
onMounted(async () => {
  activeRouteName.value = route.path;
  try {
    await getList();
  } catch (error) {
    console.error('Error loading data:', error);
  }
  isValid.value = true;
})

/**
 * 방법 1. 검색창 내의 변화를 감지하여 입력값과 일치하는 리스트를 가져옵니다.
 * 검색 버튼 이용 시(방법 2 이용) 주석 처리 필요.
 */
// const mode = "debounce";
// const filterKeyword = useDebouncedRef("", 1000);
// watch(selectedColumn, async () => {
//   if (filterKeyword.value) {
//     currentPage.value = 1;
//     loadedList.value = {};
//     await getList();
//   }
// })
// watch(filterKeyword, async () => {
//   currentPage.value = 1;
//   loadedList.value = {};
//   await getList();
// })

/**
 * 방법 2. 검색 버튼을 이용하여 입력값과 일치하는 리스트를 가져옵니다.
 * 검색 버튼 이용하지 않을 시(방법 1 이용) 주석 처리 필요.
 */
const mode = "button";
const filterKeyword = ref("");
const search = async () => {
  currentPage.value = 1;
  loadedList.value = {};
  await getList();
}

/**
 * 페이지의 변화가 있을 때 Inference Service의 리스트를 가져옵니다.
 */
watch(currentPage, async () => {
  await getList();
})

const sortList = async (event) => {
  const colName = event.columnName;
  const sortValue = event.value;
  loadedList.value = {};
  if (sortValue) {
    if (sortValue === 'asc') {
      sortedOption.value = `&sort_query=false&sort_query_col=${colName}`
    }
    else if (sortValue === "desc") {
      sortedOption.value = `&sort_query=true&sort_query_col=${colName}`
    }
  }
  else {
    sortedOption.value = ''
  }
  try {
    await getList();
  } catch (error) {
    console.error('Error sorting data:', error);
  }
}

/**
 * Inference Service의 리스트를 가져오는 함수입니다.
 */
const getList = async () => {
  isValid.value = false;
  if (currentPage.value in loadedList.value) {
    datas.value = loadedList.value[currentPage.value];
  }
  else {
    let APIurl = `/kserve?page_index=${currentPage.value}&page_object=${pageSize}`;
    if (filterKeyword.value) {
      if (selectedColumn.value === '전체') {
        APIurl += `${sortedOption.value}&search_query=${filterKeyword.value}`;
      }
      else {
        APIurl += `${sortedOption.value}&search_query=${filterKeyword.value}&col_query=${columnOptionValue[selectedColumn.value]}`;
      }
    }
    else {
      APIurl += `${sortedOption.value}`;
    }
    const response: InferenceServicesResponsebody = await restAPI.get(APIurl);
    if (response) {
      if (response.code === SuccessResponseCode) {
        datas.value = response.result.result_details;
        totalPage.value = Math.ceil(response.result.total_result_details / pageSize);
        loadedList.value[currentPage.value] = datas.value;
      }
      else {
        console.log(response.message);
      }
    }
  }
  isValid.value = true;
}

/**
 * Inference Service 등록 페이지로 이동합니다.
 */
const goAdd = () => {
  router.push('/services/add');
}

/**
 * TEST, REMOVE column이 아닐 시 상세보기 페이지로 이동 시키는 함수입니다.
 * @param event 이벤트
 */
const goDetail = (event: any) => {
  const cellIndex = event.event.target.cellIndex;
  const parentCellIndex = event.event.target.parentNode.cellIndex;
  const status = event.item.status;
  if (cellIndex < 4 || parentCellIndex < 4) {
    if (status === 'Unknown') {
      alert(`Inference Service를 생성 중입니다.
잠시 후 새로고침을 해주세요.`);
    }
    else {
      const name = event.item.name;
      navigateTo(`/services/${name}`);
    }
  }
}

/**
 * Inference Service 테스트 페이지로 이동합니다.
 */
const goTest = async (name: string, status: string, modelFormat: string) => {
  if (status === 'True') {
    router.push({ path: `/test/${name}`, query: { model_format: modelFormat } });
  }
  else {
    alert('Inference Service의 상태가 Ready일 때만 테스트 가능합니다.');
  }
}

/**
 * Inference Service를 삭제합니다.
 */
const removeItem = async (name: string) => {
  isValid.value = false;
  const response = await restAPI.del(`/kserve/${name}`);
  if (response) {
    if (response.code === SuccessResponseCode) {
      alert(`${name} is removed!`);
      currentPage.value = 1;
      loadedList.value = {};
      setTimeout(async () => {
        await getList();
        isValid.value = true;
      }, 2000);
    }
    else {
      if (response.code === NotFoundErrorResponseCode) {
        alert('잘못된 요청입니다.');
      }
      console.log(response.message);
      isValid.value = true;
    }
  }
  else {
    isValid.value = true;
  }
}

</script>

<style>
.inference-card {
  height: 100%;
}

.inference-card-content {
  height: 83%;
}

.inference-card-loading {
  height: 100%;
}

.services-card {
  height: 100%;
}

.services-card-top {
  display: flex;
  width: 30%;
  margin-bottom: 15px;
}

.services-card-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 93%;
}

.services-card-table {
  width: 100%;
  height: 100%;
  flex-grow: 1;
}

.va-input-label {
  font-size: medium;
}

.va-popover__content {
  white-space: pre;
}

.select-column {
  align-self: flex-end;
  margin-right: 10px;
  widows: 10px;
}

.search-input {
  width: 250px;
}

.search-button {
  align-self: flex-end;
  min-width: 80px;
  margin-left: 10px;
}
</style>