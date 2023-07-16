import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { Quasar } from 'quasar'
import quasarUserOptions from '@/quasar-user-options'
// import Gun from 'gun'
import 'solana-wallets-vue/styles.css'
import '@/styles/main.css'
// const Gun = GUN({peers:['http://localhost:8080/prjctHunt']})
createApp(App)
    // .use(Gun, {
    //     peers: ['http://localhost:8765/gun']
    // })
    .use(Quasar, quasarUserOptions)
    .use(store)
    .use(router).mount('#app')
