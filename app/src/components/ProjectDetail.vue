<script setup lang="ts">
import { defineProps, ref, onMounted, watchEffect, computed } from 'vue'
import store from '@/store'
import { useQuasar } from 'quasar';
import moment from 'moment'
import { requestOptions, server, earnToken } from '@/utils/helpers';
import Auth from '@/utils/auth';
import ContactCard from './ContactCard.vue';
import router from '@/router'
const props = defineProps(['project', 'closeDetailView', 'tokenID', 'refreshProjectList'])
const $q = useQuasar();


const carousel = ref()
const userID = computed(() => store.state.user.id)
const userWallet = computed(() => store.state.user.wallet)
const projID = ref(props.project?._id)
const connected = computed(() => store.state.connected)
const project = ref()
const picList = ref()
const slide = ref(0)
const userComment = ref('')
const localComments = ref()
const hunter = ref()
const contactCardToggle = ref(false)
const thumbs = ref(false)
async function handleNewComment(projectID: string) {
    const data = { target: projectID, author: userID.value, content: userComment.value, timestamp: Date.now() }
    // console.log(data)
    const response = await fetch(`${server()}proj/comment`, requestOptions(data))
    if (!response.ok) {
        $q.notify({
            color: 'red-10',
            textColor: 'white',
            icon: 'close',
            message: 'Failed',
            caption: 'Something went wrong',
            position: 'top'
        })

        return
    }
    localComments.value = await getComments(projectID)
    userComment.value = ''
    const tokenNoti = await earnToken(userWallet.value, 'create-comment')
    $q.notify(tokenNoti)
}

watchEffect(async () => {
    if (props.project) {
        localComments.value = await getComments(props.project._id)
        if (props.project.media) {
            picList.value = new Set([...props.project.media])
            props.project.thumbnail ? picList.value.add(props.project.thumbnail) : null
            if (picList.value.size > 1) {
                thumbs.value = true;
            } else {
                thumbs.value = false;
            }
        }
        console.log(props.project.hunter_id)
    }

})

async function removeComment(projectID: string, comID: string) {
    const data = { target: projectID, commentID: comID }
    const prompt = "Are you sure you want to remove this comment?"
    if (confirm(prompt) == false) {
        return
    }
    const response = await fetch(`${server()}proj/uncomment`, requestOptions(data))
    if (!response.ok) {
        $q.notify({
            color: 'red-10',
            textColor: 'white',
            icon: 'close',
            message: 'Failed',
            caption: 'Something went wrong',
            position: 'top'
        })

        return
    }
    localComments.value = await getComments(projectID);
    return
}
async function getComments(target: string) {
    try {

        if (!target) return [];
        const response = await fetch(`${server()}proj/comments/${target}`, requestOptions());
        const res = await response.json()
        const byTime = res.sort((a, b) => (a.timestamp < b.timestamp) ? 1 : -1)
        const result = byTime.sort((a, b) => (a.likes.length < b.likes.length) ? 1 : -1)
        return result;
    } catch (err) {
        // console.log(err)
        return [];
    }// console.clear()
}

async function handleCommentLike(commentID: string) {
    // console.dir({ lc0: localComments.value })
    const data = { commentID: commentID }
    const res = await fetch(`${server()}proj/comment/get/${commentID}`, requestOptions())
    if (!res.ok) return $q.notify({
        color: 'red-10',
        textColor: 'white',
        icon: 'close',
        message: 'Failed',
        caption: 'Something went wrong',
        position: 'top'
    })
    const target = await res.json()
    // console.log({ target })
    if (target.likes.includes(userID.value)) {
        const response = await fetch(`${server()}proj/comment/unlike`, requestOptions(data))
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
        // console.log(await response.json())
        return localComments.value = await getComments(props.project._id);
    }
    const response = await fetch(`${server()}proj/comment/like`, requestOptions(data))
    if (!response.ok) {
        $q.notify({
            color: 'red-10',
            textColor: 'white',
            icon: 'close',
            message: 'Failed',
            caption: 'Something went wrong',
            position: 'top'
        })

        return
    }
    const tokenNoti = await earnToken(userWallet.value, 'like-comment')
    $q.notify(tokenNoti)
    return localComments.value = await getComments(props.project._id);

}

