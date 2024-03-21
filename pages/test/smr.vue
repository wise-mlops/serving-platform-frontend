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
                    <VaRadio v-model="inputMode" :options="inputRadio" value-by="value"
                        @update:modelValue="changeRadio()" />
                </VaCardTitle>
                <VaCardContent class="test-card-content" v-if="mode === 'Form'">
                    <VaList>
                        <VaListItem class="input-set-row">
                            <VaInput v-model="topK" class="top-k" label="Top K" type="number" :min="1"
                                :rules="[(tk) => tk > 0 || `Top K must be greater than one`]" :title="guide.topk" />
                            <VaInput v-model="batchSize" class="batch-size ml-2" label="batch size" type="number"
                                :min="1" :rules="[(bs) => bs > 0 || `Batch Size must be greater than one`]"
                                :title="guide.batch_size" />
                        </VaListItem>
                        <VaListItem class="input-set">
                            <VaTextarea v-model="text" class="text" :resize="false" placeholder="질의문 입력해주세요."
                                label="text" :title="guide.text[0]" />
                            <VaButton class="text-button" @click=addText() :disabled="!isValidText">등록
                            </VaButton>
                        </VaListItem>
                    </VaList>
                    <VaScrollContainer class="text-container" vertical>
                        <span v-if="textList.length === 0">text를 한 개 이상 등록해주세요.</span>
                        <VaList>
                            <VaListItem v-for="(data, index) in textList" :key="index" class="text-item">
                                <span class="text-item-text">{{ data }}</span>
                                <va-button icon="close" preset="secondary" color="danger" class="text-item-del"
                                    v-on:click="delBtn(index)" />
                            </VaListItem>
                        </VaList>
                    </VaScrollContainer>
                </VaCardContent>
                <VaCardContent class="test-card-content" v-else-if="mode === 'Editor'">
                    <Editor v-model="editorValue" class="test-editor" />
                </VaCardContent>
            </VaCard>
            <VaButton icon-right="arrow_forward" icon-color="#ffffff50" class="ml-2 mr-2 test-btn" @click="getResult"
                :disabled="!isValid || (mode === 'Form' && !isFormValid) || (mode === 'Editor' && !isEditorValid)">
                compute
            </VaButton>
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
import { NotFoundErrorResponseCode, SuccessResponseCode } from '~/assets/const/HttpResponseCode';
import { useModal } from 'vuestic-ui'
const { confirm } = useModal()

const route = useRoute();

const pageTitle = ref<string>('생성 요약 서비스')
const name = ref<string>("smr");

// 입력 값
const topK = ref<string>("1");
const batchSize = ref<string>("1");
const text = ref<string>("");
const editorValue = ref<string>("");

const textList = ref<string[]>([]);
const outputValue = ref<string>("");
const inputMode = ref<number>(0);
const inputRadio: { text: string, value: number }[] = [{ text: "Form", value: 0 }, { text: "Editor", value: 1 }]
const mode = ref<string>("Form");
const bodySave = ref<string>("");

// 유효성 체크
const isValid = ref<boolean>(true);
const isValidText = ref<boolean>(false);

/**
 * Form의 유효성을 판단합니다.
 */
const isFormValid = computed(() => {
    const topKGreaterThanZero = parseInt(topK.value) > 0;
    const batchSizeGreaterThanZero = parseInt(batchSize.value) > 0;
    const textLength = textList.value.length;
    return topKGreaterThanZero && batchSizeGreaterThanZero && textLength > 0;
})

const guide: SmrRequestBody = {
    topk: "input별 확률 순 output들",
    batch_size: "모델 병렬 처리 단위",
    text: [`<질의문 전처리 가이드>
1. 화자(고객, 상담원)을 발화문 앞에 ']'와 함께 명시함
2. 한 화자가 연속해서 발화할 때는 발화문을 한 턴으로 만듦
ex) "고객] 어..", "고객] 안녕하세요" -> "고객] 어.. 안녕하세요"`]
};

