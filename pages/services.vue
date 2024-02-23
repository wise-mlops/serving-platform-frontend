<template>
  <div>
    <PageToolbar :pageTitle="pageTitle" :toolButtons="toolButtons" />
    <div class="row">
      <div class="px-3 flex flex-col md12 xs12 lg12">
        <VaInnerLoading :loading="!isValid">
          <VaCard outlined class="services-card">
            <VaCardTitle />
            <VaCardContent class="services-card-content">
              <VaInput :label="'SearchKeyword'" v-model="filterKeyword" class="mb-4" style="width: 300px" />
              <VaDataTable class="services-card-table" :items="datas" :columns="servicesCol" :filter="filterKeyword"
                @filtered="filtered = $event.items;" sticky-header clickable hoverable @row:click="handleClick">
                <template #cell(status)="{ rowIndex, rowData }">
                  <VaPopover message="InferenceService is Ready" placement="left-bottom" color="#154ec19e"
                    v-if="rowData.status === 'True'">
                    <VaIcon name="check_circle" color="success" />
                  </VaPopover>
                  <VaPopover :message=popoverMsg(rowData.name) placement="left-bottom" color="#154ec19e" v-else>
                    <VaProgressCircle :size="20" :thickness="0.3" indeterminate style="display: inline-block;" />
                  </VaPopover>
                </template>
                <template #cell(creationTimestamp)="{ rowIndex, rowData }">
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
import { toolButtonSample } from '~~/assets/data/toolButton'
import PageToolbar from '~~/components/PageToolBar.vue'
import { FailureResponseCode, SuccessResponseCode } from '~~/assets/const/HttpResponseCode'
import { useDebouncedRef } from '~~/composables/common';

const pageTitle = ref('Inference Services');
const toolButtons = ref(toolButtonSample);
const router = useRouter();

const currentPage = ref(1);
const filterKeyword = useDebouncedRef("", 1000);
const datas = ref([]);
const filtered = ref("");
const totalPage = ref(1);
const pageSize = 10;
const loadedList = ref({});
const isValid = ref(true);

watch(filterKeyword, async () => {
  currentPage.value = 1;
  loadedList.value = {};
  await getList();
})

const popoverMsg = (name: string) => {
  return `Configuration "${name}-predictor" does not have any ready Revision.`
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

watch(currentPage, async () => {
  await getList();
})

onMounted(async () => {
  try {
    await getList();
  } catch (error) {
    console.error('Error loading data:', error);
  }
  isValid.value = true;
})

/**
 * TEST, REMOVE column이 아닐 시 상세보기 페이지로 이동 시키는 함수입니다.
 * @param event 이벤트
 */
const handleClick = (event: any) => {
  const cellIndex = event.event.target.cellIndex;
  const status = event.item.status;
  if (cellIndex < 4) {
    if (status === 'Unknown') {
      alert(`Inference Service를 생성 중입니다.
잠시 후 새로고침을 해주세요.`);
    }
    else {
      const name = event.item.name;
      navigateTo(`/service/${name}`);
    }
  }
}

const changeTime = (rowData: any) => {
  const timeStamp: string = rowData.creationTimestamp;
  const dateTime = timeStamp.slice(0, -1).replace("T", " ");
  return dateTime
}

const goTest = async (name: string, status: string, modelFormat: string) => {
  if (status === 'True') {
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
      if (response.code === FailureResponseCode) {
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

.services-card-content {
  display: flex;
  flex-direction: column;
  height: 93%;
}

.services-card-table {
  height: 500px !important;
}
</style>