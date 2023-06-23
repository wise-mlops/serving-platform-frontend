<template>
  <div>
    <h1>Tab</h1>

    <va-tabs v-model="selectTab">
      <template #tabs>
        <va-tab v-for="(item, idx) in tabList" :key="item">
          {{ item.title }}
        </va-tab>
      </template>
    </va-tabs>

    <div id="wisenut-tab-contents">
        <h2>{{ tabList[selectTab].title }}</h2>
    </div>
  </div>
</template>

<script setup lang="ts">
interface COLUMNS {
  icon: string,
  title: string
};

interface Props {
  columns: COLUMNS[]
};

const selectTab = ref(0);

const tabList: COLUMNS[] = [
  {icon: "home", title: "Menu 1"},
  {icon: "travel", title: "Menu 2"},
  {icon: "pointer", title: "Menu 3"}
];
</script>

<style scoped>
h1 {
    font-size: 20pt;
    margin-bottom: 20px;
}
#wisenut-tab-contents {
    margin: 20px;
}
</style>