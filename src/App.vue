<template>
    <v-app>
        <v-app-bar color="primary">
            <v-app-bar-title>Shopping List</v-app-bar-title>

            <!-- Maybe there's a better way to match routes -->
            <template v-if="$route.name === 'List'">
                <v-btn icon="mdi-magnify" :variant="`${searchBarActive ? 'elevated': 'text'}`" @click="toggleSearchBar()">
                </v-btn>
                <v-btn icon="mdi-check-all" :variant="`${completedItems ? 'elevated': 'text'}`" :disabled="editMode" @click="toggleCompletedItems()">
                </v-btn>
                <v-btn icon="mdi-pencil" :variant="`${editMode ? 'elevated': 'text'}`" :disabled="completedItems" @click="toggleEditMode()">
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
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default defineComponent({
    name: 'App',
    data: () => ({
        version: import.meta.env.PACKAGE_VERSION
    }),
    methods: {
        toggleSearchBar(): void {
            this.$store.commit('toggleSearchBar');

        },
        toggleEditMode(): void {
            this.$store.commit('toggleEditMode');

        },
        toggleCompletedItems(): void {
            this.$store.commit('toggleCompletedItems');
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
        onAuthStateChanged(getAuth(), (user) => {
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
