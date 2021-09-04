export function lastLocalItem(state) {
    for (let i = 0; i < state.items.length; i++) {
        if (state.items[i].source == 'local') {
            return state.items[i];
        }
    }
    return null;
}
