// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'initial-scale=1',
      title: 'Serving Platform Webpage',
      meta: [
        { name: 'description', content: 'sample description' }
      ]
    },
    pageTransition: {
      name: 'page',
      mode: 'out-in'
    }
  },
  css: ['~/assets/css/index.css'],
  modules: ['@vuestic/nuxt', 'nuxt-monaco-editor'],
  runtimeConfig: {
    public: {
      baseURL: 'http://local.api.kserve.labs.wisenut.com'
    }
  },
  vuestic: {
    config: {},
    css: ['typography', 'reset']
  }
})
