// pinia入口文件
import { createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';

const pinia = createPinia();

// 配置持久化插件
pinia.use(createPersistedState({
  // 默认使用 localStorage
  storage: {
    getItem: (key) => {
      // 在uni-app中使用uni.getStorageSync
      try {
        return uni.getStorageSync(key);
      } catch (e) {
        return null;
      }
    },
    setItem: (key, value) => {
      // 在uni-app中使用uni.setStorageSync
      try {
        uni.setStorageSync(key, value);
      } catch (e) {
        console.error('Storage setItem error:', e);
      }
    },
    removeItem: (key) => {
      // 在uni-app中使用uni.removeStorageSync
      try {
        uni.removeStorageSync(key);
      } catch (e) {
        console.error('Storage removeItem error:', e);
      }
    }
  },
  // 默认序列化方式
  serializer: {
    serialize: JSON.stringify,
    deserialize: JSON.parse
  }
}));

export default pinia;