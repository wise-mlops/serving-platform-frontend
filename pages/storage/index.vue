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
          <VaButton @click="showModal = !showModal" class="ml-2" icon="add">
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
              <VaDataTable class="services-card-table" :items="datas" :columns="bucketCol"
                @filtered="filtered = $event.items;" sticky-header clickable hoverable @row:click="goBucket">

                <template #cell(_creation_date)="{ rowIndex, rowData }">
                  <VaPopover :message="popoverTimeMsg(rowData._creation_date)" color="primary">
                    {{ changeTime(rowData._creation_date) }}</VaPopover>
                </template>

                <template #cell(remove)="{ rowIndex, rowData }">
                  <VaButton size="small" class="px-2" @click="removeItem(rowData._name)">삭제</VaButton>
                </template>
              </VaDataTable>
              <VaPagination v-model="currentPage" :pages="totalPage" :visible-pages="5" gapped />
            </VaCardContent>
          </VaCard>
        </VaInnerLoading>
      </div>
    </div>
    <VaModal v-model="showModal" ok-text="생성" cancel-text="취소" size="small" :before-ok="beforeOk">
      <h4 class="va-h4">
        Create Bucket
      </h4>
      <VaInput class="mt-2" v-model="bucketName" placeholder="Bucket Name"
        :rules="[(value) => (value.trim().length > 0) || '버킷명을 입력해주세요.']" />
    </VaModal>
  </div>
</template>

<script setup lang="ts">
import { bucketCol } from '~~/composables/columns';
import { SuccessResponseCode, ErrorResponseCode, DuplicatedErrorResponseCode } from '~~/assets/const/HttpResponseCode'
import { useDebouncedRef } from '~~/composables/common';

const route = useRoute();
const router = useRouter();

const pageTitle = ref("Buckets");
const currentPage = ref(1);
const datas = ref([]);
const filtered = ref("");
const totalPage = ref(1);
const pageSize = 10;
const loadedList = ref({});
const isValid = ref(true);
const selectedColumn = ref("전체")
const showModal = ref(false);
const bucketName = ref("");

const columnSearchOptions = [
  "전체",
  "Bucket Name",
  "Last Modified"
]

const columnOptionValue = {
  "Bucket Name": "_name",
  "Last Modified": "_creation_date"
}

const popoverTimeMsg = (time: string) => {
  const msg = `Local:  ${new Date(time)}
  UTC:  ${time}`
  return msg
}

/**
 * 현재 시각과 UTC 시각의 차이를 반환합니다.
 * @param timeStamp: UTC 시각
 */
const changeTime = (timeStamp: string) => {
  const date = new Date(timeStamp);
  const timeDiff = nowTimeDiff(date);
  return timeDiff
}

/**
 * 페이지가 로드될 때 bucket의 리스트를 가져옵니다.
 */
onMounted(async () => {
  activeRouteName.value = route.path;
  try {
    await getBucket();
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
//     await getBucket();
//   }
// })
// watch(filterKeyword, async () => {
//   currentPage.value = 1;
//   loadedList.value = {};
//   await getBucket();
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
  await getBucket();
}

/**
 * 페이지의 변화가 있을 때 bucket의 리스트를 가져옵니다.
 */
watch(currentPage, async () => {
  await getBucket();
})

/**
 * bucket의 리스트를 가져오는 함수입니다.
 */
const getBucket = async () => {
  isValid.value = false;
  if (currentPage.value in loadedList.value) {
    datas.value = loadedList.value[currentPage.value];
  }
  else {
    let APIurl;
    if (filterKeyword.value) {
      if (selectedColumn.value === '전체') {
        APIurl = `/bucket?page=${currentPage.value}&search_query=${filterKeyword.value}`;
      }
      else {
        APIurl = `/bucket?page=${currentPage.value}&search_query=${filterKeyword.value}&col_query=${columnOptionValue[selectedColumn.value]}`;
      }
    }
    else {
      APIurl = `/bucket`;
    }
    const response = await restAPI.get(APIurl);
    if (response) {
      if (response.code === SuccessResponseCode) {
        datas.value = response.result.message.result_details;
        totalPage.value = Math.ceil(response.result.message.total_result_details / pageSize);
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
 * REMOVE column이 아닐 시 해당 bucket으로 이동 시키는 함수입니다.
 * @param event 이벤트
 */
const goBucket = (event: any) => {
  const cellIndex = event.event.target.cellIndex;
  const parentCellIndex = event.event.target.parentNode.cellIndex;
  if (cellIndex < 2 || parentCellIndex < 2) {
    const name = event.item._name;
    router.push(`/storage/${name}`);
  }
}

/**
 * bucket을 삭제합니다.
 */
const removeItem = async (name: string) => {
  isValid.value = false;
  const response = await restAPI.del(`/bucket/${name}`);
  if (response) {
    if (response.code === SuccessResponseCode) {
      alert(`${name} is removed!`);
      currentPage.value = 1;
      loadedList.value = {};
      setTimeout(async () => {
        await getBucket();
        isValid.value = true;
      }, 2000);
    }
    else {
      if (response.code === ErrorResponseCode) {
        alert(`${response.result}`);
      }
      console.log(response.message);
      isValid.value = true;
    }
  }
  else {
    isValid.value = true;
  }
}

watch(showModal, () => {
  bucketName.value = "";
})

const beforeOk = (hide) => {
  createBucket(hide);
}

/**
 * 새로운 bucket을 생성하는 함수입니다.
 */
const createBucket = async (hide) => {
  isValid.value = false;
  if (bucketName.value.trim()) {
    const body = {
      bucket_name: bucketName.value,
      object_lock: false
    }
    const response = await restAPI.usePost('/bucket', body);
    if (response) {
      if (response.code === SuccessResponseCode) {
        if (response.result) {
          currentPage.value = 1;
          loadedList.value = {};
          alert('bucket이 생성되었습니다.');
          await getBucket();
          hide();
        }
      }
      else if (response.code === DuplicatedErrorResponseCode || ErrorResponseCode) {
        alert(`${bucketName.value}은 사용할 수 없는 이름입니다.`);
        bucketName.value = '';
      }
      else {
        console.log(response.message);
        hide();
      }
    }
  }
  else {
    alert('버킷명을 확인해주세요.');
  }
  isValid.value = true;
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

.va-popover__content {
  white-space: pre;
}
</style>