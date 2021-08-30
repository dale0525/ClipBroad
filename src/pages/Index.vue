<template>
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
                        <q-icon color="primary" :name="itemIcon(item.type)" />
                    </q-item-section>
                    <q-item-section v-if="item.type == 'text'">
                        <q-item-label lines="3">{{ item.value }}</q-item-label>
                    </q-item-section>
                    <q-item-section v-if="item.type == 'png'"
                        ><img
                            :src="'data:image/png;base64,' + item.value"
                            style="max-height: 300px; object-fit: contain"
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
</template>

<script>
    import { defineComponent } from 'vue';
    import { mapState, mapActions } from 'vuex';
    const SparkMD5 = require('spark-md5');
    var timers = [];
    var existEventListen = false;

    export default defineComponent({
        computed: {
            ...mapState('clipboard', ['items']),
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
                        const textMD5 = SparkMD5.hash(text);
                        if (
                            text != '' &&
                            (this.items.length < 1 ||
                                this.items[0].md5 != textMD5)
                        ) {
                            this.filterItem(textMD5);
                            this.addItem({
                                time: new Date().getTime(),
                                value: text,
                                md5: textMD5,
                                uploaded: false,
                                type: 'text',
                            });
                        }
                    } else {
                        const imageMD5 = SparkMD5.hash(image);
                        if (
                            this.items.length < 1 ||
                            this.items[0].md5 != imageMD5
                        ) {
                            this.filterItem(imageMD5);
                            this.addItem({
                                time: new Date().getTime(),
                                value: image,
                                md5: imageMD5,
                                uploaded: false,
                                type: 'png',
                            });
                        }
                    }
                }
            },
            prevTime(timeStamp) {
                const currentTime = new Date().getTime();
                const seconds = parseInt((currentTime - timeStamp) / 1000);
                // return date.formatDate(timeStamp, 'YYYY-MM-DDTHH:mm:ss.SSSZ');
                if (seconds <= 0) {
                    return 'Right Now';
                } else if (seconds < 60) {
                    return (
                        seconds.toString() +
                        ' second' +
                        (seconds < 2 ? '' : 's') +
                        ' ago'
                    );
                } else if (seconds < 3600) {
                    const minutes = parseInt(seconds / 60);
                    return (
                        minutes.toString() +
                        ' minute' +
                        (minutes < 2 ? '' : 's') +
                        ' ago'
                    );
                } else if (seconds < 3600 * 24) {
                    const hours = parseInt(seconds / 3600);
                    return (
                        hours.toString() +
                        ' hour' +
                        (hours < 2 ? '' : 's') +
                        ' ago'
                    );
                } else {
                    const days = parseInt(seconds / 3600 / 24);
                    return (
                        days.toString() +
                        ' day' +
                        (days < 2 ? '' : 's') +
                        ' ago'
                    );
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
                this.removeItem(index);
                item.time = new Date().getTime();
                item.uploaded = false;
                this.addItem(item);
                if (this.$q.platform.is.electron) {
                    if (item.type == 'text') {
                        window.myAPI.writeClipboardText(item.value);
                        window.myAPI.showNotification('Item copied!', item.value);
                    } else if (item.type == 'png') {
                        window.myAPI.writeClipboardImage(item.value);
                        window.myAPI.showNotification('Item copied!');
                    }
                    window.myAPI.hideWindow();
                }
            },
            setDarkMode() {
                if (this.$q.platform.is.electron) {
                    const darkMode = window.myAPI.isDarkMode();
                    this.$q.dark.set(darkMode);
                }
            },
            updateFromGithub() {
                console.log('updating from github...');
                if (!this.$githubInstance.githubRepoExist) {
                    console.log('github repo does not exist');
                    return;
                }
                this.$githubInstance.githubRepo
                    .getContents('main', '', true)
                    .then(({ data }) => {
                        for (let i = 0; i < data.length; i++) {
                            ((i) => {
                                let fullName = data[i].name;
                                fullName = fullName.split('.');
                                let nameSplit = fullName[0].split('-');
                                if (nameSplit.length < 2) return;
                                let fileType =
                                    fullName.length < 2 ? 'text' : fullName[1]; //name extension as file type
                                let sha = data[i].sha;
                                let raw = fileType == 'text' ? true : false;
                                this.$githubInstance.githubRepo
                                    .getBlob(sha, raw)
                                    .then(({ data }) => {
                                        let dataValue =
                                            fileType == 'text'
                                                ? data
                                                : data.content;
                                        let oldValue = this.items.find(
                                            (item) => item.md5 == nameSplit[1]
                                        );
                                        let newTime = parseInt(nameSplit[0]);
                                        let newMD5 = nameSplit[1];
                                        if (
                                            oldValue != null &&
                                            oldValue.time > newTime
                                        )
                                            return;
                                        this.filterItem(newMD5);
                                        this.addItem({
                                            time: newTime,
                                            md5: newMD5,
                                            uploaded: true,
                                            value: dataValue,
                                            type: fileType,
                                        });
                                    });
                            })(i);
                        }
                    });
            },
            UploadToGithub() {
                return new Promise((resolve, reject) => {
                    console.log('uploading to github');
                    if (!this.$githubInstance.githubRepoExist) {
                        console.log('github repo does not exist');
                        return;
                    }
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
                                        let ghsha;
                                        this.GetSha()
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
                                                console.log('Upload complete');
                                                resolve();
                                            })
                                            .catch((error) => {
                                                console.log(error);
                                                reject();
                                            });
                                    }
                                })
                                .catch((error) => {
                                    console.log(error);
                                    reject();
                                });
                        })(i);
                    }
                });
            },
            GetSha() {
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
                const UploadToGithubInterval = setInterval(
                    this.UploadToGithub,
                    30000
                );
                timers.push(checkClipboardInterval);
                timers.push(UploadToGithubInterval);
            },
            syncNow() {
                if (!this.$githubInstance.githubRepoExist) {
                    this.$router.push('/settings');
                } else {
                    this.UploadToGithub().then(() => {
                        this.updateFromGithub();
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
            this.setDarkMode();
            if (!existEventListen) {
                window.addEventListener('Sync', this.syncNow);
                existEventListen = true;
            }
            let hideIcon = this.$q.localStorage.has('clipbroad-hide-icon') ? this.$q.localStorage.getItem('clipbroad-hide-icon') : true;
            if (this.$q.platform.is.electron) {
                window.myAPI.setHideIcon(hideIcon);
            }
        },
    });
</script>

<style></style>
