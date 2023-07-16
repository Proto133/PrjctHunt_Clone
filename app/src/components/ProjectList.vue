<script setup lang="ts">
import { Ref, ref, computed, watchEffect, defineProps } from 'vue'
import { useQuasar } from 'quasar'
import store from '@/store'
import ProjectDetail from '@/components/ProjectDetail.vue'
import { Project } from '@/types/Project'
import Auth from '@/utils/auth'
import moment from 'moment'
import { highlight, getVotes, votedCheck, requestOptions, yesterday, today, addFavorite, removeFavorite, server, earnToken } from '@/utils/helpers';
import { useWallet } from 'solana-wallets-vue'


const props = defineProps(['projectList', 'listType', 'pageTitle'])
const loading = ref(false)
const connected = computed(() => store.state.connected)
const refreshLoading = ref(false)
const selectedProject = ref()
const projectDetailView = ref(false)
const favsList = ref()
const wallet = useWallet()
// const userWallet = computed(() => wallet.publicKey.value)
const tokenID = computed(() => store.state.actingAs.token_id)
const votedHighlight = ref(false)
const $q = useQuasar()
const pageTitle = computed(() => props.pageTitle)


async function refreshProjectList() {
    const res = await fetch(`${server()}proj/get/all`, requestOptions())
    let list = await res.json()

    projectList.value = sortList(list)
    return projectList
}



async function handleUnVote(tokenID: string, projID: string) {
    refreshLoading.value = true;
    if (!connected.value) {
        highlight()
        $q.notify({
            color: 'orange-10',
            textColor: 'white',
            icon: 'close',
            message: 'Failed',
            caption: 'So Close!! Please Sign In to Cast Your Vote.',
            position: 'center'
        })
        refreshLoading.value = false;
        return
    }
    votedHighlight.value = !votedHighlight.value
    let target
    if (projectList.value) {

        target = Object.values(projectList.value)
        target = target.filter((project: any) => project._id == projID)
    }
    //console.log({ target })
    const votesList = await getVotes(projID)
    if (votesList.includes(tokenID)) {
        const data = { target: projID, tokenID: tokenID }
        //console.log({ unvote: data })
        const response = await fetch(`${server()}proj/unvote`, requestOptions(data))
        if (!response.ok) {
            refreshLoading.value = false;
            //console.log(await response.json());
            return $q.notify({
                color: 'red-10',
                textColor: 'white',
                icon: 'close',
                message: 'Failed',
                caption: 'Something went wrong',
                position: 'top'
            })
        }
        $q.notify({
            color: '#ff7f50',
            textColor: 'white',
            icon: 'remove',
            message: 'Successully unvoted',
            caption: 'We don\'t like them either . . .',
            position: 'top'
        })
        const update = target[0].upvotes.filter((i: any) => i.token !== tokenID);
        //console.log({ update })
        votesList.value = update
        refreshLoading.value = false;
        await refreshProjectList();
        return
    }
}

async function handleUpVote(tokenID: string, projID: string) {
    //console.clear()
    //console.log({ projID })
    refreshLoading.value = true;
    if (!connected.value) {
        highlight()
        $q.notify({
            color: 'orange-10',
            textColor: 'white',
            icon: 'close',
            message: 'Failed',
            caption: 'So Close!! Please Sign In to Cast Your Vote.',
            position: 'center'
        })
        refreshLoading.value = false;
        return
    }
    votedHighlight.value = !votedHighlight.value



    const data = { target: projID, tokenID: tokenID }
    const response = await fetch(`${server()}proj/upvote`, requestOptions(data))
    if (!response.ok) {
        // //console.dir(response)
        refreshLoading.value = false;
        await refreshProjectList();
        return $q.notify({
            color: 'red-10',
            textColor: 'white',
            icon: 'close',
            message: 'Failed',
            caption: 'Something went wrong',
            position: 'top'
        })
    }

    await refreshProjectList();
    refreshLoading.value = false;
    if (wallet.publicKey.value) {
        const tokenEarned = await earnToken(wallet.publicKey.value.toBase58(), 'prjct-upvote')
        $q.notify(tokenEarned)
    }
    return $q.notify({
        color: 'green-10',
        textColor: 'white',
        icon: 'done',
        message: 'Success!',
        caption: 'The project thanks you.',
        position: 'top'
    })

}



