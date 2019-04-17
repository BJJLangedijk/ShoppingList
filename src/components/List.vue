<template>
    <v-progress-circular v-if="loading" color="accent" indeterminate></v-progress-circular>
    <v-list v-else v-bind:class="{ 'editMode': settings.editMode }">
        <template v-for="section in sections">
            <div :key="section.id" v-if="section.items">
                <v-divider></v-divider>
                <v-subheader>{{section.value}}</v-subheader>

                <template v-for="item in section.items">
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
</template>

<script lang='ts'>
    import Vue from 'vue';
    import _ from 'lodash';
    import firebase, { FirebaseError } from 'firebase/app';
    import 'firebase/database';

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
        items: Item[];
        value: string;
    }

    export default Vue.extend({
        data: () => ({
            settings: {
                editMode: false,
                completed: false
            },
            loading: true,
            sections: [] as Section[],
            selectedItems: [] as any
        }),
        methods: {
            onFirebaseError(err: FirebaseError): void {
                if (err.code === 'PERMISSION_DENIED') {
                    this.$router.replace({name: 'Auth'});
                } else {
                    console.log(err);
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
                    firebase.database().ref('sections/' + section.id + '/items/' + item.id).set(item).catch(this.onFirebaseError);
                }
            },
            getItems(): void {
                if (navigator.onLine) {
                    this.loading = true;
                    firebase.database().ref('sections').on('value', (sectionData: any) => {
                        this.sections = sectionData.val() || [];
                        this.selectedItems = [];

                        for (const section in this.sections) {
                            if (this.sections.hasOwnProperty(section)) {
                                const sectionData = this.sections[section];

                                sectionData.items = _.orderBy(sectionData.items, 'value', 'asc');

                                for (const item in sectionData.items) {
                                    if (sectionData.items.hasOwnProperty(item)) {
                                        const itemData: Item = Object.assign({}, sectionData.items[item]);

                                        if (itemData.checked) {
                                            itemData.sectionId = sectionData.id;
                                            // this.selectedItems.push(itemData);
                                        }
                                    }
                                }
                            }
                        }
                        localStorage.setItem('sections', JSON.stringify(this.sections));
                        this.loading = false;
                    }, this.onFirebaseError);
                } else if (localStorage.getItem('sections')) {
                    this.sections = JSON.parse(localStorage.getItem('sections') || '');
                    this.loading = false;
                }
            },
            editItem(item: Item, section: Section) {
                this.$router.push({ name: 'editItem', params: { sectionId: section.id, itemId: item.id }});
            },
            deleteItems() {
                for (const key in this.selectedItems) {
                    if (this.selectedItems.hasOwnProperty(key)) {
                        const item = this.selectedItems[key];

                        firebase.database().ref('sections/' + item.sectionId + '/items/' + item.id).remove().catch(this.onFirebaseError);
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
            editMode(state) {
                this.settings.editMode = state;
            },
            completedItems(state) {
                this.settings.completed = state;
            }
        },
        beforeMount() {
            this.settings = {
                editMode: this.$store.state.settings.editMode,
                completed: this.$store.state.settings.completed
            };
            this.getItems();
        }
    });
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang='scss'>
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
