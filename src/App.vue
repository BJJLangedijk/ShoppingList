<template>
    <v-app>
        <v-toolbar fixed app dark :color="`${toolbarBackground}`" >
            <v-toolbar-title>Shopping List</v-toolbar-title>

            <v-spacer></v-spacer>
            <!-- Maybe there's a better way to match routes -->
            <div v-if="$route.name === 'List'">
                <v-btn icon v-if="!settings.editMode" :color="`${settings.completed ? 'accent': 'primary'}`" @click="toggleCompletedItems()">
                    <v-icon>done_all</v-icon>
                </v-btn>
                <v-btn flat icon @click="toggleEditMode()">
                    <v-icon>edit</v-icon>
                </v-btn>
            </div>
        </v-toolbar>
        <v-content>
            <router-view />
        </v-content>
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
            editMode: false,
            completed: false
        }
    }),
    methods: {
        toggleEditMode(value: boolean): void {
            this.$store.commit('toggleEditMode', value);

        },
        toggleCompletedItems(value: boolean): void {
            this.$store.commit('toggleCompletedItems', value);
        }
    },
    computed: {
        toolbarBackground(): string {
            return this.settings.editMode ? '' : 'primary';
        }
    },
    watch: {
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
                this.$router.push({name: 'List'});
            } else {
                this.$router.push({name: 'Auth'});
            }
        });
        this.settings = {
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
