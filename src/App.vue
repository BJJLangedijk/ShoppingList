<template>
    <v-app>
        <v-app-bar app dark color="primary" >
            <v-toolbar-title class="title">Shopping List</v-toolbar-title>

            <v-spacer></v-spacer>
            <!-- Maybe there's a better way to match routes -->
            <div v-if="$route.name === 'List'">
                <v-btn text icon :color="`${settings.searchBarActive ? '': 'secondary'}`" @click="toggleSearchBar()">
                    <v-icon>mdi-magnify</v-icon>
                </v-btn>
                <v-btn text icon :color="`${settings.completed ? '': 'secondary'}`" :disabled="settings.editMode" @click="toggleCompletedItems()">
                    <v-icon>mdi-check-all</v-icon>
                </v-btn>
                <v-btn text icon :color="`${settings.editMode ? '': 'secondary'}`" :disabled="settings.completed" @click="toggleEditMode()">
                    <v-icon>mdi-pencil</v-icon>
                </v-btn>
            </div>
        </v-app-bar>
        <v-main>
            <router-view />
        </v-main>
    </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import firebase from 'firebase/app';
import 'firebase/auth';

export default Vue.extend({
    name: 'App',
    data: () => ({
        settings: {
            searchBarActive: false,
            editMode: false,
            completed: false
        }
    }),
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
            return this.$store.state.settings.searchBarActive;
        },
        editMode(): boolean {
            return this.$store.state.settings.editMode;
        },
        completedItems(): boolean {
            return this.$store.state.settings.completed;
        }
    },
    watch: {
        searchBarActive(state: boolean) {
            this.settings.searchBarActive = state;
        },
        editMode(state: boolean) {
            this.settings.editMode = state;
        },
        completedItems(state: boolean) {
            this.settings.completed = state;
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
        this.settings = {
            searchBarActive: this.$store.state.settings.searchBarActive,
            editMode: this.$store.state.settings.editMode,
            completed: this.$store.state.settings.completed
        };
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
