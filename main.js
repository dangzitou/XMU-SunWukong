import { createSSRApp } from 'vue'
import App from './App.vue'
import pinia from './stores'
import uView from './uni_modules/diy-uview-ui'
import Auth from './common/Auth'
import Tools from '@/common/Tools.js'
import HttpService from '@/common/HttpService.js'
import Session from '@/common/Session.js'
// 引入全局方法
import {
  setCurrentPage,
  Validate,
  setData,
  navigateTo,
  showModal,
  showToast,
  getPickerChildren,
  uploadImage,
  getOption,
  setAuthorize
} from '@/common/Page.js'

export function createApp() {
  const app = createSSRApp(App)
  app.config.globalProperties.$tools = new Tools()
  app.config.globalProperties.$http = new HttpService()
  app.config.globalProperties.$session = Session
  app.config.globalProperties.$auth = Auth
  app.use(pinia)
  app.use(uView)
  // 全局注入 Page.js 方法
  app.mixin({
    methods: {
      setCurrentPage,
      Validate,
      setData,
      navigateTo,
      showModal,
      showToast,
      getPickerChildren,
      uploadImage,
      getOption,
      setAuthorize
    }
  })
  return { app }
}