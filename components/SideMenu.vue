<template>
  <VaSidebar :minimized="minimized" position="left" class="colored-sidebar">
    <Logo v-model:url="logoUrl" v-model:title="logoTitle" />
    <VaAccordion v-model="accordionValue" multiple>
      <VaCollapse v-for="(item, idx) in $props.menuItems" :key="idx"
        :class="{ expanded: accordionValue[idx] && item.subItems }">
        <template #header>
          <VaSidebarItem @click="setRouteActive((item.path) ? item.path : '')"
            :active="isRouteActive((item.path) ? item.path : '')">
            <VaSidebarItemContent>
              <va-icon :name="item.icon" />
              <VaSidebarItemTitle>{{ item.title }}</VaSidebarItemTitle>
              <va-icon v-if="item.subItems && !minimized" :name="accordionValue[idx] ? 'expand_less' : 'expand_more'" />
            </VaSidebarItemContent>
          </VaSidebarItem>
        </template>
        <VaSidebarItem v-for="(subItem, idx) in item.subItems" :key="idx" @click="setRouteActive(subItem.path)"
          :active="isRouteActive(subItem.path)">
          <VaSidebarItemContent>
            <va-icon :name="subItem.icon" />
            <VaSidebarItemTitle>{{ subItem.title }}</VaSidebarItemTitle>
          </VaSidebarItemContent>
        </VaSidebarItem>
      </VaCollapse>
    </VaAccordion>
  </VaSidebar>
</template>

<script setup lang="ts">
import { activeRouteName } from '~/composables/common';

const config = useAppConfig();
const router = useRouter();
const route = useRoute();

interface MenuItem {
  id: string;
  icon?: string;
  title: string;
  path?: string;
  description?: string;
  subItems?: {
    id: string;
    icon?: string;
    title: string;
    path: string;
    description?: string;
  }[]
}

interface Props {
  menuItems: MenuItem[]
}

const props = withDefaults(defineProps<Props>(), {

})

// LOGO 관련
const logoUrl = ref('/img/logo.png');
const logoTitle = ref(config.logoTitle)

// SIDEBAR관련
const minimized = ref(false);
const accordionValue = ref([false, true]);

const toggleSideMenu = () => {
  minimized.value = (minimized.value) ? false : true;
}

const isRouteActive = (path: string) => {
  return activeRouteName.value == path;
}

const setRouteActive = (path: string) => {
  if (path) {
    activeRouteName.value = path
    router.push(path)
  }
}

</script>

<style lang="scss" scoped>
.content {
  width: 100%;
  height: 100%;
  background-color: var(--va-background-primary);
}

.va-sidebar-item {
  cursor: pointer;
}

.va-popover {
  z-index: 99;
}

.expanded {
  background-color: var(--va-background-primary);
}
</style>