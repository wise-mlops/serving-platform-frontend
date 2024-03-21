<template>
  <div class="storage-card">
    <VaNavbar color="backgroundPrimary">
      <template #left>
        <h4 class="va-h5 navigate-links">
          <VaBreadcrumbs>
            <VaBreadcrumbsItem v-for="(folder, index) in pathList" :key="index">
              <NuxtLink :to="makePath(0, index + 1)" class="navigate-link">{{ folder }}</NuxtLink>
            </VaBreadcrumbsItem>
            <VaBreadcrumbsItem>
              <VaChip @click="showInput = !showInput" icon="create_new_folder" flat v-if="!showInput">new path</VaChip>
              <VaInput v-model="newPath" placeholder="new path name" v-if="showInput" @blur="loseFocus()"
                :autofocus="true" @keyup.enter="moveNewPath()" />
            </VaBreadcrumbsItem>
          </VaBreadcrumbs>
        </h4>
      </template>

      <template #right>
        <VaButton @click="showModal = !showModal" icon="upload">업로드</VaButton>
        <VaButton @click="download()" icon="download" :disabled="!selectClicked" class="ml-2">다운로드</VaButton>
        <VaButton @click="removeConfirm()" color="danger" preset="primary" border-color="danger" icon="delete"
          class="ml-2" :disabled="!selectClicked">삭제</VaButton>
      </template>
    </VaNavbar>
    <div class="px-3 md12 xs12 lg12 storage-card-content">
      <VaInnerLoading :loading="!isValid" class="storage-card-loading">
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
            <VaDataTable class="services-card-table" :items="datas" :columns="storageCol" selectable
              v-model="selectedObjects" @filtered="filtered = $event.items;" sticky-header clickable hoverable
              @row:click="selectPath" @columnSorted="sortList">

              <template #cell(_object_name)="{ rowIndex, rowData }">
                <span class="name-area clickable">
                  <VaIcon name="folder" class="mr-1 clickable" color="primary"
                    v-if="rowData._object_name.slice(-1) === '/'" />
                  <VaIcon name="description" class="mr-1 clickable" color="primary" v-else />
                  <VaPopover :message="rowData._object_name" color="primary" class="clickable"> {{
              getFName(rowData._object_name) }}
                  </VaPopover>
                </span>
              </template>

              <template #cell(_last_modified)="{ rowIndex, rowData }">
                <VaPopover :message="popoverTimeMsg(rowData._last_modified)" color="primary"
                  v-if="rowData._last_modified">{{ changeTime(rowData._last_modified) }}</VaPopover>
              </template>
              <template #cell(share)="{ rowIndex, rowData }">
                <VaIcon name="share" color="primary" @click="copyURL(rowData._object_name)" size="large" />
              </template>
            </VaDataTable>
            <VaPagination v-model="currentPage" :pages="totalPage" :visible-pages="5" gapped />
          </VaCardContent>
        </VaCard>
      </VaInnerLoading>
    </div>
    <VaModal v-model="showModal" ok-text="업로드" cancel-text="취소" :before-ok="beforeOk" max-height="442px" fixed-layout>
      <VaInnerLoading :loading="!isValid">
        <h4 class="va-h4">
          Upload Object
        </h4>
        <VaFileUpload v-model="uploadedFile" dropzone class="mt-2 file-upload-area" />
      </VaInnerLoading>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
import { storageCol } from '~~/composables/columns';
import { DuplicatedErrorResponseCode, NotFoundErrorResponseCode, SuccessResponseCode } from '~~/assets/const/HttpResponseCode'
import { useDebouncedRef } from '~~/composables/common';
import { useModal } from 'vuestic-ui'
const { confirm } = useModal()

const route = useRoute();
const routePath = route.path;

const pathList = ref<string[]>([]);
const currentPage = ref<number>(1);
const datas = ref<ObjectDetail[]>([]);
const filtered = ref<string>("");
const totalPage = ref<number>(1);
const pageSize: number = 10;
const loadedList = ref<{ [key: number]: ObjectDetail[] }>({});
const isValid = ref<boolean>(true);
const selectedColumn = ref<string>("전체")
const selectedBucket = ref<string>("");
const currentPath = ref<string>("");
const showModal = ref<boolean>(false);
const uploadedFile = ref<File[]>([]);
const newPath = ref<string>("");
const showInput = ref<boolean>(false);
const selectedObjects = ref<ObjectDetail[]>([]);
const selectClicked = ref<boolean>(false);
const sortedOption = ref<string>("");

const columnSearchOptions: string[] = [
  "전체",
  "Name",
  "Size",
  "Last Modified"
]

const columnOptionValue: { [key: string]: string } = {
  Name: "_object_name",
  Size: "_size",
  "Last Modified": "_last_modified"
}

