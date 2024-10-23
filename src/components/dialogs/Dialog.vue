<script lang="ts">
import { collection, getDocsFromCache, getFirestore, orderBy, query } from 'firebase/firestore';
import { defineComponent } from 'vue';

interface Section {
    id: string;
    value: string;
}

export default defineComponent({
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
        getSections(): Promise<void> {
            const sectionsRef = collection(getFirestore(), 'sections');

            return getDocsFromCache(query(sectionsRef, orderBy('value'))).then((collection) => {
                this.sections = [];
                collection.forEach((doc) => {
                    this.sections.push({
                        id: doc.id,
                        value: doc.data().value,
                    });
                });
            }).catch((err) => {
                console.log(err);
            });
        },
        closeDialog(): void {
            this.$router.back();
        }
    }
});
</script>
