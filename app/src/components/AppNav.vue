<script setup lang="ts">
import router from '@/router';
import { ref, watchEffect, computed, ComputedRef } from 'vue';
import Auth from '@/utils/auth';
import store, { ACTING_AS, State } from '@/store';
import { WalletMultiButton, useWallet } from 'solana-wallets-vue'
import { verifyNFT } from '@/utils/verifyNFT';
import { loginReminder } from '@/utils/helpers';
import { signout } from '@/utils/auth_func';
import LotteryButton from '@/components/LotteryButton.vue';
import { requestOptions, server } from '@/utils/helpers';
import { useQuasar } from 'quasar';

const verified = ref(false)
const lotteryView = ref(false)
const $q = useQuasar();
const wallet = useWallet()
const user = computed(() => store.state.user)
const holderStatus = ref(false)
const connected = computed(() => store.state.connected)
const rightDrawerOpen = ref(false)
// const searchToolbar = ref(false);
function toggleRightDrawer() {
    rightDrawerOpen.value = !rightDrawerOpen.value
    return
}
const authLevelInfo = ref(false)
const appTitle = "Prjct Hunt"
const nftMeta: ComputedRef<State["user"]["tokens"]> = computed(() => store.state.user.tokens)
const username = computed(() => store.state.user.username)
const defaultInfo = {
    token_id: `G-${user.value.id}`, img_src: `https://avatars.dicebear.com/api/identicon/${user.value.username}.svg`, token_name: `Explorer-${user.value.username}`, gov_weight: 0, gov_type: `Explorer`
}




function handleSignout() {
    verified.value = false
    return signout()
}

function login() {
    router.push('/login')
    return
}

function handleSelect(info: ACTING_AS) {
    if (store.state.actingAs == info) {
        // console.log('Samesies')
        return
    }
    console.log(info)
    store.commit('setAuthLevel', info.gov_type)
    store.commit('setActingAs', info)
    rightDrawerOpen.value = false;
    return

}
watchEffect(async () => {
    if (connected.value && Auth.loggedIn() && window.location.pathname === '/login') {
        router.push({ name: 'Popular' })
    }
    if (!store.state.user.wallet && wallet.publicKey.value) {
        store.commit('setWallet', wallet.publicKey.value.toBase58())
    }
    if (wallet.connected.value && !verified.value && store.state.actingAs.gov_type === 'Explorer') {
        const success = await verifyNFT(wallet.publicKey.value)
        if (success) {
            const result = await fetch(`${server()}token/send`, requestOptions({ walletString: wallet.publicKey.value, task: 'verifyNFT' }))
            const res = await result.json()
            if (result.status === 200) {
                $q.notify({
                    // type: 'success',
                    icon: 'grade',
                    color: 'secondary',
                    message: '$FIRE Earned',
                    caption: res.message,
                    position: 'top',
                    timeout: 10000
                })
            } else {
                console.log(res.message)
            }
            verified.value = true
        }
        if (!wallet.connected.value) {
            await store.dispatch('updateNFTMeta', [])
            verified.value = false;
            holderStatus.value = false;
        }

        if (nftMeta.value.length) {
            store.commit('setHolder', true)
            holderStatus.value = true;
        }
    }
})



