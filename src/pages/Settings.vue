<template>
    <q-page padding>
        <div class="q-pa-md q-gutter-sm absolute-center">
            <q-btn
                v-if="!isLogin()"
                color="primary"
                icon="github"
                label="Login With Github"
                @click="auth('github')"
            />
        </div>
    </q-page>
</template>

<script>
    const hello = require('hellojs/dist/hello.all.js');
    export default {
        methods: {
            auth(provider) {
                hello.init(
                    {
                        github: 'fa79756f53d8c0a88ddd',
                    },
                    {
                        oauth_proxy: 'https://auth-server.herokuapp.com/proxy',
                    }
                );
                hello
                    .login(provider, {
                        // display: 'page',
                        scope: 'repo',
                        response_type: 'code',
                        redirect_uri:
                            'http://localhost:8080/#/redirect',
                    })
                    .then((res) => {
                        console.log(res.authResponse.access_token);
                        this.$q.localStorage.set('clipbroad-github-token', res.authResponse.access_token);
                    });
            },
            isLogin() {
                const accessToken = this.$q.localStorage.getItem(
                    'clipbroad-github-token'
                );
                if (accessToken == null) {
                    return false;
                } else {
                    console.log(accessToken);
                    // gh = new GitHub({
                    //     token: accessToken,
                    // });
                    return true;
                }
            },
        },
    };
</script>

<style></style>
