<template>
  <div class="row">
    <va-navbar color="backgroundPrimary">
      <template #left>
        <div>
          <h4 class="va-h5">
            {{ $props.pageTitle }}
          </h4>
        </div>
      </template>
      <template #right>
        <span v-for="(item, idx) in $props.toolButtons" :key="idx">
          <va-button @click="pageMove(item.path ? item.path : '')" class="ml-2" :icon="item.icon ? item.icon : ''">
            {{ item.title ? item.title : '' }}
          </va-button>
        </span>
      </template>
    </va-navbar>
  </div>
</template>

<script setup lang="ts">
const router = useRouter();

interface ToolButton {
  id: string;
  title?: string;
  icon?: string;
  path?: string;
}

interface Props {
  pageTitle?: string;
  toolButtons: ToolButton[]
}

const props = withDefaults(defineProps<Props>(), {
  pageTitle: '제목없음'
})

const pageMove = (path: string) => {
  if (path) {
    router.push(path)
  }
}

</script>