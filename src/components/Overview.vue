<template>
    <div>
        <v-text-field
        clearable
        v-model="searchQuery"
        prepend-icon="search"
        @input="filterResults"
        placeholder="Search for a a list"
        class="p2"
        ></v-text-field>
    <v-progress-circular v-if="loading" color="accent" indeterminate></v-progress-circular>

    <div v-else-if="searchQuery && !filteredItems.length" class="subheading text-xs-center">
        Could not find any items
    </div>

    <v-list v-else v-bind:class="{ 'editMode': settings.editMode }">
        <template v-for="item in getFilteredLists()">
            <v-list-tile :key="item.id" @click="goToList(item.id)">

                <v-list-tile-avatar>
                    <img src="/img/icons/icon-96x96.png">
                </v-list-tile-avatar>
                <v-list-tile-content>
                    <v-list-tile-title v-html="item.value"></v-list-tile-title>
                    <v-list-tile-sub-title v-html="item.subtitle"></v-list-tile-sub-title>
                </v-list-tile-content>
            </v-list-tile>
        </template>
    </v-list>
    <template v-if="settings.editMode && Object.keys(selectedItems).length">

        <!-- Delete Button -->
        <v-btn fab color="primary" @click="deleteItems()">
            <v-icon>delete</v-icon>
        </v-btn>
    </template>

    <template v-if="!settings.editMode">

        <!-- Add Button -->
        <router-link :to="{name: 'addItem'}">
            <v-btn fab color="primary">
                <v-icon>add</v-icon>
            </v-btn>
        </router-link>
    </template>

    <router-view></router-view>

    <v-snackbar v-model="noConnectionSnackbar" :timeout=0 :multi-line=true>
        <v-icon dark large class='mr-4'>cloud_off</v-icon>
        <div class="text-xs-center">
            <span>You don't seem to have internet!</span>
            <br />
            <span>Using cached results</span>
        </div>
        <v-btn
            color="primary"
            flat
            @click="noConnectionSnackbar = false"
        >
            Close
        </v-btn>
    </v-snackbar>
    </div>
</template>

<script lang='ts'>
    import Vue from 'vue';
    import firebase, { FirebaseError } from 'firebase/app';
    import 'firebase/firestore';

    interface List {
        id: string;
        value: string;
    }

    export default Vue.extend({
        data: () => ({
            settings: {
                editMode: false,
                completed: false
            },
            noConnectionSnackbar: !navigator.onLine,
            searchQuery: '' as string,
            loading: true as boolean,
            filteredItems: [] as List[],
            lists: [] as List[]
        }),
        methods: {
            onFirebaseError(err: FirebaseError): void {
                if (err.code === 'PERMISSION_DENIED') {
                    this.$router.replace({name: 'Auth'});
                } else {
                    console.log(err);
                }
            },
            filterResults(): void {
                if (!this.searchQuery) {
                    this.filteredItems = [];
                } else {
                    this.filteredItems = this.lists.filter(item => item.value.toLowerCase().includes(this.searchQuery.toLowerCase()));
                }
            },
            getLists(): void {
                const user = firebase.auth().currentUser;

                this.loading = true;

                if (!user) {
                    return;
                }

                firebase.firestore().collection('lists').where('members', 'array-contains', user.uid).orderBy('value').onSnapshot((collection) => {
                    this.lists = [];
                    collection.forEach((doc) => {
                        this.lists.push({
                            id: doc.id,
                            value: doc.data().value
                        });
                    });
                    this.loading = false;
                }, (err) => {
                    console.error('Something went wrong', err);
                });
            },
            goToList(id: string) {
                this.$router.push({name: 'List', params: { id: id }});
            },
            getFilteredLists() {
                var lists = this.searchQuery ? this.filteredItems : this.lists;

                return lists;
            }
        },
        computed: {
            editMode(): any {
                return this.$store.state.settings.editMode;
            },
            completedItems(): any {
                return this.$store.state.settings.completed;
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
            this.settings = {
                editMode: this.$store.state.settings.editMode,
                completed: this.$store.state.settings.completed
            };
            this.getLists();

            window.addEventListener('online', () => {
                this.noConnectionSnackbar = false;
            });

            window.addEventListener('offline', () => {
                this.noConnectionSnackbar = true;
            });
        }
    });
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang='scss'>
    .v-input {
        padding-left: 2%;
        padding-right: 2%;
    }
    .v-list {
        display: flex;
        flex-flow: row wrap;
        max-width: 100vw;
        overflow: hidden;
        > div {
            flex: 1 1 500px;
            padding: 1% 2%;
            min-width: 50%;
        }
    }
    .v-progress-circular {
        position: absolute;
        top: 50%;
        left: 50%;
        margin-top: -30px;
        margin-left: -30px;
    }
    .v-btn.v-btn--floating {
        position: fixed;
        bottom: 2vh;
        right: 2vh;
        z-index: 3;
    }
    .v-checked + .v-list-item-text {
        text-decoration: line-through;
    }
    .editMode .v-list-item-text {
        text-decoration: none !important;
    }
    .v-field {
        margin: 0;
        padding: 0;
        min-height: auto;
    }
</style>