async function handleFavorite(target: string) {
    const data = { target: target }
    let result
    if (favsList.value.includes(target)) {
        result = await removeFavorite(data)
        if (!result) {
            return $q.notify({
                color: 'red-10',
                textColor: 'white',
                icon: 'close',
                message: 'Failed',
                caption: 'Something went wrong',
                position: 'top'
            })
        }
        return favsList.value = favsList.value.filter(f => f !== target)
    }
    result = addFavorite(data)
    if (!result) {
        return $q.notify({
            color: 'red-10',
            textColor: 'white',
            icon: 'close',
            message: 'Failed',
            caption: 'Something went wrong',
            position: 'top'
        })
    }

    if (wallet.publicKey.value) {
        const tokenNoti = await earnToken(wallet.publicKey.value.toBase58(), 'addFav')
        $q.notify(tokenNoti)
    }

    return favsList.value = [...favsList.value, target]
}


function sortList(list) {
    // //console.clear()
    // console.log({ list })
    if (!list) { return }
    const listType = props.listType
    let upvotesCount = 0
    switch (listType) {
        default:
            break;
        case "Previous":
            list = list.filter((project: Project) => project.hunted_date === yesterday);

            break;
        case 'Today':
            list = list.filter((project: Project) => project.hunted_date === today);
            //// console.log({ TodayList: list });
            break;

        case "Popular":

            break;
    }
    list.forEach((item: any) => {
        upvotesCount = item.upvotes.length
        let multiplier = 1
        multiplier = item.sponsored.multiplier + 1
        if (isNaN(multiplier)) {
            multiplier = 1
        }

        upvotesCount = upvotesCount * multiplier
        item.upVotesCount = upvotesCount;
        // console.log({ hunted_date: item.hunted_date, multiplier: multiplier, upvotesCount: upvotesCount, name: item.name })
        return item
    })

    // console.log(list)
    // console.log(list)
    list = list.sort((a, b) => (a.upVotesCount < b.upVotesCount) ? 1 : -1)
    list = list.slice(0, 9)
    return list
}


function closeDetailView() {
    handleProjectSelect(null)
    projectDetailView.value = false;
}

function handleProjectSelect(project: Project | null) {
    //// console.clear()

    selectedProject.value = { ...project }
    // console.log({ SelProj: selectedProject.value })
    projectDetailView.value = true
}


const projectList: Ref<Project[] | null> = ref(null)

watchEffect(async () => {
    // console.log(props.projectList)
    if (!projectList.value) {
        projectList.value = sortList(props.projectList)
    }

    if (Auth.loggedIn() && !favsList.value) {
        const getDbFavs = await fetch(`${server()}user/favs`, requestOptions())
        let dbFavs: { favorites: Project[] } = await getDbFavs.json()
        if (!dbFavs.favorites) {
            dbFavs.favorites = []
        }
        favsList.value = dbFavs.favorites.map(project => project._id)
    }


});

