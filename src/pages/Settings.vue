<template>
    <q-page padding>
        <div class="q-pa-md q-gutter-sm absolute-center">
            <q-btn
                v-if="!isLogin()"
                color="primary"
                icon="login"
                label="Login With Github"
                @click="Auth()"
            />
        </div>
    </q-page>
</template>

<script>
    export default {
        methods: {
            Auth() {
                // Login
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
