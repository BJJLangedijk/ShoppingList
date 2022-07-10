<template>
    <v-app>
        <v-app-bar app dark color="primary" >
            <v-app-bar-title>Shopping List</v-app-bar-title>

            <v-spacer></v-spacer>

            <!-- Maybe there's a better way to match routes -->
            <template v-if="$route.name === 'List'">
                <v-btn icon :color="`${searchBarActive ? '': 'secondary'}`" @click="toggleSearchBar()">
                    <v-icon>mdi-magnify</v-icon>
                </v-btn>
                <v-btn icon :color="`${completedItems ? '': 'secondary'}`" :disabled="editMode" @click="toggleCompletedItems()">
                    <v-icon>mdi-check-all</v-icon>
                </v-btn>
                <v-btn icon :color="`${editMode ? '': 'secondary'}`" :disabled="completedItems" @click="toggleEditMode()">
                    <v-icon>mdi-pencil</v-icon>
                </v-btn>
            </template>
        </v-app-bar>
        <v-main>
            <router-view />
        </v-main>
    </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import firebase from 'firebase/app';
import 'firebase/auth';

export default defineComponent({
    name: 'App',
    methods: {
        toggleSearchBar(value: boolean): void {
            this.$store.commit('toggleSearchBar', value);

        },
        toggleEditMode(value: boolean): void {
            this.$store.commit('toggleEditMode', value);

        },
        toggleCompletedItems(value: boolean): void {
            this.$store.commit('toggleCompletedItems', value);
        }
    },
    computed: {
        searchBarActive(): boolean {
            return this.$store.getters.searchBarActive;
        },
        editMode(): boolean {
            return this.$store.getters.editMode;
        },
        completedItems(): boolean {
            return this.$store.getters.completedItems;
        }
    },
    beforeMount() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.$router.replace({name: 'List'});
            } else {
                this.$router.replace({name: 'Auth'});
            }
        });
    }
});
</script>

<style lang="scss">
    body {
        -webkit-touch-callout: none; /* iOS Safari */
        -webkit-user-select: none; /* Safari */
        -khtml-user-select: none; /* Konqueror HTML */
        -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
        user-select: none; /* Non-prefixed version, currently supported by Chrome and Opera */
    }
</style>
