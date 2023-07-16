<script setup lang="ts">
import { Ref, ref, computed, watchEffect } from 'vue'
import { useQuasar } from 'quasar'
import { Project, resetProject } from '@/types/Project'
import { today, requestOptions, server, earnToken } from '@/utils/helpers'
import ProjectDetail from '@/components/ProjectDetail.vue'
import { sponsorProject } from '@/utils/txs'
import { wallet } from '@/utils/initWallet'
import Auth from '@/utils/auth'
import store from '@/store'
import moment from 'moment'


const $q = useQuasar();
const walletConnected = ref(false)
const projectDetailView = ref(false)
const sponsorInfo = ref(false)
const submission: Ref<Project> = ref({
  ...resetProject
})
const txIssues = ref()
const loading = ref(false)
const tagsLoading = ref(false)
const media: Ref<string[]> = ref([])
const new_img: Ref<string | null> = ref(null)
const date = ref()
const proxyDate = ref(today)
const DYOT = ref('')
const tags: Ref<string[]> = ref([])
const tagOptions = ref()
// ['DeFi', 'DAO', 'Game', 'Staking', 'LaunchPad', 'Tools', 'Metaverse', 'PFP', '3D', 'Passive Income', 'P2E', 'IRL Application', 'Native Token', 'Degen']
const actingAs = computed(() => store.state.actingAs)
const user = computed(() => store.state.user)
const userWallet = ref(user.value.wallet)
let mailToInfo: string

function closeDetailView() {
  projectDetailView.value = false;
}

function handlePreview() {
  submission.value.tags = tags.value
  submission.value.mint_info.date = date.value
  submission.value.media = [...media.value]

  projectDetailView.value = true;
}

function handleTagClick(tag: string) {
  if (!tags.value.includes(tag)) {
    tags.value = [...tags.value, tag]
  } else {
    tags.value = tags.value.filter(t => t !== tag)
  }
  // console.log(tags.value)
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
      message: `Error: ${err}`
    })
  }
  tagOptions.value = [...tagOptions.value, DYOT.value]
  DYOT.value = ''
  handleTagClick(DYOT.value)
}


/* Image & Media */
function handleAddImg(img: string | null) {
  if (!img) return
  if (media.value.includes(img)) {
    return
  }
  media.value = [...media.value, img]
  submission.value.media = [...media.value]
  new_img.value = ''
}

function handleRemoveImg(img: string) {
  if (img == submission.value.thumbnail) {
    submission.value.thumbnail = null
  }
  media.value = media.value.filter(i => i !== img)
  submission.value.media = [...media.value]
  return
}




/* ! Date Picker ! */
function updateProxy() {
  proxyDate.value = moment(date.value).format('L')
}

function save() {
  date.value = proxyDate.value
}


