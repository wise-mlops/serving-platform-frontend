<template>
    <div>
        <h1>Workflow</h1>

        <va-button v-on:click="getWorkflowData()">SAVE</va-button>

        <div style="width: 100%; height: 400px; margin-top: 10px;">
            <workflow :workflowId="workflowId" :operators="operatorList" :workflow="workflowData" @workflowSave="save"></workflow>
        </div>
    </div>
</template>

<script setup lang="ts">
import { operatorList } from '~/assets/data/workflow/sample_operators';

const workflowId: globalThis.Ref<string> = ref("");
const workflowData: globalThis.Ref<any> = ref([]);
const resultWorkflowData: globalThis.Ref<any> = ref([]);
const files: globalThis.Ref<any> = ref([]);

const getWorkflowData = (): [] => {
    alert(JSON.stringify(resultWorkflowData.value, null, 4));
    console.log(JSON.stringify(resultWorkflowData.value, null, 4));
    return resultWorkflowData.value;
}

const save = (workflow: any) => {
    let json = workflow.json.value;
    files.value = workflow.files.value;

    for (const file of files.value) {

        // 중복된 파일 검사
        let duplicateFile = false;
        let idx = 0;
        for (; idx < files.value.length; idx++) {
            if (files.value[idx].name === file.name) {
                duplicateFile = true;
                break;
            }
        }

        // 중복된 파일인 경우 최근에 올린 파일로 덮어쓰기, 신규 파일은 추가
        if (duplicateFile) {
            files.value[idx] = file;
        } else {
            files.value.push(file);
        }
    }
    resultWorkflowData.value = workflow;
}
</script>

<style scoped>
h1 {
    font-size: 20pt;
    margin-bottom: 20px;
}

#workflow-area {
    width: 200px;
}
</style>