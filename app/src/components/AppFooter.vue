<script setup lang="ts">
const d = new Date();
const currentYear = d.getFullYear(); 
</script>
<template>
    <q-footer class="footer" dark>
        <q-toolbar class="bg-dark flex-center flex">
            <q-toolbar-title>
                <q-btn type="a" flat href="https://prjctphoenix.xyz" target="_blank">

                    <q-avatar>
                        <img src="@/assets/logo.png">
                    </q-avatar>
                </q-btn>
                <div class="copyright">
                    <small>&copy; Copyright {{ currentYear }}, Prjct Phoenix. All rights reserved.</small>
                </div>
            </q-toolbar-title>
        </q-toolbar>
    </q-footer>
</template>
<style lang="scss" scoped>
.copyright {
    color: violet;
}

.footer * {
    text-align: center;
}
</style>