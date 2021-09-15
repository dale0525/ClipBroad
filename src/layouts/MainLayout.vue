<template>
    <q-layout view="lHh Lpr lFf">
        <q-header class="transparent">
            <div
                style="width: 100%; height: 10px"
                class="q-electron-drag transparent"
            ></div>
        </q-header>

        <q-page-container>
            <router-view />
        </q-page-container>
    </q-layout>
</template>

<script>
    import { defineComponent, ref } from 'vue';
    // import { mapState} from 'vuex';

    export default defineComponent({
        name: 'MainLayout',

        components: {},

        computed: {
            // ...mapState('clipboard', ['actionBtn']),
            // navigations() {
            //     return [
            //         {
            //             title: this.$t('clipboardHistory'),
            //             icon: 'history',
            //             to: '/',
            //         },
            //         {
            //             title: this.$t('settings'),
            //             icon: 'settings',
            //             to: '/settings',
            //         },
            //     ];
            // },
            // footers() {
            //     return [
            //         {
            //             label: this.$t('clipboardHistory'),
            //             icon: 'history',
            //             to: '/',
            //         },
            //         {
            //             label: this.$t('settings'),
            //             icon: 'settings',
            //             to: '/settings',
            //         },
            //     ];
            // },
        },

        setup() {
            // const leftDrawerOpen = ref(false);
            // return {
            //     leftDrawerOpen,
            //     toggleLeftDrawer() {
            //         leftDrawerOpen.value = !leftDrawerOpen.value;
            //     },
            // };
        },
    });
</script>
