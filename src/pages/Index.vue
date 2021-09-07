<template>
    <q-pull-to-refresh @refresh="syncNow" color="black" icon="autorenew">
        <q-page class="q-pa-md">
            <q-list bordered separator>
                <transition-group
                    appear
                    enter-active-class="animated slideInLeft"
                    leave-active-class="animated fadeOutLeft"
                >
                    <q-item
                        v-for="(item, index) in items"
                        :key="index"
                        clickable
                        v-ripple
                        @dblclick="copyItem(index)"
                    >
                        <q-item-section avatar>
                            <q-icon
                                color="primary"
                                :name="itemIcon(item.type)"
                            />
                        </q-item-section>
                        <q-item-section v-if="item.type == 'text'">
                            <q-item-label lines="3">{{
                                item.value
                            }}</q-item-label>
                        </q-item-section>
                        <q-item-section v-if="item.type == 'png'"
                            ><img
                                :src="'data:image/png;base64,' + item.value"
                                style="
                                    max-height: 300px;
                                    object-fit: contain;
                                    max-width: 100%;
                                "
                        /></q-item-section>
                        <q-item-section side>
                            <q-item-label caption>{{
                                prevTime(item.time)
                            }}</q-item-label>
                        </q-item-section>
                    </q-item>
                </transition-group>
            </q-list>
        </q-page>
    </q-pull-to-refresh>
</template>

