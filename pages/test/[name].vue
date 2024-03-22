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
                <VaCardTitle style="font-size: medium;">Input</VaCardTitle>
                <VaCardContent class="test-card-content">
                    <div class="input-set">
                        <VaInput v-model="input" class="test-textbox" placeholder="모델에 맞게 입력해주세요."
                            @keyup.enter="addData()" />
                        <VaButton class="input-add-button" @click=addData()>추가</VaButton>
                    </div>
                    <VaScrollContainer class="input-container" vertical>
                        <VaList>
                            <VaListItem v-for="(data, index) in inputValue" :key="index" class="list__item input-item">
                                <h6 class="va-h6 input-item-text">{{ data }}</h6>
                                <va-button icon="close" preset="secondary" color="danger" class="input-item-del"
                                    v-on:click="delBtn(index)" />
                            </VaListItem>
                        </VaList>
                    </VaScrollContainer>
                </VaCardContent>
            </VaCard>
            <VaButton icon-right="arrow_forward" icon-color="#ffffff50" class="ml-2 mr-2 test-btn" :disabled="!isText"
                @click="getResult">compute</VaButton>
            <VaCard outlined class="test-card">
                <VaCardTitle style="font-size: medium;">Output</VaCardTitle>
                <VaCardContent class="test-card-content">
                    <VaTextarea v-model="outputValue" class="test-textarea" readonly :resize="false"
                        placeholder="compute 버튼을 눌러주세요." />
                </VaCardContent>
            </VaCard>
        </VaInnerLoading>
        <VaButton preset="primary" to="/services" class="mt-2">돌아가기</VaButton>
    </div>
</template>

<script setup lang="ts">
import { SuccessResponseCode, ErrorResponseCode } from '~/assets/const/HttpResponseCode';

const route = useRoute();

definePageMeta({
    middleware: [
        'service',
    ],
});

const pageTitle = ref<string>('Inference Service 테스트')
const isValid = ref<boolean>(true);
const input = ref<string>("");
const inputValue = ref([]);
const outputValue = ref<string>("");

const isText = computed(() => {
    return inputValue.value.length > 0;
})

const addData = () => {
    const value = input.value.trim();
    if (value) {
        try {
            inputValue.value.push(JSON.parse(value));
        }
        catch {
            inputValue.value.push(value);
        }
    }
    input.value = "";
}

const delBtn = (idx: number) => {
    inputValue.value.splice(idx, 1);
}

const getResult = async () => {
    try {
        isValid.value = false;
        const response = await restAPI.post(`/kserve/${route.params.name}/infer`, inputValue.value);
        if (response) {
            if (response.code === SuccessResponseCode) {
                outputValue.value = JSON.stringify(response.result, null, 4);
            }
            else if (response.code === ErrorResponseCode) {
                outputValue.value = JSON.stringify(response.result.error, null, 4);
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

<style>
.test-page {
    height: 100%;
}

.test-content {
    height: 80%;
}

.test-card {
    height: 100%;
    width: 40%;
}

.test-card-content {
    height: 100%;
    width: 100%;
}

.input-container {
    height: 85%;
    margin-top: 10px;
}

.input-set {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
}

.input-add-button {
    min-width: 60px;
    margin-left: 10px;
}

.input-item-text {
    word-break: break-all;
    width: 95%;
    padding: 3px 8px 3px 14px;
}

.input-item:hover {
    background-color: #D3DBF3;
    border-radius: 5px;
}

.test-textbox {
    width: 60%;
}

.test-textarea {
    width: 100%;
    height: 90%;
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