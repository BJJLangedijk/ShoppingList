<template>
    <div>
        <img src="/img/google.svg" alt="Login with Google">
        <h3>Please sign in with your Google account</h3>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="login">Sign in</v-btn>
    </div>
</template>
<script lang="ts">
import { getAuth, GoogleAuthProvider, getRedirectResult, signOut, signInWithPopup } from 'firebase/auth';

const googleAuthProvider = new GoogleAuthProvider();

const auth = getAuth();

export default {
    name: 'auth',
    methods: {
        async login() {
            await signInWithPopup(auth, googleAuthProvider);

            await getRedirectResult(auth).catch((error) => {
                window.alert(`Login error: ${error.code} ${error.message}`);
            });
        },

        signOut() {
            signOut(auth).catch((error) => {
                window.alert(`Logout error: ${error.code} ${error.message}`);
            });
        },
    }
};
</script>

<style lang="scss" scoped>
div {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20%;
    text-align: center;
}

img {
    margin: 20px 0;
    width: 33%;
}

.v-btn {
    margin: 20px 0;
}
</style>
