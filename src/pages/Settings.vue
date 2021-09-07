<template>
    <q-page class="column q-pa-md items-center">
        <div class="col-3 q-py-md">
            <transition
                appear
                enter-active-class="animated fadeInDown"
                leave-active-class="animated fadeOutUp"
            >
                <q-btn
                    v-if="showLoginBtn"
                    color="primary"
                    icon="login"
                    :label="$t('githubLogin')"
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
                            $t('githubAPILimit') +
                            rateLimit.current +
                            ' / ' +
                            rateLimit.limit
                        }}</q-item-label>
                        <q-item-label caption v-if="rateLimit">{{
                            $t('githubAPIReset') + rateLimit.time + 's'
                        }}</q-item-label>
                    </q-item-section>
                    <q-menu anchor="center middle" self="center middle">
                        <q-btn color="black" label="Logout" @click="logout()" />
                    </q-menu>
                </q-item>
            </transition>
        </div>
        <div class="col-1 q-py-md" style="width: 100%">
            <q-separator />
        </div>
        <div class="col-6 q-pa-md items-center">
            <div>
                <q-toggle
                    v-if="$q.platform.is.mac"
                    v-model="hideIcon"
                    checked-icon="check"
                    color="green"
                    unchecked-icon="clear"
                    :label="$t('hideDockIcon')"
                    left-label
                />
            </div>
            <div>
                <q-toggle
                    v-if="$q.platform.is.electron"
                    v-model="autoLaunch"
                    checked-icon="check"
                    color="green"
                    unchecked-icon="clear"
                    :label="$t('launchWithSystem')"
                    left-label
                    class="q-mb-md"
                />
            </div>
            <div>
                <q-toggle
                    v-if="$q.platform.is.electron"
                    v-model="showCopiedNotification"
                    checked-icon="check"
                    color="green"
                    unchecked-icon="clear"
                    :label="$t('copyNotification')"
                    left-label
                    class="q-mb-md"
                />
            </div>
            <div>
                <q-toggle
                    v-if="$q.platform.is.cordova"
                    v-model="syncUseMobileData"
                    checked-icon="check"
                    color="green"
                    unchecked-icon="clear"
                    :label="$t('useCellular')"
                    left-label
                    class="q-mb-md"
                />
            </div>
            <div>
                <q-select
                    :label="$t('maxItem')"
                    transition-show="jump-up"
                    transition-hide="jump-up"
                    filled
                    v-model="maxItem"
                    :options="[20, 40, 60, 80, 100]"
                    style="width: 250px"
                >
                    <q-tooltip
                        anchor="top middle"
                        self="bottom middle"
                        :offset="[10, 10]"
                    >
                        {{ $t('maxItemTip') }}
                    </q-tooltip>
                </q-select>
            </div>
        </div>
        <div class="col-1 q-py-md" style="width: 100%">
            <q-separator />
        </div>
        <div class="col q-pa-md items-center">
            <div class="q-pa-md">
                {{ $t('version') }}
                <q-badge color="primary">{{ version }}</q-badge>
            </div>
            <div class="q-pa-md">
                {{ $t('link') }}
                <q-chip
                    clickable
                    @click="
                        openExternalURL('https://github.com/dale0525/ClipBroad')
                    "
                    color="grey-10"
                    text-color="white"
                >
                    Github
                </q-chip>
                <q-chip
                    clickable
                    @click="openExternalURL('https://www.logiconsole.com')"
                    color="black"
                    text-color="white"
                >
                    Blog
                </q-chip>
            </div>
            <div class="q-pa-md">
                {{ $t('donation') }}
                <q-chip
                    clickable
                    @click="openExternalURL('https://paypal.me/logictan')"
                    color="indigo-10"
                    text-color="white"
                    icon="paypal"
                >
                    Paypal
                </q-chip>
                <q-chip color="green" text-color="white" icon="wechat">
                    Wechat
                    <q-popup-proxy>
                        <q-banner style="width: 250px">
                            <q-img
                                src="https://github.com/dale0525/ClipBroad/blob/main/screenshot/donation_wechat.png?raw=true"
                                spinner-color="primary"
                                style="max-width: 250px"
                            />
                        </q-banner>
                    </q-popup-proxy>
                </q-chip>
                <q-chip color="blue-7" text-color="white">
                    Alipay
                    <q-popup-proxy>
                        <q-banner style="width: 250px">
                            <q-img
                                src="https://github.com/dale0525/ClipBroad/blob/main/screenshot/donation_alipay.png?raw=true"
                                spinner-color="primary"
                                style="max-width: 250px"
                            />
                        </q-banner>
                    </q-popup-proxy>
                </q-chip>
            </div>
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
                hideIcon: this.$q.localStorage.has('clipbroad-hide-icon')
                    ? this.$q.localStorage.getItem('clipbroad-hide-icon')
                    : false,
                autoLaunch: this.$q.localStorage.has('clipbroad-auto-launch')
                    ? this.$q.localStorage.getItem('clipbroad-auto-launch')
                    : false,
                showCopiedNotification: this.$q.localStorage.has(
                    'clipbroad-show-copied-notification'
                )
                    ? this.$q.localStorage.getItem(
                          'clipbroad-show-copied-notification'
                      )
                    : true,
                syncUseMobileData: this.$q.localStorage.has(
                    'clipbroad-use-mobile-data'
                )
                    ? this.$q.localStorage.getItem('clipbroad-use-mobile-data')
                    : false,
                maxItem: this.$q.localStorage.has('clipbroad-max-item')
                    ? this.$q.localStorage.getItem('clipbroad-max-item')
                    : 40,
                version: process.env.VERSION,
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
                    `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=https://logiconsole.com/api/clipbroad/oauth&scope=repo&state=${uuid}`
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
            openExternalURL(url) {
                openURL(url, null, {
                    noopener: true,
                    menubar: true,
                    toolbar: true,
                    noreferrer: true,
                });
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
                                // console.log(data.message);
                            } else {
                                // console.log(`access token is ${data.message}`);
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
            hideIcon: function (val) {
                this.$q.localStorage.set('clipbroad-hide-icon', val);
                if (this.$q.platform.is.mac) {
                    window.myAPI.setHideIcon(val);
                }
            },
            autoLaunch: function (val) {
                this.$q.localStorage.set('clipbroad-auto-launch', val);
                if (this.$q.platform.is.electron) {
                    window.myAPI.registerAutoLaunch(val);
                }
            },
            showCopiedNotification: function (val) {
                this.$q.localStorage.set(
                    'clipbroad-show-copied-notification',
                    val
                );
            },
            syncUseMobileData: function (val) {
                this.$q.localStorage.set('clipbroad-use-mobile-data', val);
            },
            maxItem: function (val) {
                this.$q.localStorage.set('clipbroad-max-item', val);
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
