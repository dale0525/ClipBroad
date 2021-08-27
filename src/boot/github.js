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
    if (githubInstance.github == null) {
        githubInstance.github = new GitHub({
            token: _token,
        });
        getRateLimit();
    }
    setGithubUser();
};
const setGithubUser = () => {
    if (githubInstance.github != null) {
        if (githubInstance.githubUser == null) {
            githubInstance.githubUser = githubInstance.github.getUser();
            githubInstance.githubUser
                .getProfile()
                .then(({ data }) => {
                    githubInstance.githubUserName = data.login;
                    githubInstance.githubAvatarUrl = data.avatar_url;
                    setGithubRepo();
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    } else {
        setGithub();
    }
};
const setGithubRepo = () => {
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
                })
                .catch(() => {
                    console.log('Repo is not inited, create one');
                    createGithubRepo();
                });
        }
    } else {
        setGithubUser();
    }
};
const createGithubRepo = () => {
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
            .catch((error) => {
                console.log(error);
            });
    } else {
        setGithubUser();
    }
};

const getRateLimit = () => {
    if (githubInstance.github == null) {
        return;
    }
    githubInstance.github
        .getRateLimit()
        .getRateLimit()
        .then(({ data }) => {
            const currentTime = new Date().getTime();
            const resetSecond = parseInt(data.rate.reset - currentTime / 1000);
            githubInstance.rateLimit =
                'Rate Limit: ' +
                data.rate.remaining +
                ' / ' +
                data.rate.limit +
                ' Reset in ' +
                resetSecond +
                ' seconds';
        });
};

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ app }) => {
    app.config.globalProperties.$githubInstance = githubInstance;
    app.config.globalProperties.$setGithub = setGithub;
    app.config.globalProperties.$getRateLimit = getRateLimit;
});
