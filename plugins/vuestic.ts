import { createIconsConfig, createVuestic } from "vuestic-ui"
import '@mdi/font/css/materialdesignicons.css'
import 'vuestic-ui/css'

// Ensure your project is capable of handling css files
export default defineNuxtPlugin(nuxtApp => {
  const vuestic = createVuestic({
    config: {
      icons: createIconsConfig({
        fonts: [
          {
            name: 'mdi-{icon}',
            resolve: ({ icon }) => ({
              class: 'material-icons',
              content: icon,
              tag: 'span'
            })
          }
        ]
      })
    }
  });
})