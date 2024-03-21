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
                            <VaSelect v-model="model" class="model" :options="t5modelOptions" placeholder="사용할 모델 종류"
                                label="model" :title="guide.model" />
                        </VaListItem>
                        <VaListItem class="input-set">
                            <VaInput v-model="keyword" class="keyword" placeholder="keyword을 입력해주세요." label="keyword"
                                :title="guide.messages.keyword" />
                        </VaListItem>
                        <VaListItem class="input-set">
                            <VaTextarea v-model="context" class="context" :resize="false" placeholder="context를 입력해주세요."
                                label="Context" :title="guide.messages.context" />
                            <VaButton class="context-button" @click=addContext() :disabled="!isValidContext">등록
                            </VaButton>
                        </VaListItem>
                    </VaList>
                    <VaScrollContainer class="context-container" vertical>
                        <span v-if="contextList.length === 0">Context를 한 개 이상 등록해주세요.</span>
                        <VaList>
                            <VaListItem v-for="(data, index) in contextList" :key="index" class="context-item">
                                <span class="context-item-text">{{ data }}</span>
                                <va-button icon="close" preset="secondary" color="danger" class="context-item-del"
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
import { t5modelOptions } from "~/assets/data/model";
import { useModal } from 'vuestic-ui'
const { confirm } = useModal()

const route = useRoute();

const pageTitle = ref<string>('추천 질의 생성 서비스');
const name = ref<string>("query");

// 입력 값
const model = ref<string>("t5-base-fid");
const keyword = ref<string>("");
const context = ref<string>("");
const editorValue = ref<string>("");

const contextList = ref<string[]>([]);
const outputValue = ref<string>("");
const inputMode = ref<number>(0);
const inputRadio: { text: string, value: number }[] = [{ text: "Form", value: 0 }, { text: "Editor", value: 1 }]
const mode = ref<string>("Form");
const bodySave = ref<string>("");

// 유효성 체크
const isValid = ref<boolean>(true);
const isValidContext = ref<boolean>(false);

/**
 * Form의 유효성을 판단합니다.
 */
const isFormValid = computed(() => {
    const keywordLength = keyword.value.trim().length;
    const contextLength = contextList.value.length;
    return keywordLength > 0 && contextLength > 0;
})

const guide = {
    model: `사용할 모델 종류
- t5-base-fid`,
    messages: {
        keyword: `원하는 Keyword
{
    role: "user",
    content: keyword
}`,
        context: `질의를 생성할 Context
{
    role: "context",
    content: context 내용
}
- context는 복수 입력 가능`
    }
};

/**
 * context의 길이 > 0인지 확인 후 등록 버튼을 활성화 합니다.
 */
watch(context, () => {
    const contextLength = context.value.trim().length
    if (contextLength > 0) {
        isValidContext.value = true;
    }
    else {
        isValidContext.value = false;
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
        const mustKeys1 = ['model', 'messages'];
        mustKeys1.forEach(k => {
            if (!(keys.includes(k))) {
                throw new Error;
            }
        });
        const roleKeys = json.messages.map((m: Message) => m.role);
        const mustKeys2 = ['user', 'context']
        mustKeys2.forEach(k => {
            if (!(roleKeys.includes(k))) {
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
 * QueryRequestBody 형식에 맞게 JSON format으로 만드는 함수입니다.
 * @returns QueryRequestBody 형식의 JSON
 */
const makeBody = (): QueryRequestBody => {
    let json: Message;
    let messagesList: Message[] = []
    // keyword 추가
    json = {
        role: 'user',
        content: keyword.value
    };
    messagesList.push(json);
    // context 추가
    contextList.value.forEach(context => {
        json = {
            role: 'context',
            content: context
        }
        messagesList.push(json);
    });
    return {
        model: model.value,
        messages: messagesList
    }
}

/**
 * test하는 함수입니다.
 */
const getResult = async () => {
    try {
        isValid.value = false;
        let body: QueryRequestBody;
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
 * context를 추가합니다.
 */
const addContext = () => {
    contextList.value.push(context.value);
    context.value = "";
}

/**
 * context를 삭제합니다.
 * @param idx 제거할 index
 */
const delBtn = (idx: number) => {
    contextList.value.splice(idx, 1);
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

.model {
    cursor: help;
}

.keyword {
    width: 88%;
    margin-bottom: 10px;
    cursor: help;
}

.context {
    width: 88%;
    height: 15vh;
    cursor: help;
}

.context-button {
    width: 11%;
    align-self: center;
    margin-top: 10px;
    margin-left: 5px;
}

.context-container {
    height: 45%;
    margin-top: 10px;
}

.context-item-text {
    line-height: normal;
    width: 95%;
    padding: 5px 8px 5px 14px;
}

.context-item:hover {
    background-color: #D3DBF3;
    border-radius: 5px;
}
</style>