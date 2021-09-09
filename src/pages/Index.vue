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
                        v-touch-hold:500.mouse="
                            () => {
                                toggleActionBtn = true;
                            }
                        "
                    >
                        <q-item-section avatar v-if="toggleActionBtn">
                            <q-checkbox
                                v-model="toDeleteItems"
                                :val="index"
                                color="orange"
                                @click="
                                    () => {
                                        if (
                                            toDeleteItems.length == items.length
                                        ) {
                                            isAllSelected = true;
                                        } else {
                                            isAllSelected = null;
                                        }
                                    }
                                "
                            />
                        </q-item-section>
                        <q-item-section avatar>
                            <q-icon
                                color="primary"
                                :name="itemIcon(item.type)"
                            />
                        </q-item-section>
                        <ClipboardItem
                            :type="item.type"
                            :value="item.value"
                            :key="item.md5"
                            :fileName="item.fileName"
                        />
                        <q-item-section side>
                            <q-item-label caption>{{
                                prevTime(item.time)
                            }}</q-item-label>
                        </q-item-section>
                    </q-item>
                </transition-group>
            </q-list>
            <q-toolbar
                style="z-index: 99999; height: 80px"
                class="fixed-bottom bg-black"
                v-if="toggleActionBtn"
            >
                <div class="absolute-bottom-left" v-if="toggleActionBtn">
                    <q-item-section avatar>
                        <q-checkbox
                            keep-color
                            :indeterminate-value="null"
                            size="xl"
                            class="q-mx-lg"
                            v-model="isAllSelected"
                            color="orange"
                            @click="selectAll()"
                        />
                    </q-item-section>
                </div>
                <div class="absolute-bottom-right">
                    <q-btn
                        fab
                        icon="delete"
                        color="orange"
                        v-if="showDeleteBtn"
                        class="q-ma-md"
                        @click="deleteSelected()"
                    />
                    <q-btn
                        fab
                        icon="close"
                        color="primary"
                        class="q-ma-md"
                        @click="
                            () => {
                                toDeleteItems = [];
                                toggleActionBtn = false;
                                isAllSelected = false;
                            }
                        "
                    />
                </div>
            </q-toolbar>
        </q-page>
    </q-pull-to-refresh>
</template>

