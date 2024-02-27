<template>
  <div>
    <div class="row">
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
    </div>
    <div class="row">
      <div class="px-3 flex flex-col md12 xs12 lg12">
        <VaInnerLoading :loading="!isValid">
          <VaCard outlined class="services-card">
            <VaCardTitle />
            <VaCardContent class="services-card-content">
              <div class="services-card-top" v-if="mode === 'debounce'">
                <VaSelect v-model="selectedColumn" :options="columnOptions" placeholder="전체" class="select-column" />
                <VaInput :label="'Search Keyword'" v-model="filterKeyword" class="search-input" />
              </div>
              <div class="services-card-top" v-else-if="mode === 'button'">
                <VaSelect v-model="selectedColumn" :options="columnOptions" placeholder="전체" class="select-column" />
                <VaInput :label="'Search Keyword'" v-model="filterKeyword" class="search-input" @keyup.enter="search" />
                <VaButton class="search-button" @click="search">검색</VaButton>
              </div>
              <VaDataTable class="services-card-table" :items="datas" :columns="servicesCol"
                @filtered="filtered = $event.items;" sticky-header clickable hoverable @row:click="goDetail">
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
                  <!-- <VaPopover class="mr-2 mb-2" :message="popoverTimeMsg(rowData.creationTimestamp)" color="primary">{{
                    changeTime(rowData) }}</VaPopover> -->
                  {{ changeTime(rowData) }}
                </template>
                <template #cell(test)="{ rowIndex, rowData }">
                  <VaButton size="small" class="px-2" @click="goTest(rowData.name, rowData.status, rowData.modelFormat)">
                    TEST</VaButton>
                </template>
                <template #cell(remove)="{ rowIndex, rowData }">
                  <VaButton size="small" class="px-2" @click="removeItem(rowData.name)">삭제</VaButton>
                </template>
              </VaDataTable>
              <VaPagination v-model="currentPage" :pages="totalPage" :visible-pages="5" gapped />
            </VaCardContent>
          </VaCard>
        </VaInnerLoading>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { servicesCol } from '~~/composables/columns';
import { NotFoundErrorResponseCode, SuccessResponseCode } from '~~/assets/const/HttpResponseCode'
import { useDebouncedRef } from '~~/composables/common';

const pageTitle = ref('Inference Services');
const router = useRouter();

const currentPage = ref(1);
const datas = ref([]);
const filtered = ref("");
const totalPage = ref(1);
const pageSize = 10;
const loadedList = ref({});
const isValid = ref(true);
const selectedColumn = ref("전체")

const columnOptions = [
  "전체",
  "Status",
  "Name",
  "Model Format",
  "Created"
]

const columnOptionValue = {
  Status: "status",
  Name: "name",
  "Model Format": "modelFormat",
  Created: "creationTimestamp"
}

const popoverStatusMsg = (name: string) => {
  return `Configuration "${name}-predictor" does not have any ready Revision.`
}

const popoverTimeMsg = (time: string) => {
  return `UTC: ${time}`
}

const changeTime = (rowData: any) => {
  const timeStamp: string = rowData.creationTimestamp;
  // const date = new Date(timeStamp);
  const dateTime = timeStamp.slice(0, -1).replace("T", " ");
  return dateTime
}

/**
 * 페이지가 로드될 때 Inference Service의 리스트를 가져옵니다.
 */
onMounted(async () => {
  try {
    await getList();
  } catch (error) {
    console.error('Error loading data:', error);
  }
  isValid.value = true;
})

/**
 * 10초마다 자동으로 Inference Service의 리스트를 가져옵니다.
 */
const autoGetList = setInterval(async () => {
  isValid.value = false;
  loadedList.value = {};
  await getList();
  isValid.value = true;
}, 10000);

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

/**
 * Inference Service의 리스트를 가져오는 함수입니다.
 */
const getList = async () => {
  isValid.value = false;
  if (currentPage.value in loadedList.value) {
    datas.value = loadedList.value[currentPage.value];
  }
  else {
    let APIurl;
    if (filterKeyword.value) {
      if (selectedColumn.value === '전체') {
        APIurl = `/kserve?page=${currentPage.value}&search_query=${filterKeyword.value}`;
      }
      else {
        APIurl = `/kserve?page=${currentPage.value}&search_query=${filterKeyword.value}&col_query=${columnOptionValue[selectedColumn.value]}`;
      }
    }
    else {
      APIurl = `/kserve?page=${currentPage.value}`;
    }
    const response = await restAPI.get(APIurl);
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

const goAdd = () => {
  clearInterval(autoGetList);
  router.push('/service/add');
}

/**
 * TEST, REMOVE column이 아닐 시 상세보기 페이지로 이동 시키는 함수입니다.
 * @param event 이벤트
 */
const goDetail = (event: any) => {
  const cellIndex = event.event.target.cellIndex;
  const status = event.item.status;
  if (cellIndex < 4) {
    if (status === 'Unknown') {
      alert(`Inference Service를 생성 중입니다.
잠시 후 새로고침을 해주세요.`);
    }
    else {
      const name = event.item.name;
      clearInterval(autoGetList);
      navigateTo(`/service/${name}`);
    }
  }
}

const goTest = async (name: string, status: string, modelFormat: string) => {
  if (status === 'True') {
    clearInterval(autoGetList);
    router.push({ path: `/test/${name}`, query: { model_format: modelFormat } });
  }
  else {
    alert('Inference Service의 상태가 Ready일 때만 테스트 가능합니다.');
  }
}

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
.services-card {
  height: 700px;
}

.services-card-top {
  display: flex;
  width: 30%;
  margin-bottom: 15px;
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

.services-card-content {
  display: flex;
  flex-direction: column;
  height: 93%;
}

.services-card-table {
  height: 500px !important;
}

.va-input-label {
  font-size: medium;
}
</style>