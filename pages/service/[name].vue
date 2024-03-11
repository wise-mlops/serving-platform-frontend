<template>
    <div>
        <div class="row">
            <va-navbar color="backgroundPrimary">
                <template #left>
                    <h4 class="va-h5">
                        {{ pageTitle }}
                    </h4>
                </template>
            </va-navbar>
        </div>
        <div class="row">
            <div class="px-3 flex flex-col md12 xs12 lg12">
                <VaInnerLoading :loading="!isValid">
                    <VaCard outlined class="details-card">
                        <VaCardContent class="details-card-content">
                            <VaTabs v-model="selectTab">
                                <template #tabs>
                                    <VaTab v-for="(item, idx) in tabList" :key="item">
                                        {{ item.title }}
                                    </VaTab>
                                </template>
                            </VaTabs>
                            <div id="wisenut-tab-contents" v-if="selectTab === 0">
                                <div id="wisenut-tab-contents-top">
                                    <h5 class="va-h5">
                                        <VaIcon v-if="overviewStatus === 'True'" name="check_circle" color="success" />
                                        <VaIcon v-else name="warning" color="warning" />
                                        {{ $route.params.name }}
                                    </h5>
                                    <VaList class="details-list">
                                        <VaListItem v-for="(key, index) in Object.keys(overviewData.info)" :key="index"
                                            class="list__item">
                                            <div class="details-left">
                                                <h6 class="va-h6">{{ columnOptionTitle[key] }}</h6>
                                            </div>
                                            <VaListItemSection class="details-right">
                                                <VaListItemLabel v-if="key === 'status'">
                                                    <h6 class="va-h6 status-text"
                                                        v-if="overviewData.info[key] === 'True'">
                                                        <VaPopover message="Status is deduced from the Ready Condition"
                                                            class=" row align-center justify-left"
                                                            placement="left-bottom" color="#154ec19e">
                                                            <VaIcon name="check_circle" color="success" />&nbspReady
                                                        </VaPopover>
                                                    </h6>
                                                    <h6 v-else class="va-h6 status-text row align-center">
                                                        <VaPopover message="Status is deduced from the Ready Condition"
                                                            placement="left-bottom" color="#154ec19e">
                                                            <VaIcon name="warning" color="warning" />
                                                        </VaPopover>
                                                    </h6>
                                                </VaListItemLabel>
                                                <VaListItemLabel v-else>
                                                    <h6 class="va-h6">{{ overviewData.info[key] }}</h6>
                                                </VaListItemLabel>
                                            </VaListItemSection>
                                        </VaListItem>
                                    </VaList>
                                </div>
                                <div id="wisenut-tab-contents-bottom">
                                    <h5 class="va-h5">Inference Service Conditions</h5>
                                    <VaDataTable :items="overviewData.inference_service_conditions"
                                        :columns="overviewCol" sticky-header hoverable :animated="false">
                                        <template #cell(status)="{ rowIndex, rowData }">
                                            <VaPopover message="True" v-if="rowData.status === 'True'" color="primary">
                                                <VaIcon name="check_circle" color="success" />
                                            </VaPopover>
                                            <VaPopover :message=rowData.status v-else color="primary">
                                                <VaIcon name="warning" color="warning" />
                                            </VaPopover>
                                        </template>
                                        <template #cell(lastTransitionTime)="{ rowIndex, rowData }">
                                            <VaPopover :message="popoverTimeMsg(rowData.lastTransitionTime)"
                                                color="primary">{{ changeTime(rowData.lastTransitionTime) }}
                                            </VaPopover>
                                        </template>
                                    </VaDataTable>
                                </div>
                            </div>
                            <div id="wisenut-tab-contents" v-else-if="selectTab === 1">
                                <VaList v-for="(category, index1) in Object.keys(detailsData)" :key="index1"
                                    :class="category">
                                    <h5 class="va-h5" v-if="index1 === 0">
                                        <VaIcon v-if="overviewStatus === 'True'" name="check_circle" color="success" />
                                        <VaIcon v-else name="warning" color="warning" />
                                        {{ $route.params.name }}
                                    </h5>
                                    <h5 class="va-h5" v-if="index1 === 1">{{ category }}</h5>
                                    <VaListItem v-for="(key, index2) in Object.keys(detailsData[category])"
                                        :key="index2" class="list__item">
                                        <div class="details-left">
                                            <h6 class="va-h6" v-if="key in columnOptionTitle">{{ columnOptionTitle[key]
                                                }}</h6>
                                            <h6 class="va-h6" v-else>{{ key }}</h6>
                                        </div>
                                        <VaListItemSection>
                                            <VaListItemLabel v-if="key == 'status'">
                                                <h6 class="va-h6 status-text"
                                                    v-if="detailsData[category][key] === 'True'">
                                                    <VaPopover message="Status is deduced from the Ready Condition"
                                                        class=" row align-center" placement="left-bottom"
                                                        color="#154ec19e">
                                                        <VaIcon name="check_circle" color="success" />&nbspReady
                                                    </VaPopover>
                                                </h6>
                                                <h6 v-else class="va-h6 status-text row align-center">
                                                    <VaPopover message="Status is deduced from the Ready Condition"
                                                        placement="left-bottom" color="#154ec19e">
                                                        <VaIcon name="warning" color="warning" />
                                                    </VaPopover>
                                                </h6>
                                                <h6 class="va-h6" v-else>{{ detailsData[category][key] }}</h6>
                                            </VaListItemLabel>
                                            <VaListItemLabel v-else-if="key == 'creation_timestamp'">
                                                <h6 class="va-h6">
                                                    <VaPopover :message="popoverTimeMsg(detailsData[category][key])"
                                                        color="primary">{{ changeTime(detailsData[category][key]) }}
                                                    </VaPopover>
                                                </h6>
                                            </VaListItemLabel>
                                            <VaListItemLabel v-else>
                                                <h6 class="va-h6">{{ detailsData[category][key] }}</h6>
                                            </VaListItemLabel>
                                        </VaListItemSection>
                                    </VaListItem>
                                    <VaListSeparator v-if="index1 === 0" />
                                </VaList>
                            </div>
                        </VaCardContent>
                        <VaButton preset="primary" to="/services" class="mt-2">돌아가기</VaButton>
                    </VaCard>
                </VaInnerLoading>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { SuccessResponseCode } from '~/assets/const/HttpResponseCode';
