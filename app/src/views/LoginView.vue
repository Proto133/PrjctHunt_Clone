<script setup lang="ts">
import { Ref, ref, watchEffect } from 'vue'
import axios from 'axios';
import { useQuasar } from 'quasar';
import { handleLogin, handleSignUp, handleWalletLogin, ERTLogin } from '@/utils/auth_func';
import { useWallet } from 'solana-wallets-vue';
import { verifyWallet } from '@/utils/txs';
import { PublicKey } from '@solana/web3.js';

interface LOGINCREDS {
    username?: string;
    password?: string;
    wallet?: string | PublicKey | null;
}

const wallet = useWallet()
const $q = useQuasar()


const Wallet: Ref<string | undefined> = ref(wallet.publicKey.value?.toBase58())
const username = ref('')
const password = ref('')
const pageTitle = 'Login'
const ERTView = ref(false);
const file = ref()


async function filterLoginSignup(type: string, loginData: LOGINCREDS) {
    switch (type) {
        case 'login':
            try {
                await handleLogin({ ...loginData })
            } catch (err) {
                return $q.notify({
                    color: 'red-10',
                    textColor: 'white',
                    icon: 'close',
                    message: 'Failed',
                    caption: err ? `${err}` : 'Something went wrong.',
                    position: 'top'
                })
            }
            break;
        case 'signup':
            try {
                await handleSignUp({ ...loginData })
            } catch (err) {
                return $q.notify({
                    color: 'red-10',
                    textColor: 'white',
                    icon: 'close',
                    message: 'Failed',
                    caption: err ? `${err}` : 'Something went wrong.',
                    position: 'top'
                })
            }
            break;
        case 'walletLogin':
            try {
                await verifyWallet(wallet.publicKey.value)
                if (!verifyWallet) throw new Error(`Doesn't look like that wallet is yours bub.`)
                await handleWalletLogin({ ...loginData })
            } catch (err) {
                return $q.notify({
                    color: 'red-10',
                    textColor: 'white',
                    icon: 'close',
                    message: 'Failed',
                    caption: err ? `${err}` : 'Something went wrong.',
                    position: 'top'
                })
            }
            break;
    }
}

function handleERTSelect() {
    ERTView.value = true;
}
function onSelect() {
    const FILE = file.value[0]
    const ext = FILE[0].name.split('.').pop()
    if (ext !== 'ert') {
        file.value = ''
        return $q.notify({
            color: 'red-10',
            textColor: 'white',
            icon: 'close',
            message: 'Failed',
            caption: `Wrong File Type -- please try again`,
            position: 'top'
        })
    }
    file.value = FILE
    return
}
async function handleERTLogin(ERT: (string | Blob)[]) {
    // console.log(file.value[0])
    const formData = new FormData();
    await formData.append('file', ERT[0])
    const { data } = await axios.post(`https://prjcthunt-server.herokuapp.com/user/ERT/login`, formData);
    ERTLogin(data)
    return

}

watchEffect(() => {
    if (wallet.connected.value) {
        Wallet.value = wallet.publicKey.value?.toBase58()
    }
    // console.log(Wallet.value)
})

</script>
<template>
    <q-page class="page-wrapper">
        <h4> {{ pageTitle }}</h4>
        <q-card v-if="!ERTView" class="card" dark>
            <q-card-section>
                <q-input class="input" dark filled type="text" v-model="username" placeholder="username" />
                <q-input class="input" dark filled type="password" v-model="password" placeholder="password" />
            </q-card-section>
            <q-card-actions>
                <q-btn label="Login"
                    @click="filterLoginSignup('login', { username: username, password: password, wallet: Wallet })" />
                <q-btn v-if="wallet.connected.value && Wallet" label="Login with Wallet"
                    @click="filterLoginSignup('walletLogin', { wallet: Wallet })" />
                <q-btn label="Sign Up"
                    @click="filterLoginSignup('signup', { username: username, password: password, wallet: Wallet })" />
            </q-card-actions>
        </q-card>
        <section id="ERT-container">
            <q-btn align="center" label="Login With ERT" @click="handleERTSelect()">
                <q-tooltip>Emergency Recovery Token</q-tooltip>
            </q-btn>
        </section>
        <q-dialog v-model="ERTView">
            <q-card dark>
                <form @submit.prevent="handleERTLogin(file)" enctype="multipart/form-data">
                    <q-card-section>
                        <q-input dark v-model="file" type="file" @change="onSelect()" />
                    </q-card-section>
                    <q-card-actions align="center">
                        <q-btn dark type="submit" label="Login" @click="handleERTLogin(file)" />
                    </q-card-actions>
                </form>
            </q-card>
        </q-dialog>
    </q-page>
</template>
<style scoped>
.page-wrapper {
    padding: 2rem;
}

#ERT-container {
    margin: 3rem auto;
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
}

.input {
    margin: 1rem auto;
}

.card {
    width: 60%;
    margin: auto auto;
}
</style>