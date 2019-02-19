<template>
    <v-layout row justify-center>
        <v-dialog v-model="showDialog" :fullscreen="shouldBeFullScreen" persistent max-width="300px">
            <v-card>
                <v-card-title class="headline" v-if="$route.params.sectionId || $route.params.itemId">
                    Edit Item
                </v-card-title>
                <v-card-title class="headline" v-else>
                    Add an Item
                </v-card-title>

                <v-card-text>
                    <v-form v-model="validForm">
                        <v-autocomplete required clearable autofocus
                            label="Section"
                            v-model="section.id"
                            :rules="notEmptyRule"
                            :items="sections"
                            item-text="value"
                            item-value="id">
                        </v-autocomplete>

                        <v-text-field required
                            label="Item"
                            v-model="item.value"
                            :rules="notEmptyRule"
                            placeholder="Enter the item you want to add">
                        </v-text-field>

                        <v-text-field required
                            label="Amount"
                            v-model="item.amount"
                            :rules="notEmptyRule"
                            placeholder="Enter an amount">
                        </v-text-field>
                    </v-form>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn flat @click="closeDialog()">Close</v-btn>
                    <v-btn flat @click="confirm()">Save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-layout>
</template>

<script lang="ts">
    import Dialog from './Dialog.vue';
    import firebase, { FirebaseError } from 'firebase/app';
    import 'firebase/database';
    import Reference = firebase.database.Reference;

    type Item = {
        amount: number
        id: string,
        value: string
    }

    type Section = {
        id: string,
        items: Array<Item>,
        value: string
    }

    export default Dialog.extend({
        data: () => ({
            validForm: false,
            notEmptyRule: [
                (v: string) => !!v || 'Please fill in a value'
            ],
            showDialog: true,
            initialSectionId: <string> '',
            section: <Section> {},
            item: <Item> {}
        }),
        methods: {
            confirm(): void {
                if (!this.validForm) {
                    return;
                }
                // Capitalize values
                this.item.value = this.item.value.charAt(0).toUpperCase() + this.item.value.substring(1);
                // this.section.value = this.section.value.charAt(0).toUpperCase() + this.section.value.substring(1);

                // section = this.checkForExistingRef(this.sections, 'value', this.section.value);


                this.getRef(this.section.id, this.item.id).set(this.item).then(() => {
                    if (this.initialSectionId) {
                        this.getRef(this.initialSectionId, this.item.id).remove().then(
                            this.closeDialog
                        );
                    } else {
                        this.closeDialog();
                    }
                });
            },
            getRef(sectionId: string, itemId: string): Reference {
                return firebase.database().ref(`sections/${sectionId}/items/${itemId}`);
            },
            getItemData(): void {
                this.getRef(this.section.id, this.item.id).once('value', (itemData: any) => {
                    this.item = itemData.val();
                }, (err: FirebaseError) => {
                    console.log(err);
                });
            }
        },
        beforeMount() {
            if (Object.keys(this.$route.params).length) {
                this.section.id = this.initialSectionId = this.$route.params.sectionId;
                this.item.id = this.$route.params.itemId;
                this.getItemData();
            }
            this.getItems();
        }
    })
</script>