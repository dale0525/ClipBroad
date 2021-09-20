<template>
    <q-layout view="lHh Lpr lFf">
        <q-header class="transparent">
            <div
                style="width: 100%; height: 10px"
                class="q-electron-drag transparent"
            ></div>

            <q-dialog v-model="versionTip" persistent>
                <q-card>
                    <q-card-section class="row items-center">
                        <q-avatar icon="system_update_alt" color="primary" />
                        <span class="q-ml-sm">{{
                            $t('newVersionAvailable')
                        }}</span>
                        <pre class="q-ml-sm" v-html="versionLog"></pre>
                    </q-card-section>

                    <q-card-actions align="right">
                        <q-btn
                            flat
                            :label="$t('skip')"
                            color="primary"
                            @click="versionTip = false"
                        />
                        <q-btn
                            flat
                            :label="$t('download')"
                            color="primary"
                            @click="
                                versionTip = false;
                                openExternalURL(
                                    'https://github.com/dale0525/ClipBroad/releases'
                                );
                            "
                        />
                    </q-card-actions>
                </q-card>
            </q-dialog>
        </q-header>

        <q-page-container>
            <router-view />
        </q-page-container>
    </q-layout>
</template>

<script>
    import { defineComponent, ref } from 'vue';
    import { mapState, mapActions } from 'vuex';

    let existEventListen = false;

    export default defineComponent({
        name: 'MainLayout',

        components: {},

        data() {
            return {
                versionTip: false,
                versionLog: '',
            };
        },

        computed: {},
        methods: {
            openExternalURL(url) {
                if (this.$q.platform.is.electron) {
                    window.myAPI.openSystemBrowser(url);
                } else {
                    openURL(url);
                }
            },
        },

        created() {
            if (!existEventListen) {
                window.addEventListener(
                    'version-check',
                    (e) => {
                        var message = e.detail.message;
                        var value = e.detail.value;
                        if (
                            message == 'newVersionAvailable' &&
                            this.$q.platform.is.mac
                        ) {
                            this.versionTip = true;
                            this.versionLog = value;
                        }
                    },
                    false
                );
                document.addEventListener('resume', function () {
                    codePush.sync();
                });
                existEventListen = true;
            }
        },
    });
</script>
