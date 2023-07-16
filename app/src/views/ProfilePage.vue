<script setup lang="ts">
import { Ref, ref, computed, watchEffect, toRaw, onMounted } from 'vue';
import { requestOptions, server } from '@/utils/helpers';
import { useQuasar } from 'quasar';
import Auth from '@/utils/auth';
import store, { USER } from '@/store';
import { Project } from '@/types/Project';
import { useWallet } from 'solana-wallets-vue';

const wallet = useWallet();


const projEditing = ref(false)
const NFTview = ref(false);
const token = Auth.getToken();
const storeUser = computed(() => store.state.user)
const holder = computed(() => !!store.state.user.tokens.length)
const tokens = computed(() => store.state.user.tokens)
const $q = useQuasar();
const User: Ref<USER> = ref(null as unknown as USER)
const passwordProxy = ref();
const passwordProxy2 = ref();
const loading = ref(false)
const connected = computed(() => Auth.loggedIn())
const editing = ref(false);
const updateLoading = ref(false)
const picList = ref()
const huntedProjects: Ref<any[] | null> = ref(null);
const fields = ref()
const manualField = ref('')
const tagOptions: Ref<string[]> = ref(['loading'])
const showTagBanner = ref(true)
const tagsLoading = ref(false)
const slide = ref(0)
// let tagsArray: string[] = []
const DYOT = ref('')
function toggleEdit() {
    editing.value = !editing.value;
}
async function getTags() {
    // function capitalizeWords(arr) {
    //     return arr.map(element => {
    //         return element.charAt(0).toUpperCase() + element.substring(1).toLowerCase();
    //     });
    // }
    tagsLoading.value = true;
    const response = await fetch(`${server()}tags`, requestOptions());
    if (!response.ok) {
        $q.notify({
            color: 'red-10',
            textColor: 'white',
            icon: 'warning',
            message: 'Um ... sorry. It seems that didn\'t work'
        })
        tagsLoading.value = false;
        return ['loading'];
    }
    let tags = await response.json()
    let tagArray: string[] = []
    // tags = capitalizeWords(tags)

    tags.forEach((tag: string) => {
        // console.log({ tag })
        tagArray = [...tagArray, tag]
        return tagArray
    });
    tagsLoading.value = false;
    return tagArray;

}
async function getUser() {
    loading.value = true;
    const response = await fetch(`${server()}user/me`, requestOptions())
    const res = await response.json();
    const user = res.user
    !user.avatar ?
        user.avatar = `https://avatars.dicebear.com/api/identicon/${storeUser?.value?.username}.svg` :
        null;
    huntedProjects.value = res.huntedProjects;
    loading.value = false;
    // console.log(username)
    return user
}