/* FORM SUBMIT / RESET */
const index = Date.now()
async function onSubmit() {
  let result: any
  if (!actingAs.value.token_id || !Auth.loggedIn()) {
    $q.notify({
      color: 'red-10',
      textColor: 'white',
      icon: 'warning',
      message: 'Not logged in'
    })

    return

  }
  submission.value.upvotes = []
  submission.value.hunter = actingAs.value.token_id
  submission.value.hunted_date = today
  submission.value.tags = tags.value
  submission.value.hunter_id = user.value.id

  !submission.value.thumbnail ?
    submission.value.thumbnail = "https://i.gifer.com/19Nx.gif" : null
  !submission.value.media ?
    submission.value.media = [] :
    null

  if (submission.value.sponsored.isSponsored) {
    loading.value = true;
    const { amount } = submission.value.sponsored
    if (!amount) {
      $q.notify({
        color: 'red-10',
        textColor: 'white',
        icon: 'warning',
        message: 'Error',
        caption: 'No valid Amount provided',
        position: 'top'
      })

      return loading.value = false;
    }
    submission.value.sponsored.multiplier = amount * .1
    if (amount >= 5) {
      // Returns amount of days sponsorship is valid for DURATION will be 1day + sponsored.duration for rendering purposes.
      submission.value.sponsored.duration = (Math.round((amount / 2)) * 60 * 60 * 24 * 1000)
    }


    // console.clear();
    result = await sponsorProject(wallet.publicKey.value, amount)
    // console.log(typeof result)
    console.log({ result });
    if (!result.success) {
      $q.notify({
        color: 'red-10',
        textColor: 'white',
        icon: 'warning',
        message: 'Error',
        caption: result.error,
        position: 'top'

      })

      return loading.value = false;
    }


    const tokenNoti = await earnToken(userWallet.value, 'sponsor')
    $q.notify(tokenNoti)
    loading.value = false;
    $q.notify({
      color: 'green-10',
      textColor: 'white',
      icon: 'o_verified',
      message: result.message,
      position: 'top'
    })
  }

  const response = await fetch(`${server()}proj/create`, requestOptions(submission.value))
  if (!response.ok) {
    if (result.sig) {
      let update: { project: string, date: string, tx: string } = { project: submission.value.name, date: today, tx: result.sig }
      txIssues.value = update
      // Create Route for issues to be sent to the server.
      $q.notify({
        color: 'red-10',
        textColor: 'white',
        icon: 'warning',
        message: 'Error',
        caption: `It seems that didn't work. Your tx signature has been saved to the server, so please try again WITHOUT sponsoring, and we will add the features to your project shortly.`,
        position: 'top',
        timeout: 10000
      })
      return
    }
    $q.notify({
      color: 'red-10',
      textColor: 'white',
      icon: 'warning',
      message: 'Error',
      caption: 'Um ... sorry. It seems that didn\'t work',
      position: 'top'
    })
    return
  }
  const res = await response.json()
  // console.log({ res })
  // gun.get('projects').put({ [index]: JSON.stringify(submission.value) }, (v) => console.log({ v }))
  $q.notify({
    color: 'green-10',
    textColor: 'white',
    icon: 'cloud_done',
    message: `Submitted ${res.name}!`
  })

  return onReset();

}

async function onReset() {

  const tokenNoti = await earnToken(userWallet.value, 'hunted-prjct')
  $q.notify(tokenNoti)
  submission.value = { ...resetProject }
  // console.log(resetProject)
  // console.log(submission.value)
  submission.value.mint_info.price = 0
  submission.value.mint_info.minted = false
  tags.value = []
  date.value = null;
  submission.value.mint_info.date = ''
}
async function getTags() {
  tagsLoading.value = true;
  const response = await fetch(`${server()}tags`, requestOptions());
  if (!response.ok) {
    $q.notify({
      color: 'red-10',
      textColor: 'white',
      icon: 'warning',
      message: 'Um ... sorry. It seems that didn\'t work'
    })
    return tagsLoading.value = false;
  }
  tagOptions.value = await response.json()
  return tagsLoading.value = false;
}

