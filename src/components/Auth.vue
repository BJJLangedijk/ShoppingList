<template>
    <v-btn color="primary" @click="login">LOGIN</v-btn>
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
