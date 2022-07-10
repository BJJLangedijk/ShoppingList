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
                        <v-combobox required clearable
                            label="Section *"
                            v-model="section"
                            :rules="notEmptyRule"
                            :items="sections"
                            item-text="value"
                            item-value="section.id">
                        </v-combobox>

                        <v-text-field required
                            label="Item *"
                            v-model="item.value"
                            :rules="notEmptyRule"
                            placeholder="Enter the item you want to add">
                        </v-text-field>

                        <v-text-field
                            label="Amount"
                            v-model="item.amount"
                            placeholder="Enter an amount">
                        </v-text-field>
                    </v-form>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="closeDialog()">Close</v-btn>
                    <v-btn text @click="confirm()">Save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-layout>
</template>

<script lang="ts">
    import Dialog from './Dialog.vue';
    import firebase from 'firebase/app';
    import 'firebase/firestore';
    import DocumentReference = firebase.firestore.DocumentReference;
    import { defineComponent } from '@vue/runtime-core';

    type Item = {
        sectionId: string,
        amount?: string
        id: string,
        value: string
    }

    type Section = {
        id: string,
        value: string
    }

    export default defineComponent({
        extends: Dialog,
        data: () => ({
            validForm: false,
            notEmptyRule: [
                (v: string) => !!v || 'Please fill in a value'
            ],
            showDialog: true,
            section: <Section|undefined> undefined,
            item: <Item> {}
        }),
        methods: {
            confirm(): void {
                if (!this.validForm) {
                    return;
                }

                // Capitalize values
                this.item.value = this.item.value.charAt(0).toUpperCase() + this.item.value.substring(1);

                this.getSectionId().then((sectionId) => {
                    this.item.sectionId = sectionId;

                    // We can't provide undefined values, so if it's empty remove it.
                    Object.keys(this.item).forEach(key => this.item[key] === undefined && delete this.item[key])

                    this.getItemDoc(this.item.id).set(this.item).then(() => {
                        this.closeDialog();
                    });
                });
            },
            getSectionId(): Promise<string> {
                if (!this.section) {
                    return Promise.reject();
                } else {
                    if (this.section && this.section.id) {
                        return Promise.resolve(this.section.id);
                    } else {
                        var sectionRef = firebase.firestore().collection('sections');

                        return sectionRef.add({
                            value: this.section
                        }).then(function (sectionRef) {
                            return Promise.resolve(sectionRef.id);
                        });
                    }
                }
            },

            getItemDoc(itemId?: string): DocumentReference {
                if (itemId) {
                    return firebase.firestore().collection('items').doc(itemId);
                } else {
                    return firebase.firestore().collection('items').doc();
                }
            },
            getItemData(): void {
                this.getItemDoc(this.item.id).get().then((doc) => {
                    var data = doc.data();

                    if (data) {
                        this.item = {
                            sectionId: data && data.sectionId,
                            amount: data && data.amount,
                            id: doc.id,
                            value: data && data.value,
                        };
                    }
                }).catch((err) => {
                    console.log(err);
                });
            }
        },
        beforeMount() {
            if (Object.keys(this.$route.params).length) {
                this.item.id = this.$route.params.itemId as string;
                this.getItemData();
            }

            this.getSections().then(() => {
                this.section = this.sections.find((section) => {
                    return section.id === this.$route.params.sectionId;
                });
            })
        }
    })
</script>