</script>
<template>
    <suspense>
        <template #fallback>
            <div v-if="loading" class="q-pa-md flex flex-center">
                <q-circular-progress indeterminate size="50px" color="indigo" class="q-ma-md" />
            </div>
        </template>
        <q-page v-if="projectList" class="page-wrapper hide-scrollbar">
            <span class="title-with-date flex justify-around" v-if="pageTitle !== 'Popular Projects'">
                <h4 class="page-title">{{ pageTitle }}</h4>
                <span class="text-h5">{{ moment().format('L') }}</span>
            </span>
            <span v-else class="title-with-date">

                <h4 class="page-title no-date">{{ pageTitle }}</h4>
            </span>

            <div v-if="projectList.length > 0" class="q-container">
                <q-list class="project-list" v-for="project in projectList" :key="project?._id">
                    <q-card dark class="project-list-item ">
                        <q-card-section class="mint_sponsored_info">
                            <q-chip size="xs" dark v-if="project.sponsored.isSponsored">
                                Sponsored
                            </q-chip>
                            <div v-if="!project.mint_info.minted">

                                <q-chip size="xs" dark
                                    v-if="moment(project.mint_info.date).format('MM/DD/YYYY') !== today">Mint Date:
                                    {{ project.mint_info.date }}
                                </q-chip>

                            </div>
                        </q-card-section>
                        <q-item class="list-item-inner justify-between">
                            <q-item class="left-side-item" clickable ripple @click="() => handleProjectSelect(project)">
                                <q-item-section avatar>
                                    <q-avatar square class="avatar-container">
                                        <q-avatar square v-if="project.thumbnail">
                                            <img :src="project.thumbnail" :alt="`${project.name} thumbnail`" />

                                            <q-tooltip> Hunted by {{ project.hunter }}</q-tooltip>
                                        </q-avatar>
                                        <q-icon v-else name="question_mark" />
                                        <q-tooltip> Hunted by {{ project.hunter }}</q-tooltip>
                                    </q-avatar>
                                </q-item-section>
                                <q-item-section>
                                    <q-item-label class="left project-name">
                                        {{ project.name }}
                                    </q-item-label>
                                    <!-- <q-item-section class="project-tagline"> -->
                                    <div class="project-tagline">

                                        {{ project.tagline }}
                                    </div>
                                    <!-- </q-item-section> -->
                                </q-item-section>
                            </q-item>

                            <q-card-actions class="actions">

                                <q-item class="upVotes">
                                    <q-item-section class="no-words">
                                        <q-btn v-if="props.listType !== 'Results'" class="text-accent" dense
                                            :class="votedCheck(project.upvotes, tokenID) ? 'voted' : null"
                                            :push="votedCheck(project.upvotes, tokenID)" :flat="true" squared
                                            @click="votedCheck(project.upvotes, tokenID) ? handleUnVote(tokenID, project._id) : handleUpVote(tokenID, project._id)">
                                            <div
                                                :class="votedCheck(project.upvotes, tokenID) ? 'text-secondary' : 'text-white'">
                                                {{ project?.upvotes.length }}
                                            </div>
                                            <q-icon
                                                :color="votedCheck(project.upvotes, tokenID) ? 'secondary' : 'white'"
                                                :name="!votedCheck(project.upvotes, tokenID) ? 'arrow_drop_up' : 'arrow_drop_down'" />
                                        </q-btn>
                                        <div v-else
                                            :class="votedCheck(project.upvotes, tokenID) ? 'text-secondary' : 'text-white'">
                                            {{ project?.upvotes.length }}
                                        </div>
                                    </q-item-section>
                                    <q-separator dark />
                                </q-item>
                                <q-item>
                                    <q-item-section>
                                        <q-btn dense dark flat
                                            :icon="favsList?.includes(project._id) ? 'grade' : 'o_grade'"
                                            @click="handleFavorite(project._id)" />
                                    </q-item-section>
                                </q-item>
                            </q-card-actions>
                            <q-card-section v-if="project.mint_info.mintingNow" class="mintingNow-section fit">

                                <q-btn :flat="!project.mint_info.url" :disable="!project.mint_info.url" type="a"
                                    align="center" text-color="#14f195" class="mintingNow-button"
                                    :href="project.mint_info.url ? project.mint_info.url : void 0" target="_blank">
                                    <label style="color:#14f195;">Minting Now!</label>
                                    <q-tooltip>{{ project.mint_info.url ? project.mint_info.url : 'No URL Provided' }}
                                    </q-tooltip>
                                </q-btn>
                            </q-card-section>
                        </q-item>

                        <!-- <UpVoteBtn :tokenID="tokenID"  :handleUpVote="handleUpVote"
                :projID="project._id" :index="project.index" /> -->

                    </q-card>
                    <ProjectDetail v-if="selectedProject" v-model="projectDetailView" :tokenID="tokenID"
                        :closeDetailView="closeDetailView" :refreshProjectList="refreshProjectList"
                        :project="selectedProject" />
                </q-list>

            </div>
            <div v-else class="container">
                <q-card align="center" class="no-list-card" dark>
                    <q-card-section class="no-List-title">
                        Wow! No projects on the {{ props.listType }} list. . .
                    </q-card-section>
                    <q-card-section class="flex justify-evenly buttons">
                        <q-btn ripple label="Check the Popular List . . . " dark to="/">
                            <q-tooltip>People seem to like those.</q-tooltip>
                        </q-btn>
                        <q-btn v-if="props.listType == 'Today'" ripple label="Check the Previous List . . . " dark
                            to="/previous">
                            <q-tooltip>Maybe yesterday was a good day.</q-tooltip>
                        </q-btn>
                        <q-btn v-if="props.listType == 'Previous'" ripple label="Check Today's List . . . " dark
                            to="/today">
                            <q-tooltip>Maybe today is better than yesterday. . .</q-tooltip>
                        </q-btn>
                    </q-card-section>
                </q-card>
            </div>

        </q-page>
    </suspense>

