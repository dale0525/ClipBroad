export function lastNonShareItem(state) {
    for (let i = 0; i < state.items.length; i++) {
        if (!state.items[i].fromShare) {
            return state.items[i];
        }
    }
    return null;
}
