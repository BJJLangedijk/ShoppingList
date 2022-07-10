<template>
    <div>
        <v-text-field
        v-if="searchBarActive"
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

    <div class="list-wrapper" v-else v-bind:class="{ 'editMode': editMode }">
        <template v-for="section in sections" :key="section.id">
            <!-- <v-lazy v-if="getItemsBySectionId(section.id, !shouldFilterItems()).length"> -->
                <v-list v-if="getItemsBySectionId(section.id, !shouldFilterItems()).length" density="compact">
                    <v-divider />

                    <v-list-subheader>{{section.value}}</v-list-subheader>

                    <template v-for="item in getItemsBySectionId(section.id, !shouldFilterItems())" :key="item.id" >
                        <v-list-item v-if="!item.checked || shouldFilterItems()">
                            <v-list-item-action>
                                <template v-if="editMode">
                                    <v-checkbox v-model="item.markedForDeletion" @change="toggleSelection(item, section)" />
                                </template>
                                <template v-else>
                                    <v-checkbox v-model="item.checked" @change="toggleSelection(item, section)"/>
                                </template>
                            </v-list-item-action>
                            <v-list-item-header v-long-press='function () { editItem(item, section) }'>
                                <v-list-item-title>{{ item.value }}</v-list-item-title>
                                <v-list-item-subtitle>{{ item.amount }}</v-list-item-subtitle>
                            </v-list-item-header>
                        </v-list-item>
                    </template>
                </v-list>
            <!-- </v-lazy> -->
        </template>
    </div>
    <template v-if="editMode && Object.keys(selectedItems).length">

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

    <template v-if="!editMode">

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
    import { defineComponent } from 'vue';
    import firebase from 'firebase/app';
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

    export default defineComponent({
        data: () => ({
            noConnectionSnackbar: !navigator.onLine,
            searchQuery: '' as string,
            loading: true as boolean,
            sections: [] as Section[],
            filteredItems: [] as Item[],
            items: [] as Item[],
            selectedItems: [] as Item[],
        }),
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

                if (this.editMode) {
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
                return this.editMode || this.completedItems || !!this.searchQuery;
            },
            getItemsBySectionId(sectionId: string, filterCheckedItems: boolean): Item[] {
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
            window.addEventListener('online', () => {
                this.noConnectionSnackbar = false;
            });

            window.addEventListener('offline', () => {
                this.noConnectionSnackbar = true;
            });
        },

        mounted() {
            this.getSections();
            this.getItems();
        }
    });
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang='scss'>
    .v-input {
        margin-left: 0;
        margin-right: 25px;
        --v-input-control-height: 48px - 7px;
    }
    :deep() .v-input__details {
        display: none;
    }
    .list-wrapper {
        display: flex;
        flex-flow: row wrap;
        max-width: 100vw;
        overflow: hidden;
        > div {
            flex: 1 1 500px;
            padding: 1% 2%;
            min-width: 50%;
            justify-items: center;
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
