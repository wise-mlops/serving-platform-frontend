<template>
    <va-tabs v-model="tabSelected">
        <template #tabs>
            <va-tab v-for="(item, idx) in tabCategory" :key="idx" v-on:click="tabChanged(idx)">
                {{ item.title }}
            </va-tab>
        </template>
    </va-tabs>

    <!-- 속성 탭 -->
    <div v-if="tabSelected === 0" style="margin-top: 10px;">
        <div v-for="(value, key) in props.currentNode" :key="key">
            <!-- 셀렉트박스 및 파일 업로드를 제외한 다른 모든 폼 -->
            <va-input class="attribute-input" :name="key" :label="key"
                      v-if="!value['hidden'] && (value['type'] === 'string' || value['type'] === 'textarea') && key !== 'columns' && key !== 'program_info'"
                      v-model="props.currentNode[key].value" :type="value['type']" :min-rows="3" :max-rows="5">
            </va-input>

            <!-- 체크 박스 폼 -->
            <va-checkbox class="attribute-input" v-if="!value['hidden'] && value['type'] === 'checkbox'" :label="key"
                         v-model="props.currentNode[key].value" />

            <!-- 선택 박스 폼 -->
            <va-select class="attribute-input" v-if="!value['hidden'] && value['type'] === 'select'" :label="key"
                       :options="props.currentNode[key].options"
                       v-model="props.currentNode[key].value" />

            <!-- 필터 컬럼 전용 컬럼 필터 -->
            <va-button class="attribute-input" v-if="key === 'columns' || key === 'program_info'" v-on:click="detailSettingBtn(key)">
                {{ key }} setting
            </va-button>

            <!-- 파일 업로드 폼 -->
            <va-file-upload class="attribute-input" v-if="!value['hidden'] && value['type'] === 'file'" :upload-button-text="'File Upload'"
                            v-model="props.currentNode[key].value" @fileAdded="fileUploadEvent">
            </va-file-upload>
        </div>

        <va-button-group style="position: absolute; right: 0px; bottom: 0px; margin-top: 5px;">
            <va-button :color="'#1957e0'" v-on:click="save">저장</va-button>
        </va-button-group>
    </div>

    <!-- 로그 탭 -->
    <div v-if="tabSelected === 1" style="margin-top: 10px;">
        <va-progress-circle v-if="dataLogLoading" size="large" indeterminate style="margin: auto;">
            Loading
        </va-progress-circle>

        <div v-if="!dataLogLoading" style="width: 100%; word-break: break-all;">{{dataLog}}</div>

        <va-button-group style="position: absolute; right: 0px; bottom: 0px; margin-top: 5px;">
            <va-button :color="'#1957e0'" v-on:click="viewSizeUp(1)" :disabled="props.dagId != ''">확대보기</va-button>
        </va-button-group>
    </div>

    <!-- 결과 탭 -->
    <div v-if="tabSelected === 2" style="margin-top: 10px;">
        <va-progress-circle v-if="dataResultLoading" size="large" indeterminate style="margin: auto;">
            Loading
        </va-progress-circle>

        <div v-if="!dataResultLoading" style="width: 100%; word-break: break-all;">{{dataResult}}</div>

        <va-button-group style="position: absolute; right: 0px; bottom: 0px; margin-top: 5px;">
            <va-button :color="'#1957e0'" v-on:click="viewSizeUp(2)" :disabled="props.dagId != ''">확대보기</va-button>
        </va-button-group>
    </div>

    <!-- 로그 및 결과 탭 확장 모달 -->
    <va-modal v-model="viewSizeUpModalUse" ref="modal" hide-default-actions>
        <h3 class="va-h3">
            {{ viewSizeUpTitle }}
        </h3>

        <textarea style="max-width: 100%;" cols="150" rows="30" readonly>{{ viewSizeUpContent }}</textarea>
    </va-modal>

    <!-- 필터링 설정 모달창 -->
    <va-modal v-model="filterColumnsSettingModalUse" hide-default-actions overlay-opacity="0.2" blur>
        <template #header>
            <va-button v-on:click="props.currentNode.columns.value.push({'name': '', 'type': '', 'condition': '', 'keyword':''})">필터 추가</va-button>
        </template>
        <hr v-if="props.currentNode.columns.value.length > 0"/>
        <div style="width: 720px; min-height: 140px; max-height: 300px; overflow-y: auto;">
            <div v-if="props.currentNode.columns.value.length > 0">
                <div v-for="(value, idx) in props.currentNode.columns.value">
                    <va-input label="name" class="filter-setting-input-form" v-model="props.currentNode.columns.value[idx]['name']"></va-input>
                    <va-select label="type" class="filter-setting-input-form" :options="dataType" v-model="props.currentNode.columns.value[idx]['type']"></va-select>
                    <va-select label="condition" class="filter-setting-input-form" :options="conditionList" v-on:click="dataTypeChange(idx, value)" v-model="props.currentNode.columns.value[idx]['condition']"></va-select>
                    <va-input label="keyword" class="filter-setting-input-form" v-model="props.currentNode.columns.value[idx]['keyword']"></va-input>
                    <br/><br/>
                </div>
            </div>
        </div>
        <hr v-if="props.currentNode.columns.value.length > 0"/>
        <template #footer>
            <span v-if="validateEmpty">입력되지 않은 값이 존재합니다.</span><br/><br/>
            <va-button v-if="props.currentNode.columns.value.length > 0" v-on:click="filterColumnsSave">저장</va-button>
        </template>
    </va-modal>

    <!-- 오브젝트 추출/프로그램 정보 설정 모달창 -->
    <va-modal v-model="objectExtractProgramInfoModalUse" hide-default-actions overlay-opacity="0.2" blur>
        <template #header>
            <h1>program_info setting (options)</h1><br/>
        </template>
        <div style="width: 720px; min-height: 140px; max-height: 300px; overflow-y: auto;">
            <va-input label="program_id" class="popup-setting-input-form attribute-input" v-model="props.currentNode.program_info.value['program_id']"></va-input><br/>
            <va-input label="media_id" class="popup-setting-input-form attribute-input" v-model="props.currentNode.program_info.value['media_id']"></va-input><br/>
            <va-input label="program_path" class="popup-setting-input-form attribute-input" v-model="props.currentNode.program_info.value['program_path']"></va-input><br/>
            <va-input label="image_path_org" class="popup-setting-input-form attribute-input" v-model="props.currentNode.program_info.value['image_path_org']"></va-input><br/>
            <va-input label="frame_id" class="popup-setting-input-form attribute-input" v-model="props.currentNode.program_info.value['frame_id']"></va-input><br/>
            <va-input label="frame_time" class="popup-setting-input-form attribute-input" v-model="props.currentNode.program_info.value['frame_time']"></va-input><br/>
        </div>
        <hr />
        <template #footer>
            <span v-if="validateEmpty">입력되지 않은 값이 존재합니다.</span><br/><br/>
            <va-button v-on:click="objectExtractProgramInfoSave">저장</va-button>
        </template>
    </va-modal>