function handleFullscreen() {
    return carousel.value.toggleFullscreen()
}

async function handleHunterClick(token: string) {
    console.log(token);
    const tokenNoti = await earnToken(userWallet.value, 'explore-hunters')
    $q.notify(tokenNoti)
    setTimeout(() => {

        router.push(`/hunter/${token}`)
    }, 3000)
}
onMounted(async () => {
    picList.value = []
    project.value = props.project
})

</script>
<template>

    <q-dialog v-on:close="projID.value = null">
        <q-dialog v-model="contactCardToggle">
            <ContactCard :hunter="hunter" />
        </q-dialog>
        <q-card class="card hide-scrollbar" dark>
            <q-card-section>
                <q-btn flat dark @click="handleHunterClick(props.project.hunter)">
                    <q-avatar>
                        <img :src="props.project.hunter_id.avatar" />
                    </q-avatar>
                    <q-tooltip>Hunted by {{ props.project.hunter_id.username }}</q-tooltip>
                </q-btn>
                <q-btn fab-mini class="close-btn" icon="close" align="right" @click="() => props.closeDetailView()" />
            </q-card-section>
            <q-card-section>
                <!-- <q-carousel v-else :thumbnails="false" animated v-model="slide" infinite>
                    <q-carousel-slide :name="0" img-src="https://www.freeiconspng.com/images/no-image-icon" />
                </q-carousel> -->
                <q-carousel ref="carousel" v-if="picList.size" swipeable :thumbnails="thumbs" animated
                    :transition-duration="2500" transition-prev="slide-right" transition-next="slide-left"
                    :autoplay="7000" v-model="slide" infinite>
                    <q-carousel-slide class="uncropped-image" draggable="false" :name="index"
                        v-for="(pic, index) in picList" :key="index" :ratio="16 / 9" @click="handleFullscreen()"
                        :img-src="pic" />
                </q-carousel>
                <q-carousel v-else :thumbnails="false" animated v-model="slide" infinite>
                    <q-carousel-slide :name="0"
                        img-src="https://propertywiselaunceston.com.au/wp-content/themes/property-wise/images/thumbnail-default.png" />
                </q-carousel>
            </q-card-section>
            <q-card-section>
                <div class="text-h4 flex flex-center">{{ props.project.name }}</div>
                <div class="tagline text-subtitle2">{{ props.project.tagline }}</div>
            </q-card-section>
            <q-card-section id="mint_info" align="center">
                <q-list>

                    <q-item>
                        <q-item-section>
                            <q-item-label>Mint Price:</q-item-label>
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>Collection Size:</q-item-label>
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>Mint Date:</q-item-label>
                        </q-item-section>
                    </q-item>

                    <q-item id="mint_info-content">
                        <q-item-section v-if="!props.project.mint_info.price_TBA" top dark flat square size="md">
                            {{ props.project.mint_info.price }}
                        </q-item-section>
                        <q-item-section v-else top dark flat square size="md">TBA
                        </q-item-section>
                        <q-item-section top dark flat square size="md">{{ props.project.size }} ◎</q-item-section>
                        <q-item-section top dark flat square size="md">{{ props.project.mint_info.date }}
                        </q-item-section>

                    </q-item>
                </q-list>
            </q-card-section>
            <q-card-actions align="center">
                <q-btn v-if="props.project.discord" :href="props.project.discord" target="_blank" flat>
                    <q-icon name="fab fa-discord" />
                </q-btn>
                <q-btn v-if="props.project.website" :href="props.project.website" target="_blank" flat>
                    <q-icon name="language" />
                </q-btn>
                <q-btn v-if="props.project.twitter" :href="`https://twitter.com/${props.project.twitter}`"
                    target="_blank" flat>
                    <q-icon name="fab fa-twitter" />
                </q-btn>
            </q-card-actions>
            <q-card-section align="center">
                <q-chip outline size="sm" dark v-for="tag in props.project.tags" :key="tag">{{ tag }}</q-chip>
            </q-card-section>
            <q-card-section class="summary">
                <h5>Summary:</h5>
                {{ props.project.summary }}
            </q-card-section>
            <q-card-section class="comments">
                <h6> Comments: </h6>
                <q-list v-if="Auth.loggedIn()" class="comments-list">
                    <div v-for="comment in localComments" :key="comment._id">
                        <q-separator spaced />
                        <q-item dense>
                            <q-avatar size="sm" class="avatar-container"
                                @click="handleHunterClick(comment.author.generic_token)">

                                <q-avatar size="sm" v-if="comment.author">
                                    <img
                                        :src="comment.author.avatar ? comment.author.avatar : `https://avatars.dicebear.com/api/identicon/${comment.author.username}.svg`" />
                                    <q-tooltip>{{ comment.author.username }}</q-tooltip>
                                </q-avatar>
                            </q-avatar>
                            &nbsp;&nbsp;&nbsp;
                            <q-item-section class="comment-timestamp">

                                {{ moment(comment.timestamp).format('l') }}
                            </q-item-section>
                        </q-item>
                        <q-item dense>
                            <q-item-section class="comment-content">
                                {{ comment.content }}
                            </q-item-section>
                            <span v-if="connected">
                                <q-btn v-if="userID === comment.author?._id" flat dark icon="delete"
                                    @click="removeComment(props.project._id, comment._id)" />
                                <q-btn dark dense fab-mini :icon="comment.likes.includes(userID) ? 'star' : 'o_grade'"
                                    @click="handleCommentLike(comment._id)"
                                    :label="comment.likes.length > 0 ? comment.likes.length : null" />
                            </span>
                        </q-item>
                        <q-separator dark />
                    </div>
                </q-list>
                <q-card dark v-else>
                    <q-card-section class="text-h5">
                        You must be logged in to view and interact with comments.
                    </q-card-section>
                    <q-card-section align="center">
                        . . . now go'on . . git!
                    </q-card-section>

                </q-card>
                <q-card-section>
                    <span class="comment-span">

                        <q-input :readonly="!Auth.loggedIn()" class="comment-input" dark filled autogrow
                            hide-bottom-space clearable v-model="userComment" type="text" resize="false" />
                        <q-btn :disabled="!Auth.loggedIn()" class="comment-button" dark flat label="Post"
                            @click="handleNewComment(props.project._id)" :disable="userComment == ''" />

                    </span>
                </q-card-section>
            </q-card-section>

        </q-card>
    </q-dialog>
