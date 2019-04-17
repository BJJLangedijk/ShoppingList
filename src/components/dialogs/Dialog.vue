<script lang="ts">
import Vue from 'vue';
import firebase, { FirebaseError } from 'firebase/app';
import 'firebase/database';
import Reference = firebase.database.Reference;

interface Item {
    amount: number;
    id: string;
    value: string;
}

interface Section {
    id: string;
    items: Item[];
    value: string;
}

export default Vue.extend({
    data: () => ({
        showDialog: true,
        item: {} as Item,
        sections: [] as Section[],
        section: {} as Section
    }),
    computed: {
        shouldBeFullScreen(): boolean {
            return window.innerWidth < 600;
        },
    },
    methods: {
        confirm(): void {
        },
        checkForExistingRef(list: object[], key: string, value: string): any {
            for (const item in list) {
                if (list.hasOwnProperty(item)) {
                    const section: any = list[item];

                    if (section[key].toLowerCase() === value.toLowerCase()) {
                        return section;
                    }
                }
            }

            return false;
        },
        createNewRef(key: string) {
            return firebase.database().ref(key).push();
        },
        getOrCreateNewRef(query: string, key: string): Promise<Object> {
            return new Promise((onFulfilled, onRejected) => {
                firebase.database().ref(query).once('value', (result: any) => {
                    let ref;

                    if (result.val() && result.val()[key]) {
                        ref = firebase.database().ref(query + '/' + key);
                        onFulfilled({
                            ref
                        });
                    } else {
                        ref = firebase.database().ref(query).push();
                        onFulfilled({
                            ref,
                            created: true
                        });
                    }
                });
            });
        },
        getItems(): void {
            firebase.database().ref('sections').on('value', (sections: any) => {
                this.sections = Object.values(sections.val());
            }, (err: FirebaseError) => {
                console.log(err);
            });
        },
        closeDialog(): void {
            this.$router.back();
        }
    },
    beforeMount() {
        this.getItems();
    }
});
</script>

<style scoped>
</style>