</template>

<script setup lang="ts">
import {VaButton, VaButtonGroup} from "vuestic-ui";
const emit = defineEmits(["toggle-drawer"]);

interface Props {
    dagId: string,
    nodeId: string,
    currentNode: object,
    currentNodeOrigin: object
};
const props = withDefaults(defineProps<Props>(), {});

///////////////////////////////
/// 카테고리 탭 기능 구현 로직 ///
///////////////////////////////
const tabSelected: globalThis.Ref<number> = ref(0);
const tabCategory: object[] = [
    {icon: "home", title: "속성"},
    {icon: "home", title: "로그"},
    {icon: "home", title: "결과"}
]

/**
 * 탭을 선택해서 값이 변경되는 이벤트
 * @param selectedTab 선택한 탭의 인덱스
 */
const tabChanged = (selectedTab: number) => {
    switch (selectedTab) {
        case 1:
            logView();
            return;
        case 2:
            resultView();
            return;
        default:
            return;
    }
    return tabCategory[selectedTab].title;
}

////////////////////////////
/// 속성 탭 기능 구현 로직 ///
////////////////////////////
const save = () => {
    if (props.currentNode['file_name']) {
        let files = props.currentNode['file_name'].value;
        let fileCount = props.currentNode['file_name'].value.length;
        if (fileCount > 0) {
            props.currentNode['file_name'].value = files[fileCount - 1].name;
            fileUploadForm.value = files[fileCount - 1];
        }
    }

    emit("saveJson", props.currentNode);
    emit("saveFiles", fileUploadForm.value);
}

///////////////////////////////////
/// 필터 오퍼레이터 기능 구현 로직 ///
//////////////////////////////////
const filterColumnsSettingModalUse: globalThis.Ref<boolean> = ref(false);
const filterColumns: globalThis.Ref<Array<any>> = ref([]);
const dataType: globalThis.Ref<Array<string>> = ref(['string','int','long','date']);
const conditionList: globalThis.Ref<Array<string>> = ref(['eq','gt','gte','lt','lte']);
const validateEmpty: globalThis.Ref<boolean> = ref(false);