</template>
<style scoped>
.actions {
    flex: 1 0 25%;
    justify-content: space-between;
    flex-flow: row nowrap;
}

.left-side-item {
    flex: 1 0 70%;
}

a.q-btn {
    transition: all ease-in-out .5s;
}

a.q-btn:hover {
    box-shadow: 0px 0px 5px 2px rgba(255, 255, 255, 0.5), 0px 0px 0px 2px rgba(0, 0, 0, 0.1);

    /* background-color: #ffffff4e; */

}

.no-list-card {
    max-width: 900px;
    margin: auto;
}

.no-List-title {
    font-size: 2rem;
    font-weight: 800;
    font-variant: small-caps;
    width: 80%;
    margin: 2rem auto;
}

.page-title {
    font-weight: 800;
    font-variant: small-caps;


}

h4.page-title.no-date {
    width: 80%;
    margin: 0 auto;
}

.title-with-date {
    width: 90%;
    margin: 0 auto
}

.title-with-date * {
    margin: .5rem 0;
}

.page-wrapper {
    padding: 1rem;
    margin: 0 auto;
}


.project-list {
    width: 80%;
    max-width: 900px;
    margin: 0 auto;
    /* -webkit-box-shadow: 0px 0px 8px 3px #ABABAB;  */
    background-color: #1d1d1dd9;
    box-shadow: 0px 0px 5px 1px rgb(171, 171, 171, .8);
}

.container {
    width: 90%;
    margin: 0 auto;
}

.project-list-item {
    background-color: rgba(133, 133, 133, 0.05)
}

.mint_sponsored_info {
    width: 100%;
    margin: 0 auto;
    padding: 0;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
}

.list-item-inner {
    padding: 8px 8px;
    flex-wrap: wrap;
}

.project-name {
    font-weight: 800;
    font-size: calc(10px + .25vw);
    text-align: initial;
}

.project-tagline {
    color: #d73a01;
    font-size: calc(8px + .25vw);
    text-align: initial;

}

.voted {
    background-color: #ffffff09;
}

.avatar-container {
    box-shadow: 0px 0px 5px 2px rgba(255, 255, 255, 0.5), 0px 0px 0px 2px rgba(0, 0, 0, 0.1);
}

.btn-container {
    margin-top: 2rem;
    padding: 1rem;
}

.btn-container * {
    background-color: var(--q-dark);
    box-shadow: 0px 0px 3px 1px rgb(171, 171, 171, .8);
}

.mintingNow-button {
    margin: 0 auto;
    font-weight: 800;
    font-variant: small-caps;
}

a.mintingNow-button {
    color: #14f195 !important;

}

.mintingNow-section {
    padding: 0;
    display: flex;
    justify-content: center;
}

@media screen and (max-width:968px) {

    /* .no-words {
        display: flex;
    } */


    .title-with-date,
    h4.page-title.no-date {
        width: 100%;
        margin: unset;
    }

    .project-list {
        width: 100%;
        max-width: 768px;
        margin: 0 auto;
        /* -webkit-box-shadow: 0px 0px 8px 3px #ABABAB;  */
        box-shadow: 0px 0px 5px 1px rgb(171, 171, 171, .8);
    }

    .container {
        width: 100%;
    }

    .project-list-card {
        width: 100%
    }

    .words {
        display: none;
        /* visibility:hidden; */
    }

    .no-words {
        display: flex;
    }

    .timestamp {
        display: none;
    }
}
</style>
