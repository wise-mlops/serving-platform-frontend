<template>
    <div class="test-page">
        <VaNavbar color="backgroundPrimary">
            <template #left>
                <h4 class="va-h5">
                    {{ pageTitle }}
                </h4>
            </template>
        </VaNavbar>
        <div class="row flex test-content">
            <VaCard outlined class="flex test-card">
                <VaCardTitle>Input</VaCardTitle>
                <VaCardContent class="test-card-content">
                    <VaTextarea v-model="inputValue" class="test-textarea" autosize placeholder="모델에 맞게 입력해주세요." />
                </VaCardContent>
            </VaCard>
            <VaButton icon-right="arrow_forward" icon-color="#ffffff50" class="ml-2 mr-2 test-btn" @click="getResult">
                compute</VaButton>
            <VaCard outlined class="test-card">
                <VaCardTitle>Output</VaCardTitle>
                <VaCardContent class="test-card-content">
                    <pre>{{ outputValue }}</pre>
                </VaCardContent>
            </VaCard>
        </div>
        <VaButton preset="primary" to="/services" class="mt-2">돌아가기</VaButton>
    </div>
</template>
<script setup>
import { SuccessResponseCode } from '~/assets/const/HttpResponseCode';
const route = useRoute();

const pageTitle = ref('Inference Service 테스트')

const isValid = ref(true);
const inputValue = ref(xgboostExample);
const outputValue = ref("");
const xgboostExample = `[
    [6.8, 2.8, 4.8, 1.4],
    [6.0, 3.4, 4.5, 1.6]
]`
const modelFormat = route.query.model_format;

const getResult = async () => {
    try {
        isValid.value = false;
        const response = await restAPI.post(`/kserve/kubeflow-user-example-com/${route.params.name}/infer?model_format=${modelFormat}`, inputValue.value);
        if (response) {
            if (response.code === SuccessResponseCode) {
                outputValue.value = response.result;
            }
            else {
                console.log(response.message);
            }
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
    isValid.value = true;
}

</script>
<style>
.test-page {
    height: 100%;
}

.test-content {
    height: 80%;
}

.test-card {
    width: 40%;
}

.test-card-content {
    height: 100%;
}

.test-textarea {
    height: 90%;
    width: 100%;
}

.test-btn {
    height: 50px;
    width: 100px;
    align-self: center;
}

pre {
    font-size: large;
    line-height: normal;
}
</style>