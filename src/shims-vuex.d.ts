// vuex.d.ts
import { Store } from 'vuex'
import { ShoppingState } from './store'

declare module '@vue/runtime-core' {
    // provide typings for `this.$store`
    interface ComponentCustomProperties {
        $store: Store<ShoppingState>;
    }
}
