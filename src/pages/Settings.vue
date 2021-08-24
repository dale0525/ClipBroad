<template>
    <q-page padding>
        <div class="q-pa-md q-gutter-sm absolute-center">
            <q-btn
                v-if="!accessToken"
                color="primary"
                icon="login"
                label="Login With Github"
                @click="auth()"
            />
            <q-item v-ripple>
                <q-item-section side>
                    <q-avatar rounded size="48px">
                        <img :src="githubAvaterUrl" />
                    </q-avatar>
                </q-item-section>
                <q-item-section>
                    <q-item-label>{{ githubUserName }}</q-item-label>
                </q-item-section>
            </q-item>
        </div>
    </q-page>
</template>

<script>
    import { openURL } from 'quasar';
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
            };
        },
        computed: {
            ...mapGetters('clipboard', [
                'githubUserName',
                'githubAvaterUrl',
            ]),
        },
        methods: {
            ...mapActions('clipboard', ['setGithub']),
            auth() {
                openURL(
                    `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=http://localhost:8080/callback.html&scope=repo&state=5498a909-64f1-4701-a96f-05d551ad31d1`
                );
                loggin = true;
            },
            onGetToken() {
                this.setGithub(this.accessToken);
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
                this.accessToken = this.$q.localStorage.getItem(
                    'clipbroad-github-token'
                );
                if (this.accessToken == null) {
                    console.log('access token is null');
                    return;
                } else {
                    console.log(`access token is ${this.accessToken}`);
                    loggin = false;
                    this.onGetToken();
                }
            }, 500);
        },
    };
</script>

<style></style>
