export function addItem({ commit }, item) {
    commit('addItem', item);
}

export function updateRemoteParam({ commit }, payload) {
    commit('updateRemoteParam', payload);
}

export function removeItem({ commit }, index) {
    commit('removeItem', index);
}

export function setItemUploaded({ commit }, index) {
    commit('setItemUploaded', index);
}

export function toggleActionBtn({ commit }, toggled) {
    commit('toggleActionBtn', toggled);
}