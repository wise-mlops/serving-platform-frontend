<template>
    <div style="position: relative; height: 650px;" @drop="onDrop">
        <!-- 오퍼레이터 사이드 메뉴창 -->
        <div style="float: left; width: 15%; height: 100%;">
            <va-sidebar v-if="operatorListActive" style="width: 100%; background: rgb(0,0,0,0);">
                <va-accordion v-model="propsOperatorExpand">
                    <va-collapse v-for="(group, category) in $props.operators"
                                 :key="category"
                                 :header="category" text-color="textPrimary"
                                 color="textInverted">
                        <div v-for="(operator, idx) in group" :key="operator"
                             class="operator-list vue-flow__node-default" :draggable="true"
                             @dragstart="onDragStart($event, category, operator)"
                             style="text-align: center; border: #efefef solid 1px;">
                            <div class="operator-label"></div>
                            <div class="operator-node">{{ operator.operatorName }}</div>
                        </div>
                    </va-collapse>
                </va-accordion>
            </va-sidebar>
        </div>

        <!-- 워크플로우 캔버스 -->
        <div style="float: left; width: 70%; height: 100%; top: 0px;">
            <VueFlow v-model="workflowData" fit-view-on-init @dragover="onDragOver"
                     class="vue-flow-basic-example" :default-viewport="vueFlowSetting"
                     style="width: 100%; height: 100%;">
                <Background variant="dots"/>
                <MiniMap/>
                <Controls/>
                <template #node-toolbar="nodeProps">
                    <CustomNode :dagId="workflowId" :id="nodeProps.id" :label="nodeProps.label"
                                :attributes="getAttributes(nodeProps.id)" v-on:click="setNodeAttributes(nodeProps.id, getAttributes(nodeProps.id))">
                    </CustomNode>
                </template>
                <template #edge-custom="props">
                    <CustomEdge v-bind="props"/>
                </template>
            </VueFlow>
        </div>

        <!-- 오퍼레이터 속성 설정창 -->
        <div style="float: left; width: 15%; height: 100%;">
            <workflow-detail :nodeId="nodeId" :dagId="workflowId"
                                 :currentNode="nodeAttributes" :currentNodeOrigin="nodeAttributesOrigin"
                                 @saveJson="saveJson" @saveFiles="saveFiles">
            ></workflow-detail>
        </div>
    </div>
</template>

<script setup lang="ts">
import {restAPI} from '~/composables/apis';
import {defineEmits} from "vue";
const emit = defineEmits(["toggle-drawer"]);

onMounted( () => {
    let dagInfo = sessionStorage.getItem("dagInfo");
    workflowData.value = JSON.parse(dagInfo)?.workflow;
})

const workflowSave = () => {
    let jobs = {
        json: workflowData,
        files: uploadFiles
    };

    emit("workflowSave", jobs);
}

///////////////////////////////////
/// 오퍼레이터 속성 기능 구현 로직 ///
///////////////////////////////////
const nodeId: globalThis.Ref<string> = ref("");
const nodeAttributes: globalThis.Ref<object> = ref({});
const nodeAttributesOrigin: globalThis.Ref<object> = ref({});
const getAttributes = (operatorId: string): {} => {
    let json = toObject()
    let nodes = json.nodes;
    if (!nodes) {
        return {};
    }
    let data = nodes.filter(json => json.id === operatorId);
    return data[0].attributes;
}

const setNodeAttributes = (id: string, node: object) => {
    nodeId.value = id;
    nodeAttributes.value = node;
    for (let key in node) {
        nodeAttributesOrigin.value[key] = node[key].value;
    }
}

const searchOperator = (attributes: any) => {
    let operators: any = toObject();

    for (let idx in operators.nodes) {
        if (operators.nodes[idx].id == nodeId.value) {
            operators.nodes[idx].attributes = JSON.parse(JSON.stringify(attributes));
            break;
        }
    }
    return operators;
}

///////////////////////////////////
/// 워크플로우 저장 기능 구현 로직 ///
///////////////////////////////////
const saveJson = (json: any = toObject()) => {
    json = searchOperator(json);
    let getNodes: object = json.nodes;
    let getEdges: object = json.edges;

    // 워크플로우를 다시 그리기 위해 데이터 파싱
    let saveJson: [] = [];
    if (getNodes) {
        for (let idx in getNodes) {
            saveJson.push(getNodes[idx]);
        }
    }
    if (getEdges) {
        for (let idx in getEdges) {
            saveJson.push(getEdges[idx]);
        }
    }
    workflowData.value = saveJson;
    workflowSave();
}

const saveFiles = (file: any = undefined) => {
    if (file) {
        uploadFiles.value.push(file);
    }
    workflowSave();
}

///////////////////////////////////
/// 워크플로우 기본 기능 구현 로직 ///
///////////////////////////////////
import {nextTick, onMounted, watch} from "vue";
import {VueFlow, useVueFlow} from '@vue-flow/core'
import {Background} from '@vue-flow/background'
import {MiniMap} from '@vue-flow/minimap'
import {Controls} from '@vue-flow/controls'

const {findNode, onConnect, addEdges, addNodes, project, vueFlowRef, toObject} = useVueFlow();

import CustomNode from "./CustomNode.vue";
import CustomEdge from './CustomEdge.vue'

import OperatorDataTransfer, * as workflow from './ts/Workflow';
import {ViewportTransform} from "@vue-flow/core/dist/types/zoom";
import {Attributes} from "~/composables/WorkflowNode";

