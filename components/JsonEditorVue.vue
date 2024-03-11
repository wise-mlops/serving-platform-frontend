<template>
    <JsonEditorVue v-bind="$props.inputTextValue" class="editor" mode="text" :mainMenuBar="false"
        :askToFormat="false" />
</template>

<script setup lang="ts">
import JsonEditorVue from 'json-editor-vue'

interface Props {
    inputTextValue?: string;
}

const props = withDefaults(defineProps<Props>(), {
})
</script>