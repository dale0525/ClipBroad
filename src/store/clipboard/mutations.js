export function addItem (state, item) {
    state.items.unshift(item);
}

export function filterItem (state, md5) {
    state.items = state.items.filter(
        (item) => item.md5 != md5
    );
}

export function removeItem (state, index) {
    state.items.splice(index, 1);
}