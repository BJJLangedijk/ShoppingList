<template>
    <div>
        <v-text-field
        clearable
        v-model="searchQuery"
        prepend-icon="search"
        @input="filterResults"
        placeholder="Search for an item"
        class="p2"
        ></v-text-field>
    <v-progress-circular v-if="loading" color="accent" indeterminate></v-progress-circular>

    <div v-else-if="searchQuery && !filteredItems.length" class="subheading text-xs-center">
        Could not find any items
    </div>

    <v-list v-else v-bind:class="{ 'editMode': settings.editMode }">
        <template v-for="section in sections">
            <div :key="section.id">
                <v-divider></v-divider>
                <v-subheader>{{section.value}}</v-subheader>

                <template v-for="item in getItemsBySectionId(section.id)">
                    <v-list-tile :key="item.id" v-if="settings.editMode || settings.completed || !item.checked">
                        <v-list-tile-action>
                            <template v-if="settings.editMode">
                                <v-checkbox v-model="item.markedForDeletion" @change="toggleSelection(item, section)" />
                            </template>
                            <template v-else>
                                <v-checkbox v-model="item.checked" @change="toggleSelection(item, section)"/>
                            </template>
                        </v-list-tile-action>
                        <v-list-tile-content v-long-press='function () { editItem(item, section) }'>
                            <v-list-tile-title>{{ item.value }}</v-list-tile-title>
                            <v-list-tile-sub-title>{{ item.amount }}</v-list-tile-sub-title>
                        </v-list-tile-content>
                    </v-list-tile>
                </template>
            </div>
        </template>


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
    </v-list>
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

    interface Item {
        sectionId: string;
        amount: number;
        id: string;
        value: string;
        checked: boolean;
        markedForDeletion: boolean;
    }

    interface Section {
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
            sections: [] as Section[],
            filteredItems: [] as Item[],
            items: [] as Item[],
            selectedItems: [] as Item[],
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
                    this.filteredItems = this.items.filter(item => item.value.toLowerCase().includes(this.searchQuery.toLowerCase()));
                }
            },
            toggleEditMode(): void {
                this.$store.commit('toggleEditMode');
            },
            toggleSelection(item: Item, section: Section): void {
                let itemData;

                if (this.settings.editMode) {
                    itemData = Object.assign({}, item);

                    itemData.sectionId = section.id;

                    if (item.checked && this.selectedItems[item.id]) {
                        delete this.selectedItems[item.id];
                    } else {
                        this.selectedItems[item.id] = itemData;
                    }
                } else {
                    if (item.checked) {
                        firebase.firestore().collection('items').doc(item.id).update({
                            checked: item.checked
                        }).catch(this.onFirebaseError);
                    } else {
                        firebase.firestore().collection('items').doc(item.id).update({
                            checked: firebase.firestore.FieldValue.delete()
                        }).catch(this.onFirebaseError);
                    }
                }
            },
            getSections(): void {
                this.loading = true;
                firebase.firestore().collection('sections').orderBy('value').onSnapshot((collection) => {
                    this.sections = [];
                    collection.forEach((doc) => {
                        this.sections.push({
                            id: doc.id,
                            value: doc.data().value,
                        });
                    });
                    this.loading = false;
                }, (err) => {
                    console.error('Something went wrong', err);
                });
            },
            getItems(): void {
                this.loading = true;
                firebase.firestore().collection('items').orderBy('value').onSnapshot((collection) => {
                    this.items = [];
                    collection.forEach((doc) => {
                        this.items.push({
                            sectionId: doc.data().sectionId,
                            amount: doc.data().amount,
                            id: doc.id,
                            value: doc.data().value,
                            checked: doc.data().checked,
                            markedForDeletion: doc.data().markedForDeletion
                        });
                    });
                    this.loading = false;
                }, (err) => {
                    console.error('Something went wrong', err);
                });
            },
            getItemsBySectionId(sectionId: string) {
                var items = this.searchQuery ? this.filteredItems : this.items;

                return items.filter(item => {
                    if (this.searchQuery && !(this.settings.editMode || this.settings.completed)) {
                        return item.sectionId === sectionId && !item.checked;
                    }
                    return item.sectionId === sectionId
                });
            },
            editItem(item: Item, section: Section) {
                this.$router.push({ name: 'editItem', params: { sectionId: section.id, itemId: item.id }});
            },
            deleteItems() {
                for (const key in this.selectedItems) {
                    if (this.selectedItems.hasOwnProperty(key)) {
                        const item = this.selectedItems[key];

                        firebase.firestore().collection('items').doc(item.id).delete().catch(this.onFirebaseError);
                    }
                }
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
            this.getSections();
            this.getItems();

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