/**
 * 필터 컬럼별 데이터 타입이 변경될 때, 조건식이 변경되어야함.
 * @param idx
 * @param dataType
 */
const dataTypeChange = (idx: number, dataType: any) => {
    props.currentNode.columns.value[idx]['condition'] = "";

    let type = dataType.type;
    if (type === "string") {
        conditionList.value = ["eq","contains","not eq"];
    } else {
        conditionList.value = ["eq","gt","gte","lt","lte"];
    }
}

const filterColumnsSave = () => {
    // 입력되지 않은 값이 있는지 체크
    for (let idx in filterColumns.value) {
        for (let key in filterColumns.value[idx]) {
            if (!filterColumns.value[idx][key]) {
                validateEmpty.value = true;
                return;
            }
        }
    }
    filterColumnsSettingModalUse.value = !filterColumnsSettingModalUse.value;
}

const objectExtractProgramInfoModalUse: globalThis.Ref<boolean> = ref(false);
const objectExtractProgramInfoSave = () => {
    objectExtractProgramInfoModalUse.value = !objectExtractProgramInfoModalUse.value;
}

const detailSettingBtn = (type: string) => {
    if (type === "columns") {
        filterColumnsSettingModalUse.value = !filterColumnsSettingModalUse.value;
        validateEmpty.value = false;
        filterColumns.value = JSON.parse(JSON.stringify(props.currentNode[type]));
    } else if (type === "program_info") {
        objectExtractProgramInfoModalUse.value = !objectExtractProgramInfoModalUse.value;
        validateEmpty.value = false;
    }
}

///////////////////////////////
/// 파일 업로드 기능 구현 로직 ///
///////////////////////////////
const fileUploadForm: globalThis.Ref<any> = ref(undefined);
const fileUploadEvent = (files: any) => {
    let fileCount = files.length;
    // 파일이 여러개 업로드 되는 경우, 마지막에 업로드한 파일만 업로드 되도록 처리
    // 파일이 없는 경우 생략
    if (fileCount.length > 0) {
        props.currentNode['file_name'].value = files[fileCount-1].name;
        fileUploadForm.value = files[fileCount-1];
    }
}

////////////////////////////
/// 로그 탭 기능 구현 로직 ///
////////////////////////////
const dataLogLoading: globalThis.Ref<boolean> = ref(false);
const dataLog: globalThis.Ref<string> = ref("");
const logView = async () => {
    dataLogLoading.value = true;
    dataLog.value = "You can check the log data in this form.\n -by. jskang";
    dataLogLoading.value = false;
}

////////////////////////////
/// 결과 탭 기능 구현 로직 ///
////////////////////////////
const dataResultLoading: globalThis.Ref<boolean> = ref(false);
const dataResult: globalThis.Ref<string> = ref("");
const resultView = async () => {
    dataResultLoading.value = true;
    dataResult.value = "You can check the resulting data in this form.\n -by. jskang";
    dataResultLoading.value = false;
}

///////////////////////////////////
/// 로그 및 결과 탭 기능 구현 로직 ///
///////////////////////////////////
const viewSizeUpModalUse: globalThis.Ref<boolean> = ref(false);
const viewSizeUpTitle: globalThis.Ref<string> = ref("");
const viewSizeUpContent: globalThis.Ref<string> = ref("");
const viewSizeUp = (selectedTab: number) => {
    let dagId = props.dagId? props.dagId:"";

    switch (selectedTab) {
        case 1:
            viewSizeUpTitle.value = "[로그] DAG ID " +dagId+ " :: " +props.currentNodeOrigin["task_id"];
            viewSizeUpContent.value = dataLog.value;
            viewSizeUpModalUse.value = true;
            return;
        case 2:
            viewSizeUpTitle.value = "[결과] DAG ID " +dagId+ " :: " +props.currentNodeOrigin["task_id"];
            viewSizeUpContent.value = dataResult.value;
            viewSizeUpModalUse.value = true;
            return;
        default:
            viewSizeUpTitle.value = "";
            viewSizeUpContent.value = "";
            viewSizeUpModalUse.value = false;
            return;
    }
}
</script>

<style>
.attribute-input {
    width: 100%;
    margin: 5px 0px 5px 0px;
}

.filter-setting-input-form {
    width: 20%;
    margin-right: 10px;
}

.va-file-upload-list {
    display: none;
}

.va-dropdown__content {
    z-index: 100;
}
</style>