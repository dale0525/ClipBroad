import { boot } from 'quasar/wrappers';
const GitHub = require('github-api');
let githubInstance = {
    github: null,
    githubUser: null,
    githubUserName: null,
    githubAvatarUrl: null,
    githubRepo: null,
    githubRepoExist: false,
    rateLimit: null,
};
const REPO_NAME = 'ClipBroadHistory';

const setGithub = (_token) => {
    return new Promise((resolve, reject) => {
        if (githubInstance.github == null) {
            githubInstance.github = new GitHub({
                token: _token,
            });
        }
        setGithubUser()
            .then((data) => {
                resolve(data);
            })
            .catch((error) => {
                reject(error);
            });
    });
};
const setGithubUser = () => {
    return new Promise((resolve, reject) => {
        if (githubInstance.github != null) {
            if (githubInstance.githubUser == null) {
                githubInstance.githubUser = githubInstance.github.getUser();
            }
            if (githubInstance.githubUserName == null) {
                githubInstance.githubUser
                    .getProfile()
                    .then(({ data }) => {
                        githubInstance.githubUserName = data.login;
                        githubInstance.githubAvatarUrl = data.avatar_url;
                    })
                    .then(setGithubRepo)
                    .then((data) => {
                        resolve(data);
                    })
                    .catch((error) => {
                        reject(error);
                        console.log(error);
                    });
            } else {
                setGithubRepo().then((data) => {
                    resolve(data);
                });
            }
        } else {
            reject({
                status: 'error',
                data: 'Github not inited',
            });
        }
    });
};
const setGithubRepo = () => {
    return new Promise((resolve, reject) => {
        if (githubInstance.githubUserName != null) {
            if (
                githubInstance.githubRepo == null ||
                !githubInstance.githubRepoExist
            ) {
                githubInstance.githubRepo = githubInstance.github.getRepo(
                    githubInstance.githubUserName,
                    REPO_NAME
                );
                githubInstance.githubRepo
                    .getDetails()
                    .then(() => {
                        githubInstance.githubRepoExist = true;
                        resolve({
                            status: 'success',
                            data: {
                                username: githubInstance.githubUserName,
                                avatarUrl: githubInstance.githubAvatarUrl,
                            },
                        });
                    })
                    .catch(() => {
                        console.log('Repo is not inited, create one');
                        createGithubRepo()
                            .then((data) => {
                                resolve(data);
                            })
                            .catch((error) => {
                                console.log(error);
                                reject(error);
                            });
                    });
            } else {
                resolve({
                    status: 'success',
                    data: {
                        username: githubInstance.githubUserName,
                        avatarUrl: githubInstance.githubAvatarUrl,
                    },
                });
            }
        } else {
            reject({
                status: 'error',
                data: 'Github Username not inited',
            });
        }
    });
};
const createGithubRepo = () => {
    return new Promise((resolve, reject) => {
        if (githubInstance.githubUser != null) {
            githubInstance.githubUser
                .createRepo({
                    name: REPO_NAME,
                    private: true,
                    has_projects: false,
                    has_wiki: false,
                    auto_init: true,
                })
                .then(() => {
                    githubInstance.githubRepoExist = true;
                    setGithubRepo();
                })
                .then((data) => {
                    resolve(data);
                })
                .catch((error) => {
                    console.log(error);
                    reject(error);
                });
        } else {
            reject({
                status: 'error',
                data: 'Github User not inited',
            });
        }
    });
};

const getRateLimit = () => {
    return new Promise((resolve, reject) => {
        if (githubInstance.github == null) {
            reject({ status: 'error', message: 'Github not inited' });
        }
        githubInstance.github
            .getRateLimit()
            .getRateLimit()
            .then(({ data }) => {
                const currentTime = new Date().getTime();
                const resetSecond = parseInt(
                    data.rate.reset - currentTime / 1000
                );
                resolve({
                    status: 'success',
                    message: {
                        current: data.rate.remaining,
                        limit: data.rate.limit,
                        time: resetSecond,
                    },
                });
            })
            .catch((error) => {
                reject({
                    status: 'error',
                    message: error,
                });
            });
    });
};

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ app }) => {
    app.config.globalProperties.$githubInstance = githubInstance;
    app.config.globalProperties.$setGithub = setGithub;
    app.config.globalProperties.$getRateLimit = getRateLimit;
});
