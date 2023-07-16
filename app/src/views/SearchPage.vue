<script setup lang="ts">
import { ref, Ref } from 'vue'
import router from '@/router';
import { requestOptions, server } from '@/utils/helpers';
import ProjectList from '@/components/ProjectList.vue';
import { useQuasar } from 'quasar'
import { Project } from '@/types/Project';



const $q = useQuasar()
const searchInput = ref('')
const searchResults = ref(false);

const projectList: Ref<Project[] | null> = ref([])
const userList: Ref<{ _id: string, username: string, avatar: string }[] | null> = ref([])

async function handleSearch(input: string) {
    // console.clear();
    searchResults.value = false;
    if (input == '') {
        return $q.notify({
            color: 'red-10',
            textColor: 'white',
            icon: 'close',
            message: 'Failed',
            caption: 'You should type something . . . you dum dum.',
            position: 'top'
        })
    }
    const response = await fetch(`${server()}proj/search/?input=${input}`, requestOptions());
    const res = await response.json();
    if (!response.ok) {
        return $q.notify({
            color: 'red-10',
            textColor: 'white',
            icon: 'close',
            message: 'Failed',
            caption: 'Something went wrong',
            position: 'top'
        })
    }
    if (!res.projects) {
        $q.notify({
            color: 'orange-10',
            textColor: 'white',
            icon: 'close',
            message: 'No Projects',
            caption: `No projects with that inquiry.`,
            position: 'top'
        })
    }
    if (!res.users) {
        $q.notify({
            color: 'orange-10',
            textColor: 'white',
            icon: 'close',
            message: 'No Users',
            caption: `No users found with that inquiry.`,
            position: 'top'
        })
    }
    console.log({ handleSearch: res });
    // const prjctList = 
    projectList.value = res.projects.map((project: { doc: Project }) => { return project.doc })
    userList.value = res.users;

    searchResults.value = true
}

async function handleHunterClick(token: string) {
    console.log(token);
    router.push(`/hunter/G-${token}`)
}

</script>
<template>
    <q-page>

        <q-card dark class="search-card">
            <!-- <q-card-section class="text-h6">
                Search PrjctHunt
            </q-card-section> -->

            <q-input label-color="white" dark filled bottom-slots v-model="searchInput" label="Search PrjctHunt">
                <template v-slot:append>
                    <q-btn ripple dense flat icon="search" @click="handleSearch(searchInput)" />
                </template>
            </q-input>
        </q-card>
        <div v-if="searchResults">
            <section v-if="userList">
                <span class="title-with-date flex justify-around">
                    <h4 class="page-title">Hunters Found: </h4>
                </span>
                <q-card dark id="user-search-results">
                    <q-btn outline class="fav-card" align="center" dark v-for="user in userList" :key="user._id"
                        @click="handleHunterClick(user._id)">
                        <!-- {{ user }} -->
                        <q-img style="max-width: 300px; height: 150px;" fit="cover" ratio="1" :src="user?.avatar">
                            <div class="absolute-bottom text-subtitle1 text-center">
                                {{ user.username }}
                            </div>
                        </q-img>
                        <q-tooltip> Visit {{ user.username }}'s Contact Page </q-tooltip>
                    </q-btn>
                </q-card>
            </section>
            <ProjectList id="projectList-template" listType="Results" pageTitle="Prjcts Found"
                :projectList="projectList" />

        </div>
    </q-page>

</template>
<style scoped>
.search-card {
    width: 60%;
    margin: 0 auto;
}

#user-search-results {
    padding: 1.25rem;
    display: flex;
    justify-content: center;
    flex-flow: row wrap;
    gap: 2rem 2rem;
}


.fav-card {
    /* background-color: #ffffff6b; */
    padding: .25rem;
    flex: 0 0 20%;
    min-width: 195px;

}

.title-with-date {
    width: 90%;
    margin: 0 auto
}


.page-title {
    font-weight: 800;
    font-variant: small-caps;


}
</style>