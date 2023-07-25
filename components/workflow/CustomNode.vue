<template>
    <div>
        <!-- 오퍼레이터 엣지 포인트 커넥터 설정 -->
        <Handle type="target" :position="Position.Top" />
        <Handle type="source" :position="Position.Top" />

        <Handle type="target" :position="Position.Bottom" />
        <Handle type="source" :position="Position.Bottom" />

        <Handle type="target" :position="Position.Left" />
        <Handle type="source" :position="Position.Left" />

        <Handle type="target" :position="Position.Right" />
        <Handle type="source" :position="Position.Right" />

        <!-- 오퍼레이터 디자인 -->
        <div class="operator">
            <va-accordion v-model="accordionValue" class="max-w-sm">
                <va-collapse :key="props.label" :header="getOperatorTitle()">
                    <div class="operator-attribute" v-for="(value, key) in props.attributes">
                        <va-input class="attribute-input" v-if="key !== 'operator_type' && (props.attributes[key].type === 'string' || props.attributes[key].type === 'textarea')"
                                  :label="key" :background="'#dfdfdf'" readonly>
                            {{ summaryContent(props.attributes[key].value) }}
                        </va-input>

                        <!-- 체크 박스 폼 -->
                        <va-checkbox class="attribute-input" v-if="key !== 'operator_type' && !props.attributes[key].hidden && props.attributes[key].type === 'checkbox'"
                                     :label="key" v-model="props.attributes[key].value" readonly></va-checkbox>

                        <!-- 선택 박스 폼 -->
                        <va-select class="mb-6" v-if="key !== 'operator_type' && !props.attributes[key].hidden && props.attributes[key].type === 'select'" :label="key"
                                   :options="props.attributes[key].options" v-model="props.attributes[key].value" readonly/>

                        <!-- 파일 업로드 폼 -->
                        <va-input class="attribute-input" v-if="key !== 'operator_type' && !value['hidden'] && value['type'] === 'file'" :upload-button-text="'File Upload'"
                                  :label="key" :background="'#dfdfdf'" v-model="props.attributes[key].value" readonly>
                        </va-input>
                        <br/>
                    </div>
                </va-collapse>
            </va-accordion>
            <span></span>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {Attributes} from "~/composables/WorkflowNode";
import {Handle, Position} from '@vue-flow/core'
import {max} from "rxjs";

interface Props {
    id: string,
    dagId: string,
    label: string,
    attributes: Attributes
}

const props = defineProps<Props>();
const accordionValue = ref([false]);

/**
 * 오퍼레이터 타이틀명 추출
 * 사용자가 입력한 값에 따라 실시간 변경.
 */
const getOperatorTitle = () => {
    return props.attributes["task_id"].value ? props.attributes["task_id"].value : props.label;
}

/**
 * 오퍼레이터 긴문자는 생략하도록 추출
 */
const summaryContent = (origin: string) => {
    if (typeof origin === 'string') {
        let maxSize = origin.length > 30 ? 30 : origin.length;
        return origin ? origin.substring(0, maxSize) : origin;
    }

    let originStr = JSON.stringify(origin);
    let maxSize = originStr.length > 30 ? 30 : originStr.length;
    return originStr.substring(0, maxSize);
}
</script>

<style>
.operator {
    padding: 3px;
    border: 1px solid #cccccc;
    border-radius: 5px;
    text-align: center;
    background-color: rgba(248, 248, 248, 0.59);
}

.operator-attribute {
    margin-top: 3px;
}

.attribute-input {
    width: 100%;
    margin: 5px 0px 5px 0px;
}
</style>