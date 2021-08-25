const GitHub = require('github-api');

export function addItem({ commit }, item) {
    commit('addItem', item);
}

export function filterItem({ commit }, md5) {
    commit('filterItem', md5);
}

export function removeItem({ commit }, index) {
    commit('removeItem', index);
}

export function setItemUploaded({ commit }, index) {
    commit('setItemUploaded', index);
}

export function setGithub({ commit, state }, accessToken) {
    if (state.github == null) {
        commit('setGithub', accessToken);
    }
    if (state.githubUser == null) {
        commit('setGithubUser');
    }
    if (state.githubUserName == null || state.githubAvaterUrl == null) {
        state.githubUser
            .getProfile()
            .then(({ data }) => {
                commit('setGithubUserDetail', {
                    username: data.login,
                    avatarUrl: data.avatar_url,
                });
                if (state.githubRepo == null || !state.githubRepoExist) {
                    commit('setGithubRepo');
                    state.githubRepo
                        .getDetails()
                        .then(() => {
                            commit('setGithubRepoExist', true);
                        })
                        .catch(() => {
                            console.log('Repo is not inited, create one');
                            state.githubUser
                                .createRepo({
                                    name: 'ClipBroadHistory',
                                    private: true,
                                    has_projects: false,
                                    has_wiki: false,
                                    auto_init: true,
                                })
                                .then(() => {
                                    commit('setGithubRepoExist', true);
                                    commit('setGithubRepo');
                                })
                                .catch((error) => {
                                    console.log(error);
                                });
                        });
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }
    // if (state.githubRepo == null || !state.githubRepoExist) {
    //     commit('setGithubRepo');
    //     state.githubRepo
    //         .getDetails()
    //         .then(() => {
    //             commit('setGithubRepoExist', true);
    //         })
    //         .catch(() => {
    //             console.log('Repo is not inited, create one');
    //             state.githubUser
    //                 .createRepo({
    //                     name: 'ClipBroadHistory',
    //                     private: true,
    //                     has_projects: false,
    //                     has_wiki: false,
    //                     auto_init: true,
    //                 })
    //                 .then(() => {
    //                     commit('setGithubRepoExist', true);
    //                     commit('setGithubRepo');
    //                 })
    //                 .catch((error) => {
    //                     console.log(error);
    //                 });
    //         });
    // }
}

export function updateCurrentTree({ commit }, sha) {
    commit('updateCurrentTree', sha);
}