<template>
    <v-text-field v-if="searchBarActive" clearable v-model="searchQuery" prepend-inner-icon="mdi-magnify"
        @input="filterResults" @click:clear="filterResults" placeholder="Search for an item"></v-text-field>

    <v-progress-circular v-if="loading" color="accent" indeterminate></v-progress-circular>

    <div v-else-if="searchQuery && !filteredItems.length" class="text-center">
        Could not find any items
    </div>

    <div class="list-wrapper" v-else :class="{ 'editMode': editMode }">
        <template v-for="section in sections">
            <v-lazy :key="section.id" v-if="getItemsBySectionId(section.id, !shouldFilterItems()).length">
                <v-list v-if="getItemsBySectionId(section.id, !shouldFilterItems()).length" density="compact">
                    <v-divider />

                    <v-list-subheader>{{ section.value }}</v-list-subheader>

                    <template v-for="item in getItemsBySectionId(section.id, !shouldFilterItems())">
                        <v-list-item :key="item.id" v-if="!item.checked || shouldFilterItems()"
                            v-long-press='function () { editItem(item, section) }'>
                            <template #prepend>
                                <v-list-item-action start>
                                    <v-checkbox-btn color="primary" v-if="editMode" v-model="item.markedForDeletion"
                                        @change="toggleSelection(item, section)"></v-checkbox-btn>
                                    <v-checkbox-btn color="primary" v-else v-model="item.checked"
                                        @change="toggleSelection(item, section)"></v-checkbox-btn>
                                </v-list-item-action>
                            </template>
                            <v-list-item-title>{{ item.value }}</v-list-item-title>
                            <v-list-item-subtitle>{{ item.amount }}</v-list-item-subtitle>
                        </v-list-item>
                    </template>
                </v-list>
            </v-lazy>
        </template>
    </div>
    <template v-if="editMode && selectedItems.length">

        <!-- Delete Button -->
        <v-btn position="fixed" location="bottom right" icon="mdi-delete" color="primary" size="large"
            @click="deleteItems()">
        </v-btn>
    </template>

    <template v-if="!editMode">

        <!-- Add Button -->
        <v-btn position="fixed" location="bottom right" icon="mdi-plus" color="primary" size="large"
            @click="addItem()">
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
        <v-btn color="primary" @click="noConnectionSnackbar = false">
            Close
        </v-btn>
    </v-snackbar>
</template>

<script lang='ts'>
import { useSettingsState } from '@/store/settings';
import { FirebaseError } from 'firebase/app';
import { getFirestore, collection, deleteDoc, deleteField, doc, onSnapshot, orderBy, updateDoc, query } from 'firebase/firestore';
import { mapState } from 'pinia';
import { defineComponent } from 'vue';

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
    watch: {
        searchBarActive() {
            this.searchQuery = '';
            this.filteredItems = [];
        }
    },
    methods: {
        onFirebaseError(err: FirebaseError): void {
            if (err.code === 'PERMISSION_DENIED') {
                this.$router.replace({ name: 'Auth' });
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
        toggleSelection(item: Item, section: Section): void {
            if (this.editMode) {
                if (this.selectedItems.some(x => x.id === item.id)) {
                    this.selectedItems = this.selectedItems.filter((x) => {
                        return x.id !== item.id;
                    });
                } else {
                    this.selectedItems.push({
                        ...item,
                        sectionId: section.id
                    });
                }
            } else {
                const itemsRef = doc(getFirestore(), 'items', item.id);

                if (item.checked) {
                    updateDoc(itemsRef, {
                        checked: true
                    }).catch(this.onFirebaseError);
                } else {
                    updateDoc(itemsRef, {
                        checked: deleteField()
                    }).catch(this.onFirebaseError);
                }
            }
        },
        getSections(): void {
            this.loading = true;

            const sectionsRef = collection(getFirestore(), 'sections');
            onSnapshot(query(sectionsRef, orderBy('value')), (collection) => {
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

            const itemsRef = collection(getFirestore(), 'items');

            onSnapshot(query(itemsRef, orderBy('value')), (collection) => {
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
            return this.editMode || this.showChecked || !!this.searchQuery;
        },
        getItemsBySectionId(sectionId: string, filterCheckedItems: boolean): Item[] {
            const items = this.filteredItems.length ? this.filteredItems : this.items;

            return items.filter(item => {
                if (filterCheckedItems) {
                    return item.sectionId === sectionId && !item.checked;
                }
                return item.sectionId === sectionId;
            });
        },
        addItem() {
            this.$router.push({ name: 'addItem' });
        },
        editItem(item: Item, section: Section) {
            this.$router.push({ name: 'editItem', params: { sectionId: section.id, itemId: item.id } });
        },
        deleteItems() {
            this.selectedItems.forEach((item) => {
                deleteDoc(doc(getFirestore(), 'items', item.id)).catch(this.onFirebaseError);
            });
        }
    },
    computed: {
        ...mapState(useSettingsState, ['searchBarActive', 'editMode', 'showChecked']),
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
.list-wrapper {
    display: flex;
    flex-flow: row wrap;
    max-width: 100vw;
    overflow: hidden;

    >div {
        flex: 1 1 500px;
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

.v-btn--fixed {
    margin: 1em;
}
</style>
