<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { ref, watchEffect, defineProps } from 'vue'
import { copyToClipboard, useQuasar } from 'quasar'
import { requestOptions, server } from '@/utils/helpers';

const props = defineProps(['userToken'])

async function handleCopyClick(value: string) {
    try {
        await copyToClipboard(value)
        return $q.notify({
            color: 'green-10',
            textColor: 'white',
            icon: 'clipboard',
            group: 'saved group',
            message: `Successfully copied to clipboard`,
            position: 'top'

        })

    } catch (err) {
        // console.log(err)
        return $q.notify({
            color: 'red-10',
            textColor: 'white',
            icon: 'warning',
            message: `So that didn't work. . . sorry`,
            position: 'top'

        })
    }


}
const $q = useQuasar();
const loading = ref(true)
const friend = ref()
const route = useRoute()
watchEffect(async () => {
    let newToken = route.params.id || props.userToken
    if (newToken) {
        // console.log({ newToken })
        const response = await fetch(`${server()}user/findByToken`, requestOptions({ token: newToken }))
        if (!response.ok) { return }
        // console.log(await response.json())
        friend.value = await response.json();
        loading.value = false
    }

})
</script>
<template>
    <suspense>
        <template #fallback>
            <div v-if="loading" class="q-pa-md flex flex-center">
                <q-circular-progress indeterminate size="50px" color="indigo" class="q-ma-md" />
            </div>
        </template>
        <q-card id="contact-card" v-if="!loading" dark>
            <q-card-section class=" flex justify-center greeting full-width">
                <q-avatar v-if="friend.avatar" size="40px">
                    <img id="avatar" :src="friend.avatar ? friend.avatar : void 0" alt="User Avatar" />
                </q-avatar>
                <div class="text-h6">
                    {{ friend.username }}
                </div>

            </q-card-section>
            <q-card-section v-if="friend.bio" id="bio-section">
                <div class="text-h6">
                    Bio:
                </div>
                {{ friend.bio }}
            </q-card-section>
            <q-card-section id="socials-section">
                <div class="text-h6">Socials:</div>
                <q-btn dark flat :disable="!friend?.discord"
                    :label="($q.screen.gt.xs ? (friend.discord ? friend.discord : 'Not Available') : void 0)"
                    icon="fab fa-discord" :href="`http://www.discordapp.com/user/${friend.discordID}`" target="_blank">
                    <q-tooltip v-if="friend?.discord">{{ friend?.discord }}</q-tooltip>
                </q-btn>
                <q-btn dark flat :disable="!friend?.twitter"
                    :label="$q.screen.gt.xs ? (friend.twitter ? friend.twitter : 'Not Available') : void 0"
                    icon="fab fa-twitter" :href="`http://www.twitter.com/${friend.twitter}`" target="_blank">
                    <q-tooltip v-if="friend?.twitter">{{ friend.username }} on Twitter @{{ friend?.twitter }}
                    </q-tooltip>
                </q-btn>
                <q-btn dark flat :disable="!friend?.email"
                    :label="$q.screen.gt.xs ? (friend.email ? friend.email : 'Not Available') : void 0" icon="email"
                    :href="`mailto:${friend.email}`" target="_blank">
                    <q-tooltip v-if="friend?.email">{{ friend.email }}</q-tooltip>
                </q-btn>
                <q-btn dark flat v-if="friend?.website" :label="$q.screen.gt.xs ? 'Website' : void 0" icon="language"
                    :href="friend.website" target="_blank">
                    <q-tooltip>{{ friend?.website }}</q-tooltip>
                </q-btn>
            </q-card-section>
            <q-card-section id="wallet-section">
                <div class="text-h6">Wallet:</div>
                <div class="truncate" @click="handleCopyClick(friend.wallet)">
                    {{ friend?.wallet }}
                </div>
                <q-tooltip max-width="300px">Click to Copy Address to Clipboard</q-tooltip>
            </q-card-section>
            <q-card-section>

                <div class="text-h6">Favorite Prjcts:</div>
                <q-card-section class="flex fav-section row justify-around">
                    <q-card class="fav-card" align="center" dark v-for="project in friend?.favorites" :key="project.id">
                        <q-img style="max-width: 300px; height: 150px;" fit="cover" ratio="1" :src="project.thumbnail">
                            <div class="absolute-bottom text-subtitle1 text-center">
                                {{ project.name }}
                            </div>
                        </q-img>
                    </q-card>
                </q-card-section>
            </q-card-section>
        </q-card>
    </suspense>
</template>
<style scoped>
#contact-card {
    width: 80%;
    margin: 2rem auto;
}

.fav-section {
    gap: 1rem 1rem;
}

.fav-card {
    background-color: #ffffff6b;
    padding: .25rem;
    flex: 0 0 20%;
    min-width: 195px;

}

.truncate {
    font-size: calc(10px + .25vw);
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
