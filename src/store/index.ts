import { createStore } from 'vuex';

export interface ShoppingState {
    settings: {
        searchBarActive: boolean;
        editMode: boolean;
        completed: boolean;
    }
}

export default createStore<ShoppingState>({
  state: {
      settings: {
            searchBarActive: false,
            editMode: false,
            completed: false
      }
  },
  getters: {
        searchBarActive(state) {
            return state.settings.searchBarActive;
        },
        editMode(state) {
            return state.settings.editMode;
        },
        completedItems(state) {
            return state.settings.completed;
        }
  },
  mutations: {
      initialiseStore(state) {

          // Check if the ID exists
          if (localStorage.getItem('store')) {

              // Replace the state object with the stored item
              this.replaceState(
                  Object.assign(state, JSON.parse(localStorage.getItem('store') || '')), 'store'
              );
          }
      },
      toggleSearchBar(state) {
          state.settings.searchBarActive = !state.settings.searchBarActive;
      },
      toggleEditMode(state) {
          state.settings.editMode = !state.settings.editMode;
      },
      toggleCompletedItems(state) {
          state.settings.completed = !state.settings.completed;
      }
  }
});
