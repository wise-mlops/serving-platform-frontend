<template>
    <div class="test-page">
        <VaNavbar color="backgroundPrimary">
            <template #left>
                <h4 class="va-h5">
                    {{ pageTitle }}
                </h4>
            </template>
        </VaNavbar>
        <VaInnerLoading :loading="!isValid" class="row flex test-content">
            <VaCard outlined class="flex test-card">
                <VaCardTitle>Input</VaCardTitle>
                <VaCardContent class="test-card-content">
                    <VaInput v-model="name" label="Inference Service Name" />
                    <VaTextarea v-model="inputValue" class="test-textarea" autosize placeholder="T5 모델에 맞게 Body 값을 입력해주세요."
                        :maxRows="1" />
                </VaCardContent>
            </VaCard>
            <VaButton icon-right="arrow_forward" icon-color="#ffffff50" class="ml-2 mr-2 test-btn" @click="getResult"
                :disabled="!isText">compute</VaButton>
            <VaCard outlined class="test-card">
                <VaCardTitle>Output</VaCardTitle>
                <VaCardContent class="test-card-content">
                    <VaTextarea v-model="outputValue" class="test-textarea-result" readonly autosize
                        placeholder="compute 버튼을 눌러주세요." :maxRows="1" />
                </VaCardContent>
            </VaCard>
        </VaInnerLoading>
        <VaButton preset="primary" to="/services" class="mt-2">돌아가기</VaButton>
    </div>
</template>
<script setup>
import { SuccessResponseCode } from '~/assets/const/HttpResponseCode';

const pageTitle = ref('T5 모델 테스트')

const isValid = ref(true);
const name = ref("");
const inputValue = ref("");
const outputValue = ref("");

const isText = computed(() => {
    return name.value.length > 0 && inputValue.value.length > 0;
})

const getResult = async () => {
    try {
        isValid.value = false;
        const response = await restAPI.post(`/kserve/kubeflow-user-example-com/${name.value}/infer?model_format=T5`, inputValue.value);
        if (response) {
            if (response.code === SuccessResponseCode) {
                outputValue.value = JSON.stringify(response.result, null, 4);
            }
            else {
                outputValue.value = "에러가 발생하였습니다. API 수정 예정입니다.";
                console.log(response.message);
            }
        }
    } catch (error) {
        outputValue.value = "에러가 발생하였습니다. API 수정 예정입니다.";
        console.error('Error loading data:', error);
    }
    isValid.value = true;
}

</script>
<style scoped>
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
    height: 80%;
    width: 100%;
    margin-top: 15px;
}

.test-textarea-result {
    height: 80%;
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
    overflow: auto;
}
</style>