const popoverTimeMsg = (time: string) => {
  const utc = new Date(time);
  const kst = utc.setHours(utc.getHours() + 9);
  const date = new Date(kst);
  const msg = `Local:  ${new Date(date)}
    UTC:  ${time}`
  return msg
}

/**
 * 현재 시각과 UTC 시각의 차이를 반환합니다.
 * @param timeStamp: UTC 시각
 */
const changeTime = (timeStamp: string) => {
  const utc = new Date(timeStamp);
  const kst = utc.setHours(utc.getHours() + 9);
  const date = new Date(kst);
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
    result += pathList.value[i] + "/";
  }
  return result;
}

/**
 * 클릭된 object가 있는지 확인합니다.
 */
watch(selectedObjects, () => {
  if (selectedObjects.value.length > 0) {
    selectClicked.value = true;
  }
  else {
    selectClicked.value = false;
  }
})

/**
 * 페이지가 로드될 때 해당 directory의 파일과 폴더 리스트를 가져옵니다.
 */
onMounted(async () => {
  activeRouteName.value = routePath;
  pathList.value = routePath.split("/");
  if (pathList.value.at(-1) === '') {
    pathList.value.pop();
  }
  selectedBucket.value = pathList.value[2];
  currentPath.value = makePath(3, pathList.value.length);
  try {
    await getFiles();
  } catch (error) {
    console.error('Error loading data:', error);
  }
  isValid.value = true;
})

const sortList = async (event) => {
  const colName = event.columnName;
  const sortValue = event.value;
  loadedList.value = {};
  if (sortValue) {
    if (sortValue === 'asc') {
      sortedOption.value = `&sort=true&sort_column=${colName}`
    }
    else if (sortValue === "desc") {
      sortedOption.value = `&sort=false&sort_column=${colName}`
    }
  }
  else {
    sortedOption.value = ''
  }
  try {
    await getFiles();
  } catch (error) {
    console.error('Error sorting data:', error);
  }
}

/**
 * file인지 folder인지 알려주는 함수입니다.
 * @param name object name
 */
const getFType = (name: string): "file" | "folder" => {
  if (name.at(-1) === "/") {
    return "folder"
  }
  return "file"
}

/**
 * path를 제외한 해당 file 혹은 folder의 이름을 알려주는 함수입니다.
 * @param name object name
 */