</script>
<template>
    <q-header elevated class=" header bg-primary text-white" height-hint="98">
        <q-toolbar app dark>
            <q-toolbar-title>
                <q-btn ripple flat dark to="/">
                    <q-avatar class="white-shadow">
                        <q-avatar>
                            <img src="../assets/logo.png">
                        </q-avatar>
                    </q-avatar>
                    <label class="text-h5" v-if="$q.screen.gt.sm">
                        {{ appTitle }}
                    </label>
                </q-btn>
                <q-chip outline size="sm" dark>Beta</q-chip>
            </q-toolbar-title>
            <wallet-multi-button v-if="!$q.screen.gt.sm" dark />
            <q-btn align="right" dense flat round icon="menu" @click="toggleRightDrawer" />
        </q-toolbar>

        <q-toolbar id="tabs">
            <q-tabs :align="!$q.screen.gt.sm ? 'left' : 'center'">
                <q-route-tab icon="workspace_premium" to="/" flat class="hidden-sm-and-down"
                    :label="$q.screen.gt.sm ? 'Popular' : void 0">
                    <q-tooltip anchor="top middle" v-if="!$q.screen.gt.sm">Popular</q-tooltip>
                </q-route-tab>
                <q-route-tab icon="today" to="/today" :label="$q.screen.gt.sm ? 'Today' : void 0">
                    <q-tooltip anchor="top middle" v-if="!$q.screen.gt.sm">Today</q-tooltip>
                </q-route-tab>
                <q-route-tab icon="history" to="/previous" :label="$q.screen.gt.sm ? 'Previous' : void 0">
                    <q-tooltip anchor="top middle" v-if="!$q.screen.gt.sm">Today</q-tooltip>
                </q-route-tab>
                <q-route-tab icon="grade" to="/favorites" v-if="connected" flat class="hidden-sm-and-down"
                    :label="$q.screen.gt.sm ? 'Favorites' : void 0">
                    <q-tooltip anchor="top middle" v-if="!$q.screen.gt.sm">Favorites</q-tooltip>
                </q-route-tab>
                <q-route-tab icon="send" v-if="connected" to="Submit" :label="$q.screen.gt.sm ? 'Submit' : void 0">
                    <q-tooltip anchor="top middle" v-if="!$q.screen.gt.sm">Submit</q-tooltip>
                </q-route-tab>
                <q-separator dark class="hidden-sm-and-down" />
                <q-route-tab icon="login" flat :class="loginReminder ? 'highlight' : null" class="hidden-sm-and-down"
                    v-if="!connected" @click="login" :label="$q.screen.gt.sm ? 'Login / Sign Up' : void 0">
                    <q-tooltip anchor="top middle" v-if="!$q.screen.gt.sm">Login/Sign Up</q-tooltip>
                </q-route-tab>
                <!-- <q-route-tab v-if="!connected" flat class="hidden-sm-and-down" @click="signup" label="Signup" /> -->
                <q-route-tab icon="logout" v-if="connected" flat class="hidden-sm-and-down" @click="handleSignout()"
                    :label="$q.screen.gt.sm ? 'Sign Out' : void 0">
                    <q-tooltip anchor="top middle" v-if="!$q.screen.gt.sm">Popular</q-tooltip>
                </q-route-tab>
            </q-tabs>
            <div v-if="$q.screen.gt.sm" class="username-container">
                <span v-if="username">
                    <q-btn dense flat to="/me" :disable="!username">
                        <q-avatar square size="sm">
                            <img :src="store.state.actingAs.img_src" />
                        </q-avatar>
                        <span>
                            &nbsp; &nbsp;|&nbsp;
                            {{ username }}
                        </span>
                        <q-tooltip anchor="bottom left">View/Edit Your Info</q-tooltip>
                    </q-btn>
                    <q-btn dense flat @click="authLevelInfo = true">
                        &nbsp;|&nbsp;
                        {{ store.state.actingAs.gov_type }}
                        <q-tooltip>Governing Type of NFT You're Working As.</q-tooltip>
                    </q-btn>

                </span>
                <span v-else>
                    Not Signed In
                </span>
                <!-- <q-btn class="username" flat :label="username ? username : 'Not Signed In'" to="/me">

                    </q-btn> -->
            </div>

        </q-toolbar>
        <q-toolbar class="bg-primary search-toolbar text-white">
            <!-- <span v-if="searchToolbar" class="searchBar-span">
               
            </span> -->
            <span v-if="!$q.screen.gt.sm" class="username-container">
                <span v-if="username">
                    <q-btn dense flat to="/me" :disable="!username">
                        <q-avatar square size="sm">
                            <img :src="store.state.actingAs.img_src" />
                        </q-avatar>
                        <q-tooltip anchor="bottom left">View/Edit Your Info</q-tooltip>
                    </q-btn>
                    &nbsp;|&nbsp;
                    <q-btn dense flat @click="authLevelInfo = true">
                        {{ store.state.actingAs.gov_type }}
                        <q-tooltip>Governing Type of NFT You're Working As.<br> Click for more info.</q-tooltip>
                    </q-btn>
                    <q-icon name="o_info">
                        <q-tooltip> Click on current role for more info.</q-tooltip>
                    </q-icon>

                </span>
                <span v-else>
                    Not Signed In
                </span>
                <!-- <q-btn class="username" flat :label="username ? username : 'Not Signed In'" to="/me">
                
                </q-btn> -->
            </span>
        </q-toolbar>

        <q-dialog class="auth-level-info" v-model="authLevelInfo" transition-show="slide-up"
            transition-hide="slide-down">
            <q-card dark>
                <q-bar>
                    <q-btn dense flat icon="close" v-close-popup>
                        <q-tooltip class="bg-white text-primary">Close</q-tooltip>
                    </q-btn>
                </q-bar>

                <q-card-section class="roles-page-title text-h5">
                    PrjctHunt Roles:
                </q-card-section>
                <q-card-section class="roles-container">
                    <q-card dark class="shadow-up-10 shadow-12">
                        <q-card-section class="role-title">Explorer</q-card-section>
                        <q-card-section class="role-description">
                            This is the default role on PrjctHunt. No frills. Everyone gets this role for
                            signing up.

                        </q-card-section>
                    </q-card>
                    <q-card dark class="shadow-up-10 shadow-12">

                        <q-card-section class="role-title">Founder</q-card-section>
                        <q-card-section class="role-description">
                            This is the highest role on PrjctHunt. Attained by holding one or more
                            PrjctPhoenix: Founder NFT in the connected wallet.
                            <dl>
                                <dt>

                                    Perks include:
                                </dt>
                                <dd>&#x2B50; All perks of PrjctPhoenix Member</dd>
                                <dd>&#x2B50; Top priority on Feature requests</dd>
                                <dd>
                                    ... and more.
                                </dd>

                            </dl>
                        </q-card-section>
                    </q-card>
                    <q-card dark class="shadow-up-10 shadow-12">
                        <q-card-section class="role-title">Member</q-card-section>
                        <q-card-section class="role-description">
                            This is the second highest role on PrjctHunt.Attained by holding one or
                            more PrjctPhoenix: Member Collection NFT in the connected wallet.
                            <dl>
                                <dt>

                                    Perks include:
                                </dt>

                                <dd>
                                    &#x2B50; Augmented Sponsoring when submitting Prjcts
                                </dd>
                                <dd>
                                    &#x2B50; Full access to all features Available
                                </dd>
                            </dl>
                        </q-card-section>
                    </q-card>
                    <q-card dark class="shadow-up-10 shadow-12">
                        <q-card-section class="role-title">Affiliate</q-card-section>
                        <q-card-section class="role-description">
                            This is the second level membership role on PrjctHunt. Attained by holding one
                            or
                            more of any PrjctPhoenix Affiliate's NFT in the connected wallet.
                        </q-card-section>
                    </q-card>
                    <q-card dark class="shadow-up-10 shadow-12">
                        <q-card-section class="role-title">Saved</q-card-section>
                        <q-card-section class="role-description">
                            This is the base level membership role on PrjctHunt. Attained by holding one or
                            more PrjctPhoenix: Saved By Fire in the connected wallet.
                        </q-card-section>
                    </q-card>
                </q-card-section>
            </q-card>
        </q-dialog>
    </q-header>
    <q-drawer dark v-model="rightDrawerOpen" side="right">
        <div>
            <wallet-multi-button v-if="$q.screen.gt.sm" dark />
            Holder : <span :class="holderStatus ? 'holder' : 'no-holder'">{{ holderStatus }}</span>
        </div>
        <q-btn id="search-btn" color='accent' fab icon=search @click="router.push('/search')">
            <q-tooltip>Navigate to Search Page</q-tooltip>
        </q-btn>
        <div v-if="!verified" class="text-subtitle text-white">
            Connect a Wallet with Prjct Phoenix NFT To Use This Feature.
            <p>Have one?<br> <a href="#/login">LOGIN</a></p>
        </div>
        <div v-else class="text-subtitle text-white">Select an NFT for use. </div>
        <q-separator dark spaced />
        <div class="button-container">
            <q-btn class="drawer-btn" fit v-if="connected" fab label="View Your Favorite Prjcts" to="/favorites" />
            <q-btn class="drawer-btn" fit v-if="connected" fab label="Submit Prjct" to="/submit" />
            <q-btn class="drawer-btn" fit v-if="connected" fab label="Edit Profile" to="/me" />
            <q-btn class="drawer-btn" fit v-if="connected" fab label="Bug / Feature Request" to="/report" />
            <q-btn class="drawer-btn" color="$accent" fit v-if="connected && wallet.connected.value" fab
                label="$Fire Lottery" @click="() => lotteryView = !lotteryView" />
        </div>
        <q-separator dark spaced />
        <div v-if="nftMeta.length" class="workAs text-h6">
            Work As

        </div>
        <div class="drawer-wrapper">
            <div class="wag-btn--container">
                <q-btn v-if="nftMeta.length" fab ripple clickable class="wag-btn" label="Guest"
                    @click="handleSelect({ ...defaultInfo })" />
                <q-btn v-else class="wag-btn" fab dark disabled label="Get One from MagicEden" target="_blank" />
            </div>

            <section class="drawer" v-if="nftMeta">
                <q-card class="nft-card" v-for="nft in nftMeta" :key="nft.key" dark>
                    <q-card-section type="button" ripple class="select-btn"
                        @click="() => handleSelect({ token_id: nft.mint, img_src: nft.image, token_name: nft.name, gov_weight: nft.gov_weight, gov_type: nft.gov_type })">

                        <q-img :src="nft.image" ratio="1">

                        </q-img>
                        <q-card-actions align="center" class="truncate">
                            {{ nft.name }}
                        </q-card-actions>
                    </q-card-section>
                </q-card>
            </section>
        </div>
    </q-drawer>
    <q-dialog class="auth-level-info" v-model="lotteryView" transition-show="slide-up" transition-hide="slide-down">
        <LotteryButton />
    </q-dialog>