watchEffect(async () => {
  if (wallet.connected.value) {
    walletConnected.value = true;
    userWallet.value = wallet.publicKey.value.toBase58();
    console.log({ userWallet: userWallet })
  }

  if (!tagOptions.value) {
    await getTags()
  }
  submission.value.index = index
  if (!submission.value.sponsored.isSponsored) {
    submission.value.sponsored.amount = null;
  }
  // if (submission.value.mint_info.minted) {
  // date.value = null;
  // submission.value.mint_info.date = ''
  // submission.value.mint_info.price = 0;
  // }
  // if (!submission.value.mint_info.minted) {
  submission.value.mint_info.date = date.value;
  // }
  if (txIssues.value) {
    mailToInfo = `mailto:the.phoenix.prjct@gmail.com?subject=Sponsored%20PrjctHunt%20TX%20Issue%20:%20${txIssues.value.project}%20--%20${Date.now()}&body=User:%20${user.value.username}%0D%0AProject:%20${txIssues.value.project}%0D%0ATX:%20${txIssues.value.tx}%0D%0ADate:%20${txIssues.value.date}%0D%0A%0D%0A`
  }

})
</script>
<template>
  <q-page id="submission-page">
    <section v-if="loading">
      <q-linear-progress indeterminate color="white" class="q-mt-sm" />
      <q-linear-progress query color="secondary" class="q-mt-sm" />
      <q-linear-progress indeterminate color="accent" class="q-mt-sm" />
      <div>Sending the Money for sponsorship, please sit tight.</div>
      <q-linear-progress indeterminate rounded color="accent" class="q-mt-sm" />
      <q-linear-progress query color="secondary" class="q-mt-sm" />
      <q-linear-progress indeterminate color="white" class="q-mt-sm" />
    </section>
    <section v-else class="form-container">
      <q-btn v-if="txIssues" fab icon="report" label="Notify Prjct Phoenix of the error" :href="mailToInfo"
        target="_blank" />
      <div v-if="!walletConnected">
        <h4>Connect your wallet to hunt a Prjct.</h4>
      </div>
      <q-card v-else dark class="card">
        <div class="form">
          <q-form dark @submit="onSubmit" @reset="onReset" class="q-gutter-md">
            <q-card-section class="general">
              <h6 align="center">Submit New Project to Prjct Hunt</h6>
              <q-input dense dark filled v-model="submission.name" label="Project Name" lazy-rules
                :rules="[val => val && val.length > 0 || 'Please type something']" />
              <q-input dense dark filled v-model="submission.tagline" label="One-liner for Hype!" hint="" />
              <div class=" summary">

                <q-input dense dark filled v-model="submission.summary" autogrow textarea
                  :label="submission.name ? `What is ${submission.name}'s Deal?` : 'What is this Project All About?'"
                  lazy-rules :rules="[val => val && val.length > 0 || 'Please type something']" />
              </div>
              <q-card-section class="socials-section">

                <div class="social-title text-subtitle">
                  Socials:
                </div>
                <q-input class="socials-input" dense dark filled v-model="submission.discord"
                  :placeholder="submission.name ? `Invite to ${submission.name} Server` : 'Invite to Server'">
                  <template v-slot:prepend>
                    <q-icon name="discord" />
                  </template>
                </q-input>

                <q-input class="socials-input" dense dark filled v-model="submission.twitter"
                  :placeholder="submission.name ? `${submission.name} Official Twitter` : 'Official Twitter'">
                  <template v-slot:prepend>
                    <q-icon name="fab fa-twitter" />
                  </template>
                </q-input>

                <q-input class="socials-input" dense dark filled v-model="submission.website"
                  :placeholder="submission.name ? `${submission.name} Website` : 'Website'">
                  <template v-slot:prepend>
                    <q-icon name="language" />
                  </template>
                </q-input>
              </q-card-section>

              <div class="text-subtitle">
                Select Applicable Tags:
              </div>
              <span v-if="!tagsLoading" class="tags">
                <q-btn class="tag-btn truncate" v-for="tag in tagOptions" :key="tag" dark dense
                  :outline="tags.includes(tag) ? true : false" :class="!tags.includes(tag) ? 'glossy' : null"
                  :color="tags.includes(tag) ? 'secondary' : 'primary'" size="sm" :value="tag"
                  @click="() => handleTagClick(tag.toString())" :label="tag" />
              </span>
              <span v-else>
                <q-linear-progress indeterminate color="white" class="q-mt-sm" />
                <q-linear-progress query color="secondary" class="q-mt-sm" />

                <div>Possible Tags Loading. . . </div>

                <q-linear-progress query color="secondary" class="q-mt-sm" />
                <q-linear-progress indeterminate color="white" class="q-mt-sm" />
              </span>
              <div class="dyot">
                <q-input dense dark filled type="text" label="Add New Tag" v-model="DYOT">
                  <q-btn dark flat icon="add" @click="() => handleDYOT()" />
                </q-input>
              </div>
            </q-card-section>
            <q-card-section class="media">
              <div class="thumbnail">
                <q-input id="thumb-input" dense dark filled v-if="!media.includes(submission.thumbnail!)" type="text"
                  label="URL to Thumbnail Image" v-model="submission.thumbnail">
                  <q-btn flat icon="add_circle" @click="() => handleAddImg(submission.thumbnail)" />
                </q-input>
                <q-input id="media-input" dense dark filled type="text" label="URL(s) to Aditional Images"
                  v-model="new_img">
                  <q-btn flat v-if="media.length < 5" icon="add_circle" @click="() => handleAddImg(new_img)" />
                </q-input>
                <q-card-section class="media-section">
                  <q-avatar @click="handleRemoveImg(img)" class="q-mx-sm" square v-for="img in media" :key="img"
                    size="80px">
                    <img :src="img" />
                    <q-tooltip>Click to Remove</q-tooltip>
                  </q-avatar>
                </q-card-section>

              </div>
            </q-card-section>
            <q-card-section class="collection">
              <div class="text-subtitle">Collection Info: </div>

            </q-card-section>
            <q-card-section>

              <q-card-section>
                <q-card-section>
                  <div class="sponsor-container">

                    <q-toggle dark v-model="submission.mint_info.minted" label="Already Minted?" unchecked-icon="clear"
                      checked-icon="done" color="accent" />
                    <q-toggle dark v-model="submission.mint_info.date_TBA" label="Mint Date TBA?" unchecked-icon="clear"
                      checked-icon="done" color="accent" />
                    <q-toggle dark v-model="submission.mint_info.price_TBA" label="Mint Date TBA?"
                      unchecked-icon="clear" checked-icon="done" color="accent" />
                    <q-toggle dark class="sponsor-toggle" v-model="submission.sponsored.isSponsored"
                      label="Sponsor Project? " checked-icon="check" color="accent" unchecked-icon="clear" />
                    <span class="sponsor-input-span" v-if="submission.sponsored.isSponsored">

                      <q-input class="sponsor-input" dense dark standout="bg-accent text-white"
                        pattern="^[0-9]\d*(\.\d+)?$" :bottom-slots="false" v-model="submission.sponsored.amount"
                        stack-label label="Amount" suffix="◎" :rules="[val => val && val.length > 0 || 'SOL > 0  ?']" />
                      <q-btn dense class="sponsor-btn" flat icon="info" color="accent"
                        @click="sponsorInfo = !sponsorInfo" />
                    </span>
                    <q-dialog v-model="sponsorInfo">
                      <q-card dark>
                        <q-toolbar>
                          <q-avatar>
                            <img src="../assets/logo.png">
                          </q-avatar>
                          <q-toolbar-title><span class="text-weight-bold">PrjctHunt</span>: Sponsoring</q-toolbar-title>
                          <q-btn flat round dense icon="close" v-close-popup />
                        </q-toolbar>
                        <q-card-section>
                          <p>
                            We are still working on a method that works well for everyone, but currently sponsoring
                            works as an upvote multiplier.
                          </p>
                          <p>
                            The current formula is 0.5 ◎ = 0.1x
                          </p>
                          <p>
                            Example:
                          </p>
                          <pre style="background-color: black;">

                              Project A sponsors themselves for 5 ◎
                              5 ◎ x 0.1 = 0.5 
                              1 upvote now counts as 1.5
                            </pre>
                          Since we will not be showing half votes,it will be rounded to the nearest whole number.
                        </q-card-section>
                        <q-card-section class="text-accent">
                          This formula may change so please check again in the future.
                        </q-card-section>
                      </q-card>
                    </q-dialog>
                  </div>
                </q-card-section>
                <q-card-section class="mint-container">


                  <q-btn label="Mint Date" class="date-btn" dark outlined v-if="!submission?.mint_info.date_TBA"
                    icon="event" color="primary">

                    <q-popup-proxy @before-show="updateProxy" cover transition-show="scale" transition-hide="scale">
                      <q-date dark v-model="proxyDate" mask="MM/DD/YYYY">
                        <div class="row items-center justify-end q-gutter-sm">
                          <q-btn dark label="Cancel" color="white" flat v-close-popup />
                          <q-btn dark label="OK" color="white" flat @click="save" v-close-popup />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                    <label v-if="date">{{ date }}</label>
                  </q-btn>
                </q-card-section>
              </q-card-section>
              <q-card-section>

              </q-card-section>
              <q-card-section horizontal class="price-size-container">
                <q-input class="price-input" v-if="!submission.mint_info.price_TBA"
                  :input-style="{ paddingLeft: '2rem;' }" dense dark v-model="submission.mint_info.price" stack-label
                  label="Price" suffix="◎" pattern="^[0-9]\d*(\.\d+)?$"
                  :rules="[val => val && val.length > 0 || 'SOL > 0  ?']" lazy-rules>
                  <q-tooltip>What's the mint price?</q-tooltip>
                </q-input>
                <q-input class="size-input" dense dark v-model="submission.size" type="number" stack-label
                  label="# of NFTs" :rules="[val => val && val >= 1 || 'No NFTs?']" lazy-rules>
                  <q-tooltip>How Many NFTs are in the collection?</q-tooltip>
                </q-input>
              </q-card-section>
            </q-card-section>


            <q-card-actions>
              <q-btn label="Submit" type="submit" color="primary" />
              <q-btn label="Reset" type="button" color="secondary" flat class="q-ml-sm" @click="onReset()" />
            </q-card-actions>
          </q-form>

        </div>
        <q-card-section class="flex justify-center">
          <q-btn dark label="See Preview?" @click="handlePreview" />
        </q-card-section>
      </q-card>
    </section>
    <ProjectDetail v-model="projectDetailView" :closeDetailView="closeDetailView"
      :project="submission ? submission : null" />
  </q-page>
