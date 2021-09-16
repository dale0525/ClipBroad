export function addItem(state, item) {
    state.items.unshift(item);
    state.items.sort(function (a, b) {
        var x = a.time;
        var y = b.time;
        if (x < y) return 1;
        if (x > y) return -1;
        return 0;
    });
    if (state.items.length > 100) {
        state.items.splice(99, state.items.length - 100);
    }
}

export function updateRemoteParam(state, payload) {
    if (!state.items[payload.index].isBuffer) {
        state.items[payload.index].value = payload.value;
    }
    if (payload.remotePath != null) {
        state.items[payload.index].remotePath = payload.remotePath;
    }
    if (payload.remoteSha != null) {
        state.items[payload.index].remoteSha = payload.remoteSha;
    }
}

export function removeItem(state, index) {
    state.items.splice(index, 1);
}

export function setItemUploaded(state, index) {
    state.items[index].uploaded = true;
}

export function resetItems(state) {
    state.items = [];
}