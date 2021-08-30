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
                    <q-item-section side v-if="avatarUrl != ''">
                        <q-avatar rounded size="48px">
                            <img :src="avatarUrl" />
                        </q-avatar>
                    </q-item-section>
                    <q-item-section>
                        <q-item-label v-if="username != ''">{{
                            username
                        }}</q-item-label>
                        <q-item-label caption v-if="rateLimit">{{
                            'Limit: ' +
                            rateLimit.current +
                            ' / ' +
                            rateLimit.limit
                        }}</q-item-label>
                        <q-item-label caption v-if="rateLimit">{{
                            'Reset in: ' + rateLimit.time + 's'
                        }}</q-item-label>
                    </q-item-section>
                    <q-menu anchor="center middle" self="center middle">
                        <q-btn color="black" label="Logout" @click="logout()" />
                    </q-menu>
                </q-item>
            </transition>

            <q-separator />

            <q-toggle
                v-model="hideIcon"
                checked-icon="check"
                color="green"
                unchecked-icon="clear"
                label="Hide Dock Icon"
                left-label
            />
        </div>
    </q-page>
</template>

<script>
    import { openURL, uid } from 'quasar';
    import { ref } from 'vue';
    const GITHUB_CLIENT_ID = 'fa79756f53d8c0a88ddd';
    let checkLogginInterval = null;
    let loggin = false;
    let hasToken = ref(false);
    let username = ref('');
    let avatarUrl = ref('');
    let rateLimit = ref(null);

    export default {
        data() {
            return {
                hideIcon: true,
            };
        },
        computed: {
            showLoginBtn() {
                return hasToken.value ? false : true;
            },
            username() {
                return username.value;
            },
            avatarUrl() {
                return avatarUrl.value;
            },
            rateLimit() {
                return rateLimit.value;
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
                hasToken.value = false;
            },
            setToken(_token) {
                hasToken.value = true;
                loggin = false;
                this.$setGithub(_token)
                    .then(({ data }) => {
                        username.value = data.username;
                        avatarUrl.value = data.avatarUrl;
                    })
                    .catch(() => {});
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
            this.$getRateLimit()
                .then(({ message }) => {
                    rateLimit.value = message;
                })
                .catch((error) => {});
        },
        watch: {
            // appVisible: (val) => {
            //     console.log(val ? 'app activate' : 'app background');
            // },
            hideIcon: function(val) {
                this.$q.localStorage.set('clipbroad-hide-icon', val);
                if (this.$q.platform.is.electron) {
                    window.myAPI.setHideIcon(val);
                }
            },
        },
        created() {
            this.hideIcon = this.$q.localStorage.has('clipbroad-hide-icon')
                ? this.$q.localStorage.getItem('clipbroad-hide-icon')
                : true;
            if (this.$q.platform.is.electron) {
                window.myAPI.setHideIcon(this.hideIcon);
            }
        },
    };
</script>

<style></style>
