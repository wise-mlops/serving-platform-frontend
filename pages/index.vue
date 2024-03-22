<template>
  <div>
    <h1>Serving Platform</h1>
    <hr />
    <p>Serving Platform 입니다.</p>
    <br />
  </div>
</template>
<script setup>
definePageMeta({
  redirect: to => {
    return { path: '/services' }
  }
});
</script>