<template>
  <div>
      <h1>Nuxt3 GetStarter Intro</h1>
      <hr/>
      <p>본 Nuxt3 GetStart는 2023년 04월 13일 비공식 출범하였습니다.</p>
      <br/>

      <br/>
      <h2>Update history</h2>
      <h3>2023. 06. 30.</h3>
      <p>
        1. vuestic 공식페이지에서 가이드가 제공되므로 탭 컴포넌트에서 제거<br/>
        2. RestAPI 공통 함수 추가<br/>
      </p>

      <h3>2023. 05. 25.</h3>
      <p>
        1. 사이드 메뉴 숨김 기능 추가<br/>
        2. 데이터테이블 버그 패치<br/>
      </p>

      <h3>2023. 05. 19.</h3>
      <p>
        1. Nuxt3 GetStart 전반적인 코드 리팩토링<br/>
      </p>

      <h3>2023. 05. 15.</h3>
      <p>
          1. 워크플로우 컴포넌트 코드 리팩토링<br/>
          2. 워크플로우 UI/UX 디자인 개선<br/>
          3. 데이터테이블 버그 패치<br/>
      </p>

      <h3>2023. 04. 13.</h3>
      <p>
          1. 메인페이지 추가<br/>
          2. 데이터테이블 컴포넌트 예제 추가<br/>
          3. 워크플로우 컴포넌트 코드 개선<br/>
      </p>

      <h3>2023. 04. 10.</h3>
      <p>
          1. 탭 컴포넌트 신규 추가<br/>
          2. 워크플로우 컴포넌트 신규 추가<br/>
          3. 로딩 컴포넌트 신규 추가<br/>
          4. 경고창 컴포넌트 신규 추가<br/>
      </p>
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