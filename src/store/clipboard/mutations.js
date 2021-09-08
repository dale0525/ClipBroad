export function addItem(state, item) {
    if (state.items.length < 1){
        state.items.unshift(item);
        return;
    }
    for (let i = 0; i < state.items.length; i++)
    {
        if (state.items[i].md5 == item.md5)
        {
            item.relatedItems.push(state.items[i]);
            state.items.splice(i, 1);
        }
    }
    state.items.unshift(item);
    state.items.sort(function (a, b) {
        var x = a.time;
        var y = b.time;
        if (x < y) return 1;
        if (x > y) return -1;
        return 0;
    });
    while (state.items.length > 100) {
        state.items.pop();
    }
}

export function addRelatedItem(state, payload) {
    state.items[payload.index].relatedItems.push(payload.item);
}

export function removeItem(state, index) {
    state.items.splice(index, 1);
}

export function setItemUploaded(state, index) {
    state.items[index].uploaded = true;
}
