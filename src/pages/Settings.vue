<template>
    <q-page class="column q-pa-md items-center">
        <q-item to="/" clickable class="fixed-top-left q-ma-lg">
            <q-icon name="arrow_back" size="lg" class="absolute-center" />
        </q-item>
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
            <div v-if="$q.platform.is.electron">
                <q-toggle
                    v-model="hideIcon"
                    checked-icon="check"
                    color="green"
                    unchecked-icon="clear"
                    :label="$t('hideDockIcon')"
                    left-label
                />
            </div>
            <div v-if="$q.platform.is.electron">
                <q-toggle
                    v-model="autoLaunch"
                    checked-icon="check"
                    color="green"
                    unchecked-icon="clear"
                    :label="$t('launchWithSystem')"
                    left-label
                />
            </div>
            <div v-if="$q.platform.is.electron">
                <q-toggle
                    v-model="showCopiedNotification"
                    checked-icon="check"
                    color="green"
                    unchecked-icon="clear"
                    :label="$t('copyNotification')"
                    left-label
                />
            </div>
            <div v-if="$q.platform.is.cordova">
                <q-toggle
                    v-model="syncUseMobileData"
                    checked-icon="check"
                    color="green"
                    unchecked-icon="clear"
                    :label="$t('useCellular')"
                    left-label
                />
            </div>
            <div class="q-mt-md">
                <q-select
                    :label="$t('darkMode')"
                    transition-show="jump-up"
                    transition-hide="jump-up"
                    filled
                    v-model="darkMode"
                    :options="[
                        { label: $t('yes'), value: false },
                        { label: $t('no'), value: true },
                        { label: $t('darkModeAuto'), value: 'auto' },
                    ]"
                    :map-options="true"
                    style="width: 250px"
                >
                </q-select>
            </div>
            <div class="q-mt-md">
                <q-select
                    :label="$t('maxItem')"
                    transition-show="jump-up"
                    transition-hide="jump-up"
                    filled
                    v-model="maxItem"
                    :options="[20, 40, 60, 80, 100]"
                    style="width: 250px"
                >
                </q-select>
            </div>
            <div class="q-mt-md">
                <q-select
                    :label="$t('maxFileSize')"
                    transition-show="jump-up"
                    transition-hide="jump-up"
                    filled
                    v-model="maxFileSize"
                    :options="[1, 5, 10, 20]"
                    style="width: 250px"
                    :hint="$t('maxFileSizeTip2')"
                >
                </q-select>
            </div>
            <div v-if="$q.platform.is.electron" class="q-mt-xl">
                <q-field
                    filled
                    :label="$t('shortcut')"
                    :model-value="shortcut"
                    stack-label
                    :rules="[
                        (val) => {
                            if (val && validShortcut) {
                                return true;
                            } else if (!validShortcut) {
                                return $t('invalidShortcut');
                            } else if (registerShortcutSuccess) {
                                return true;
                            } else {
                                return $t('shortcutRegisterFail');
                            }
                        },
                    ]"
                >
                    <div
                        class="self-center full-width no-outline"
                        tabindex="0"
                        v-on:keydown="setShortcut"
                        @click="setShortcutStart = true"
                    >
                        {{ shortcut }}
                    </div>
                </q-field>
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
    import config from 'src/config.js';
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
                    : config.defaultSettings.hideIcon,
                autoLaunch: this.$q.localStorage.has('clipbroad-auto-launch')
                    ? this.$q.localStorage.getItem('clipbroad-auto-launch')
                    : config.defaultSettings.autoLaunch,
                showCopiedNotification: this.$q.localStorage.has(
                    'clipbroad-show-copied-notification'
                )
                    ? this.$q.localStorage.getItem(
                          'clipbroad-show-copied-notification'
                      )
                    : config.defaultSettings.showCopiedNotification,
                syncUseMobileData: this.$q.localStorage.has(
                    'clipbroad-use-mobile-data'
                )
                    ? this.$q.localStorage.getItem('clipbroad-use-mobile-data')
                    : config.defaultSettings.syncUseMobileData,
                maxItem: this.$q.localStorage.has('clipbroad-max-item')
                    ? this.$q.localStorage.getItem('clipbroad-max-item')
                    : config.defaultSettings.maxItem,
                darkMode: this.$q.localStorage.has('clipbroad-dark-mode')
                    ? this.$q.localStorage.getItem('clipbroad-dark-mode')
                    : config.defaultSettings.darkMode,
                maxFileSize: this.$q.localStorage.has('clipbroad-max-file-size')
                    ? this.$q.localStorage.getItem('clipbroad-max-file-size')
                    : config.defaultSettings.maxFileSize,
                shortcutArray: this.$q.localStorage.has('clipbroad-shortcut')
                    ? this.$q.localStorage.getItem('clipbroad-shortcut')
                    : config.defaultSettings.shortcut,
                setShortcutStart: false,
                validShortcut: true,
                registerShortcutSuccess: true,
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
            shortcut() {
                return this.shortcutArray.join('+');
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
                    `https://github.com/login/oauth/authorize?client_id=${config.githubClientID}&redirect_uri=https://logiconsole.com/api/clipbroad/oauth&scope=repo&state=${uuid}`
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
            setShortcut(event) {
                if (this.$q.platform.is.win && event.metaKey) return;
                var key = event.key;
                key = key.charAt(0).toUpperCase() + key.slice(1);
                if (this.setShortcutStart) {
                    this.validShortcut = true;
                    this.setShortcutStart = false;
                    this.shortcutArray = [];
                }
                if (
                    this.shortcutArray.length > 0 &&
                    this.shortcutArray.includes(key)
                ) {
                    return;
                }
                this.shortcutArray.push(key);
                if (
                    ![
                        'Meta',
                        'Shift',
                        'Control',
                        'Alt',
                        'Option',
                        'AltGr',
                        'Super',
                    ].includes(key)
                ) {
                    //not modify key, stop capturing keyboard
                    if (this.shortcutArray.length < 2) {
                        this.validShortcut = false;
                        this.setShortcutStart = true;
                        this.shortcutArray = [];
                        return;
                    }
                    window.myAPI
                        .registerShortcut(JSON.stringify(this.shortcutArray))
                        .then((result) => {
                            if (result) {
                                //register success
                                this.registerShortcutSuccess = true;
                                this.validShortcut = true;
                                this.$q.localStorage.set(
                                    'clipbroad-shortcut',
                                    this.shortcutArray
                                );
                                document.activeElement.blur();
                                this.$q.notify(
                                    this.$t('shortcutRegisterSuccess')
                                );
                            } else {
                                this.registerShortcutSuccess = false;
                                this.validShortcut = true;
                                this.setShortcutStart = true;
                                this.shortcutArray = [];
                            }
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                }
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
                                if (this.$q.platform.is.electron)
                                    window.myAPI.showWindow(true);
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
            darkMode: function (val) {
                this.$q.localStorage.set('clipbroad-dark-mode', val.value);
                window.dispatchEvent(new CustomEvent('setDarkMode'));
            },
            maxFileSize: function (val) {
                this.$q.localStorage.set('clipbroad-max-file-size', val);
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