</template>
<style scoped>
.holder {
    color: green;
    margin-left: 3px;
    font-size: 1.25rem;
    font-variant: small-caps;
    font-weight: 600;

}

.white-shadow {
    box-shadow: 0px 0px 5px 2px rgba(255, 255, 255, 0.5), 0px 0px 0px 2px rgba(0, 0, 0, 0.1);
    margin-right: .5rem;
}

.username-container {
    flex: 1;
    text-align: right;
}

.no-holder {
    color: #ff7f50;
    margin-left: 3px;
    font-size: 1.25rem;
    font-variant: small-caps;
    font-weight: 600;

}

.highlight {
    background-color: #ff7f50;
}


#tabs {
    overflow-x: auto;
}

.drawer-wrapper {
    background-color: #ffffff55;
    max-height: 500px;
    overflow-y: auto;
    padding: 1rem 0;
}

.drawer {
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    gap: 1rem 2rem;

}

.workAs {
    flex: 0 0 100%;
}

.wag-btn--container {
    display: flex;
}

.wag-btn {
    margin: 1rem auto;
    /* flex: 0 0 100%; */
    align-items: center;
    justify-self: center;
    width: 80%;
    background-color: #1D1D1D;
    /* box-shadow: 0px 0px 5px 2px rgba(255, 255, 255, 0.5), 0px 0px 0px 2px rgba(0, 0, 0, 0.1); */
}

