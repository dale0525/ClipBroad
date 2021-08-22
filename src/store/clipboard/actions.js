export function addItem({ commit }, item) {
    commit('addItem', item);
}

export function filterItem({ commit }, md5) {
    commit('filterItem', md5);
}

export function removeItem({ commit }, index) {
    commit('removeItem', index);
}
