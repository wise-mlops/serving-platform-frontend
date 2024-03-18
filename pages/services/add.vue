<template>
    <div class="add-card">
        <va-navbar color="backgroundPrimary">
            <template #left>
                <h4 class="va-h5">
                    {{ pageTitle }}
                </h4>
            </template>
        </va-navbar>
        <div class="px-3 md12 xs12 lg12 add-card-content">
            <VaInnerLoading :loading="!isValid" class="add-card-loading">
                <VaCard outlined class="create-card">
                    <!-- <VaButton preset="primary" @click="changeMode('form')">변경</VaButton>
                    <VaCardBlock horizontal class="create-content" v-if="mode.form">
                        <VaCardContent>
                        </VaCardContent>
                    </VaCardBlock> -->
                    <VaCardContent class="create-content" v-if="!mode.form">
                        <VaList class="create-content-list">
                            <VaListItem class="create-item">
                                <VaInput class="input-value" label="Name"
                                    :rules="[(value) => (value && regexName.test(value)) || regexNameExp]"
                                    v-model="formName" />
                            </VaListItem>
                            <VaListItem class="create-item">
                                <VaSelect v-model="formModelFormat" :options="modelFormatOptions"
                                    label="Model Format" />
                            </VaListItem>
                            <VaListItem class="create-item-uri" v-if="!mode.uri">
                                <div class="flex item-uri">
                                    <p class="uri-text">STORAGE URI</p>
                                    <VaFileUpload v-model="uploadedFile" dropzone
                                        dropZoneText="Drop model file here to upload" type="single" />
                                </div>
                            </VaListItem>
                            <VaListItem class="create-item" v-else-if="mode.uri">
                                <VaInput class="input-value" label="Storage Uri"
                                    :rules="[(value) => (value && regexUri.test(value)) || regexUriExp]"
                                    v-model="formStorageUri" />
                            </VaListItem>
                            <VaListItem class="change-mode-btn">
                                <VaButton v-if="mode.uri" @click="changeMode('uri')" preset="secondary"
                                    borderColor="primary" size="small">
                                    파일 업로드 </VaButton>
                                <VaButton v-else @click="changeMode('uri')" preset="secondary" borderColor="primary"
                                    size="small">
                                    직접 입력 </VaButton>
                            </VaListItem>
                        </VaList>
                    </VaCardContent>
                    <div class="button-set">
                        <VaButton :disabled="!isValid || !isText || !formValid" @click="submit()" class="ml-3 mr-3">등록
                        </VaButton>
                        <VaButton preset="primary" to="/services" :disabled="!isValid" class="ml-3 mr-3">취소</VaButton>
                    </div>
                </VaCard>
            </VaInnerLoading>
        </div>
    </div>
</template>

<script setup lang="ts">
import { SuccessResponseCode, DuplicatedErrorResponseCode } from '~~/assets/const/HttpResponseCode';
import { modelFormatOptions } from "~/assets/data/model";

const pageTitle = ref<string>('Inference Service 등록')
const regexName = /^[a-z]([-a-z0-9]*[a-z])?$/;  // 영어 소문자, 숫자, -만 허용
const regexUri = /(file|s3|gs|http)?:\/\/.*/;  // ["file://", "s3://", "gs://", "http://"] 중 하나로 시작
const regexNameExp: string = "이름은 영어 소문자로 시작하고 끝나며, 그 안에는 소문자, 숫자, -만 허용됩니다.";
const regexUriExp: string = "file:// , s3:// , gs:// , http:// 중 하나로 시작해야 합니다.";
const formName = ref<string>('');
const formNamespace = ref<string>('kubeflow-user-example-com');
const formModelFormat = ref<string>('');
const selectedBucket = ref<string>('test');  // 버킷명 수동으로 변경 필요
const formStorageUri = ref<string>('');
const uploadedFile = ref([]);
const fileLen = ref<number>(0);

/**
 * [form mode]
 *  - true: 직접 입력 (미구현)
 *  - false: 선택
 * [storage uri mode]
 *  - true: 직접 입력
 *  - false: 파일 업로드
 */
const mode = ref({
    form: false,
    uri: true
})

const formValid = computed(() => {
    return regexName.test(formName.value) && (regexUri.test(formStorageUri.value) || fileLen.value === 1);
})

watch(uploadedFile, () => {
    try {
        fileLen.value = uploadedFile.value.length;
        if (fileLen.value === undefined) {
            fileLen.value = 1;
        }
    }
    catch {
        fileLen.value = 0;
    }
})

const changeMode = (modeType: string) => {
    mode.value[modeType] = !mode.value[modeType];
    uploadedFile.value = [];
    formStorageUri.value = "";
}

/**
 * 생성 버튼 활성화와 관련된 변수들입니다.
 */
const isValid = ref<boolean>(true);
const isText = computed(() => {
    if (mode.value.uri) {
        return formName.value.length > 0 && formModelFormat.value.length > 0 && formStorageUri.value.length > 0;
    }
    return formName.value.length > 0 && formModelFormat.value.length > 0;
})

const submit = async () => {
    isValid.value = false;
    let url;
    let data;
    if (mode.value.uri) {
        url = '/kserve'
        data = {
            name: formName.value,
            namespace: formNamespace.value,
            inference_service_spec: {
                predictor: {
                    model_spec: {
                        storage_uri: formStorageUri.value,
                        model_format: {
                            name: formModelFormat.value
                        }
                    },
                    service_account_name: "kserve-sa"
                }
            },
            sidecar_inject: false
        }
    }
    else {
        url = `/bucket/object/serving/${selectedBucket.value}?model_format=${formModelFormat.value}&service_name=${formName.value}`;
        data = new FormData();
        data.append("file", uploadedFile.value);
    }
    const response = await restAPI.post(url, data);
    if (response) {
        if (response.code === SuccessResponseCode) {
            setTimeout(() => {
                alert('Inference Service 등록이 완료되었습니다.');
                navigateTo('/services');
                isValid.value = true;
            }, 2000);
        }
        else {
            if (response.code === DuplicatedErrorResponseCode) {
                alert(`${data.name}은 사용할 수 없는 이름입니다.`);
                formName.value = '';
            }
            else {
                console.log(response.message);
            }
            isValid.value = true;
        }
    }
    else {
        isValid.value = true;
    }
}

</script>

<style>
.add-card {
    height: 100%;
}

.add-card-content {
    height: 83%;
}

.add-card-loading {
    height: 100%;
}

.create-card {
    height: 100%;
}

.create-content {
    height: 92%;
    width: 100%;
}

.create-content-list {
    height: 100%;
    width: 35%;
}

.create-item {
    height: 17%;
}

.create-item-uri {
    height: 27.5%;
}

.change-mode-btn>div {
    display: flex;
    justify-content: flex-end;
    width: 100%;
}

.item-uri {
    width: 100%;
}

.uri-text {
    color: #154EC1;
    letter-spacing: 0.6px;
    line-height: 1.2;
    font-weight: 700;
}

.va-file-upload {
    width: 100%;
}

.input-value {
    width: 100%;
}

.button-set {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}

.va-input-label {
    font-size: medium;
}

.va-file-upload__field__button {
    z-index: 1;
}
</style>