.container {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-evenly;
    min-height: 100px;
    /* gap: 2rem 2rem; */
}

.button-container {
    display: flex;
    width: 100%;
    flex-flow: row wrap;
}

.drawer-btn {
    flex: 1 0 100%;
}

.absolute-bottom {
    background-color: unset;
}

.nft-card {
    flex: 0 0 20%;
    /* min-width: 250px; */
    max-width: 300px;
}

.auth-level-info {
    -ms-overflow-style: none;
    /* IE and Edge */
    scrollbar-width: none;
}

.roles-page-title {
    font-weight: 800;
    padding-bottom: 0;
}

.roles-container {
    width: 80%;
    margin: 0 auto;
}

.role-title {
    font-weight: 600;
    font-size: 1rem;
    margin: 0;
    padding-bottom: 0;
    text-decoration: underline;
}

.role-description {
    font-size: .75rem;
    margin-top: 0;
    margin-bottom: 2rem;
}

.search-toolbar {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-evenly;
}

.searchBar-span {
    min-width: 200px;
}

.truncate {
    font-size: calc(6px + .25vw);
    width: 100px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.search-toolbar .username-container {
    flex: 0 0 175px;
    min-width: 168px;
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
}

#search-btn {
    position: absolute;
    bottom: 2%;
    right: 1.5rem;
    margin: 2rem auto
}
</style>