async function downloadERT() {
    // console.log('Download')
    const response = await fetch(`${server()}user/ERT/`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    const file = await response.blob()
    const blob = new Blob([file], { type: "application/ert" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${storeUser.value.username}.ert`;
    link.click();
    URL.revokeObjectURL(link.href);

    await fetch(`${server()}user/rmERT`, requestOptions())
    return


}
async function genERT() {
    // console.log('genERT')
    const response = await fetch(`${server()}user/genERT`, requestOptions());
    if (!response.ok) {
        return $q.notify({
            color: 'red-10',
            textColor: 'white',
            icon: 'close',
            message: 'Failed',
            caption: 'Something went wrong.',
            position: 'top'
        })
    }
    await response.json();
    return downloadERT();


}

async function setUpdateUserInfo({ field, value }: { field: string, value: string | number }) {
    updateLoading.value = true
    if (field === 'password' && passwordProxy.value === passwordProxy2.value) {
        value = passwordProxy.value
    }
    if (field === 'username' || field === 'wallet') {
        store.state.user = { ...store.state.user, [field]: value }
    }
    const data = { field: field, value: value }
    const response = await fetch(`${server()}user/me`, requestOptions(data))
    if (!response.ok) {
        return $q.notify({
            color: 'red-10',
            textColor: 'white',
            icon: 'warning',
            message: `Error saving ${data.field} . . . sorry.`,
            position: 'top'
        })

    }
    const res = await response.json();
    const Field = field.charAt(0).toUpperCase() + field.slice(1);
    $q.notify({
        color: 'green-10',
        textColor: 'white',
        icon: 'grade',
        group: 'saved group',
        message: `${Field} has been successfully updated to ${value}`,
        position: 'top'
    })
    passwordProxy.value = ''
    passwordProxy2.value = ''
    User.value = res

}

async function handleSave() {
    let TMPUser = { ...toRaw(User.value) }
    const entries = Object.entries(TMPUser)
    entries.forEach((entry) => {
        if (entry[0] !== 'password') {
            setUpdateUserInfo({ field: entry[0], value: entry[1] })
        }
    })
    await getUser()
    toggleEdit();


}

async function handleMintNowChange(projectID: string, mintingNow: boolean) {
    // console.clear()
    let res
    const data = { projectID: projectID }
    switch (mintingNow) {
        case true:
            try {
                const response = await fetch(`${server()}proj/minting/on`, requestOptions(data))
                res = await response.json()
                // console.log({ res })
            } catch (err) {
                console.log(err)
                return $q.notify({
                    color: 'red-10',
                    textColor: 'white',
                    icon: 'warning',
                    message: `Error setting minting on. . . try again later.`,
                    position: 'top'
                })
            }
            break;
        case false:
            try {
                const response = await fetch(`${server()}proj/minting/off`, requestOptions(data))
                res = await response.json()
            } catch (err) {
                console.log(err)
                return $q.notify({
                    color: 'red-10',
                    textColor: 'white',
                    icon: 'warning',
                    message: `Error setting minting on. . . try again later.`,
                    position: 'top'
                })
            }
            break;
    }
    let otherProjects = huntedProjects.value.filter((project: Project) => project._id !== projectID)

    huntedProjects.value = [res, ...otherProjects]
    return

}
async function setMintURL(projectID: string, mintURL: string) {
    const data = { projectID: projectID, mintURL: mintURL }
    try {
        const response = await fetch(`${server()}proj/setMintURL`, requestOptions(data))
        const res = await response.json()
        return huntedProjects.value = [...huntedProjects.value, res]
    } catch (err) {
        console.log(err)
        return $q.notify({
            color: 'red-10',
            textColor: 'white',
            icon: 'warning',
            message: `Error setting minting URL . . try again later.`,
            position: 'top'
        })
    }

}
async function handleDYOT() {
    if (!DYOT.value) {
        return
    }
    try {
        const data = { tag: DYOT.value }
        await fetch(`${server()}tags/add`, requestOptions(data));

    } catch (err) {
        return $q.notify({
            color: 'red-10',
            textColor: 'white',
            icon: 'warning',
            message: `Error: ${err}`,
            position: 'top'
        })
    }
    tagOptions.value = [...tagOptions.value, DYOT.value]
}
async function editProject(projectID: string, field: string, val: string | any, mint: boolean) {
    let response, res
    if (field === 'media') {
        val.includes(',') ?
            val = val.split(',') : null
        console.log(val)

    }
    if (field === 'tags') {

        val = Object.values(val)
    }


    const data = { target: projectID, field: field, value: val }
    try {
        switch (mint) {
            case true:
                response = await fetch(`${server()}proj/edit/mint`, requestOptions(data))
                break;
            default:
                response = await fetch(`${server()}proj/edit`, requestOptions(data))
        }

        res = await response.json()
        const Field = field.charAt(0).toUpperCase() + field.slice(1);
        $q.notify({
            color: 'green-10',
            textColor: 'white',
            icon: 'o_verified',
            message: `Successfully updated ${Field}`,
            position: 'top'
        })

        // @ts-ignore
        huntedProjects.value = huntedProjects.value.filter(project => project._id !== projectID)
        return huntedProjects.value = [...huntedProjects.value, res]
    } catch (err) {
        console.log(err)
        return $q.notify({
            color: 'red-10',
            textColor: 'white',
            icon: 'warning',
            message: `Error setting minting URL . . try again later.`,
            position: 'top'
        })
    }
}


onMounted(() => {
    loading.value = true;
    // console.clear();
    // console.log({ User: User.value })
    // User.value.username = storeUser.value.username;
})

watchEffect(async () => {
    if (!connected.value) {
        store.dispatch('signout')
    }
    if (tagOptions.value[0] === 'loading') {

        tagOptions.value = await getTags()
    }
    picList.value = tokens.value
    const nogoArray = ['_id', 'sponsored', 'mint_info', 'index', 'hunter', 'hunter_id', 'hunted_date', 'upvotes', 'comments', '__v']
    if (huntedProjects.value) {
        huntedProjects.value.length > 0 ?
            fields.value = Object.keys(huntedProjects.value[0]).filter(field => {
                if (!nogoArray.includes(field)) {
                    return field
                }
            }) : null
    }
    // console.log(picList.value)



    !User.value ? User.value = await getUser() : null

    if (User.value?.wallet && wallet.connected.value) {
        wallet.publicKey.value ?
            User.value.wallet = wallet.publicKey?.value?.toBase58() : null
    }


})
</script>
<template>
    <suspense>
        <q-page>
            <template #fallback>
                <div v-if="loading" class="q-pa-md flex flex-center">
                    <q-circular-progress indeterminate size="50px" color="indigo" class="q-ma-md" />
                </div>
            </template>

            <q-dialog v-model="NFTview" v-if="holder">
                <q-card v-if="holder" class="full-width" elevated dark>
                    <q-carousel v-if="picList?.length > 0" thumbnails swipeable animated v-model="slide" infinite>
                        <q-carousel-slide :name="index" v-for="(pic, index) in picList" :key="index" ratio="1"
                            :img-src="pic.image">
                            {{ pic.name }}
                        </q-carousel-slide>
                    </q-carousel>
                </q-card>
            </q-dialog>
            <div v-if="!loading" class="wrapper flex justify-around wrap full-width">

                <div class="greeting full-width">
                    <q-avatar class="avatar-bg" size="125px">
                        <q-avatar v-if="User" size="125px">
                            <img id="avatar" :src="User.avatar ? User.avatar : void 0" alt="User Avatar" />
                        </q-avatar>
                    </q-avatar>
                </div>
                <q-btn v-if="holder" class="center" @click="NFTview = true">View Your NFTs Affiliated with PrjctHunt
                </q-btn>
            </div>
            <q-card v-if="!loading && User" class="info-card" elevated dark>
                <div class="flex justify-evenly wrap button-container">
                    <q-btn class="btns" color='secondary' @click="toggleEdit" :label="!editing ? 'Edit' : 'Exit'" push
                        dark />
                    <q-btn class="btns" color='secondary' v-if="editing" @click="handleSave" label="Save All" push
                        dark />
                </div>
                <div class="card-overlay">

                    <q-card-section id="general">
                        <q-card-section class="text-h5">
                            General Info:
                        </q-card-section>
                        <q-input :readonly="!editing" v-model="User.username" stacked-label label="Username"
                            :placeholder="User.username" name="username" dense dark>
                            <q-btn v-if="editing" icon-right="save" push dense
                                @click="setUpdateUserInfo({ field: 'username', value: User?.username })" />
                        </q-input>
                        <q-input :readonly="!editing" v-model="User.email" stacked-label label="Email"
                            :placeholder="User.email ? User.email : 'ElonMusk@tesla.com'" name="email" dense dark>
                            <q-btn v-if="editing" icon-right="save" push dense
                                @click="setUpdateUserInfo({ field: 'email', value: User?.username })" />
                        </q-input>
                        <q-input :readonly="!editing" v-model="User.avatar" stacked-label type="url"
                            label="Custom Avatar Image" :placeholder="User.avatar" name="avatar" dense dark>
                            <q-btn v-if="editing" icon-right="save" push dense
                                @click="setUpdateUserInfo({ field: 'avatar', value: User?.avatar })" />
                        </q-input>
                        <q-input :readonly="!editing" v-model="User.bio" stacked-label autogrow type="textarea"
                            label="Bio" :placeholder="User.bio ? User.bio : `A little about yourself`" name="bio"
                            outline dark>
                            <q-btn v-if="editing" icon-right="save" push dense
                                @click="setUpdateUserInfo({ field: 'bio', value: User?.bio })" />
                        </q-input>
                        <q-input :readonly="!editing" v-model="User.wallet" stacked-label type="text"
                            label="Wallet Address" :placeholder="User.wallet ? User.wallet : `Your Solana PubKey`"
                            name="wallet" dense dark>
                            <q-btn v-if="editing" icon-right="save" push dense
                                @click="setUpdateUserInfo({ field: 'wallet', value: User?.wallet })" />
                        </q-input>
                    </q-card-section>
                    <q-card-section id="socials">
                        <q-card-section class="text-h5">
                            Socials:
                        </q-card-section>
                        <q-input :readonly="!editing" v-model="User.website" stacked-label type="text" label="Website"
                            :placeholder="User.website ? User.website : 'https://mysite.com/'" name="website" dense
                            dark>
                            <q-btn v-if="editing" icon-right="save" push dense
                                @click="setUpdateUserInfo({ field: 'website', value: User?.website })" />
                        </q-input>
                        <q-input :readonly="!editing" v-model="User.twitter" stacked-label type="text"
                            label="Twitter Handle" :placeholder="User.twitter" prefix="https://twitter.com/"
                            name="twitter" dense dark>
                            <q-btn v-if="editing" icon-right="save" push dense
                                @click="setUpdateUserInfo({ field: 'twitter', value: User?.twitter })" />
                        </q-input>
                        <q-input :readonly="!editing" v-model="User.discord" stacked-label type="text"
                            label="Discord Handle" :placeholder="User.discord ? User.discord : 'DiscordUSER#1234'"
                            name="discord" dense dark>
                            <q-btn v-if="editing" icon-right="save" push dense
                                @click="setUpdateUserInfo({ field: 'discord', value: User?.discord })" />
                        </q-input>
                        <q-input v-if="editing" v-model="User.discordID" stacked-label type="text" label="Discord ID"
                            name="discord" prefix="https://discordapp.com/users/" dense dark>
                            <q-btn icon-right="save" push dense
                                @click="setUpdateUserInfo({ field: 'discordID', value: User?.discordID })" />
                            <q-tooltip>This is all numbers and can be found by enabling dev mode on Discord. . . Google
                                it if you want --- it's easy.</q-tooltip>
                        </q-input>
                    </q-card-section>
                    <q-card-section v-if="editing" id="account">
                        <q-card-section class="text-h5">
                            Change Password:
                        </q-card-section>
                        <q-input :readonly="!editing" v-model="passwordProxy" stacked-label type="password"
                            label="New Password" name="password" dense dark />
                        <q-input v-if="passwordProxy" :readonly="!editing" v-model="passwordProxy2" stacked-label
                            type="password" label="Again" name="password" dense dark
                            :rules="[val => val == passwordProxy || 'Passwords do not match']">
                            <q-btn icon-right="save" push dense
                                @click="setUpdateUserInfo({ field: 'password', value: passwordProxy })" />
                        </q-input>
                        <q-btn fit dark label="Download Account Recovery File" @click="genERT()" />
                    </q-card-section>
                </div>
            </q-card>
            <q-card id="projects-card" dark>
                <q-card-section align="center">
                    <q-btn class="btns" color='secondary' dark @click="projEditing = !projEditing">
                        Edit Your Hunted Prjcts
                    </q-btn>
                </q-card-section>
                <q-separator dark />
                <q-card outline class="project-card" dark elevated v-for="project in huntedProjects" :key="project.id">
                    <q-list>
                        <q-parallax
                            :src="project.thumbnail ? project.thumbnail : 'https://cdn.discordapp.com/attachments/981310301842591786/984509456110981180/bg_bggenerator_com.png'"
                            :height="400">

                            <div class="project-parallax-text text-h6">
                                {{ project.name }}
                            </div>
                        </q-parallax>
                        <q-item>

                            <q-item-section v-if="projEditing">
                                Minting Now?
                                <span class="mint-toggle">

                                    <q-btn-toggle dark v-model="project.mint_info.mintingNow" toggle-color="accent"
                                        :options="[
                                            { label: 'Yes', value: true },
                                            { label: 'No', value: false }
                                        ]"
                                        @update:model-value="handleMintNowChange(project._id, project.mint_info.mintingNow)" />
                                </span>
                            </q-item-section>
                            <q-item-section>
                                Price Still TBA?
                                <span class="priceTBA-toggle">

                                    <q-btn-toggle dark v-model="project.mint_info.price_TBA" toggle-color="accent"
                                        :options="[
                                            { label: 'Yes', value: true },
                                            { label: 'No', value: false }
                                        ]"
                                        @update:model-value="handleMintNowChange(project._id, project.mint_info.price_TBA)" />
                                </span>

                            </q-item-section>
                            <q-item-section v-if="projEditing">
                                <q-input v-if="project.mint_info.mintingNow" v-model="project.mint_info.url"
                                    stacked-label type="url" label="URL to Mint" name="mintURL" dense dark>
                                    <q-btn icon-right="save" push dense
                                        @click="setMintURL(project._id, project.mint_info.url)" />
                                </q-input>
                            </q-item-section>

                            <q-item-section v-if="projEditing">
                                <q-input v-model="project.mint_info.date" stacked-label type="text" label="Mint Date"
                                    name="mintDate" dense dark>
                                    <q-btn icon-right="save" push dense
                                        @click="editProject(project._id, 'date', project.mint_info.date, true)" />
                                </q-input>
                            </q-item-section>
                            <q-item-section v-if="projEditing">
                                <q-input v-model="project.mint_info.price" stacked-label type="text" label="Mint Price"
                                    name="mintPrice" dense dark>
                                    <q-btn icon-right="save" push dense
                                        @click="editProject(project._id, 'price', project.mint_info.price, true)" />
                                </q-input>
                            </q-item-section>

                        </q-item>
                        <q-item>

                            <q-item-section v-if="projEditing">
                                <q-select popup-content-class="select-options" dark dense v-model="manualField"
                                    label="Field To Edit" :options="fields" />
                                <q-card-section class="tags-span" v-if="manualField === 'tags'">
                                    <div class="flex justify-between">
                                        <span id="tag-options-span">
                                            <span id="tag-options-select">

                                                <q-select popup-content-class="select-options" dark use-chips
                                                    v-model="project.tags" label="Available Tags" :options="tagOptions"
                                                    multiple />
                                            </span>
                                            <span id="tag-options-btn">

                                                <q-btn dark dense
                                                    @click="editProject(project._id, 'tags', project.tags, false)"
                                                    icon="o_save" />
                                            </span>
                                        </span>
                                        <!-- <span id="tag-options-btn">



                                        </span> -->
                                        <span id="tag-DYOT">


                                            <q-input dark id="DYOT-input" v-model="DYOT" type="text"
                                                label="Add a new tag">
                                                <q-btn dark text-color="white" icon="add" push @click="handleDYOT()" />
                                            </q-input>
                                        </span>

                                    </div>
                                    <div id="tag-banner">

                                        <q-banner class="bg-secondary text-white" dark v-if="showTagBanner"
                                            align="center" color="accent" inline-actions>
                                            When adding new tag, save it first, then select it from the list.
                                            <template v-slot:action>
                                                <q-btn flat color="white" label="Dismiss"
                                                    @click="showTagBanner = false" />
                                            </template>
                                        </q-banner>
                                    </div>
                                </q-card-section>
                                <q-input v-if="manualField && manualField !== 'tags'" v-model="project[manualField]"
                                    stacked-label type="textarea" autogrow :label="`Value of ${manualField}`"
                                    name="Manual Field"
                                    :prefix="manualField == 'twitter' ? 'https://twitter.com/' : manualField == 'discordID' ? 'https://discordapp.com/user/' : void 0"
                                    dense dark>
                                    <q-btn icon-right="save" push dense
                                        @click="editProject(project._id, manualField, project[manualField], false)" />
                                </q-input>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </q-card>
            </q-card>
        </q-page>
    </suspense>
</template>
<style scoped>
main {
    height: 100%;
}

q-btn {
    color: #ffffff;
}

.section-title {
    flex: 0 0 100%;
}

#projects-card,
.info-card {
    max-width: 80%;
    margin: 1rem auto 3rem;
    padding: 2rem 5rem;
    background-color: #1d1d1d74
}

.friend--section {
    overflow-x: scroll;
    width: 100%;
    max-height: 50%;
    margin: 0 auto;
    padding: auto 200px;
    display: flex;
    justify-content: center;
    flex-flow: row wrap;
    gap: 1rem 2rem;
}

.friend--container {
    flex: 0 0 100%;
    display: flex;
    justify-content: center;
    flex-flow: row wrap;
    gap: 1rem 2rem;
}

.friend--card {
    width: 186px;
    /* max-height: 100px; */
    box-shadow: 0 1px 5px rgba(255, 255, 255, 0.5);
}

.greeting {
    flex: 0 0 100%;
    display: flex;
    justify-content: center;
    margin: 1rem;
    /* border: 3px solid white; */
}



.project-card {
    margin: 2rem auto;
    background-color: #ffffff2e;
    box-shadow: 0px 0px 3px 3px rgba(255, 255, 255, 0.5), 0px 0px 0px 2px rgba(0, 0, 0, 0.1);
}

.avatar-bg {
    box-shadow: 0px 0px 15px 7px rgba(255, 255, 255, 0.5), 0px 0px 0px 2px rgba(0, 0, 0, 0.1);
    background-color: #0000008d;
}

.card-overlay {
    margin-top: 2rem;
    background-color: #ffffff46;
}

.btns {
    min-width: 150px;
    margin: auto 2rem;
}

.project-parallax-text {
    padding: 1rem;
    background-color: #1d1d1d74
}

.select-options {
    font-variant: small-caps;
}

#tag-DYOT {
    flex: 0 0 33%;
}

#tag-options-span {
    flex: 0 0 33%;
    display: flex;
    justify-content: space-around;
    margin-bottom: 1rem;
}

#tag-options-select {
    flex: 0 0 80%;
}

#tag-options-btn {
    flex: 1;
    display: flex;
    justify-content: center;
}

#DYOT-input {
    flex: 0 0 30%
}

/* 
#tag-banner * {
    color: #14f195 !important;
    background-color: #ffffff0b !important;
} */

@media screen and (max-width: 600px) {

    #projects-card,
    .info-card {
        max-width: 100%;
        /* margin: 1rem auto 3rem; */
        padding: 2rem .5rem;
    }


}
</style>