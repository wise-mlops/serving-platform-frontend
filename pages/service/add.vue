<template>
    <div class="row">
        <va-navbar color="backgroundPrimary">
            <template #left>
                <h4 class="va-h5">
                    {{ pageTitle }}
                </h4>
            </template>
        </va-navbar>
        <div class="px-3 flex flex-col md12 xs12 lg12">
            <VaInnerLoading :loading="!isValid">
                <VaCard class="create-card">
                    <!-- <VaButton preset="primary" @click="changeMode()">변경</VaButton>
                    <VaCardBlock horizontal class="create-content" v-if="mode === 'text'">
                        <VaCardContent>
                        </VaCardContent>
                    </VaCardBlock> -->
                    <VaCardContent class="create-content" v-if="mode === 'select'">
                        <VaList class="create-content-list">
                            <VaListItem class="create-item">
                                <VaInput class="input-value" label="Name"
                                    :rules="[(value) => (value && regexName.test(value)) || regexNameExp]"
                                    v-model="formName" />
                            </VaListItem>
                            <VaListItem class="create-item">
                                <VaSelect v-model="formModelFormat" :options="modelFormatOptions" label="Model Format" />
                            </VaListItem>
                            <VaListItem class="create-item">
                                <VaInput class="input-value" label="Storage Uri"
                                    :rules="[(value) => (value && regexUri.test(value)) || regexUriExp]"
                                    v-model="formStorageUri" />
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
<script setup>
import { SuccessResponseCode, DuplicatedErrorResponseCode } from '~~/assets/const/HttpResponseCode';
import { modelFormatOptions } from "~/assets/data/model";

const pageTitle = ref('Inference Service 등록')
const regexName = /^[a-z]([-a-z0-9]*[a-z])?$/;  // 영어 소문자, 숫자, -만 허용
const regexUri = /(file|s3|gs|http)?:\/\/.*/;  // ["file://", "s3://", "gs://", "http://"] 중 하나로 시작
const regexNameExp = "이름은 영어 소문자로 시작하고 끝나며, 그 안에는 소문자, 숫자, -만 허용됩니다.";
const regexUriExp = "file:// , s3:// , gs:// , http:// 중 하나로 시작해야 합니다.";

const formName = ref('');
const formNamespace = ref('kubeflow-user-example-com');
const formModelFormat = ref('');
const selectedBucket = ref('');
const bucketInfo = ref({});
const formStorageUri = ref('');
const mode = ref('select');

const formValid = computed(() => {
    return regexName.test(formName.value) && regexUri.test(formStorageUri.value);
})

const changeMode = () => {
    if (mode.value === 'select') {
        mode.value = 'text';
    }
    else if (mode.value === 'text') {
        mode.value = 'select';
    }
}

const bucketList = ref([]);
const storageUriList = ref([]);

onMounted(async () => {
    try {
        const response = await restAPI.get(`/bucket`);
        if (response) {
            if (response.code === SuccessResponseCode) {
                bucketList.value = response.result.map(item => item._name);
            }
            else {
                console.log(response.message);
            }
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
})

watch(selectedBucket, async () => {
    formStorageUri.value = '';
    if (selectedBucket.value in bucketInfo.value) {
        storageUriList.value = bucketInfo.value[selectedBucket.value];
    }
    else {
        const response = await restAPI.get(`/bucket/object/${selectedBucket.value}?recursive=true`);
        if (response) {
            if (response.code === SuccessResponseCode) {
                storageUriList.value = response.result.map(item => item._object_name);
                bucketInfo.value[selectedBucket.value] = storageUriList.value;
            }
            else {
                console.log(response.message);
            }
        }
    }
})

/**
 * 생성 버튼 활성화와 관련된 변수들입니다.
 */
const isValid = ref(true);
const isText = computed(() => {
    return formName.value.length > 0 && formModelFormat.value.length > 0 && formStorageUri.value.length > 0
})

const submit = async () => {
    isValid.value = false;
    const data = {
        name: formName.value,
        namespace: formNamespace.value,
        inference_service_spec: {
            predictor: {
                model_spec: {
                    storage_uri: `s3://${selectedBucket.value}/` + formStorageUri.value,
                    model_format: {
                        name: formModelFormat.value
                    }
                },
                service_account_name: "kserve-sa"
            }
        },
        sidecar_inject: false
    }
    const response = await restAPI.post(`/kserve`, data);
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
h1 {
    font-size: 20pt;
    margin-top: 20px;
    margin-bottom: 20px;
}

.create-card {
    height: 700px;
}

.create-content {
    height: 92%;
    width: 100%;
}

.create-content-list {
    width: 35%;
}

.create-item {
    height: 100px;
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
</style>