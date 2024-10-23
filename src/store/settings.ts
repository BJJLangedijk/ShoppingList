import { defineStore } from 'pinia';

export interface SettingsState {
    searchBarActive: boolean;
    editMode: boolean;
    showChecked: boolean;
}

export const useSettingsState = defineStore('settings', {
    state: (): SettingsState => ({
        searchBarActive: false,
        editMode: false,
        showChecked: false
    }),
    actions: {
        toggleSearchBar() {
            this.searchBarActive = !this.searchBarActive;
        },
        toggleEditMode() {
            this.editMode = !this.editMode;
        },
        toggleShowChecked() {
            this.showChecked = !this.showChecked;
        }
    }
});
