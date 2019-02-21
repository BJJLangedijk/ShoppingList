<script lang="ts">
import Vue from 'vue';
import firebase, { FirebaseError } from 'firebase/app';
import 'firebase/firestore';

interface Section {
    id: string;
    value: string;
}

export default Vue.extend({
    data: () => ({
        showDialog: true,
        sections: [] as Section[]
    }),
    computed: {
        shouldBeFullScreen(): boolean {
            return window.innerWidth < 600;
        },
    },
    methods: {
        confirm(): void {
        },
        getSections(): void {
            firebase.firestore().collection('sections').orderBy('value').get().then((collection) => {
                this.sections = [];
                collection.forEach((doc) => {
                    this.sections.push({
                        id: doc.id,
                        value: doc.data().value,
                    });
                });
            }).catch((err: FirebaseError) => {
                console.log(err);
            });
        },
        closeDialog(): void {
            this.$router.back();
        }
    },
    beforeMount() {
        this.getSections();
    }
});
</script>

<style scoped>
</style>