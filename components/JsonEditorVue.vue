<template>
    <JsonEditorVue v-model="$props.inputTextValue" class="editor" mode="text" :mainMenuBar="false"
        :askToFormat="false" />
</template>

<script setup lang="ts">
import JsonEditorVue from 'json-editor-vue'

interface Props {
    inputTextValue?: ref;
}

const props = withDefaults(defineProps<Props>(), {
    inputTextValue: ref()
})
</script>