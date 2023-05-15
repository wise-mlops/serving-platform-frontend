<template>
    <div>
        <va-alert id="alert-warning" color="#ce6e67" v-if="attributeHandler.warningAlertState()">수정중인
            속성창을 먼저 닫아주세요.
        </va-alert>
        <div style="position: relative; width: 100%; height: 650px;" @drop="onDrop">
            <div style="position: absolute; width: 18%; min-width: 175px;">
                <div v-if="operatorListActive" style="width: 90%; position: relative; display: inline-block;">
                    <va-sidebar style="width: 100%; background: rgb(0,0,0,0);">
                        <va-accordion v-model="propsOperatorExpand">
                            <va-collapse v-for="(group, category) in $props.operators" :key="category"
                                         :header="category" text-color="textPrimary" color="textInverted">
                                <div v-for="(operator, idx) in group" :key="operator"
                                     class="operator-list vue-flow__node-default" :draggable="true"
                                     @dragstart="onDragStart($event, category, operator)"
                                     style="text-align: center; border: #efefef solid 1px;">
                                    <div class="operator-label"></div>
                                    <div class="operator-node">{{ operator.operatorName }}</div>
                                </div>
                                <!--<div class="vue-flow__node-input" :draggable="true" @dragstart="onDragStart($event, 'input')">Input Node</div>
                                <div class="vue-flow__node-default" :draggable="true" @dragstart="onDragStart($event, 'default')">Default Node</div>
                                <div class="vue-flow__node-default" :draggable="true" @dragstart="onDragStart($event, 'default2')">222Default Node</div>
                                <div class="vue-flow__node-output" :draggable="true" @dragstart="onDragStart($event, 'output')">Output Node</div>-->
                            </va-collapse>
                        </va-accordion>
                    </va-sidebar>
                </div>
                <div style="width: 10%; position: relative; z-index: 10; display: inline-block;">
                    <va-icon :name="'menu_open'" :size="'3em'" v-if="operatorListActive" style="line-height: 0px; height: 0px;" v-on:click="operatorListActive = !operatorListActive"></va-icon>
                    <va-icon :name="'menu'" :size="'3em'" v-if="!operatorListActive" style="line-height: 0px; height: 0px; margin-top: 27px;" v-on:click="operatorListActive = !operatorListActive"></va-icon>
                </div>
            </div>

            <div style="width: 10%; position: absolute; right: 0px;">
                <workflow-detail v-if="attributeHandler.attributesState()" :enabled="enabled"
                                 :operatorAttributes="workflow.getOperatorDetailInfo()"
                                 @saveBtn="save()" @closeBtn="close()"
                                 style="float: right; height: 100%;"
                ></workflow-detail>
            </div>

            <div style="width: 100%; position: relative; z-index: 10; display: contents;">
                <VueFlow
                    v-model="$props.setWorkflowJson" fit-view-on-init @dragover="onDragOver"
                    class="vue-flow-basic-example"
                    style="width: 100%; height: 100%;">
                    <Background variant="dots"/>
                    <MiniMap/>
                    <Controls/>
                    <template #node-toolbar="nodeProps">
                        <CustomNode :id="nodeProps.id" :label="nodeProps.label" :toolbar="nodeProps"/>
                    </template>
                    <template #edge-custom="props">
                        <CustomEdge v-bind="props"/>
                    </template>
                </VueFlow>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// 워크플로우 라이브러리
import {nextTick, watch} from "vue";
import {VueFlow, useVueFlow, MarkerType} from '@vue-flow/core'
import {Background} from '@vue-flow/background'
import {MiniMap} from '@vue-flow/minimap'
import {Controls} from '@vue-flow/controls'

const {findNode, onConnect, addEdges, addNodes, project, vueFlowRef, toObject} = useVueFlow();

// 워크플로우 커스텀 기능
import CustomNode from './CustomNode.vue'
import CustomEdge from './CustomEdge.vue'

import OperatorDataTransfer, * as workflow from './ts/Workflow';
import AttributeHandler from './ts/AttributeHandler';

const attributeHandler = new AttributeHandler();
const operatorListActive: globalThis.Ref<boolean> = ref(true);

const emit = defineEmits(["toggle-drawer"]);
const DEFINE: any = {
    WORKFLOW_SAVE_DATA: "getWorkflowJson"
}

interface Operators {
    "operatorName": string,
    "attributes": any
}

interface Props {
    setWorkflowJson: any,
    operators: [Operators]
};

const props = withDefaults(defineProps<Props>(), {});
const propsOperatorExpand = ref([true, false]);
const enabled = ref("enabled");

const save = () => {
    emit(DEFINE.WORKFLOW_SAVE_DATA, toObject());
    attributeHandler.attributesOff();
}

const close = () => {
    attributeHandler.attributesOff();
}

onConnect((params: any) => {
    let edge = workflow.createEdge(params);
    addEdges([edge]);
    save();
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

const onDrop = (event: any) => {
    const operatorName = event.dataTransfer?.getData("operatorName");
    const operatorLabel = event.dataTransfer?.getData("operatorLabel");
    const operatorAttributes = event.dataTransfer?.getData("operatorAttributes");

    const {left, top} = vueFlowRef.value.getBoundingClientRect();

    const position = project({
        x: event.clientX - left,
        y: event.clientY - top,
    })

    let jsonOperatorAttributes = JSON.parse(operatorAttributes);
    let attributes: any = {};
    for (let key in jsonOperatorAttributes) {
        let value = "";
        if (jsonOperatorAttributes[key]["value"]) {
            value = jsonOperatorAttributes[key]["value"];
        }
        attributes[key] = value;
    }

    const newNode = {
        id: "dndnode_" + new Date().getTime(),
        position: position,
        type: 'toolbar',
        operatorName: `${operatorName}`,
        label: `${operatorLabel}`,
        attributes: attributes,
        events: {
            doubleClick: () => {
                // 이미 속성 수정 팝업이 띄워져 있는 경우
                if (attributeHandler.attributesState()) {
                    // 팝업 경고창 띄우기
                    attributeHandler.warningAlertOn()

                    // 3초후 팝업 경고창 닫기
                    setTimeout(() => {
                        attributeHandler.warningAlertOff()
                    }, 3000);
                    return;
                }

                let saveAttribute: any = {
                    operatorName: operatorName,
                    value: attributes,
                    view: jsonOperatorAttributes
                }
                workflow.setOperatorDetailInfo(saveAttribute);

                // 속성 수정 팝업 띄우기
                attributeHandler.attributesOn();
            }
        }
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

    save();
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