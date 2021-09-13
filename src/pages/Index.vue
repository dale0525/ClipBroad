<template>
    <q-pull-to-refresh @refresh="syncNow" color="black" icon="autorenew">
        <q-page class="q-pa-md">
            <q-spinner
                color="primary"
                size="5em"
                :thickness="10"
                class="fixed-center"
                v-if="loading"
            />
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
                                toggleActionBtn(true);
                            }
                        "
                        ><q-tooltip v-if="showItemDebugInfo">
                            {{ item.time }}<br />
                            {{ item.value.toString().substr(0, 100) }}<br />
                            {{ item.isBuffer }}<br />
                            {{ item.md5 }}<br />
                            {{ item.uploaded }}<br />
                            {{ item.type }}<br />
                            {{ item.fileName == null ? 'N/A' : item.fileName
                            }}<br />
                            {{
                                item.remotePath == null
                                    ? 'N/A'
                                    : item.remotePath
                            }}<br />
                            {{
                                item.remoteSha == null ? 'N/A' : item.remoteSha
                            }}
                        </q-tooltip>
                        <q-item-section avatar v-if="actionBtn">
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
                                        } else if (toDeleteItems.length == 0) {
                                            isAllSelected = false;
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
                            :value="item.value.toString()"
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
            <q-toolbar class="fixed-bottom bg-primary" v-if="actionBtn">
                <div class="absolute-bottom-left" v-if="actionBtn">
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
                                toggleActionBtn(false);
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
    const mime = require('mime');
    import { exportFile } from 'quasar';
    import config from 'src/config.js';
    // import { Clipboard } from '@capacitor/clipboard';
    const maxItemLength = 500;
    var timers = [];
    var existEventListen = false;
    var openWithInited = false;
    var toDeleteRemote = 0;
    var uploading = false;
    var updating = false;
    var toUploadTree = [];
    var deletedMd5 = [];
    var username;

    export default defineComponent({
        components: {
            ClipboardItem,
        },

        data() {
            return {
                toDeleteItems: [],
                isAllSelected: false,
                showItemDebugInfo: process.env.PROD ? false : true,
                maxFileSize: this.$q.localStorage.has('clipbroad-max-file-size')
                    ? this.$q.localStorage.getItem('clipbroad-max-file-size')
                    : config.defaultSettings.maxFileSize,
                maxItem: this.$q.localStorage.has('clipbroad-max-item')
                    ? this.$q.localStorage.getItem('clipbroad-max-item')
                    : config.defaultSettings.maxItem,
                loading: false,
            };
        },
        computed: {
            ...mapState('clipboard', ['items', 'actionBtn']),
            ...mapGetters('clipboard', ['lastNonShareItem']),
            showDeleteBtn() {
                return this.toDeleteItems.length > 0 ? true : false;
            },
        },
        methods: {
            ...mapActions('clipboard', [
                'addItem',
                'updateRemoteParam',
                'removeItem',
                'setItemUploaded',
                'toggleActionBtn',
            ]),
            checkClipboard() {
                if (this.$q.platform.is.electron) {
                    const item = window.myAPI.readClipboard(this.maxFileSize);
                    if (item == null) return;
                    this.addNewItem(
                        null,
                        item.value,
                        true,
                        null,
                        false,
                        item.type,
                        item.fileName,
                        null,
                        null
                    );
                } else if (this.$q.platform.is.cordova) {
                    cordova.plugins.clipboard.paste((text) => {
                        if (text == null || text == '') return;
                        this.addNewItem(
                            null,
                            text.toString(),
                            true,
                            null,
                            false,
                            'text',
                            null,
                            null,
                            null
                        );
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
                if (type == 'html') {
                    return 'code';
                } else if (type == 'pdf') {
                    return 'picture_as_pdf';
                } else if (type == 'apk') {
                    return 'apps';
                } else if (type == 'text') {
                    return 'subject';
                } else if (config.textExt.includes(type)) {
                    return 'text_fields';
                } else if (config.imageExt.includes(type)) {
                    return 'image';
                } else if (config.archieveExt.includes(type)) {
                    return 'archive';
                } else if (config.excelExt.includes(type)) {
                    return 'table_view';
                } else if (config.wordExt.includes(type)) {
                    return 'article';
                } else if (config.videoExt.includes(type)) {
                    return 'movie';
                } else if (config.audioExt.includes(type)) {
                    return 'audiotrack';
                } else {
                    return 'attachment';
                }
            },
            copyItem(index) {
                const item = this.items[index];
                if (item.type == 'text') {
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
                } else if (item.type == 'html') {
                    var temporalDivElement = document.createElement('div');
                    temporalDivElement.innerHTML = item.value;
                    var text =
                        temporalDivElement.textContent ||
                        temporalDivElement.innerText ||
                        '';
                    if (this.$q.platform.is.electron) {
                        window.myAPI.writeClipboardHTML(text);
                        if (
                            this.$q.localStorage.getItem(
                                'clipbroad-show-copied-notification'
                            ) === true
                        )
                            window.myAPI.showNotification(
                                this.$t('copied'),
                                text
                            );
                        window.myAPI.hideWindow();
                    } else if (this.$q.platform.is.cordova) {
                        cordova.plugins.clipboard.copy(text);
                        this.$q.notify(this.$t('copied'));
                    }
                } else if (item.type == 'gif') {
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
                        window.myAPI.clearClipboard();
                    } else if (this.$q.platform.is.cordova) {
                        cordova.plugins.clipboard.copy('');
                        window.plugins.socialsharing.shareWithOptions(
                            {
                                files: ['data:image/gif;base64,' + item.value],
                            },
                            () => {},
                            (msg) => {
                                this.$q.notify(msg);
                            }
                        );
                    }
                } else if (config.imageExt.includes(item.type)) {
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
                        cordova.plugins.clipboard.copy('');
                        window.plugins.socialsharing.shareWithOptions(
                            {
                                files: [
                                    'data:' +
                                        mime.getType(item.type) +
                                        ';base64,' +
                                        item.value,
                                ],
                            },
                            () => {},
                            (msg) => {
                                this.$q.notify(msg);
                            }
                        );
                    }
                } else {
                    if (this.$q.platform.is.electron) {
                        if (!item.isBuffer) {
                            this.loading = true;
                            fetch(item.value)
                                .then((response) => response.blob())
                                .then((blob) => {
                                    this.loading = false;
                                    exportFile(
                                        item.fileName + '.' + item.type,
                                        blob
                                    );
                                })
                                .catch((error) => {
                                    console.log(error);
                                });
                        } else {
                            exportFile(
                                item.fileName + '.' + item.type,
                                Buffer.from(item.value, 'base64')
                            );
                        }
                        window.myAPI.clearClipboard();
                    } else if (this.$q.platform.is.cordova) {
                        const applicationType = mime.getType(item.type);
                        if (!applicationType) {
                            this.$q.notify(this.$t('fileTypeNotSupported'));
                            return;
                        } else {
                            cordova.plugins.clipboard.copy('');
                            window.plugins.socialsharing.shareWithOptions(
                                {
                                    subject: item.fileName,
                                    files: [
                                        item.isBuffer
                                            ? 'data:' +
                                              applicationType +
                                              ';base64,' +
                                              item.value
                                            : item.value,
                                    ],
                                },
                                () => {},
                                (msg) => {
                                    this.$q.notify(msg);
                                    return;
                                }
                            );
                        }
                    }
                }
                this.addNewItem(
                    new Date().getTime(),
                    item.value,
                    item.isBuffer,
                    item.md5,
                    item.uploaded,
                    item.type,
                    item.fileName,
                    item.remotePath,
                    item.remoteSha
                );
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
                return new Promise((resolve, reject) => {
                    if (!this.shouldSync()) {
                        resolve();
                        return;
                    }
                    if (updating) {
                        reject('Already updating');
                        return;
                    }
                    updating = true;
                    console.log('updating...');
                    this.$githubInstance.githubRepo
                        .getContents('main', '', true)
                        .then(({ data }) => {
                            if (data.length < 2) {
                                updating = false;
                                resolve();
                                return;
                            }
                            toDeleteRemote = Math.max(
                                data.length - maxItemLength,
                                0
                            );
                            const toFetch = Math.min(this.maxItem, data.length);
                            let fetched = 0;
                            for (
                                let i = data.length - 1;
                                i >= data.length - toFetch;
                                i--
                            ) {
                                ((i) => {
                                    let fullName = data[i].name;
                                    let fullNameSplit = fullName.split('.');
                                    if (fullNameSplit.length < 2) return;
                                    let fileType =
                                        fullNameSplit[fullNameSplit.length - 1];
                                    let nameSplit = fullName
                                        .replace('.' + fileType, '')
                                        .split('-');
                                    if (nameSplit.length < 2) {
                                        fetched++;
                                        return;
                                    }
                                    let remoteTime = parseInt(nameSplit[0]);
                                    let remoteMD5 = nameSplit[1];
                                    if (deletedMd5.includes(remoteMD5)) {
                                        //to avoid hitting github cache after delete items
                                        fetched++;
                                        return;
                                    }
                                    let fileName = null;
                                    if (nameSplit.length > 2) {
                                        fileName = fullName
                                            .replace('.' + fileType, '')
                                            .replace(
                                                nameSplit[0] +
                                                    '-' +
                                                    nameSplit[1] +
                                                    '-',
                                                ''
                                            );
                                    }
                                    this.addNewItem(
                                        remoteTime,
                                        data[i].download_url,
                                        true,
                                        remoteMD5,
                                        true,
                                        fileType,
                                        fileName,
                                        data[i].name,
                                        data[i].sha
                                    ).then(() => {
                                        fetched++;
                                        if (fetched == toFetch) {
                                            updating = false;
                                            console.log('updated');
                                            resolve();
                                        }
                                    });
                                })(i);
                            }
                            if (toDeleteRemote <= 0) return;
                            for (let j = 0; j < toDeleteRemote; j++) {
                                toUploadTree.push({
                                    path: data[j].path,
                                    sha: null,
                                    mode: '100644',
                                    type: 'blob',
                                });
                            }
                        })
                        .catch((error) => {
                            console.log(error);
                            reject(error);
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
                        console.log('still uploading...');
                        resolve();
                        return;
                    }
                    uploading = true;
                    let toUpload = [];
                    // console.log(this.items);
                    for (let j = 0; j < this.items.length; j++) {
                        if (!this.items[j].uploaded) {
                            toUpload.push(this.items[j]);
                            this.setItemUploaded(j);
                        }
                    }
                    // console.log(toUpload);
                    // console.log(toUploadTree);
                    if (toUpload.length <= 0) {
                        if (toUploadTree.length <= 0) {
                            console.log('no item to upload');
                            uploading = false;
                            resolve();
                            return;
                        } else {
                            console.log(this.$t('uploading'));
                            let tmpUploadTree = toUploadTree;
                            // this.$q.notify(this.$t('uploading'));
                            this.uploadTree(toUploadTree)
                                .then(() => {
                                    console.log(this.$t('uploaded'));
                                    // this.$q.notify(this.$t('uploaded'));
                                    toUploadTree = toUploadTree.filter(
                                        (el) => !tmpUploadTree.includes(el)
                                    );
                                    uploading = false;
                                    resolve();
                                })
                                .catch((error) => {
                                    console.log(error);
                                    this.$q.notify(this.$t('error'));
                                    // toUploadTree = [];
                                    uploading = false;
                                    reject(error);
                                });
                        }
                    } else {
                        console.log('uploading');
                        // this.$q.notify(this.$t('uploading'));
                        let createBlobCount = 0;
                        for (var i = 0; i < toUpload.length; i++) {
                            ((i) => {
                                let itemPath = this.getItemPath(toUpload[i]);
                                let content = toUpload[i].value;
                                switch (toUpload[i].type) {
                                    case 'text':
                                    case 'html':
                                        break;
                                    default:
                                        content = Buffer.from(
                                            content,
                                            'base64'
                                        );
                                        break;
                                }
                                this.$githubInstance.githubRepo
                                    .createBlob(content)
                                    .then(({ data }) => {
                                        toUploadTree.push({
                                            sha: data.sha,
                                            path: itemPath,
                                            mode: '100644',
                                            type: 'blob',
                                        });
                                        createBlobCount++;
                                        // console.log(
                                        //     `${createBlobCount} / ${toUpload.length}`
                                        // );
                                        if (
                                            createBlobCount == toUpload.length
                                        ) {
                                            this.uploadTree(toUploadTree)
                                                .then(() => {
                                                    console.log('uploaded');
                                                    // this.$q.notify(
                                                    //     this.$t('uploaded')
                                                    // );
                                                    toUploadTree = [];
                                                    uploading = false;
                                                    resolve();
                                                })
                                                .catch((error) => {
                                                    console.log(error);
                                                    this.$q.notify(
                                                        this.$t('error')
                                                    );
                                                    // toUploadTree = [];
                                                    uploading = false;
                                                    reject(error);
                                                });
                                        }
                                    })
                                    .catch((error) => {
                                        console.log(error);
                                        this.$q.notify(this.$t('error'));
                                        uploading = false;
                                        reject(error);
                                    });
                            })(i);
                        }
                    }
                });
            },
            uploadTree(treeItems) {
                return new Promise((resolve, reject) => {
                    if (treeItems.length < 1) {
                        resolve();
                        return;
                    }
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
                            console.log(error);
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
                    config.checkClipboardInterval
                );
                const syncInterval = setInterval(
                    this.syncNow,
                    config.autoSyncInterval
                );
                timers.push(checkClipboardInterval);
                timers.push(syncInterval);
            },
            syncNow(done) {
                if (!this.$githubInstance.githubRepoExist) {
                    this.$router.push('/settings');
                } else {
                    this.updateFromGithub().then(() => {
                        this.uploadToGithub();
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
                                    cordova.plugins.clipboard.copy('');
                                    window
                                        .resolveLocalFilesystemUrl(item.uri)
                                        .then((fileEntry) => {
                                            fileEntry.getMetadata(
                                                (metadata) => {
                                                    let fileSize =
                                                        metadata.size /
                                                        1024 /
                                                        1024;
                                                    if (
                                                        fileSize >
                                                        this.maxFileSize
                                                    ) {
                                                        this.$q.notify(
                                                            this.$t(
                                                                'maxFileSizeTip2'
                                                            )
                                                        );
                                                        return;
                                                    } else {
                                                        const ext =
                                                            mime.getExtension(
                                                                item.type
                                                            );
                                                        if (ext) {
                                                            var itemPath =
                                                                item.path;
                                                            itemPath =
                                                                itemPath.split(
                                                                    '/'
                                                                );
                                                            var fullName =
                                                                itemPath[
                                                                    itemPath.length -
                                                                        1
                                                                ];
                                                            var fullNameSplit =
                                                                fullName.split(
                                                                    '.'
                                                                );
                                                            var fileName =
                                                                fullName.replace(
                                                                    '.' +
                                                                        fullNameSplit[
                                                                            fullNameSplit.length -
                                                                                1
                                                                        ],
                                                                    ''
                                                                );
                                                            this.addNewItem(
                                                                null,
                                                                data,
                                                                true,
                                                                null,
                                                                false,
                                                                ext,
                                                                fileName,
                                                                null,
                                                                null,
                                                                true
                                                            );
                                                        }
                                                    }
                                                }
                                            );
                                        });
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
            addNewItem(
                time,
                value,
                isBuffer,
                md5,
                uploaded,
                type,
                fileName,
                remotePath,
                remoteSha,
                fromShare = false
            ) {
                return new Promise((resolve, reject) => {
                    // console.log(this.items);
                    if (md5 == null) md5 = SparkMD5.hash(value);
                    if (
                        this.lastNonShareItem != null &&
                        this.lastNonShareItem.md5 == md5
                    ) {
                        resolve();
                        return;
                    }
                    if (time == null) time = new Date().getTime();
                    let localItemIndex = this.items.findIndex(
                        (item) => item.md5 == md5
                    );
                    if (localItemIndex < 0) {
                        if (remoteSha != null) {
                            if (
                                !['text', 'html']
                                    .concat(config.imageExt)
                                    .concat(config.videoExt)
                                    .concat(config.audioExt)
                                    .concat(config.textExt)
                                    .includes(type)
                            ) {
                                this.addItem({
                                    time: time,
                                    value: value,
                                    isBuffer: false,
                                    md5: md5,
                                    uploaded: uploaded,
                                    type: type,
                                    fileName: fileName,
                                    remotePath: remotePath,
                                    remoteSha: remoteSha,
                                });
                                resolve();
                            } else {
                                let raw =
                                    type == 'html' || type == 'text'
                                        ? true
                                        : false;
                                this.$githubInstance.githubRepo
                                    .getBlob(remoteSha, raw)
                                    .then(({ data }) => {
                                        let dataValue =
                                            type == 'html' || type == 'text'
                                                ? data
                                                : data.content;
                                        this.addItem({
                                            time: time,
                                            value: dataValue,
                                            isBuffer: true,
                                            md5: md5,
                                            uploaded: uploaded,
                                            type: type,
                                            fileName: fileName,
                                            remotePath: remotePath,
                                            remoteSha: remoteSha,
                                        });
                                        resolve();
                                    });
                            }
                        } else {
                            this.addItem({
                                time: time,
                                value: value,
                                isBuffer: isBuffer,
                                md5: md5,
                                uploaded: uploaded,
                                type: type,
                                fileName: fileName,
                                remotePath: remotePath,
                                remoteSha: remoteSha,
                            });
                            resolve();
                        }
                    } else if (this.items[localItemIndex].time == time) {
                        this.updateRemoteParam({
                            index: localItemIndex,
                            value: value,
                            remotePath: remotePath,
                            remoteSha: remoteSha,
                        });
                        resolve();
                    } else if (this.items[localItemIndex].time > time) {
                        toUploadTree.push({
                            path: remotePath,
                            sha: null,
                            mode: '100644',
                            type: 'blob',
                        });
                        resolve();
                    } else {
                        let localItem = this.items[localItemIndex];
                        this.removeItem(localItemIndex);
                        if (localItem.remotePath != null) {
                            let newPath = this.getItemPath({
                                time: time,
                                md5: md5,
                                fileName: fileName,
                                type: type,
                            });
                            toUploadTree.push({
                                path: newPath,
                                sha: localItem.remoteSha,
                                mode: '100644',
                                type: 'blob',
                            });
                            toUploadTree.push({
                                path: localItem.remotePath,
                                sha: null,
                                mode: '100644',
                                type: 'blob',
                            });
                            this.addItem({
                                time: time,
                                value: value,
                                isBuffer: isBuffer,
                                md5: md5,
                                uploaded: true,
                                type: type,
                                fileName: fileName,
                                remotePath: newPath,
                                remoteSha: localItem.remoteSha,
                            });
                            resolve();
                        } else {
                            this.addItem({
                                time: time,
                                value: value,
                                isBuffer: isBuffer,
                                md5: md5,
                                uploaded: false,
                                type: type,
                                fileName: fileName,
                                remotePath: null,
                                remoteSha: null,
                            });
                            resolve();
                        }
                    }
                });
            },
            getItemPath(item) {
                let itemPath = item.time.toString() + '-' + item.md5;
                if (item.fileName != null) {
                    itemPath += '-' + item.fileName;
                }
                itemPath += '.' + item.type;
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
                    this.toDeleteItems.sort(function (a, b) {
                        return a - b;
                    });
                    for (let i = 0; i < this.toDeleteItems.length; i++) {
                        if (this.items[this.toDeleteItems[i]].uploaded) {
                            toUploadTree.push({
                                sha: null,
                                path: this.getItemPath(
                                    this.items[this.toDeleteItems[i]]
                                ),
                                mode: '100644',
                                type: 'blob',
                            });
                        }
                    }
                    if (toUploadTree.length > 0) {
                        uploading = true;
                        this.uploadTree(toUploadTree)
                            .then(() => {
                                for (
                                    let i = this.toDeleteItems.length - 1;
                                    i >= 0;
                                    i--
                                ) {
                                    deletedMd5.push(
                                        this.items[this.toDeleteItems[i]].md5
                                    );
                                    this.removeItem(this.toDeleteItems[i]);
                                }
                                toUploadTree = [];
                                uploading = false;
                                this.toDeleteItems = [];
                                this.$q.notify(this.$t('deleted'));
                            })
                            .catch((error) => {
                                console.log(error);
                                toUploadTree = [];
                                uploading = false;
                                this.$q.notify(this.$t('error'));
                            });
                    } else {
                        for (
                            let i = this.toDeleteItems.length - 1;
                            i >= 0;
                            i--
                        ) {
                            deletedMd5.push(
                                this.items[this.toDeleteItems[i]].md5
                            );
                            this.removeItem(this.toDeleteItems[i]);
                        }
                        this.toDeleteItems = [];
                        this.$q.notify(this.$t('deleted'));
                    }
                }
                this.toggleActionBtn(false);
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
            initGithub() {
                if (this.$q.localStorage.has('clipbroad-github-token')) {
                    this.$q.notify(this.$t('connectingGithub'));
                    this.$setGithub(
                        this.$q.localStorage.getItem('clipbroad-github-token')
                    )
                        .then(({ data }) => {
                            username = data.username;
                            this.$q.notify(this.$t('connectedGithub'));
                            this.$q.notify(this.$t('updating'));
                            this.updateFromGithub()
                                // .then(this.uploadToGithub())
                                .then(() => {
                                    this.$q.notify(this.$t('updated'));
                                    this.resetTimer();
                                });
                        })
                        .catch(() => {
                            this.$q.notify();
                            setTimeout(() => {
                                this.initGithub();
                            }, 2000);
                        });
                }
            },
        },
        mounted() {
            this.initGithub();
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
                : config.defaultSettings.hideIcon;
            if (this.$q.platform.is.electron) {
                window.myAPI.setHideIcon(hideIcon);
            }
            if (this.$q.platform.is.cordova) {
                if (!openWithInited) this.setupOpenwith();
            }
        },
    });
</script>

<style></style>
