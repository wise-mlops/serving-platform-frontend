<template>
    <div>
        <h1>Workflow</h1>

        <va-button v-on:click="getJson()">SAVE</va-button>

        <div style="width: 100%; height: 400px; margin-top: 10px;">
            <workflow :setWorkflowJson="workflowJson" @getWorkflowJson="save" :operators="operatorList"></workflow>
        </div>
    </div>
</template>

<script setup lang="ts">
import { operatorList } from '~/assets/data/workflow/sample_operators';

const workflowJson: any = ref([]);

const getJson = (): [] => {
    alert(JSON.stringify(workflowJson.value, null, 4));
    return workflowJson.value;
}

const save = (json: any) => {
    // 워크플로우를 다시 그리기 위해 데이터 파싱
    let saveJson: [] = [];

    let nodes: any = json.nodes;
    if(nodes) {
        for (let idx in nodes) {
            let node = nodes[idx];
            saveJson.push(node);
        }
    }

    let edges: any = json.edges;
    if (edges) {
        for (let idx in edges) {
            let edge = edges[idx];
            saveJson.push(edge);
        }
    }

    workflowJson.value = saveJson;
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