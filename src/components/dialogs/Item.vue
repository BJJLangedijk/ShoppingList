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
                        <v-autocomplete required clearable
                            label="Section *"
                            v-model="section.id"
                            :rules="notEmptyRule"
                            :items="sections"
                            item-text="value"
                            item-value="id">
                        </v-autocomplete>

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
    import 'firebase/firestore';
    import DocumentReference = firebase.firestore.DocumentReference;

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

    export default Dialog.extend({
        data: () => ({
            validForm: false,
            notEmptyRule: [
                (v: string) => !!v || 'Please fill in a value'
            ],
            showDialog: true,
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

                this.item.sectionId = this.section.id;

                // We can't provide undefined values, so if it's empty remove it.
                Object.keys(this.item).forEach(key => this.item[key] === undefined && delete this.item[key])

                this.getItemDoc(this.item.id).set(this.item).then(() => {
                    this.closeDialog();
                });
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
                }).catch((err: FirebaseError) => {
                    console.log(err);
                });
            }
        },
        beforeMount() {
            if (Object.keys(this.$route.params).length) {
                this.section.id = this.$route.params.sectionId;
                this.item.id = this.$route.params.itemId;
                this.getItemData();
            }
            this.getSections();
        }
    })
</script>