<script>
    import { defineComponent } from 'vue';
    import { mapState, mapActions, mapGetters } from 'vuex';
    const SparkMD5 = require('spark-md5');
    // import { Clipboard } from '@capacitor/clipboard';
    const maxItemLength = 500;
    var timers = [];
    var existEventListen = false;
    var openWithInited = false;
    var toDeleteRemote = 0;

    export default defineComponent({
        computed: {
            ...mapState('clipboard', ['items']),
            ...mapGetters('clipboard', ['lastLocalItem']),
        },
        methods: {
            ...mapActions('clipboard', [
                'addItem',
                'filterItem',
                'removeItem',
                'setItemUploaded',
            ]),
            checkClipboard() {
                if (this.$q.platform.is.electron) {
                    const image = window.myAPI.readClipboardImage();
                    if (image == null) {
                        const text = window.myAPI.readClipboardText();
                        this.addItemInternal(text, 'text');
                    } else {
                        this.addItemInternal(image, 'png');
                    }
                } else if (this.$q.platform.is.capacitor) {
                    Clipboard.read().then((data) => {
                        if (data.type == 'text/plain') {
                            this.addItemInternal(data.value, 'text');
                        }
                    });
                } else if (this.$q.platform.is.cordova) {
                    cordova.plugins.clipboard.paste((text) => {
                        this.addItemInternal(text, 'text');
                    });
                }
            },
            prevTime(timeStamp) {
                const currentTime = new Date().getTime();
                const seconds = parseInt((currentTime - timeStamp) / 1000);
                // return date.formatDate(timeStamp, 'YYYY-MM-DDTHH:mm:ss.SSSZ');
                if (seconds <= 0) {
                    return 'Right Now';
                } else if (seconds < 60) {
                    return seconds.toString() + 's ago';
                } else if (seconds < 3600) {
                    const minutes = parseInt(seconds / 60);
                    return minutes.toString() + 'm ago';
                } else if (seconds < 3600 * 24) {
                    const hours = parseInt(seconds / 3600);
                    return hours.toString() + 'h ago';
                } else {
                    const days = parseInt(seconds / 3600 / 24);
                    return days.toString() + 'd ago';
                }
            },
            itemIcon(type) {
                switch (type) {
                    case 'text':
                        return 'text_fields';
                    case 'png':
                        return 'image';
                    default:
                        return 'text_fields';
                }
            },
            copyItem(index) {
                const item = this.items[index];
                switch (item.type) {
                    case 'text':
                        this.removeItem(index);
                        item.time = new Date().getTime();
                        item.uploaded = false;
                        this.addItem(item);
                        if (this.$q.platform.is.electron) {
                            window.myAPI.writeClipboardText(item.value);
                            if (
                                this.$q.localStorage.getItem(
                                    'clipbroad-show-copied-notification'
                                ) === true
                            )
                                window.myAPI.showNotification(
                                    this.$t('copied'),
                                    item.value
                                );
                            window.myAPI.hideWindow();
                        } else if (this.$q.platform.is.cordova) {
                            cordova.plugins.clipboard.copy(item.value);
                            this.$q.notify(this.$t('copied'));
                        }
                        break;
                    case 'png':
                        if (this.$q.platform.is.electron) {
                            window.myAPI.writeClipboardImage(item.value);
                            if (
                                this.$q.localStorage.getItem(
                                    'clipbroad-show-copied-notification'
                                ) === true
                            )
                                window.myAPI.showNotification(this.$t('copied'));
                            window.myAPI.hideWindow();
                        } else if (this.$q.platform.is.cordova) {
                            // this.$q.notify('Not supported!');
                            window.plugins.socialsharing.shareWithOptions(
                                {
                                    files: [
                                        'data:image/png;base64,' + item.value,
                                    ],
                                },
                                null,
                                (msg) => {
                                    this.$q.notify(msg);
                                }
                            );
                        }
                        break;
                    default:
                        break;
                }
            },
            setDarkMode() {
                if (this.$q.platform.is.electron) {
                    const darkMode = window.myAPI.isDarkMode();
                    this.$q.dark.set(darkMode);
                }
            },
            isCellular() {
                if (this.$q.platform.is.electron) return false;
                var networkState = navigator.connection.type;
                console.log(networkState);
                if (
                    [
                        Connection.CELL_2G,
                        Connection.CELL_3G,
                        Connection.CELL_4G,
                        Connection.CELL,
                    ].includes(networkState)
                )
                    return true;
                return false;
            },
            isConnected() {
                var networkState = navigator.connection.type;
                return networkState == Connection.NONE ? false : true;
            },
            shouldSync() {
                if (!this.$githubInstance.githubRepoExist) {
                    console.log('github repo does not exist');
                    return false;
                }
                if (!this.isConnected()) {
                    this.$q.notify(this.$t('noNetwork'));
                    return false;
                }
                if (
                    this.$q.localStorage.getItem(
                        'clipbroad-use-mobile-data'
                    ) !== true &&
                    this.isCellular()
                ) {
                    this.$q.notify(
                        this.$t('syncUntilWifi')
                    );
                    return false;
                }
                return true;
            },
            updateFromGithub() {
                if (!this.shouldSync) return;
                this.$q.notify(this.$t('updating'));
                this.$githubInstance.githubRepo
                    .getContents('main', '', true)
                    .then(({ data }) => {
                        toDeleteRemote = Math.max(
                            data.length - maxItemLength,
                            0
                        );
                        const settingsMax = this.$q.localStorage.has(
                            'clipbroad-max-item'
                        )
                            ? this.$q.localStorage.getItem('clipbroad-max-item')
                            : 20;
                        var fetchedItems = 0;
                        for (
                            let i = data.length - 1;
                            i >= Math.max(0, data.length - maxItemLength);
                            i--
                        ) {
                            ((i) => {
                                if (fetchedItems >= settingsMax) return;
                                let fullName = data[i].name;
                                fullName = fullName.split('.');
                                let nameSplit = fullName[0].split('-');
                                if (nameSplit.length < 2) return;
                                let fileType =
                                    fullName.length < 2 ? 'text' : fullName[1]; //name extension as file type
                                let newTime = parseInt(nameSplit[0]);
                                let newMD5 = nameSplit[1];
                                let oldValue = this.items.find(
                                    (item) => item.md5 == nameSplit[1]
                                );
                                if (oldValue != null && oldValue.time > newTime)
                                    return;
                                fetchedItems++;
                                let sha = data[i].sha;
                                let raw = fileType == 'text' ? true : false;
                                this.$githubInstance.githubRepo
                                    .getBlob(sha, raw)
                                    .then(({ data }) => {
                                        let dataValue =
                                            fileType == 'text'
                                                ? data
                                                : data.content;
                                        this.filterItem(newMD5);
                                        this.addItem({
                                            time: newTime,
                                            md5: newMD5,
                                            uploaded: true,
                                            value: dataValue,
                                            type: fileType,
                                            source: 'remote',
                                        });
                                    });
                            })(i);
                        }
                        if (toDeleteRemote <= 0) return;
                        let treeItems = [];
                        for (let j = 0; j < toDeleteRemote; j++) {
                            treeItems.push({
                                path: data[j].path,
                                sha: null,
                                mode: '100644',
                                type: 'blob',
                            });
                        }
                        this.uploadTree(treeItems)
                            .then(() => {
                                toDeleteRemote = 0;
                                console.log('delete complete');
                            })
                            .catch((error) => {
                                console.log(error);
                            });
                    });
            },
            uploadToGithub() {
                return new Promise((resolve, reject) => {
                    if (!this.shouldSync) {
                        resolve();
                        return;
                    }
                    console.log('uploading to github');
                    let treeItems = [];
                    let toUpload = [];
                    // console.log(this.items);
                    for (let j = 0; j < this.items.length; j++) {
                        if (
                            !this.items[j].uploaded &&
                            this.items[j].value != ''
                        ) {
                            toUpload.push(this.items[j]);
                            this.setItemUploaded(j);
                        }
                    }
                    // console.log(toUpload);
                    if (toUpload.length <= 0) {
                        console.log('no item to upload');
                        resolve();
                        return;
                    }
                    // const tempPath = path.join(remote.app.getPath("temp"), "clipbroad");
                    // if (!fs.existsSync(tempPath)) {
                    //     fs.mkdirSync(tempPath);
                    // }
                    for (var i = 0; i < toUpload.length; i++) {
                        ((i) => {
                            let fileName =
                                toUpload[i].time.toString() +
                                '-' +
                                toUpload[i].md5;
                            let content = toUpload[i].value;
                            switch (toUpload[i].type) {
                                case 'png':
                                    fileName += '.png';
                                    content = Buffer.from(content, 'base64');
                                    break;
                                default:
                                    fileName += '-text';
                                    break;
                            }
                            // filePath = path.join(
                            //     tempPath,
                            //     fileName,
                            // );
                            // fs.writeFileSync(filePath, toUpload[i].value);
                            // console.log("file saved");
                            this.$githubInstance.githubRepo
                                .createBlob(content)
                                .then(({ data }) => {
                                    treeItems.push({
                                        sha: data.sha,
                                        path: fileName,
                                        mode: '100644',
                                        type: 'blob',
                                    });
                                    if (treeItems.length == toUpload.length) {
                                        this.uploadTree(treeItems)
                                            .then(() => {
                                                this.$q.notify(
                                                    this.$t('uploaded')
                                                );
                                                resolve();
                                            })
                                            .catch((error) => {
                                                this.$q.notify(error);
                                                reject(error);
                                            });
                                    }
                                })
                                .catch((error) => {
                                    this.$q.notify(error);
                                    reject(error);
                                });
                        })(i);
                    }
                });
            },
            uploadTree(treeItems) {
                return new Promise((resolve, reject) => {
                    let ghsha;
                    this.getSha()
                        .then((data) => {
                            ghsha = data;
                        })
                        .then(() =>
                            this.$githubInstance.githubRepo.createTree(
                                treeItems,
                                ghsha.commit
                            )
                        )
                        .then(({ data }) => {
                            return this.$githubInstance.githubRepo.commit(
                                ghsha.parent,
                                data.sha,
                                'update'
                            );
                        })
                        .then(({ data }) => {
                            this.$githubInstance.githubRepo.updateHead(
                                'heads/main',
                                data.sha,
                                true
                            );
                        })
                        .then(() => {
                            resolve();
                        })
                        .catch((error) => {
                            reject(error);
                        });
                });
            },
            getSha() {
                return new Promise((resolve, reject) => {
                    let refSha;
                    let commitSha;

                    this.$githubInstance.githubRepo
                        .getRef('heads/main')
                        .then(({ data }) => {
                            refSha = data.object.sha;
                        })
                        .then(() =>
                            this.$githubInstance.githubRepo.getCommit(refSha)
                        )
                        .then(({ data }) => {
                            commitSha = data.tree.sha;
                            return resolve({
                                parent: refSha,
                                commit: commitSha,
                            });
                        })
                        .catch((error) => {
                            return reject(error);
                        });
                });
            },
            resetTimer() {
                timers.forEach((item, index) => {
                    clearInterval(item);
                });
                timers = [];
                const checkClipboardInterval = setInterval(
                    this.checkClipboard,
                    500
                );
                const uploadToGithubInterval = setInterval(
                    this.uploadToGithub,
                    30000
                );
                timers.push(checkClipboardInterval);
                timers.push(uploadToGithubInterval);
            },
            syncNow(done) {
                if (!this.$githubInstance.githubRepoExist) {
                    this.$router.push('/settings');
                } else {
                    this.uploadToGithub().then(() => {
                        this.updateFromGithub();
                        setTimeout(done, 1000);
                    });
                }
            },
            setupOpenwith() {
                cordova.openwith.init(
                    () => {
                        cordova.openwith.addHandler((intent) => {
                            for (var i = 0; i < intent.items.length; ++i) {
                                var item = intent.items[i];
                                cordova.openwith.load(item, (data, item) => {
                                    if (item.type.includes('image/')) {
                                        this.addItemInternal(
                                            data,
                                            'png',
                                            'share'
                                        );
                                    } else {
                                        this.$q.notify(
                                            this.$t('fileTypeNotSupported')
                                        );
                                    }

                                    if (intent.exit) {
                                        cordova.openwith.exit();
                                    }
                                });
                            }
                        });
                        openWithInited = true;
                    },
                    () => {
                        console.log('openwith plugin init failed');
                    }
                );
            },
            addItemInternal(data, type, source = 'local') {
                const md5 = SparkMD5.hash(data);
                if (
                    data != '' &&
                    (this.items.length < 1 ||
                        (this.lastLocalItem != null &&
                            this.lastLocalItem.md5 != md5))
                ) {
                    this.filterItem(md5);
                    this.addItem({
                        time: new Date().getTime(),
                        value: data,
                        md5: md5,
                        uploaded: false,
                        type: type,
                        source: source,
                    });
                }
            },
        },
        mounted() {
            if (this.$q.localStorage.has('clipbroad-github-token')) {
                this.$setGithub(
                    this.$q.localStorage.getItem('clipbroad-github-token')
                )
                    .then(() => {
                        this.updateFromGithub();
                    })
                    .catch(() => {});
            }
            this.resetTimer();
        },
        created() {
            this.$i18n.locale = this.$q.lang.getLocale();
            this.setDarkMode();
            if (!existEventListen) {
                window.addEventListener('Sync', this.syncNow, false);
                existEventListen = true;
            }
            let hideIcon = this.$q.localStorage.has('clipbroad-hide-icon')
                ? this.$q.localStorage.getItem('clipbroad-hide-icon')
                : true;
            if (this.$q.platform.is.electron) {
                window.myAPI.setHideIcon(hideIcon);
            }
            if (this.$q.platform.is.cordova) {
                if (!openWithInited) this.setupOpenwith();
            }
            this.resetTimer();
        },
    });
</script>

<style></style>
