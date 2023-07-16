<script setup lang="ts">
import { ref, computed, watchEffect, onMounted } from 'vue'
import ProjectDetail from '@/components/ProjectDetail.vue'
// import UpVoteBtn from '@/components/UpVoteBtn.vue';
import { Project } from '@/types/Project'
import { useQuasar } from 'quasar'
import { highlight, getVotes, votedCheck, requestOptions, removeFavorite, server } from '@/utils/helpers';
// import moment from 'moment'
import store from '@/store'
import router from '@/router'
onMounted(async () => {
    await getFavorites()
})
const user = computed(() => store.state.user)
const connected = computed(() => store.state.connected)
const tokenID = computed(() => store.state.actingAs.token_id)
const refreshLoading = ref(false)
const selectedProject = ref()
const projectDetailView = ref(false)
const projectList = ref()
const votedHighlight = ref(false)
const favsList = ref()
// const votesList = (upvotes) => { return upvotes.map(v => v.token) }
const $q = useQuasar()
const pageTitle = `${user.value.username}'s Collections`


async function getFavorites() {
    const response = await fetch(`${server()}user/favs`, requestOptions())
    const res = await response.json()

    // console.log(res.favorites)

    projectList.value = sortList(res.favorites)
    // let favsArr: string[] =
    favsList.value = projectList.value.map(p => p._id)
    // console.log(projectList.value)

}

async function refreshProjectList() {
    const res = await fetch(`${server()}user/favs`, requestOptions())
    const list = await res.json()
    projectList.value = sortList(list.favorites)
    return projectList
}

async function handleUpVote(tokenID: string, projID: string) {
  // console.clear()
    // voterID = user.value.id
    // console.log(voterID)
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
    // POST Route data includes index of project and gov_weight?
    let target = Object.values(projectList.value)
    target = target.filter((project:any) => project._id == projID)
    const votesList = await getVotes(projID)
  // console.dir({ target: target })

    if (votesList.includes(tokenID)) {
        const data = { target: projID, tokenID: tokenID }
      // console.log({ unvote: data })
        const response = await fetch(`${server()}proj/unvote`, requestOptions(data))
        if (!response.ok) {
            // console.log(response)

            $q.notify({
                color: 'red-10',
                textColor: 'white',
                icon: 'close',
                message: 'Failed',
                caption: 'Something went wrong',
                position: 'top'
            })
            return refreshLoading.value = false;
        }
        $q.notify({
            color: '#ff7f50',
            textColor: 'white',
            icon: 'close',
            message: 'Successully unvoted',
            caption: 'We don\'t like them either . . .',
            position: 'top'
        })
        const update = target[0].upvotes.filter(i => i.token !== tokenID);
        votesList.value = update
        refreshLoading.value = false;
        await refreshProjectList();
        return
    }
    const data = { target: projID, tokenID: tokenID }
    // console.log({ vote: data })
    const response = await fetch(`${server()}proj/upvote`, requestOptions(data))
    if (!response.ok) {
        $q.notify({
            color: 'red-10',
            textColor: 'white',
            icon: 'close',
            message: 'Failed',
            caption: 'Something went wrong',
            position: 'top'
        })
        await refreshProjectList();
        return refreshLoading.value = false;
    }

    $q.notify({
        color: 'green-10',
        textColor: 'white',
        icon: 'done',
        message: 'Success!',
        caption: 'The project thanks you.',
        position: 'top'
    })
    await refreshProjectList();
    refreshLoading.value = false;
    // console.dir(target[0].upvotes)
}

async function handleFavorite(target: string) {
  // console.log(favsList.value)
    const data = { target: target }
    let result = await removeFavorite(data)
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
    await refreshProjectList()
    return favsList.value = favsList.value.filter(f => f !== target)
}
function closeDetailView() {
    projectDetailView.value = false;
}