<script>
    import { defineComponent } from 'vue';
    import ClipboardItem from 'src/components/ClipboardItem.vue';
    import { mapState, mapActions, mapGetters } from 'vuex';
    const SparkMD5 = require('spark-md5');
    import { exportFile } from 'quasar';
    // import { Clipboard } from '@capacitor/clipboard';
    const maxItemLength = 500;
    var timers = [];
    var existEventListen = false;
    var openWithInited = false;
    var toDeleteRemote = 0;
    var uploading = false;

    export default defineComponent({
        components: {
            ClipboardItem,
        },

        data() {
            return {
                toDeleteItems: [],
                toggleActionBtn: false,
                isAllSelected: false,
            };
        },
        computed: {
            ...mapState('clipboard', ['items']),
            ...mapGetters('clipboard', ['lastLocalItem']),
            showDeleteBtn() {
                return this.toDeleteItems.length > 0 ? true : false;
            },
        },
        methods: {
            ...mapActions('clipboard', [
                'addItem',
                'addRelatedItem',
                'removeItem',
                'setItemUploaded',
            ]),
            checkClipboard() {
                if (this.$q.platform.is.electron) {
                    const item = window.myAPI.readClipboard();
                    if (item == null) return;
                    this.addItemInternal(
                        item.value,
                        item.type,
                        'local',
                        item.fileName
                    );
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
                    case 'html':
                        return 'code';
                    case 'pdf':
                        return 'picture_as_pdf';
                    case 'gif':
                        return 'gif_box';
                    case 'zip':
                    case '7z':
                    case 'rar':
                    case 'tar':
                        return 'archive';
                    case 'xlsx':
                    case 'xls':
                    case 'xlsm':
                        return 'table_view';
                    default:
                        return 'attachment';
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
                    case 'html':
                        this.removeItem(index);
                        item.time = new Date().getTime();
                        item.uploaded = false;
                        this.addItem(item);
                        if (this.$q.platform.is.electron) {
                            window.myAPI.writeClipboardHTML(item.value);
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
                            var temporalDivElement =
                                document.createElement('div');
                            temporalDivElement.innerHTML = item.value;
                            cordova.plugins.clipboard.copy(
                                temporalDivElement.textContent ||
                                    temporalDivElement.innerText ||
                                    ''
                            );
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
                                window.myAPI.showNotification(
                                    this.$t('copied')
                                );
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
                    case 'gif':
                        if (this.$q.platform.is.electron) {
                            fetch('data:image/gif;base64,' + item.value)
                                .then((response) => response.blob())
                                .then((blob) => {
                                    exportFile(
                                        item.fileName + '.' + item.type,
                                        blob
                                    );
                                })
                                .catch((error) => {
                                    console.log(error);
                                });
                        } else if (this.$q.platform.is.cordova) {
                            // this.$q.notify('Not supported!');
                            window.plugins.socialsharing.shareWithOptions(
                                {
                                    files: [
                                        'data:image/gif;base64,' + item.value,
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
                        if (this.$q.platform.is.electron) {
                            fetch(item.value)
                                .then((response) => response.blob())
                                .then((blob) => {
                                    exportFile(
                                        item.fileName + '.' + item.type,
                                        blob
                                    );
                                })
                                .catch((error) => {
                                    console.log(error);
                                });
                        } else if (this.$q.platform.is.cordova) {
                        }
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
                if (this.$q.platform.is.electron) return true;
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
                    this.$q.notify(this.$t('syncUntilWifi'));
                    return false;
                }
                return true;
            },
            updateFromGithub() {
                if (!this.shouldSync()) return;
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
                                let fullNameSplit = fullName.split('.');
                                let fileType =
                                    fullNameSplit.length < 2
                                        ? 'text'
                                        : fullNameSplit[
                                              fullNameSplit.length - 1
                                          ]; //name extension as file type
                                let nameSplit =
                                    fileType == 'text'
                                        ? fullName.split('-')
                                        : fullName
                                              .replace('.' + fileType, '')
                                              .split('-');
                                if (nameSplit.length < 2) return;
                                let remoteTime = parseInt(nameSplit[0]);
                                let remoteMD5 = nameSplit[1];
                                let fileName = null;
                                if (nameSplit.length > 2) {
                                    fileName = nameSplit[2];
                                }
                                let localItemIndex = this.items.findIndex(
                                    (item) => item.md5 == nameSplit[1]
                                );
                                if (
                                    localItemIndex >= 0 &&
                                    this.items[localItemIndex].time > remoteTime
                                ) {
                                    this.addRelatedItem({
                                        index: localItemIndex,
                                        item: {
                                            time: remoteTime,
                                            md5: remoteMD5,
                                            uploaded: true,
                                            value: null,
                                            type: null,
                                            source: null,
                                            fileName: fileName,
                                            relatedItems: [],
                                        },
                                    });
                                    return;
                                }
                                fetchedItems++;
                                if (
                                    !['text', 'html', 'png', 'gif'].includes(
                                        fileType
                                    )
                                ) {
                                    this.addItem({
                                        time: remoteTime,
                                        md5: remoteMD5,
                                        uploaded: true,
                                        value: data[i].download_url, //only record download url of binary file
                                        type: fileType,
                                        source: 'remote',
                                        fileName: fileName,
                                        relatedItems: [],
                                    });
                                } else {
                                    let sha = data[i].sha;
                                    let raw =
                                        fileType == 'text' || fileType == 'html'
                                            ? true
                                            : false;
                                    this.$githubInstance.githubRepo
                                        .getBlob(sha, raw)
                                        .then(({ data }) => {
                                            let dataValue =
                                                fileType == 'text' ||
                                                fileType == 'html'
                                                    ? data
                                                    : data.content;
                                            this.addItem({
                                                time: remoteTime,
                                                md5: remoteMD5,
                                                uploaded: true,
                                                value: dataValue,
                                                type: fileType,
                                                source: 'remote',
                                                fileName: fileName,
                                                relatedItems: [],
                                            });
                                        });
                                }
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
                    if (!this.shouldSync()) {
                        resolve();
                        return;
                    }
                    if (uploading) {
                        resolve();
                        return;
                    }
                    console.log('uploading to github');
                    uploading = true;
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
                        uploading = false;
                        resolve();
                        return;
                    }
                    // const tempPath = path.join(remote.app.getPath("temp"), "clipbroad");
                    // if (!fs.existsSync(tempPath)) {
                    //     fs.mkdirSync(tempPath);
                    // }
                    for (var i = 0; i < toUpload.length; i++) {
                        ((i) => {
                            let itemPath = this.getItemPath(toUpload[i]);
                            let content = toUpload[i].value;
                            switch (toUpload[i].type) {
                                case 'text':
                                case 'html':
                                    break;
                                default:
                                    content = Buffer.from(content, 'base64');
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
                                        path: itemPath,
                                        mode: '100644',
                                        type: 'blob',
                                    });
                                    if (treeItems.length == toUpload.length) {
                                        this.uploadTree(treeItems)
                                            .then(() => {
                                                // this.$q.notify(
                                                //     this.$t('uploaded')
                                                // );
                                                console.log('uploaded');
                                                resolve();
                                            })
                                            .catch((error) => {
                                                console.log(error);
                                                this.$q.notify(
                                                    this.$t('error')
                                                );
                                                reject(error);
                                            });
                                    }
                                })
                                .catch((error) => {
                                    console.log(error);
                                    this.$q.notify(this.$t('error'));
                                    reject(error);
                                });
                        })(i);
                    }
                });
            },
            uploadTree(treeItems) {
                return new Promise((resolve, reject) => {
                    uploading = true;
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
                            uploading = false;
                            resolve();
                        })
                        .catch((error) => {
                            uploading = false;
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
            addItemInternal(data, type, source = 'local', fileName = null) {
                const md5 = SparkMD5.hash(data);
                if (
                    data != '' &&
                    (this.items.length < 1 ||
                        (this.lastLocalItem != null &&
                            this.lastLocalItem.md5 != md5))
                ) {
                    this.addItem({
                        time: new Date().getTime(),
                        value: data,
                        md5: md5,
                        uploaded: false,
                        type: type,
                        source: source,
                        fileName: fileName,
                        relatedItems: [],
                    });
                }
            },
            getItemPath(item) {
                let itemPath = item.time.toString() + '-' + item.md5;
                if (item.fileName != null) {
                    itemPath += '-' + item.fileName;
                }
                switch (item.type) {
                    case 'text':
                        itemPath += '-text';
                        break;
                    default:
                        itemPath += '.' + item.type;
                        break;
                }
                return itemPath;
            },
            deleteSelected(notify = true) {
                if (this.toDeleteItems.length > 0) {
                    if (notify) this.$q.notify(this.$t('deleting'));
                    if (uploading) {
                        setTimeout(() => {
                            this.deleteSelected(false);
                        }, 1000);
                        return;
                    }
                    let treeItems = [];
                    this.toDeleteItems.sort(function (a, b) {
                        return a - b;
                    });
                    for (let i = 0; i < this.toDeleteItems.length; i++) {
                        if (this.items[this.toDeleteItems[i]].uploaded) {
                            treeItems.push({
                                sha: null,
                                path: this.getItemPath(
                                    this.items[this.toDeleteItems[i]]
                                ),
                                mode: '100644',
                                type: 'blob',
                            });
                        }
                        if (
                            this.items[this.toDeleteItems[i]].relatedItems
                                .length > 0
                        ) {
                            for (
                                let j = 0;
                                j <
                                this.items[this.toDeleteItems[i]].relatedItems
                                    .length;
                                j++
                            ) {
                                treeItems.push({
                                    sha: null,
                                    path: this.getItemPath(
                                        this.items[this.toDeleteItems[i]]
                                            .relatedItems[j]
                                    ),
                                    mode: '100644',
                                    type: 'blob',
                                });
                            }
                        }
                    }
                    if (treeItems.length > 0) {
                        this.uploadTree(treeItems)
                            .then(() => {
                                for (
                                    let i = this.toDeleteItems.length - 1;
                                    i >= 0;
                                    i--
                                ) {
                                    this.removeItem(this.toDeleteItems[i]);
                                }
                                this.$q.notify(this.$t('deleted'));
                            })
                            .catch((error) => {
                                console.log(error);
                                this.$q.notify(this.$t('error'));
                            });
                    } else {
                        for (
                            let i = this.toDeleteItems.length - 1;
                            i >= 0;
                            i--
                        ) {
                            this.removeItem(this.toDeleteItems[i]);
                        }
                        this.$q.notify(this.$t('deleted'));
                    }
                }
                this.toggleActionBtn = false;
                this.isAllSelected = false;
            },
            selectAll() {
                this.toDeleteItems = [];
                if (this.isAllSelected === true) {
                    for (let i = 0; i < this.items.length; i++) {
                        this.toDeleteItems.push(i);
                    }
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
