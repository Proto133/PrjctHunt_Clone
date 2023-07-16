<script setup lang="ts">
import { ref, Ref, watchEffect } from 'vue'
import { Project } from '@/types/Project';
import { requestOptions ,server} from '@/utils/helpers';
import ProjectList from '@/components/ProjectList.vue';


const loading = ref(false);
const projectList: Ref<Project[] | null | undefined> = ref()
const pageTitle = "Previous"

watchEffect(async () => {
  if (!projectList.value) {
    loading.value = true;
    const response = await fetch(`${server()}proj/get/all`, requestOptions())
    let dbProjects: Project[] = await response.json()
    // projectList.value = sortList(props.projectList)
    projectList.value = dbProjects
  }
  if (projectList.value) {
    loading.value = false;
  }
})
</script>
<template>
  <suspense>
    <ProjectList listType="Previous" :pageTitle="pageTitle" :projectList="projectList" />
    <template #fallback>
      <div v-if="loading">
        <q-linear-progress indeterminate color="white" class="q-mt-sm" />
        <q-linear-progress query color="secondary" class="q-mt-sm" />
        <q-linear-progress indeterminate color="accent" class="q-mt-sm" />
        <div>Things are happening . . . </div>
        <q-linear-progress indeterminate rounded color="accent" class="q-mt-sm" />
        <q-linear-progress query color="secondary" class="q-mt-sm" />
        <q-linear-progress indeterminate color="white" class="q-mt-sm" />
      </div>
    </template>

  </suspense>
</template>
<style scoped>
</style>