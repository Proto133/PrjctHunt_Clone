<script setup lang="ts">
import { watchEffect, ref } from 'vue';
import AppNav from '@/components/AppNav.vue'
import AppFooter from '@/components/AppFooter.vue'
import router from '@/router'
import store from './store';
import Auth from '@/utils/auth'
// import { handleCheckStore, handleCheckGunDB} from '@/dev/testing';
// import moment from 'moment';


// const searchInput = ref('')
const loading = ref(false)




watchEffect(() => {
  const info = Auth.getProfile()?.data
  console.log(window.location)
  if (window.location.hash == '#/login' && store.state.connected) {
    router.push({ name: 'Popular' })
  }
  if (info) {
    const { username, id } = info
    if (Auth.loggedIn() && !store.state.connected) {

      // console.log({ App_vue: info })
      store.commit('setConnected', true)
      store.commit('setActingAs', info)
      store.commit('setAuthLevel', 'Explorer')
      store.dispatch('login', { username: username, id: id })
    }
    if (!store.state.user && Auth.loggedIn()) {
      store.dispatch('login', { username: username, id: id })


    }
    if (Auth.loggedIn() && !store.state.connected) {
      store.dispatch('login', { username: username, id: id })

    }
  }
  if (!Auth.loggedIn() && store.state.connected) {
    store.dispatch('signout')
    Auth.logout()
  }
})

</script>

<template>
  <q-layout class="layout hide-scrollbar" view="hHh lpR fFf">

    <q-page-container class="wrapper hide-scrollbar" v-if="!loading">
      <AppNav />
      <!-- <q-btn label="Check GunDB" @click="() => handleCheckGunDB()" />-->
      <!-- <q-btn class="text-white" label="Check Store" @click="() => handleCheckStore()" /> -->
      <router-view />
    </q-page-container>
    <q-page-container class="wrapper hide-scrollbar" v-else>
      <q-linear-progress indeterminate color="white" class="q-mt-sm" />
      <q-linear-progress query color="secondary" class="q-mt-sm" />
      <q-linear-progress indeterminate color="accent" class="q-mt-sm" />
      <q-linear-progress query color="primary" class="q-mt-sm" />
      <q-linear-progress indeterminate rounded color="accent" class="q-mt-sm" />
      <q-linear-progress query color="secondary" class="q-mt-sm" />
      <q-linear-progress indeterminate color="white" class="q-mt-sm" />
    </q-page-container>
    <AppFooter />
  </q-layout>
</template>

<style lang="scss">
.layout {
  width: 50%;
}

nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

.wrapper {
  margin-top: 3rem;
}

// @media screen and (max-width: 768px) {
//   #search-btn {
//     bottom: unset;
//     right: unset;

//   }
// }
</style>
