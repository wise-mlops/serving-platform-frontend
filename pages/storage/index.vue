<template>
  <div class="bucket-card">
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
    <div class="px-3 md12 xs12 lg12 bucket-card-content">
      <VaInnerLoading :loading="!isValid" class="bucket-card-loading">
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
            <VaList class="services-card-bottom">
              <VaListItem v-for="(data, index) in datas" :key="index" class="service-card-item">
                <VaListItemSection avatar @click="goBucket(index)">
                  <VaAvatar>
                    <VaIcon name="inventory" size="large" />
                  </VaAvatar>
                </VaListItemSection>
                <VaListItemSection @click="goBucket(index)">
                  <VaListItemLabel>
                    <h6 class="va-h6 ml-1">{{ data._name }}</h6>
                  </VaListItemLabel>
                  <VaListItemLabel caption :lines="2">
                    <p class="category-text"> last modified: {{ changeTime(data._creation_date) }}</p>
                  </VaListItemLabel>
                </VaListItemSection>
                <VaListItemSection icon>
                  <VaIcon name="delete_forever" @click="removeConfirm(data._name)" size="large" color="info" />
                </VaListItemSection>
              </VaListItem>
            </VaList>
            <VaPagination v-model="currentPage" :pages="totalPage" :visible-pages="5" gapped class="pagination" />
          </VaCardContent>
        </VaCard>
      </VaInnerLoading>
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
import { SuccessResponseCode, ErrorResponseCode, DuplicatedErrorResponseCode } from '~~/assets/const/HttpResponseCode'
import { useDebouncedRef } from '~~/composables/common';
import { useModal } from 'vuestic-ui'
const { confirm } = useModal()

const route = useRoute();
const router = useRouter();

const pageTitle = ref<string>("Buckets");
const currentPage = ref<number>(1);
const datas = ref<BucketDetail[]>([]);
const totalPage = ref<number>(1);
const pageSize: number = 6;
const loadedList = ref<{ [key: number]: BucketDetail[] }>({});
const isValid = ref<boolean>(true);
const selectedColumn = ref<string>("전체")
const showModal = ref<boolean>(false);
const bucketName = ref<string>("");

const columnSearchOptions: string[] = [
  "전체",
  "Bucket Name",
  "Last Modified"
]

const columnOptionValue: { [key: string]: string } = {
  "Bucket Name": "_name",
  "Last Modified": "_creation_date"
}

/**
 * 현재 시각과 UTC 시각의 차이를 반환합니다.
 * @param timeStamp: UTC 시각
 */
const changeTime = (timeStamp: string) => {
  const utc = new Date(timeStamp);
  const kst = utc.setHours(utc.getHours() + 9);
  const date = new Date(kst);
  const newDate = `${date.getFullYear()}/${date.getMonth()}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} (GMT +9)`;
  return newDate
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
    let APIurl = `/bucket?page_index=${currentPage.value}&page_size=${pageSize}`;
    if (filterKeyword.value) {
      if (selectedColumn.value === '전체') {
        APIurl += `&search_keyword=${filterKeyword.value}`;
      }
      else {
        APIurl += `&search_keyword=${filterKeyword.value}&search_column=${columnOptionValue[selectedColumn.value]}`;
      }
    }
    const response: BucketsResponsebody = await restAPI.get(APIurl);
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
 * REMOVE column이 아닐 시 해당 bucket으로 이동 시키는 함수입니다.
 * @param event 이벤트
 */
const goBucket = (idx: number) => {
  router.push(`/storage/${datas.value[idx]._name}`);
}

/**
 * 삭제 진행 여부를 확인하는 함수입니다.
 */
const removeConfirm = async (name: string) => {
  if (await confirm('삭제를 진행하겠습니까?')) {
    removeBucket(name);
  }
}

/**
 * bucket을 삭제합니다.
 */
const removeBucket = async (name: string) => {
  isValid.value = false;
  const response = await restAPI.del(`/bucket/${name}`);
  if (response) {
    if (response.code === SuccessResponseCode) {
      currentPage.value = 1;
      loadedList.value = {};
      setTimeout(async () => {
        await getBucket();
        alert(`${name} is removed!`);
        isValid.value = true;
      }, 2000);
    }
    else {
      if (response.code === ErrorResponseCode) {
        alert("비어있는 버킷만 삭제가 가능합니다.");
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
.bucket-card {
  height: 100%;
}

.bucket-card-content {
  height: 83%;
}

.bucket-card-loading {
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

.services-card-bottom {
  width: 100%;
  height: 100%;
  flex-grow: 1;
}

.services-card-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 93%;
}

.service-card-item {
  height: 16%;
  padding: 14px;
  cursor: pointer;
}

.service-card-item:hover {
  background-color: rgb(21, 78, 193, 0.1);
  border-radius: 10px;
}

.va-input-label {
  font-size: medium;
}

.select-column {
  align-self: flex-end;
  margin-right: 10px;
}

.search-input {
  width: 250px;
}

.search-button {
  align-self: flex-end;
  min-width: 80px;
  margin-left: 10px;
}

.category-text {
  line-height: normal;
}
</style>