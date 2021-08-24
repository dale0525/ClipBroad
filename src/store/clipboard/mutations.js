const GitHub = require('github-api');

export function addItem(state, item) {
    state.items.unshift(item);
    state.items.sort(function (a, b) {
        var x = a.time;
        var y = b.time;
        return x < y ? 1 : x > y ? -1 : 0;
    });
    while (state.items.length > 100) {
        state.items.pop();
    }
}

export function filterItem(state, md5) {
    state.items = state.items.filter((item) => item.md5 != md5);
}

export function removeItem(state, index) {
    state.items.splice(index, 1);
}

export function setItemUploaded(state, index) {
    state.items[index].uploaded = true;
}

export function setGithub(state, accessToken) {
    state.github = new GitHub({
        token: accessToken,
    });
}

export function setGithubUser(state) {
    state.githubUser = state.github.getUser();
}

export function setGithubUserDetail(state, payload) {
    state.githubUserName = payload.username;
    state.githubAvaterUrl = payload.avatarUrl;
}

export function setGithubRepoExist(state, exist) {
    state.githubRepoExist = exist;
}

export function setGithubRepo(state) {
    state.githubRepo = state.github.getRepo(
        state.githubUserName,
        'ClipBroadHistory'
    );
}
