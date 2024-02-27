<template>
  <div>
    <div class="main-body">
      <div class="side-menu">
        <SideMenu v-model:menuItems="sideMenu" :side-menu-active="sideMenuActive" :width="sideWidth" />
        <div style="position: absolute; bottom: 25px; z-index: 10;">
          <va-icon name="menu" :size="'3em'" v-if="!sideMenuActive" style="line-height: 0px; height: 0px;"
            v-on:click="sideMenuActiveOnOff"></va-icon>
          <va-icon name="menu_open" :size="'3em'" v-if="sideMenuActive" style="line-height: 0px; height: 0px;"
            v-on:click="sideMenuActiveOnOff"></va-icon>
        </div>
      </div>
      <div class="content body-height" :style="contentStyle">
        <NavBar :userId="userId.value" :userName="userName.value" />
        <div class="container body-height">
          <slot />
        </div>
      </div>
    </div>

  </div>
</template>


<script setup lang="ts">

import { sideMenuData } from '~~/assets/data/sidemenu';
const sideMenu = ref(sideMenuData);
const sideMenuActive = ref(true);

const sideWidth = ref("250px");
const sideStyle = ref("width: 250px;");
const contentStyle = ref("width: calc( 100% - 250px);");

const userId: globalThis.Ref<string> = ref('admin');
const userName: globalThis.Ref<string> = ref('관리자');

useHead({
  title: 'Serving Platform'
})

const sideMenuActiveOnOff = () => {
  let style = "";
  let logoTitle: any = document.getElementsByClassName("va-list-item-label");
  let menuTitle: any = document.getElementsByClassName("va-sidebar__title va-sidebar-item-title");

  sideMenuActive.value = !sideMenuActive.value;
  // 사이드메뉴 펼쳐질 때
  if (sideMenuActive.value) {
    sideWidth.value = "270px";
    sideStyle.value = "width: 270px;";
    contentStyle.value = "width: calc( 100% - 270px);";
  }
  // 사이드메뉴 접을 때
  else {
    sideWidth.value = "80px";
    sideStyle.value = "width: 80px;";
    contentStyle.value = "width: calc( 100% - 80px);";
    style = "display: none;";
  }

  for (let i in menuTitle) {
    if (menuTitle[i]["style"]) {
      menuTitle[i]["style"] = style;
    }
  }

  for (let i in logoTitle) {
    if (logoTitle[i]["style"]) {
      logoTitle[i]["style"] = style;
    }
  }
}
</script>

<style scoped>
.main-body {
  display: flex;
}

.side-menu {
  /* height: calc(100vh - 56px); */
  height: 100vh;
}

.content {
  width: 100%;
}

.container {
  padding: 12px;
}

.body-height {
  height: calc(100vh - 56px);
}</style>