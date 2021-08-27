<template>
    <q-page padding>
        <div class="q-pa-md q-gutter-sm absolute-center">
            <transition
                appear
                enter-active-class="animated slideInLeft"
                leave-active-class="animated fadeOutLeft"
            >
                <q-btn
                    v-if="!accessToken"
                    color="primary"
                    icon="login"
                    label="Login With Github"
                    @click="auth()"
                />
            </transition>
            <transition
                appear
                enter-active-class="animated pulse"
                leave-active-class="animated fadeOutDown"
            >
                <q-item v-ripple v-if="accessToken">
                    <q-item-section side>
                        <q-avatar rounded size="48px">
                            <img :src="githubAvaterUrl" />
                        </q-avatar>
                    </q-item-section>
                    <q-item-section>
                        <q-item-label>{{ githubUserName }}</q-item-label>
                        <q-item-label caption>{{ rateLimit }}</q-item-label>
                    </q-item-section>
                    <q-menu anchor="center middle" self="center middle">
                        <q-btn color="black" label="Logout" @click="logout()" />
                    </q-menu>
                </q-item>
            </transition>
        </div>
    </q-page>
</template>

<script>
    import { openURL, uid } from 'quasar';
    import { mapGetters, mapActions } from 'vuex';
    const GITHUB_CLIENT_ID = 'fa79756f53d8c0a88ddd';
    const REPO_NAME = 'ClipBroadHistory';
    let loggin = false;

    export default {
        data() {
            return {
                accessToken: this.$q.localStorage.getItem(
                    'clipbroad-github-token'
                ),
                rateLimit: null,
            };
        },
        computed: {
            ...mapGetters('clipboard', [
                'githubUserName',
                'githubAvaterUrl',
                'github',
            ]),
            // appVisible() {
            //     return this.$q.appVisible;
            // },
        },
        methods: {
            ...mapActions('clipboard', ['setGithub', 'logoutGithub']),
            auth() {
                let uuid = uid();
                this.$q.localStorage.set('clipbroad-github-state', uuid);
                openURL(
                    `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=https://logiconsole.com/api/clipbroad/oauth&scope=repo&state=${uuid}`,
                    null,
                    { noreferrer: false }
                );
                loggin = true;
            },
            onGetToken() {
                this.setGithub(this.accessToken);
                this.getRateLimit();
            },
            getRateLimit() {
                if (this.accessToken == null || this.github == null) {
                    return;
                }
                this.github
                    .getRateLimit()
                    .getRateLimit()
                    .then(({ data }) => {
                        const currentTime = new Date().getTime();
                        const resetSecond = parseInt(
                            data.rate.reset - currentTime / 1000
                        );
                        this.rateLimit =
                            'Rate Limit: ' +
                            data.rate.remaining +
                            ' / ' +
                            data.rate.limit +
                            ' Reset in ' +
                            resetSecond +
                            ' seconds';
                    });
            },
            logout() {
                this.$q.localStorage.remove('clipbroad-github-token');
                this.accessToken = null;
                this.logoutGithub();
            },
        },
        mounted() {
            // this.$q.localStorage.remove('clipbroad-github-token');
            if (this.accessToken != null) {
                this.onGetToken();
            }
            loggin = false;
            setInterval(() => {
                if (!loggin) {
                    return;
                }
                // this.accessToken = this.$q.localStorage.getItem(
                //     'clipbroad-github-token'
                // );
                // if (this.accessToken == null) {
                //     console.log('access token is null');
                //     return;
                // } else {
                //     console.log(`access token is ${this.accessToken}`);
                //     loggin = false;
                //     this.onGetToken();
                // }
                this.$axios
                    .post('https://api.logictan.workers.dev/corsproxy/', {
                        state: this.$q.localStorage.getItem(
                            'clipbroad-github-state'
                        ),
                        // apiurl: 'https://www.logiconsole.com/api/clipbroad/token/',
                    })
                    .then(({ data }) => {
                        if (data.status != 'success') {
                            console.log(data.message);
                        } else {
                            console.log(`access token is ${data.message}`);
                            this.$q.localStorage.set('clipbroad-github-token', data.message);
                            this.accessToken = data.message;
                            loggin = false;
                            this.onGetToken();
                        }
                    }).catch(error=>{
                        console.log(error);
                    });
            }, 2000);
            this.getRateLimit();
        },
        // watch: {
        //     appVisible: (val) => {
        //         console.log(val ? 'app activate' : 'app background');
        //     },
        // },
    };
</script>

<style></style>