</template>
<style scoped>
#submission-page {
  width: 100%;
}

.form-container {
  width: 80%;
  max-width: 725px;
  margin: 2rem auto;
}

h6 {
  margin: 1rem;
}

.summary {
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
}

.socials-section {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-evenly;
  align-items: center;
  gap: 1rem 1rem;
}

.social-title {
  flex: 0 0 100%;
}

.socials-input {
  flex: 0 0 33%;
  /* margin: 1rem auto */
}

.tags {
  margin: .5rem auto;
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  justify-content: space-around;
  gap: 1rem 1rem
}

.tag-btn {
  max-width: 150px;
  height: 1.25rem;
  flex: 1 0 25%;
}

.media-section {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-evenly;
  align-items: center;
  gap: 1rem 1rem;
}

.tiny-img {
  margin: .5rem 1rem !important;
}

.dyot {
  max-width: 200px;
  margin: 1rem auto;
}

.thumbnail label {
  margin: .25rem auto;
}

.sponsor-container {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
}

.sponsor-toggle {
  flex: 0 1 50%;
}

.sponsor-input-span {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  flex: 1 0 45%;
  align-content: center;
}

.sponsor-input {
  flex: 0 0 45%;
  max-width: 150px;
  margin: 0;
  padding-bottom: 0;
}

.sponsor-btn {
  flex: 0 0 30%;
  align-self: center;
  padding: 0;
  margin: 0;
}

.mint-container {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
}

.date-btn {
  box-shadow: 0px 0px 5px 2px rgba(255, 255, 255, 0.5), 0px 0px 0px 2px rgba(0, 0, 0, 0.1);
}

.price-size-container {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-around;
  /* background-color: #0000001f; */
  padding-bottom: .5rem;
  box-shadow: 0px 0px 5px 2px rgba(255, 255, 255, 0.5), 0px 0px 0px 2px rgba(0, 0, 0, 0.1);
}

.price-input {

  flex: 0 0 15%;
}

.size-input {
  flex: 0 0 15%;
}

.truncate {
  font-size: calc(10px + .25vw);
  min-width: 125px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media screen and (max-width: 600px) {
  .form-container {
    width: 100%;
  }
}
</style>