function handleProjectSelect(project: Project) {
    selectedProject.value = { ...project }
    projectDetailView.value = true
}
function sortList(list) {
    return list.sort((a, b) => (a.upvotes.length < b.upvotes.length) ? 1 : -1)

}
onMounted(async () => {
    // favsList.value = projectList.value.forEach(p => p._id)
})
watchEffect(() => {
    if (!connected.value) {
        router.push('#/')
    }
})
</script>
<template>
    <q-page class="page-wrapper">
        <h4 class="page-title">{{ pageTitle }}</h4>
        <div v-if="refreshLoading" align="center" dark>
            <div class="loader">
                <q-spinner-puff color="primary" size="25em" />
                <q-tooltip :offset="[0, 8]">Fetching Favorite Projects</q-tooltip>
                <div>Loading {{ pageTitle }} List, please wait <br><br> . . .or don't.</div>
            </div>
        </div>
        <div v-else>
            <div v-if="projectList?.length > 0" class="container">
                <q-list class="project-list" v-for="project in projectList" :key="project?.index">
                    <q-card class="project-list-item">
                        <q-item class="justify-between ">

                            <q-item clickable ripple @click="() => handleProjectSelect(project)">
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
                                    <q-item-label class="project-name">
                                        {{ project.name }}
                                    </q-item-label>
                                    <q-item-section class="project-tagline">
                                        {{ project.tagline }}
                                    </q-item-section>
                                </q-item-section>
                            </q-item>
                            <q-item class="actions">

                                <q-item class="upVotes">
                                    <q-item-section class="no-words">
                                        <q-btn class="text-accent" dense
                                            :class="votedCheck(project.upvotes, tokenID) ? 'voted' : null"
                                            :push="votedCheck(project.upvotes, tokenID)" :flat="true" squared
                                            @click="handleUpVote(tokenID, project._id)">

                                            <q-tooltip v-if="votedCheck(project.upvotes, tokenID)">
                                                Unvote ?
                                            </q-tooltip>
                                            <q-tooltip v-else>
                                                Upvote ?
                                            </q-tooltip>
                                            <div
                                                :class="votedCheck(project.upvotes, tokenID) ? 'text-secondary' : 'text-white'">
                                                {{ project.upvotes.length }}
                                            </div>
                                            <q-icon
                                                :color="votedCheck(project.upvotes, tokenID) ? 'secondary' : 'white'"
                                                :name="!votedCheck(project.upvotes, tokenID) ? 'arrow_drop_up' : 'arrow_drop_down'" />

                                        </q-btn>
                                    </q-item-section>
                                    <q-separator dark />
                                </q-item>
                                <q-item>
                                    <q-item-section>
                                        <q-btn :icon="favsList.includes(project._id) ? 'grade' : 'o_grade'"
                                            @click="handleFavorite(project._id)">
                                            <q-tooltip>Remove From Favorites</q-tooltip>
                                        </q-btn>
                                    </q-item-section>
                                </q-item>
                            </q-item>
                        </q-item>


                    </q-card>
                    <ProjectDetail v-model="projectDetailView" :closeDetailView="closeDetailView"
                        :project="selectedProject ? selectedProject : null" />
                </q-list>

            </div>
            <div v-else>
                <h5> You don't like anything? </h5>
            </div>
        </div>
    </q-page>

</template>

<style scoped>
.page-title {
    font-weight: 800;
    font-variant: small-caps;
    width: 80%;
    margin: 2rem auto;
}

.page-wrapper {
    padding: 1rem;
}

.project-list {
    width: 80%;
    max-width: 768px;
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

.project-name {
    font-size: calc(10px + .25vw);
}

.project-tagline {
    color: #ff8000;
    font-size: calc(8px + .25vw);

}

.voted {
    background-color: #ffffff09;
}

.voted {
    color: #86008f !important;
}

.avatar-container {
    box-shadow: 0px 0px 5px 2px rgba(255, 255, 255, 0.5), 0px 0px 0px 2px rgba(0, 0, 0, 0.1);

}


@media screen and (max-width:768px) {

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

    .timestamp {
        display: none;
    }

    .words {
        display: none;
        /* visibility:hidden; */
    }

    .no-words {
        display: flex;
    }
}
</style>
