<script setup lang="ts">
import { watchEffect, ref, onMounted } from 'vue'
import { server, requestOptions } from '@/utils/helpers'
import { useWallet } from 'solana-wallets-vue'
import { tokenLottery } from '@/utils/tokens';
import { useQuasar } from 'quasar';

const wallet = useWallet()
const eligibility = ref(true)
const eligibilityChecked = ref(false);
const $q = useQuasar()
const whyNoPlay = ref('');

onMounted(() => resetCheck())

watchEffect(() => {
    if (!eligibilityChecked.value) {
        checkLotteryEligibility();
    }
})

// async function handleListClear() {
//     await fetch(`${server()}token/clearLottery`, requestOptions())
//     return
// }
function handleConnectWarning() {
    return $q.notify({
        type: 'warning',
        icon: 'warning',
        message: 'Not Eligible to Play',
        caption: 'Is your wallet connected?',
        position: 'center'
    })
}

function resetCheck() {
    console.log("resetCheck")
    eligibilityChecked.value = false;
    setTimeout(resetCheck, 1000 * 60 * 30)
    return
}

async function checkLotteryEligibility() {
    console.log('Checking Eligibility...')
    if (!wallet.publicKey.value) {
        return
    }
    const data = { walletString: wallet.publicKey.value.toBase58() }
    // console.log({ data })
    const response = await fetch(`${server()}token/eligibility/lottery`, requestOptions(data))
    const eligible = await response.json()
    whyNoPlay.value = eligible.message
    eligibility.value = response.status === 200
    return eligibilityChecked.value = true

}

async function handleTokenLottery() {
    let pubkey: string | null = null
    if (wallet.publicKey.value) {
        pubkey = wallet.publicKey.value.toBase58()
    }
    console.log(pubkey)
    try {

        const result = await tokenLottery(pubkey!);
        $q.notify({
            // type: 'success',
            icon: 'grade',
            color: 'secondary',
            message: 'Lottery Results',
            caption: result,
            position: 'top',
            timeout: 10000
        })

        return checkLotteryEligibility()
    } catch (err) {
        console.log(err)
        handleConnectWarning()
        return
    }
}

</script>

<template>


    <q-card dark class="card">
        <q-card-section class="heading">
            <div class="text-h5">
                Click the button below to see if you can win some $FIRE tokens.
            </div>
        </q-card-section>
        <q-card-section class="section" v-if="!!wallet.publicKey.value && eligibility">
            <q-avatar class="white-shadow logo-avatar">
                <q-avatar>
                    <img src="../assets/logo.png">
                </q-avatar>
            </q-avatar>
            <q-btn class="lottery--btn flex justify-evenly" dark @click="() => handleTokenLottery()">
                <label class="text-h5 btn-text">
                    Play Lottery
                </label>
            </q-btn>
            <q-avatar class="white-shadow logo-avatar">
                <q-avatar>
                    <img src="../assets/logo.png">
                </q-avatar>
            </q-avatar>

            <div class="text-caption">
                The odds of winning are 10:1 and the clears every 12hrs. This is just a fun side reason to be here, as
                you may have noticed, you earn $FIRE just by using the site as normal.

            </div>
        </q-card-section>
        <q-card-section v-else>
            <div class="text-h6 flex justify-center q-pa-lg">
                {{ whyNoPlay }}
            </div>
            <!-- <q-btn @click="handleListClear">CLEAR</q-btn> -->
        </q-card-section>
        <q-card-section class="text-center link">
            <a href="https://solscan.io/account/F1RELQfqm789aGdLsdXRusCnrVEhqWGg3rrRDQsFXvR8" target="_blank">
                F1RELQfqm789aGdLsdXRusCnrVEhqWGg3rrRDQsFXvR8
                <q-tooltip>Look at $FIRE on Solscan</q-tooltip>
            </a>

        </q-card-section>
    </q-card>
</template>
<style scoped>
.card {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 60%;
    min-height: 300px;
}

.lottery--btn {
    padding: 5px 0;
    flex: 0 0 70%;
    /* padding: 1rem; */
    box-shadow: 0 0 8px 2px #fe4200;
}

.logo-avatar {
    flex: 0 0 10%
}

.btn-text {
    font-size: 1.5rem;
    font-weight: bold;
}

.section {
    display: flex;
    flex-flow: row wrap;
    gap: 1.5rem .5rem;
    justify-content: center;

}

.link * {
    text-decoration: none;
}
</style>
