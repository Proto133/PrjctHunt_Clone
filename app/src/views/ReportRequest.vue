<script setup lang="ts">
import { ref, watchEffect } from "vue"
import { useQuasar, QCard, QCardSection } from 'quasar'
import moment from 'moment'
import { requestOptions, server } from '@/utils/helpers'

const categoryOptions = ['Feature Request', 'Bug Report', 'General Feedback', 'Question']
const date = moment().format('MM-DD-YYYY')
const description = ref('')
const category = ref('Feature Request')
const title = ref('')
const $q = useQuasar()
let data: { category: string, title: string, description: string }
watchEffect(() => {
    data = {
        category: category.value,
        title: title.value,
        description: description.value
    }
})

async function sendMessage() {
    if (!data) return false
    if (!data.description) {
        return false;
    }

    !data.title ? data.title = date : null


    // console.dir(data)
    try {
        const response = await fetch(`${server()}feedback`, requestOptions(data))
        return !response.ok ?
            false : true
    } catch (err) {
        console.log(err)
        return false
    }
}
async function onSubmit() {
    const sentToDiscord = await sendMessage()
    if (!sentToDiscord) {
        $q.notify({
            color: 'warning',
            textColor: 'white',
            icon: 'danger',
            message: 'Something went wrong'
        })

    }
    else {
        $q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'Submitted'
        })
        category.value = 'Feature Request'
        title.value = ''
        description.value = ''
    }

}

function onReset() {
    description.value = ''
    title.value = ''
    category.value = 'Feature Request'
    // contactInfo.value.discord ''
    // contactInfo.value.twitter ''
    // contactInfo.value.email = ''

}

</script>
<template>

    <q-card class="feedback-card" dark>
        <q-card-section align="center">
            <q-avatar size="125px" class="white-shadow">
                <q-avatar size="125px">
                    <img src="../assets/logo.png">
                </q-avatar>
            </q-avatar>
        </q-card-section>
        <q-card-section class="center title">
            <h5> What's up? </h5>
        </q-card-section>
        <q-form @submit="onSubmit" @reset="onReset" class="form q-gutter-md text-white">
            <q-card-section>
                <q-input dark filled type="text" v-model="title" autogrow label="Title / Subject" />
                <q-separator dark spaced />
                <q-select dark v-model="category" :options="categoryOptions" />
                <q-separator dark spaced />
                <q-input dark filled type="textarea" v-model="description" autogrow label="Details" />

            </q-card-section>
            <div class=" btn-div flex justify-evenly">
                <q-btn dark class="btn text-white" label="Submit" type="submit" color="primary" />
                <q-btn dark class="text-white" label="Reset" type="reset" color="primary" flat />
            </div>
        </q-form>

    </q-card>

</template>
<style scoped>
* {
    font-family: 'Orbitron', 'Helvetica', sans-serif;
}

h5 {
    margin-bottom: 0;
}

.feedback-card {
    padding: 2rem;

}

.white-shadow {
    box-shadow: 0px 0px 15px 7px rgba(255, 255, 255, 0.5), 0px 0px 0px 2px rgba(0, 0, 0, 0.1);
}

/* #affiliate-btn {
    margin: auto;
    margin-bottom: 7rem;
    background-color: rgba(0, 0, 0, 0.5);
    box-shadow: 0px 1px 11px 2px rgba(255, 255, 255, 0.51);
} */

.btn:hover {
    box-shadow: 0px 1px 15px 5px rgba(255, 255, 255, 0.51)
}

.center.title {
    padding: 0;
    width: 100%;
    margin: auto;
    /* background-color: transparent; */
}

.center {
    text-align: center;
}

.affiliate-form-card {
    width: 100%;
}

.form {
    width: 80%;
    margin: auto;
}

.btn {
    box-shadow: 0px 1px 4px 2px rgba(255, 255, 255, 0.31);
}

.btn-div {
    margin-top: 5rem
}
</style>