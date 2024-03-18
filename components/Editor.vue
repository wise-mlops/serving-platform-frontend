<template>
    <MonacoEditor v-bind="$props.inputTextValue" lang="json" :options="{ minimap: { enabled: false }, fontSize: 16 }" />
</template>

<script setup lang="ts">
interface Props {
    inputTextValue?: string;
}

const props = withDefaults(defineProps<Props>(), {
})
</script>

<style>
.monaco-editor span {
    font-family: 'D2Coding', serif !important;
}
</style>