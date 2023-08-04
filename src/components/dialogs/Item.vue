<template>
    <v-layout row justify-center>
        <v-dialog v-model="showDialog" :fullscreen="shouldBeFullScreen" persistent :max-width="shouldBeFullScreen ? '' : '300px'">
            <v-card>
                <v-card-title class="headline" v-if="$route.params.sectionId || $route.params.itemId">
                    Edit Item
                </v-card-title>
                <v-card-title class="headline" v-else>
                    Add an Item
                </v-card-title>

                <v-card-text>
                    <v-form v-model="validForm">
                        <v-combobox
                            required
                            clearable
                            label="Section *"
                            v-model="section"
                            :rules="notEmptyRule"
                            :items="sections"
                            item-title="value"
                            item-value="id">
                        </v-combobox>

                        <v-text-field
                            required
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
                    <v-btn @click="closeDialog()">Close</v-btn>
                    <v-btn @click="confirm()">Save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-layout>
</template>

<script lang="ts">
    import { getFirestore, addDoc, collection, updateDoc, doc, getDocFromCache } from 'firebase/firestore';
    import Dialog from './Dialog.vue';
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
            section: {} as Section | undefined,
            item: {} as Item
        }),
        methods: {
            async confirm(): Promise<void> {
                if (!this.validForm) {
                    return;
                }

                // Capitalize values
                this.item.value = this.item.value.charAt(0).toUpperCase() + this.item.value.substring(1);

                if (!this.section) {
                    return;
                }

                let sectionId = this.section.id;

                if (!sectionId) {
                    await addDoc(collection(getFirestore(), 'sections'), {
                        value: this.section.value,
                    }).then((docRef) => {
                        sectionId = docRef.id;
                    });
                }

                this.item.sectionId = sectionId;

                if (!this.item.id) {
                    await addDoc(collection(getFirestore(), 'items'), {
                        sectionId: sectionId,
                        amount: this.item.amount,
                        value: this.item.value,
                    });
                } else {
                    await updateDoc(doc(getFirestore(), 'items', this.item.id), {
                        sectionId: sectionId,
                        amount: this.item.amount,
                        value: this.item.value,
                    });
                }
                this.closeDialog();
            },

            getItem(id: string): Promise<void> {
                const itemRef = doc(getFirestore(), 'items', id);

                return getDocFromCache(itemRef).then((doc) => {
                    if (!doc.exists()) {
                        throw new Error('Item does not exist');
                    }

                    this.item = {
                        sectionId: doc.data().sectionId,
                        amount: doc.data().amount,
                        id: doc.id,
                        value: doc.data().value,
                    };
                }).catch((err) => {
                    console.log(err);
                });
            },
        },
        beforeMount() {
            if (Object.keys(this.$route.params).length) {
                this.item.id = this.$route.params.itemId as string;
                this.getItem(this.item.id);
            }

            this.getSections().then(() => {
                const matchingSection = this.sections.find((section) => {
                    return section.id === this.$route.params.sectionId;
                });

                this.section = matchingSection;
            })
        }
    })
</script>
