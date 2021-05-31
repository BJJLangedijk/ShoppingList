<template>
    <div>
        <v-text-field
        v-if="settings.searchBarActive"
        clearable
        v-model="searchQuery"
        prepend-icon="mdi-magnify"
        @input="filterResults"
        placeholder="Search for an item"
        class="p2"
        ></v-text-field>
    <v-progress-circular v-if="loading" color="accent" indeterminate></v-progress-circular>

    <div v-else-if="searchQuery && !filteredItems.length" class="text-center">
        Could not find any items
    </div>

    <v-list v-else v-bind:class="{ 'editMode': settings.editMode }">
        <template v-for="section in sections">
            <div v-if="getItemsBySectionId(section.id, !shouldFilterItems()).length" :key="section.id">
                <v-divider></v-divider>
                <v-subheader>{{section.value}}</v-subheader>

                <template v-for="item in getItemsBySectionId(section.id, !shouldFilterItems())">
                    <v-list-item :key="item.id" v-if="!item.checked || shouldFilterItems()">
                        <v-list-item-action>
                            <template v-if="settings.editMode">
                                <v-checkbox v-model="item.markedForDeletion" @change="toggleSelection(item, section)" />
                            </template>
                            <template v-else>
                                <v-checkbox v-model="item.checked" @change="toggleSelection(item, section)"/>
                            </template>
                        </v-list-item-action>
                        <v-list-item-content v-long-press='function () { editItem(item, section) }'>
                            <v-list-item-title>{{ item.value }}</v-list-item-title>
                            <v-list-item-subtitle>{{ item.amount }}</v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                </template>
            </div>
        </template>
    </v-list>
    <template v-if="settings.editMode && Object.keys(selectedItems).length">

        <!-- Delete Button -->
        <v-btn
            fixed
            bottom
            right
            fab
            color="primary"
            @click="deleteItems()">
            <v-icon>mdi-delete</v-icon>
        </v-btn>
    </template>

    <template v-if="!settings.editMode">

        <!-- Add Button -->
        <v-btn
            fixed
            bottom
            right
            fab
            color="primary"
            @click="addItem()">
            <v-icon>mdi-plus</v-icon>
        </v-btn>
    </template>

    <router-view></router-view>

    <v-snackbar v-model="noConnectionSnackbar" :timeout=-1 :multi-line=true>
        <v-icon dark large class='mr-4'>mdi-wifi-off</v-icon>
        <div class="text-center">
            <span>Not connected!</span>
            <br />
            <span>Using cached results</span>
        </div>
        <v-btn
            color="primary"
            text
            @click="noConnectionSnackbar = false"
        >
            Close
        </v-btn>
    </v-snackbar>
    </div>
</template>

<script lang='ts'>
    import Vue from 'vue';
    import firebase from 'firebase/app';
    import { LongPressDirective } from '../directives/long-press';
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
                searchBarActive: false,
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
        directives: {
            LongPressDirective
        },
        methods: {
            onFirebaseError(err): void {
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
            shouldFilterItems(): boolean {
                return this.settings.editMode || this.settings.completed || !!this.searchQuery;
            },
            getItemsBySectionId(sectionId: string, filterCheckedItems): Item[] {
                var items = this.filteredItems.length ? this.filteredItems : this.items;

                return items.filter(item => {
                    if (filterCheckedItems) {
                        return item.sectionId === sectionId && !item.checked;
                    }
                    return item.sectionId === sectionId;
                });
            },
            addItem() {
                this.$router.push({name: 'addItem'});
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
            searchBarActive(): any {
                return this.$store.state.settings.searchBarActive;
            },
            editMode(): any {
                return this.$store.state.settings.editMode;
            },
            completedItems(): any {
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
            this.settings = {
                searchBarActive: this.$store.state.settings.searchBarActive,
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
