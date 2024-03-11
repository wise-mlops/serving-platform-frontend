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
                <VaCardTitle style="font-size: medium;">
                    <VaRadio v-model="inputMode" :options="inputRadio" value-by="value" />
                </VaCardTitle>
                <VaCardContent class="test-card-content" v-if="inputMode === 0">
                    <div class="input-set">
                        <VaInput v-model="inputValue.role" class="test-inputbox" placeholder="role을 입력해주세요."
                            @keyup.enter="addData()" label="role" />
                        <VaTextarea v-model="inputValue.content" class="test-textbox" autosize
                            placeholder="content를 입력해주세요." :maxRows="1" label="Content" @keyup.enter="addData()" />
                        <VaButton class="input-add-button" @click=addData() :disabled="!isText">추가</VaButton>
                    </div>
                    <VaScrollContainer class="input-container" vertical>
                        <VaList>
                            <VaListItem v-for="(data, index) in inputValueList" :key="index" class="input-item">
                                <h6 class="va-h6 input-item-text">{{ data }}</h6>
                                <va-button icon="close" preset="secondary" color="danger" class="input-item-del"
                                    v-on:click="delBtn(index)" />
                            </VaListItem>
                        </VaList>
                    </VaScrollContainer>
                </VaCardContent>
                <VaCardContent class="test-card-content" v-else-if="inputMode === 1">
                    <JsonEditorVue v-model="inputTextValue" />
                </VaCardContent>
            </VaCard>
            <VaButton icon-right="arrow_forward" icon-color="#ffffff50" class="ml-2 mr-2 test-btn" @click="getResult"
                :disabled="!isValue">compute</VaButton>
            <VaCard outlined class="test-card">
                <VaCardTitle style="font-size: medium;">Output</VaCardTitle>
                <VaCardContent class="test-card-content">
                    <VaTextarea v-model="outputValue" class="test-textarea" readonly autosize
                        placeholder="compute 버튼을 눌러주세요." :maxRows="1" />
                </VaCardContent>
            </VaCard>
        </VaInnerLoading>
        <VaButton preset="primary" to="/services" class="mt-2">돌아가기</VaButton>
    </div>
</template>

<script setup lang="ts">
import { SuccessResponseCode } from '~/assets/const/HttpResponseCode';
import JsonEditorVue from '~/components/JsonEditorVue.vue';

const route = useRoute();

const pageTitle = ref<string>('T5 모델 테스트')
const isValid = ref<boolean>(true);
const name = ref<string>("nlp-torchserve");
const inputTextValue = ref();
const inputValue = ref<{ role: string, content: string }>({
    role: "",
    content: ""
});
const inputValueList = ref([])
const outputValue = ref<string>("");
const inputMode = ref<number>(0);
const inputRadio: { text: string, value: number }[] = [{ text: "모드 1", value: 0 }, { text: "모드 2", value: 1 }]

const isText = computed(() => {
    const roleLength = inputValue.value.role.trim().length
    const contentLength = inputValue.value.content.trim().length
    return roleLength > 0 && contentLength > 0;
})

const isValue = computed(() => {
    try {
        if (inputMode.value === 0) {
            return inputValueList.value.length > 0
        }
        return inputTextValue.value.length > 0
    } catch (error) {
        return false;
    }
})

onMounted(() => {
    activeRouteName.value = route.path;
})

watch(inputMode, () => {
    if (inputMode.value === 0) {
        inputTextValue.value = ref().value;
    }
    if (inputMode.value === 1) {
        inputValueList.value = []
    }
})

const getResult = async () => {
    try {
        isValid.value = false;
        let body;
        if (inputMode.value === 0) {
            body = inputValueList.value;
        }
        else if (inputMode.value === 1) {
            body = inputTextValue.value
        }
        const response = await restAPI.post(`/kserve/kubeflow-user-example-com/${name.value}/infer?model_format=T5`, body);
        if (response) {
            if (response.code === SuccessResponseCode) {
                outputValue.value = JSON.stringify(JSON.parse(response.result), null, 4);
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

const addData = () => {
    try {
        inputValueList.value.push(JSON.parse(inputValue.value));
    }
    catch {
        inputValueList.value.push(inputValue.value);
    }
    inputValue.value = {
        role: "",
        content: ""
    };
}

const delBtn = (idx: number) => {
    inputValueList.value.splice(idx, 1);
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
    max-height: 100%;
}

.test-card-content {
    height: 100%;
}

.test-textbox {
    height: 60%;
    width: 100%;
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
    overflow: auto;
}

.editor {
    height: 90%;
}

.input-set {
    display: flex;
    flex-direction: column;
    height: 50%;
    justify-content: space-around;
}

.input-container {
    height: 35%;
    margin-top: 10px;
}

.input-item-text {
    white-space: pre-line;
    width: 95%;
    padding: 3px 8px 3px 14px;
}

.input-item:hover {
    background-color: #D3DBF3;
    border-radius: 5px;
}
</style>