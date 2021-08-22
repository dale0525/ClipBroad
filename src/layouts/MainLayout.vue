<template>
    <q-layout view="lHh Lpr lFf">
        <q-header elevated>
            <q-toolbar>
                <q-btn
                    v-if="$q.platform.is.electron || $q.platform.is.desktop"
                    flat
                    dense
                    round
                    icon="menu"
                    aria-label="Menu"
                    @click="toggleLeftDrawer"
                />

                <q-toolbar-title class="absolute-center"> ClipBroad </q-toolbar-title>

                <!-- <div>Quasar v{{ $q.version }}</div> -->
            </q-toolbar>
        </q-header>

        <q-footer elevated v-if="$q.platform.is.cordova">
            <q-tabs>
                <Footer
                    v-for="footer in footers"
                    :key="footer.label"
                    v-bind="footer"
                />
            </q-tabs>
        </q-footer>

        <q-drawer
            v-model="leftDrawerOpen"
            :breakpoint="800"
            bordered
            class="bg-grey-1"
        >
            <q-list>
                <q-item-label header class="text-grey-8">
                    Navigation
                </q-item-label>

                <Navigation
                    v-for="link in navigations"
                    :key="link.title"
                    v-bind="link"
                />
            </q-list>
        </q-drawer>

        <q-page-container>
            <router-view />
        </q-page-container>
    </q-layout>
</template>

<script>
    import Navigation from 'src/components/Navigation.vue';
    import Footer from 'src/components/Footer.vue';

    const navigationList = [
        {
            title: 'Clipboard History',
            icon: 'history',
            to: '/',
        },
        {
            title: 'Settings',
            icon: 'settings',
            to: '/settings',
        },
    ];

    const footersList = [
        {
            label: 'History',
            icon: 'history',
            to: '/',
        },
        {
            label: 'Settings',
            icon: 'settings',
            to: '/settings',
        },
    ];

    import { defineComponent, ref } from 'vue';

    export default defineComponent({
        name: 'MainLayout',

        components: {
            Navigation,
            Footer,
        },

        setup() {
            const leftDrawerOpen = ref(false);

            return {
                navigations: navigationList,
                footers: footersList,
                leftDrawerOpen,
                toggleLeftDrawer() {
                    leftDrawerOpen.value = !leftDrawerOpen.value;
                },
            };
        },
    });
</script>
