<template>
  <div class="logo">
    <va-list >
      <va-list-item >
        <img v-if="$props.url" :src="$props.url" :alt="$props.alt" :title="$props.title"> 
        <img v-else src="~/assets/img/logo.png" :alt="$props.alt" :title="$props.title"/>
        <va-list-item-label>
          <b>{{ $props.title }}</b>
        </va-list-item-label>
      </va-list-item>
    </va-list>
  </div>
</template>

<script setup lang="ts">

interface Props {
  url?: string;
  title?: string;
  alt?: string;
}

const props = withDefaults(defineProps<Props>(), {
  url: '',
  title: 'manager-ui-starter',
  alt: 'default-logo'
})

</script>

<style scoped>
  .logo {
    height: 56px;
    background-color: #fff;
    display: flex;
    align-items: center; 
    /* padding: var(--va-sidebar-item-content-padding); */
    padding: 20px;
    box-sizing: border-box;
    border-width: 2px;
  }
  .logo .icon, .logo img {
    margin-right: var(--va-sidebar-item-content-gap);
    width:24px;
    height:24px;
  }
  
</style>