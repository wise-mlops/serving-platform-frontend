<template>
  <div>
    <h1>Serving Platform</h1>
    <hr />
    <p>Serving Platform 입니다.</p>
    <br />

    <!-- <br/>
      <h2>Update history</h2>
      <h3>2024. 02. 13.</h3>
      <p>
        1. nuxt 업데이트 진행<br/>
        2. vuestic 업데이트 진행<br/>
        3. 라이브러리 업데이트 진행<br/>
      </p> -->

  </div>
</template>
<script setup>
definePageMeta({
  middleware: 'auth'
})
</script>
<style>
h1 {
  font-size: 20pt;
  margin-top: 20px;
  margin-bottom: 20px;
}

h2 {
  font-size: 16pt;
  margin-top: 20px;
  margin-bottom: 20px;
}

h3 {
  font-size: 12pt;
  margin-top: 20px;
  margin-bottom: 20px;
}
</style>