const operatorListActive: globalThis.Ref<boolean> = ref(true);

interface Operators {
    operatorName: string,
    attributes: any
}

interface Props {
    workflowId: string,
    operators: [Operators],
    workflow: any
};

const props = withDefaults(defineProps<Props>(), {});
const propsOperatorExpand = ref([true, false]);
const workflowData: globalThis.Ref<any> = ref([]);
const uploadFiles: globalThis.Ref<any> = ref([]);
const vueFlowSetting: globalThis.Ref<ViewportTransform> = ref({
    x: 0,
    y: 0,
    zoom: 2
});

onConnect((params: any) => {
    let edge = workflow.createEdge(params);
    addEdges([edge]);
    saveJson();
});

const onDragStart = (event: any, nodeCategory: string, nodeAttributes: any) => {
    if (event.dataTransfer) {
        let dataTrasfer: OperatorDataTransfer = workflow.setOperatorDataTransfer(nodeCategory, nodeAttributes);

        event.dataTransfer.setData('operatorLabel', dataTrasfer.operatorLabel);
        event.dataTransfer.setData('operatorName', dataTrasfer.operatorName);
        event.dataTransfer.setData('operatorAttributes', dataTrasfer.operatorAttributes);
        event.dataTransfer.effectAllowed = 'move'
    }
}

const onDragOver = (event: any) => {
    event.preventDefault()

    if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move'
    }
}

const onDrop = async (event: any) => {
    const operatorKey = new Date().getTime();
    const operatorName = event.dataTransfer?.getData("operatorName");
    const operatorLabel = event.dataTransfer?.getData("operatorLabel");
    const operatorAttributes = event.dataTransfer?.getData("operatorAttributes");
    const nodeId = "WEO_" + operatorKey;

    const {left, top} = vueFlowRef.value.getBoundingClientRect();

    const position = project({
        x: event.clientX - left,
        y: event.clientY - top,
    })

    let jsonOperatorAttributes = JSON.parse(operatorAttributes);
    let attributes: globalThis.Ref<Attributes> = ref({});
    for (let key in jsonOperatorAttributes) {
        let type = jsonOperatorAttributes[key]["type"];
        let value = "";
        let hidden = jsonOperatorAttributes[key]["hidden"];
        if (jsonOperatorAttributes[key]["value"] || typeof jsonOperatorAttributes[key]["value"] === 'boolean') {
            value = jsonOperatorAttributes[key]["value"];
        }

        attributes.value[key] = {
            type: ref(type),
            hidden: ref(hidden),
            value: ref(value)
        };
    }

    // operator attribute에서 select 일 때, options 정보가 고정값이 아닌 URL 에서 가져오는 링크인 경우
    // URL 링크에서 목록을 그때마다 조회해서 options 값 로딩 처리
    for (let key1 in jsonOperatorAttributes) {
        for (let key2 in jsonOperatorAttributes[key1]) {

            // SelectBox 인 경우에만 아래 로직 수행
            if (key2 === "type" && jsonOperatorAttributes[key1][key2] === "select") {

                // 데이터를 URL에서 받아오는 경우에만 아래 로직 수행
                if (jsonOperatorAttributes[key1]["options"]["type"] === "url") {

                    let method = jsonOperatorAttributes[key1]["options"]["method"];
                    let url = jsonOperatorAttributes[key1]["options"]["data"];

                    let data: any = "";
                    if (method.toLowerCase() === "get") {
                        data = await restAPI.get(url);
                    }
                    if (!data) {
                        continue;
                    }

                    // Select 박스 Options 채우기
                    jsonOperatorAttributes[key1]["options"]["data"] = [];
                    for (let idx in data.result.connections) {
                        let connectionType = jsonOperatorAttributes[key1]["options"]["connection_type"];
                        if (data.result.connections[idx].conn_type.toLowerCase() != connectionType.toLowerCase()) {
                            continue;
                        }

                        let connectionId = data.result.connections[idx].connection_id;
                        jsonOperatorAttributes[key1]["options"]["data"].push(connectionId);
                    }
                }
                attributes.value[key1]["options"] = jsonOperatorAttributes[key1]["options"]["data"];
            }
        }
    }

    const newNode = {
        id: nodeId,
        position: position,
        type: 'toolbar',
        label: `${operatorLabel}`,
        attributes: attributes
    }
    addNodes([newNode])

    // align node position after drop, so it's centered to the mouse
    nextTick(() => {
        const node: any = findNode(newNode.id)
        const stop = watch(
            () => node.dimensions,
            (dimensions) => {
                if (dimensions.width > 0 && dimensions.height > 0) {
                    node.position = {
                        x: node.position.x - node.dimensions.width / 2,
                        y: node.position.y - node.dimensions.height / 2
                    }
                    stop()
                }
            },
            {deep: true, flush: 'post'},
        )
    })

    saveJson();
}
</script>

<style>
/* these are necessary styles for vue flow */
@import '@vue-flow/core/dist/style.css';

/* this contains the default theme, these are optional styles */
@import '@vue-flow/core/dist/theme-default.css';

.operator-list {
    width: 100%;
    height: 45px;
    padding: 0 0 0 0;
}

.operator-label {
    float: left;
    width: 10px;
    height: 100%;
    background: #ff7878;
}

.operator-node {
    font-size: 10pt;
    font-weight: normal;
    font-family: Consolas;
    text-align: center;
    padding-top: 15px;
}

#alert-warning {
    text-align: center;
    font-weight: bold;
}
</style>