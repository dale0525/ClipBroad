<template>
    <q-page padding>
        <div class="q-pa-md q-gutter-sm absolute-center">
            <transition
                appear
                enter-active-class="animated fadeInDown"
                leave-active-class="animated fadeOutUp"
            >
                <q-btn
                    v-if="showLoginBtn"
                    color="primary"
                    icon="login"
                    label="Login With Github"
                    @click="auth()"
                />
            </transition>
            <transition
                appear
                enter-active-class="animated fadeInUp"
                leave-active-class="animated fadeOutDown"
            >
                <q-item v-ripple v-if="!showLoginBtn">
                    <q-item-section side v-if="githubAvatarUrl">
                        <q-avatar rounded size="48px">
                            <img :src="githubAvatarUrl" />
                        </q-avatar>
                    </q-item-section>
                    <q-item-section>
                        <q-item-label v-if="githubUserName">{{
                            githubUserName
                        }}</q-item-label>
                        <q-item-label caption v-if="rateLimit">{{
                            rateLimit
                        }}</q-item-label>
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
    import { openURL, uid, format } from 'quasar';
    const GITHUB_CLIENT_ID = 'fa79756f53d8c0a88ddd';
    let loggin = false;
    let checkLogginInterval = null;

    export default {
        data() {
            return {
                hasToken: false,
            };
        },
        computed: {
            showLoginBtn(){
                return this.hasToken ? false : true;
            },
            githubUserName() {
                return this.$githubInstance.githubUserName == null
                    ? ''
                    : this.$githubInstance.githubUserName;
            },
            githubAvatarUrl() {
                return this.$githubInstance.githubAvatarUrl;
            },
            rateLimit() {
                return this.$githubInstance.rateLimit;
            },
            // appVisible() {
            //     return this.$q.appVisible;
            // },
        },
        methods: {
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

            logout() {
                this.$q.localStorage.remove('clipbroad-github-token');
                this.$githubInstance.github = null;
                this.$githubInstance.githubUser = null;
                this.$githubInstance.githubRepo = null;
                this.$githubInstance.githubUserName = null;
                this.$githubInstance.githubAvatarUrl = null;
                this.$githubInstance.rateLimit = null;
                this.$githubInstance.githubRepoExist = false;
                this.hasToken = false;
            },
            setToken(_token) {
                this.hasToken = true;
                loggin = false;
                this.$setGithub(_token);
            },
        },
        mounted() {
            // this.$q.localStorage.remove('clipbroad-github-token');
            if (this.$q.localStorage.has('clipbroad-github-token')) {
                this.setToken(
                    this.$q.localStorage.getItem('clipbroad-github-token')
                );
            }
            loggin = false;
            if (checkLogginInterval == null) {
                checkLogginInterval = setInterval(() => {
                    if (!loggin) {
                        return;
                    }
                    this.$axios
                        .post('https://api.logictan.workers.dev/corsproxy/', {
                            state: this.$q.localStorage.getItem(
                                'clipbroad-github-state'
                            ),
                        })
                        .then(({ data }) => {
                            if (data.status != 'success') {
                                console.log(data.message);
                            } else {
                                console.log(`access token is ${data.message}`);
                                this.$q.localStorage.set(
                                    'clipbroad-github-token',
                                    data.message
                                );
                                this.setToken(data.message);
                            }
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                }, 2000);
            }
            this.$getRateLimit();
        },
        watch: {
            // appVisible: (val) => {
            //     console.log(val ? 'app activate' : 'app background');
            // },
        },
    };
</script>

<style></style>