</template>
<style scoped>
.card {
    padding-bottom: 1.5rem;
    display: flex;
    flex-flow: column nowrap;
    justify-content: stretch;
    width: 100%;
    max-width: 900px;
    /* height: 70%; */
}

#mint_info-content,
#mint_info-labels {
    margin: 0 auto;
    padding-top: 0;
    padding-bottom: 0;
}

#mint_info {
    /* margin: 0 auto; */
    padding-top: 0;
    padding-bottom: 0;
}

.comments {
    height: 300px;
}

.comments-list {
    box-shadow: inset 0 0 15px 3px rgba(0, 0, 0, 0.5);
    max-height: 250px;
    overflow-y: auto;

}

/* Hide scrollbar for Chrome, Safari and Opera */
.comments-list::-webkit-scrollbar {
    display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.comments-list {
    /* padding: .25rem; */
    -ms-overflow-style: none;
    /* IE and Edge */
    scrollbar-width: none;
    /* Firefox */
}

.comment-timestamp {
    text-align: right;
    align-self: flex-start;
    font-size: calc(7px + .25vw);
    transform: translateY(-10px);
}

.comment-content {
    white-space: pre-wrap;
    font-size: calc(10px + .25vw);
}

.close-btn {
    flex: 0 0 5%;
    float: right;
    /* width: 10px; */
}

h6,
h5 {
    margin: 5px auto;
}

.comment-span {
    /* max-width: 500px; */
    display: flex;
}

.comment-input {
    flex: 1;
}

.comment-btn {
    flex: 0 0 5%;
}

.avatar-container {
    box-shadow: 0px 0px 5px 2px rgba(255, 255, 255, 0.5), 0px 0px 0px 2px rgba(0, 0, 0, 0.1);
}

.tagline {
    padding: .25rem 2rem;
    color: #777777
}

.uncropped-image {
    background-size: contain;
    /* don't crop the image  */
    background-repeat: no-repeat;
    /* only show the image one time  */
    background-color: #1d1d1d;
    /* color to fill empty space with  */
}

.summary {
    white-space: pre-wrap;
}
</style>