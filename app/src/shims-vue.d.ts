/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@/quasar-user-options'
declare module '@/utils/initWallet'
declare module '@/wallet/connect'
declare module '@/utils/auth_func'
declare module '@/utils/auth'
declare module '@/utils/helpers'
declare module '@/utils/txs'
declare module '@/utils/verifyNFT'
