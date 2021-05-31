import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
      settings: {
            searchBarActive: false,
            editMode: false,
            completed: false
      }
  },
  getters: {
        getSearchActive(state) {
            return state.settings.searchBarActive;
        },
        getEditMode(state) {
            return state.settings.editMode;
        },
        getCompletedItems(state) {
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