/**
* text의 길이 > 0인지 확인 후 등록 버튼을 활성화 합니다.
*/
watch(text, () => {
    const textLength = text.value.trim().length
    if (textLength > 0) {
        isValidText.value = true;
    }
    else {
        isValidText.value = false;
    }
}, { immediate: true })

/**
 * Editor의 유효성을 판단합니다.
 */
const isEditorValid = computed(() => {
    const editorlength = editorValue.value.trim().length;
    const jsonValid = ref<boolean>(true);
    try {
        const json = JSON.parse(editorValue.value);
        const keys = Object.keys(json);
        const mustKeys = ['topk', 'batch_size', 'text'];
        mustKeys.forEach(k => {
            if (!(keys.includes(k))) {
                throw new Error;
            }
        });
    }
    catch (error) {
        jsonValid.value = false;
    }
    return editorlength > 0 && jsonValid.value;
})

onMounted(() => {
    activeRouteName.value = route.path;
})

/**
 * Editor 내에서 변경사항이 있을 때, Form으로 작성 모드를 바꾸게 되면 입력한 값이 사라집니다.
 */
const changeRadio = async () => {
    if (inputMode.value === 0) {
        const editorlength = editorValue.value.trim().length;
        if (editorlength > 0) {
            if (editorValue.value !== bodySave.value) {
                if (await confirm('작성한 내용이 사라질 수 있습니다.')) {
                    mode.value = 'Form';
                }
                else {
                    mode.value = 'Editor';
                    inputMode.value = 1;
                }
            }
            else {
                mode.value = 'Form';
            }
        }
        else {
            mode.value = 'Form';
        }
    }
    else {
        mode.value = 'Editor';
        editorValue.value = JSON.stringify(makeBody(), null, 4);
        bodySave.value = editorValue.value;
    }
}

/**
 * SmrRequestBody 형식에 맞게 JSON format으로 만드는 함수입니다.
 * @returns SmrRequestBody 형식의 JSON
 */
const makeBody = (): SmrRequestBody => {
    return {
        topk: topK.value,
        batch_size: String(parseInt(batchSize.value)),
        text: textList.value
    }
}

/**
 * test하는 함수입니다.
 */
const getResult = async () => {
    try {
        isValid.value = false;
        let body: SmrRequestBody;
        if (inputMode.value === 0) {
            body = makeBody()
        }
        else if (inputMode.value === 1) {
            body = JSON.parse(editorValue.value);
        }
        const response = await restAPI.post(`/kserve/kubeflow-user-example-com/${name.value}/infer/${name.value}`, body);
        if (response) {
            if (response.code === SuccessResponseCode) {
                outputValue.value = JSON.stringify(response.result, null, 4);
            }
            else if (response.code === NotFoundErrorResponseCode) {
                outputValue.value = response.result;
                console.log(response.message);
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

/**
 * text를 추가합니다.
 */
const addText = () => {
    textList.value.push(text.value);
    text.value = "";
}

/**
 * text를 삭제합니다.
 * @param idx 제거할 index
 */
const delBtn = (idx: number) => {
    textList.value.splice(idx, 1);
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

.test-editor {
    height: 88%;
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

.editor {
    height: 90%;
}

.input-set-row {
    display: flex;
    flex-direction: row;
    width: 50%;
    margin-bottom: 10px;
}

.input-set {
    display: flex;
    width: 100%;
}

.top-k,
.batch-size {
    height: 65px;
    cursor: help;
}

.text {
    width: 88%;
    height: 15vh;
    cursor: help;
}

.text-button {
    width: 11%;
    align-self: center;
    margin-top: 10px;
    margin-left: 5px;
}

.text-container {
    height: 52%;
    margin-top: 10px;
}

.text-item-text {
    line-height: normal;
    width: 95%;
    padding: 5px 8px 5px 14px;
}

.text-item:hover {
    background-color: #D3DBF3;
    border-radius: 5px;
}
</style>