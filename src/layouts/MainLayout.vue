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

                <q-toolbar-title class="absolute-center">
                    ClipBroad
                </q-toolbar-title>

                <!-- <div>Quasar v{{ $q.version }}</div> -->
            </q-toolbar>
        </q-header>

        <q-footer
            elevated
            v-if="$q.platform.is.cordova || $q.platform.is.mobile"
        >
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
                <q-item-label header class="text-grey-8"> </q-item-label>

                <Navigation
                    v-for="link in navigations"
                    :key="link.title"
                    v-bind="link"
                    @click="toggleLeftDrawer"
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

    import { defineComponent, ref } from 'vue';

    export default defineComponent({
        name: 'MainLayout',

        components: {
            Navigation,
            Footer,
        },

        computed: {
            navigations() {
                return [
                    {
                        title: this.$t('clipboardHistory'),
                        icon: 'history',
                        to: '/',
                    },
                    {
                        title: this.$t('settings'),
                        icon: 'settings',
                        to: '/settings',
                    },
                ];
            },
            footers() {
                return [
                    {
                        label: this.$t('clipboardHistory'),
                        icon: 'history',
                        to: '/',
                    },
                    {
                        label: this.$t('settings'),
                        icon: 'settings',
                        to: '/settings',
                    },
                ];
            },
        },

        setup() {
            const leftDrawerOpen = ref(false);

            return {
                leftDrawerOpen,
                toggleLeftDrawer() {
                    leftDrawerOpen.value = !leftDrawerOpen.value;
                },
            };
        },
    });
</script>
