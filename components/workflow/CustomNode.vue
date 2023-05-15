<template>
  <div>
    <NodeToolbar :is-visible="toolbar.visible" :position="toolbar.position">
      <va-button class="button-margin" preset="secondary" @click="removeNodes([id])">삭제</va-button>
    </NodeToolbar>

    <div class="operator">
        <fieldset>
            <va-input label="Operator Label" v-model="props.label" :background="'#dfdfdf'" readonly/>
        </fieldset>
    </div>

    <Handle type="target" :position="Position.Top" />
    <Handle type="source" :position="Position.Left" />
    <Handle type="source" :position="Position.Bottom" />
    <Handle type="target" :position="Position.Right" />
  </div>
</template>

<script lang="ts" setup>
const { removeNodes } = useVueFlow();
import {Handle, Position, useVueFlow} from '@vue-flow/core'
import {NodeToolbar} from '@vue-flow/node-toolbar'

interface Toolbar {
  visible: boolean
  position: Position
}

interface Props {
  id: string,
  label: string,
  toolbar: Toolbar
}

const props = defineProps<Props>()
</script>

<style>
.button-margin {
  margin: 0px 5px 0px 0px;
}
.operator {
    padding: 10px;
    border: 1px solid #cccccc;
    border-radius: 5px;
    text-align: center;
    background-color: rgba(248, 248, 248, 0.59);
}
</style>