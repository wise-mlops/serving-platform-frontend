<template>
  <div>
    <VaNavbar color="backgroundPrimary">
      <template #left>
        <h4 class="va-h5">
          <VaBreadcrumbs>
            <VaBreadcrumbsItem v-for="(folder, index) in pathList" :label="folder" :href="makePath(1, index + 1)"
              class="navigate-link" />
          </VaBreadcrumbs>
        </h4>
      </template>

      <template #right>
        <VaButton @click="showModal = !showModal" class="ml-2" icon="upload">
          upload
        </VaButton>
      </template>
    </VaNavbar>
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
              <VaDataTable class="services-card-table" :items="datas" :columns="storageCol"
                @filtered="filtered = $event.items;" sticky-header clickable hoverable @row:click="selectPath">

                <template #cell(_object_name)="{ rowIndex, rowData }">
                  <span class="name-area">
                    <VaIcon name="folder" class="mr-1" color="primary" v-if="rowData._object_name.slice(-1) === '/'" />
                    <VaIcon name="description" class="mr-1" color="primary" v-else />
                    {{ getName(rowData._object_name)[1] }}
                  </span>
                </template>

                <template #cell(_last_modified)="{ rowIndex, rowData }">
                  <VaPopover :message="popoverTimeMsg(rowData._last_modified)" color="primary"
                    v-if="rowData._last_modified">{{ changeTime(rowData._last_modified) }}</VaPopover>
                </template>

                <template #cell(remove)="{ rowIndex, rowData }">
                  <VaButton size="small" class="px-2" @click="removeItem(rowData._object_name)">삭제</VaButton>
                </template>
              </VaDataTable>
              <VaPagination v-model="currentPage" :pages="totalPage" :visible-pages="5" gapped />
            </VaCardContent>
          </VaCard>
        </VaInnerLoading>
      </div>
    </div>
    <VaModal v-model="showModal" ok-text="업로드" cancel-text="취소" :before-ok="beforeOk" max-height="442px" fixed-layout>
      <h4 class="va-h4">
        Upload Object
      </h4>
      <VaFileUpload v-model="uploadedFile" dropzone class="mt-2 file-upload-area" />
    </VaModal>
  </div>
</template>

<script setup lang="ts">
import { storageCol } from '~~/composables/columns';
import { NotFoundErrorResponseCode, SuccessResponseCode } from '~~/assets/const/HttpResponseCode'
import { useDebouncedRef } from '~~/composables/common';

const route = useRoute();
const routePath = route.path;

const pathList = ref([]);
const currentPage = ref(1);
const datas = ref([]);
const filtered = ref("");
const totalPage = ref(1);
const pageSize = 10;
const loadedList = ref({});
const isValid = ref(true);
const selectedColumn = ref("전체")
const selectedBucket = ref("");
const currentPath = ref("");
const showModal = ref(false);
const uploadedFile = ref([]);

const columnSearchOptions = [
  "전체",
  "Name",
  "Size",
  "Last Modified"
]

const columnOptionValue = {
  Name: "_object_name",
  Size: "_size",
  "Last Modified": "_last_modified"
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
 * path를 만드는 함수입니다.
 * @param start: 시작 index
 * @param end: 끝 index
 */
const makePath = (start: number, end: number) => {
  let result = "";
  for (let i = start; i < end; i += 1) {
    result += "/" + pathList.value[i];
  }
  return result + "/";
}

/**
 * 페이지가 로드될 때 해당 directory의 파일과 폴더 리스트를 가져옵니다.
 */
onMounted(async () => {
  activeRouteName.value = routePath;
  pathList.value = routePath.split("/");
  selectedBucket.value = pathList.value[2];
  currentPath.value = makePath(3, pathList.value.length).slice(1);
  try {
    await getFiles();
  } catch (error) {
    console.error('Error loading data:', error);
  }
  isValid.value = true;
})

const getName = (name: string) => {
  const objectName = name.split("/");
  if (name.slice(-1) === '/') {
    return ["folder", objectName.at(-2)];
  }
  return ["file", objectName.at(-1)];
}

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
//     await getFiles();
//   }
// })
// watch(filterKeyword, async () => {
//   currentPage.value = 1;
//   loadedList.value = {};
//   await getFiles();
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
  await getFiles();
}

/**
 * 페이지의 변화가 있을 때 해당 directory의 파일과 폴더 리스트를 가져옵니다.
 */
watch(currentPage, async () => {
  await getFiles();
})

/**
 * 해당 directory의 파일과 폴더 리스트를 가져오는 함수입니다.
 */
const getFiles = async () => {
  isValid.value = false;
  if (currentPage.value in loadedList.value) {
    datas.value = loadedList.value[currentPage.value];
  }
  else {
    let APIurl;
    if (filterKeyword.value) {
      if (selectedColumn.value === '전체') {
        APIurl = `/bucket/object/${selectedBucket.value}?prefix=${currentPath.value}&recursive=false&page=${currentPage.value}&search_query=${filterKeyword.value}`;
      }
      else {
        APIurl = `/bucket/object/${selectedBucket.value}?prefix=${currentPath.value}&recursive=false&page=${currentPage.value}&search_query=${filterKeyword.value}&col_query=${columnOptionValue[selectedColumn.value]}`;
      }
    }
    else {
      if (currentPath.value === '/') {
        APIurl = `/bucket/object/${selectedBucket.value}?recursive=false&page=${currentPage.value}`;
      }
      else {
        APIurl = `/bucket/object/${selectedBucket.value}?prefix=${currentPath.value}&recursive=false&page=${currentPage.value}`;
      }
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
 * REMOVE column이 아니고, 폴더일 시 해당 directory로 이동 시키는 함수입니다.
 * @param event 이벤트
 */
const selectPath = (event: any) => {
  const cellIndex = event.event.target.cellIndex;
  if (cellIndex < 3) {
    const name = event.item._object_name;
    let next = getName(name);
    if (next[0] === "folder") {
      if (routePath.at(-1) === '/') {
        navigateTo(`${routePath}${next[1]}/`);
      }
      else {
        navigateTo(`${routePath}/${next[1]}/`);
      }
    }
    else {
      alert("파일 정보 보여주기?")
    }
  }
}

/**
 * object를 삭제합니다.
 */
const removeItem = async (name: string) => {
  isValid.value = false;
  const response = await restAPI.del(`/bucket/object/${selectedBucket.value}?object_name=${name}`);
  if (response) {
    if (response.code === SuccessResponseCode) {
      alert(`${name} is removed!`);
      currentPage.value = 1;
      loadedList.value = {};
      setTimeout(async () => {
        await getFiles();
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

watch(showModal, () => {
  uploadedFile.value = [];
})

const beforeOk = (hide) => {
  uploadObject(hide);
}

/**
 * object를 업로드하는 함수입니다.
 */
const uploadObject = async (hide) => {
  isValid.value = false;
  if (uploadedFile.value.length > 0) {
    const data = new FormData();
    data.append("file", uploadedFile.value);
    const response = await restAPI.usePost(`/bucket/object/${selectedBucket.value}`, data);
    if (response) {
      if (response.code === SuccessResponseCode) {
        if (response.result) {
          currentPage.value = 1;
          loadedList.value = {};
          alert('업로드가 완료되었습니다.');
          await getFiles();
        }
      }
      else {
        console.log(response.message);
      }
    }
    hide();
  }
  else {
    alert('업로드된 파일이 없습니다.');
  }
  isValid.value = true;
}

</script>

<style>
.navigate-link {
  text-wrap: nowrap;
}

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