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
                        <VaListItem class="input-set">
                            <VaTextarea v-model="currentUtterance" class="utterance" :resize="false"
                                placeholder="사용자의 현재 입력을 입력해주세요." label="Current Utterance"
                                :title="guide.current_utterance" />
                        </VaListItem>
                        <VaListItem class="input-set">
                            <VaTextarea v-model="dialogueHistory" class="history mt-2" :resize="false"
                                placeholder="사용자와 챗봇 사이의 대화 내역을 입력해주세요." label="Dialogue History"
                                :title="guide.dialogue_history" />
                        </VaListItem>
                    </VaList>
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

const pageTitle = ref<string>('대화 상태 추적 서비스')
const name = ref<string>("dst");

// 입력 값
const currentUtterance = ref<string>("");
const dialogueHistory = ref<string>("");
const editorValue = ref<string>("");

const outputValue = ref<string>("");
const inputMode = ref<number>(0);
const inputRadio: { text: string, value: number }[] = [{ text: "Form", value: 0 }, { text: "Editor", value: 1 }]
const mode = ref<string>("Form");
const bodySave = ref<string>("");

// 유효성 체크
const isValid = ref<boolean>(true);

/**
 * Form의 유효성을 판단합니다.
 */
const isFormValid = computed(() => {
    const utteranceLength = currentUtterance.value.length;
    const historyLength = dialogueHistory.value.length;
    return utteranceLength > 0 && historyLength > 0;
})

const guide: DstRequestBody = {
    current_utterance: '반드시 앞에 user]가 필요합니다.',
    dialogue_history: `1. 턴 구분을 >*>으로 해야합니다.
2. user] 혹은 sys] 태그가 필요합니다.`
};

/**
 * Editor의 유효성을 판단합니다.
 */
const isEditorValid = computed(() => {
    const editorlength = editorValue.value.trim().length;
    const jsonValid = ref<boolean>(true);
    try {
        const json = JSON.parse(editorValue.value);
        const keys = Object.keys(json);
        const mustKeys = ['current_utterance', 'dialogue_history'];
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
 * DstRequestBody 형식에 맞게 JSON format으로 만드는 함수입니다.
 * @returns DstRequestBody 형식의 JSON
 */
const makeBody = (): DstRequestBody => {
    return {
        current_utterance: currentUtterance.value,
        dialogue_history: dialogueHistory.value
    }
}

/**
 * test하는 함수입니다.
 */
const getResult = async () => {
    try {
        isValid.value = false;
        let body: DstRequestBody;
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

.input-set {
    display: flex;
    width: 100%;
}

.utterance,
.history {
    width: 88%;
    cursor: help;
}

.utterance {
    height: 15vh;
}

.history {
    height: 40vh;
}
</style>