const getFName = (name: string): string => {
  const nameSplit: string[] = name.split("/");
  if (getFType(name) === "folder") {
    return nameSplit.at(-2) || '';
  }
  return nameSplit.at(-1) || '';
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
 * new path를 입력하는 input box에 focus를 잃을 때 input box를 숨깁니다.
 */
const loseFocus = () => {
  showInput.value = !showInput.value;
  newPath.value = "";
}

/**
 * 입력한 new path로 이동하는 함수입니다.
 */
const moveNewPath = () => {
  let url = routePath;
  if (getFType(routePath) === "folder") {
    url += newPath.value;
  }
  else {
    url += '/' + newPath.value;
  }
  navigateTo(url);
}

/**
 * 해당 directory의 파일과 폴더 리스트를 가져오는 함수입니다.
 */
const getFiles = async () => {
  isValid.value = false;
  if (currentPage.value in loadedList.value) {
    datas.value = loadedList.value[currentPage.value];
  }
  else {
    let APIurl = `/bucket/object/${selectedBucket.value}?page_index=${currentPage.value}&page_size=${pageSize}&`;
    if (filterKeyword.value) {
      if (selectedColumn.value === '전체') {
        APIurl += `prefix=${currentPath.value}&recursive=true&search_keyword=${filterKeyword.value}${sortedOption.value}`;
      }
      else {
        APIurl += `prefix=${currentPath.value}&recursive=true&search_keyword=${filterKeyword.value}&search_column=${columnOptionValue[selectedColumn.value]}${sortedOption.value}`;
      }
    }
    else {
      if (currentPath.value) {
        APIurl += `prefix=${currentPath.value}&recursive=false${sortedOption.value}`;
      }
      else {
        APIurl += `recursive=false${sortedOption.value}`;
      }
    }
    const response: ObjectsResponsebody = await restAPI.get(APIurl);
    if (response) {
      if (response.code === SuccessResponseCode) {
        datas.value = response.result.result_details
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
 * Checkbox, Download, Share column이 아니고, 폴더일 시 해당 directory로 이동 시키는 함수입니다.
 * @param event 이벤트
 */
const selectPath = (event: any) => {
  const cellIndex = event.event.target.cellIndex;
  const parentCellIndex = event.event.target.parentNode.cellIndex;
  const grandParentCellIndex = event.event.target.parentNode.parentNode.cellIndex;
  if ((cellIndex > 0 && cellIndex < 4) || (parentCellIndex > 0 && parentCellIndex < 4) || (grandParentCellIndex > 0 && grandParentCellIndex < 4)) {
    const name = event.item._object_name;
    if (getFType(name) === "folder") {
      const fName = getFName(name);
      if (routePath.at(-1) === '/') {
        navigateTo(`${fName}`);
      }
      else {
        navigateTo(`${routePath}/${fName}/`);
      }
    }
  }
}

/**
 * 삭제 진행 여부를 확인하는 함수입니다.
 */
const removeConfirm = async () => {
  if (await confirm('삭제를 진행하겠습니까?')) {
    removeItem();
  }
}

/**
 * object를 삭제합니다.
 */
const removeItem = async () => {
  isValid.value = false;
  const removeItems: string[] = [];
  selectedObjects.value.forEach(obj => {
    removeItems.push(`object_name=${obj._object_name}`);
  });
  const removeQuery: string = removeItems.join('&');
  try {
    const response = await restAPI.del(`/bucket/object/${selectedBucket.value}?${removeQuery}`);
    if (response) {
      if (response.code === SuccessResponseCode) {
        currentPage.value = 1;
        loadedList.value = {};
        setTimeout(async () => {
          await getFiles();
          alert('삭제가 완료되었습니다.');
          isValid.value = true;
        }, 1000);
      }
      else {
        if (response.code === NotFoundErrorResponseCode) {
          alert('잘못된 요청입니다.');
        }
        console.log(response.message);
        isValid.value = true;
      }
    }
  }
  catch (error) {
    console.error(error);
    isValid.value = true;
  }
}

/**
 * object를 다운로드합니다.
 */
const download = async () => {
  isValid.value = false;
  try {
    let objects: string[] = []
    selectedObjects.value.forEach(obj => {
      objects.push(`object_names=${obj._object_name}`);
    });
    const objectsQuery: string = objects.join('&');
    const APIurl = `/bucket/object/${selectedBucket.value}/download?${objectsQuery}`;
    const response = await restAPI.get(APIurl);
    const baseURL = useRuntimeConfig().public.baseURL;
    const downloadLink = document.createElement("a");
    downloadLink.href = baseURL + APIurl;
    downloadLink.download = currentPath.value;
    downloadLink.click();
  }
  catch (error) {
    // console.error(error);
  }
  finally {
    isValid.value = true;
  }
}

/**
 * modal창에서 벗어났을 때 업로드한 파일이 사라집니다.
 */
watch(showModal, () => {
  uploadedFile.value = [];
})

/**
 * modal창에서 업로드 버튼을 클릭 시 발생하는 함수입니다.
 */
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
    uploadedFile.value.forEach(file => {
      data.append("file", file);
    });
    let url;
    const uploadPath = currentPath.value.slice(0, -1);
    if (uploadPath) {
      url = `/bucket/object/${selectedBucket.value}?folder_path=${uploadPath}`;
    }
    else {
      url = `/bucket/object/${selectedBucket.value}`;
    }
    try {
      hide();
      const response = await restAPI.post(url, data);
      if (response) {
        if (response.code === SuccessResponseCode) {
          const res = response.result;
          const successNum = res.succeeded.length;
          const failNum = res.failed.length;
          if (successNum > 0 && failNum === 0) {
            alert('업로드가 완료되었습니다.');
          }
          else {
            alert(`파일 업로드가 실패하였습니다.
업로드 실패한 파일 목록
- ${res.failed.join('\n- ')}`)
          }
          currentPage.value = 1;
          loadedList.value = {};
          setTimeout(async () => {
            await getFiles();
            isValid.value = true;
          }, 2000);
        }
        else if (response.code === DuplicatedErrorResponseCode) {
          alert(response.result);
          isValid.value = true;
        }
        else {
          console.log(response.message);
          isValid.value = true;
        }
      }
    }
    catch (error) {
      console.error('Error uploading data: ', error);
      isValid.value = true;
    }
  }
  else {
    alert('업로드된 파일이 없습니다.');
    isValid.value = true;
  }
}

const copyURL = async (name: string) => {
  const storageUrl = "s3://" + selectedBucket.value + "/" + currentPath.value + getFName(name);
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(storageUrl);
      alert("클립보드에 uri가 복사되었습니다.");
    } catch (error) {
      console.error(error);
      alert("클립보드에 uri가 복사되지 않았습니다.");
    }
  } else {
    const textArea = document.createElement("textarea");
    textArea.value = storageUrl;

    textArea.style.position = "absolute";
    textArea.style.left = "-999999px";

    document.body.prepend(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      alert("클립보드에 uri가 복사되었습니다.");
    } catch (error) {
      console.error(error);
      alert("클립보드에 uri가 복사되지 않았습니다.");
    } finally {
      textArea.remove();
    }
  }
}

</script>

<style>
.navigate-links,
.navigate-link {
  text-wrap: nowrap;
  color: black;
}

.navigate-link:hover {
  color: #154EC1;
}

.storage-card {
  height: 100%;
}

.storage-card-content {
  height: 83%;
}

.storage-card-loading {
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