export function addItem({ commit }, item) {
    commit('addItem', item);
}

export function addRelatedItem({ commit }, payload) {
    commit('addRelatedItem', payload);
}

export function removeItem({ commit }, index) {
    commit('removeItem', index);
}

export function setItemUploaded({ commit }, index) {
    commit('setItemUploaded', index);
}