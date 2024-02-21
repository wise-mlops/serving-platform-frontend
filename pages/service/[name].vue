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
                        <VaCardContent class="details-card-content" v-if="serviceStatus === 'success'">
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
                                        <VaIcon v-if="overviewStatus === 'False'" name="warning" color="warning" />
                                        {{ $route.params.name }}
                                    </h5>
                                    <VaList class="details-list">
                                        <VaListItem v-for="(key, index) in Object.keys(OverviewData.Info)" :key="index"
                                            class="list__item">
                                            <div class="details-left">
                                                <h6 class="va-h6">{{ key }}</h6>
                                            </div>
                                            <VaListItemSection class="details-right">
                                                <VaListItemLabel v-if="key === 'Status'">
                                                    <h6 class="va-h6" v-if="OverviewData.Info[key] === 'True'">
                                                        <VaPopover message="Status is deduced from the Ready Condition"
                                                            class=" row align-center justify-left" placement="left-bottom"
                                                            color="#154ec19e">
                                                            <VaIcon name="check_circle" color="success" />&nbspReady
                                                        </VaPopover>
                                                    </h6>
                                                    <h6 v-else-if="OverviewData.Info[key] === 'False'"
                                                        class="va-h6 row align-center">
                                                        <VaPopover message="Status is deduced from the Ready Condition"
                                                            placement="left-bottom" color="#154ec19e">
                                                            <VaIcon name="warning" color="warning" />
                                                        </VaPopover>
                                                    </h6>
                                                    <h6 class="va-h6" v-else>{{ OverviewData.Info[key] }}</h6>
                                                </VaListItemLabel>
                                                <VaListItemLabel v-else>
                                                    <h6 class="va-h6">{{ OverviewData.Info[key] }}</h6>
                                                </VaListItemLabel>
                                            </VaListItemSection>
                                        </VaListItem>
                                    </VaList>
                                </div>
                                <div id="wisenut-tab-contents-bottom">
                                    <h5 class="va-h5">InferenceService Conditions</h5>
                                    <VaDataTable :items="OverviewData['InferenceService Conditions']" :columns="overviewCol"
                                        sticky-header hoverable :animated="false">
                                        <template #cell(status)="{ rowIndex, rowData }">
                                            <VaPopover message="True" v-if="rowData.status === 'True'" color="primary">
                                                <VaIcon name="check_circle" color="success" />
                                            </VaPopover>
                                            <VaPopover message="False" v-else-if="rowData.status === 'False'"
                                                color="primary">
                                                <VaIcon name="warning" color="warning" />
                                            </VaPopover>
                                            <h6 class="va-h6" v-else>{{ rowData.status }}</h6>
                                        </template>
                                        <template #cell(lastTransitionTime)="{ rowIndex, rowData }">
                                            {{ changeTime(rowData.lastTransitionTime) }}
                                        </template>
                                    </VaDataTable>
                                </div>
                            </div>
                            <div id="wisenut-tab-contents" v-else-if="selectTab === 1">
                                <VaList v-for="(category, index1) in Object.keys(DetailsData)" :key="index1"
                                    :class="category">
                                    <h5 class="va-h5" v-if="index1 === 0">
                                        <VaIcon v-if="overviewStatus === 'True'" name="check_circle" color="success" />
                                        <VaIcon v-if="overviewStatus === 'False'" name="warning" color="warning" />
                                        {{ $route.params.name }}
                                    </h5>
                                    <h5 class="va-h5" v-if="index1 === 1">{{ category }}</h5>
                                    <VaListItem v-for="(key, index2) in Object.keys(DetailsData[category])" :key="index2"
                                        class="list__item">
                                        <div class="details-left">
                                            <h6 class="va-h6">{{ key }}</h6>
                                        </div>
                                        <VaListItemSection>
                                            <VaListItemLabel v-if="key == 'Status'">
                                                <h6 class="va-h6" v-if="DetailsData[category][key] === 'True'">
                                                    <VaPopover message="Status is deduced from the Ready Condition"
                                                        class=" row align-center" placement="left-bottom" color="#154ec19e">
                                                        <VaIcon name="check_circle" color="success" />&nbspReady
                                                    </VaPopover>
                                                </h6>
                                                <h6 v-else-if="DetailsData[category][key] === 'False'"
                                                    class="va-h6 row align-center">
                                                    <VaPopover message="Status is deduced from the Ready Condition"
                                                        placement="left-bottom" color="#154ec19e">
                                                        <VaIcon name="warning" color="warning" />
                                                    </VaPopover>
                                                </h6>
                                                <h6 class="va-h6" v-else>{{ DetailsData[category][key] }}</h6>
                                            </VaListItemLabel>
                                            <VaListItemLabel v-else-if="key == 'creationTimestamp'">
                                                <h6 class="va-h6">{{ changeTime(DetailsData[category][key]) }}</h6>
                                            </VaListItemLabel>
                                            <VaListItemLabel v-else>
                                                <h6 class="va-h6">{{ DetailsData[category][key] }}</h6>
                                            </VaListItemLabel>
                                        </VaListItemSection>
                                    </VaListItem>
                                    <VaListSeparator v-if="index1 === 0" />
                                </VaList>
                            </div>
                        </VaCardContent>
                        <VaCardContent class="details-card-content" v-if="serviceStatus !== 'success'">
                            <h6 class="va-h6">
                                <span class="va-text-highlighted">{{ $route.params.name }}</span>라는 Inference Service가 존재하지
                                않습니다.
                            </h6>
                            <h6 class="va-h6">Inference Service 이름을 다시 한번 확인해주세요.</h6>
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

interface COLUMNS {
    icon?: string,
    title: string,
    data: object
};

interface Props {
    columns: COLUMNS[]
};

const route = useRoute();

const OverviewData = ref({
    Info: '',
    'InferenceService Conditions': []
})

const DetailsData = ref({
    Info: '',
    'Predictor: spec': ''
})

const pageTitle = ref('Inference Service 상세 보기')
const selectTab = ref(0);
const overviewStatus = ref('');
const isValid = ref(true);
const serviceStatus = ref('success');

const tabList: COLUMNS[] = [
    { title: "Overview", data: {} },
    { title: "Details", data: {} }
];

onMounted(async () => {
    try {
        isValid.value = false;
        const response = await restAPI.get(`/kserve/detail/${route.params.name}`);
        if (response) {
            if (response.code === SuccessResponseCode) {
                OverviewData.value = response.result.OVERVIEW;
                overviewStatus.value = response.result.OVERVIEW.Info.Status;
                DetailsData.value = response.result.DETAILS;
            }
            else {
                serviceStatus.value = 'not found';
                console.log(response.message);
            }
        }
    } catch (error) {
        serviceStatus.value = 'error';
        console.error('Error loading data:', error);
    }
    isValid.value = true;
})

const changeTime = (timeStamp: string) => {
    const dateTime = timeStamp.slice(0, -1).replace("T", " ");
    return dateTime
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
    height: 90%;
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
</style>