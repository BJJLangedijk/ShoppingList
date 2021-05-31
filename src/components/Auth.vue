<template>
    <div>
        <img src="/img/google.svg" alt="Login with Google">
        <h3>Please sign in with your Google account</h3>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="login">Sign in</v-btn>
    </div>
</template>
<script lang="ts">
import firebase from 'firebase/app';
import 'firebase/auth';

const googleAuthProvider = new firebase.auth.GoogleAuthProvider();

export default {
    name: 'auth',
    methods: {
        login() {
            firebase.auth().signInWithRedirect(googleAuthProvider).then().catch((err) => window.alert(err));
        },

        signOut() {
            firebase.auth().signOut().then(() => {
            }).catch((err) => window.alert(err));
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