import { columnOptionTitle } from '~/composables/columns';

interface COLUMNS {
    icon?: string,
    title: string,
    data: object
};

definePageMeta({
    middleware: [
        'service',
    ],
});

const route = useRoute();

const pageTitle = ref<string>('Inference Service 상세 보기')
const selectTab = ref<number>(0);
const overviewStatus = ref<string>('');
const isValid = ref<boolean>(true);
const overviewData = ref<DetailOverview>({
    info: {
        status: 'True',
        api_url: '',
        storage_uri: '',
        model_format: ''
    },
    inference_service_conditions: []
})
const detailsData = ref<DetailDetails>({
    info: {
        status: 'True',
        name: '',
        namespace: '',
        url: '',
        annotations: {
            'sidecar.istio.io/inject': ''
        },
        creation_timestamp: ''
    },
    predictor_spec: {
        storage_uri: '',
        model_format: '',
        service_account: ''
    }
})

const tabList: COLUMNS[] = [
    { title: "Overview", data: {} },
    { title: "Details", data: {} }
];

onMounted(async () => {
    try {
        isValid.value = false;
        const response: InferenceServiceDetailResponsebody = await restAPI.get(`/kserve/detail/${route.params.name}`);
        if (response) {
            if (response.code === SuccessResponseCode) {
                overviewData.value = response.result.overview;
                overviewStatus.value = response.result.overview.info.status;
                detailsData.value = response.result.details;
            }
            else {
                console.log(response.message);
            }
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
    isValid.value = true;
})

const popoverTimeMsg = (time: string) => {
    const msg = `Local:  ${new Date(time)}
  UTC:  ${time}`
    return msg
}

const changeTime = (timeStamp: string) => {
    const date = new Date(timeStamp);
    const timeDiff = nowTimeDiff(date);
    return timeDiff
}
</script>

<style scoped>
.details-card {
    height: 700px;
}

.details-card-content {
    height: 100%;
}

.details-left {
    width: 20%;
}

#wisenut-tab-contents {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 80%;
    margin: 5px;
}

#wisenut-tab-contents-top {
    height: 40%;
}

.list__item {
    width: 100%;
}

#wisenut-tab-contents-bottom {
    height: 60%;
}

.list__item+.list__item {
    margin-top: 2px;
    border-top: 1px solid #e6e9ec;
}

.spec {
    height: 40%;
}

.va-list-item-label>.va-h6 {
    color: #797373;
}

.status-text {
    width: 90px;
}
</style>