<template>
    <q-page class="q-pa-md">
        <q-list bordered separator>
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
        </q-list>
    </q-page>
</template>

<script>
    import { defineComponent } from 'vue';
    import { mapGetters, mapActions } from 'vuex';
    const SparkMD5 = require('spark-md5');
    let ghSha;

    export default defineComponent({
        computed: {
            ...mapGetters('clipboard', [
                'items',
                'githubRepo',
                'githubRepoExist',
            ]),
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
                        (seconds < 1 ? '' : 's') +
                        ' ago'
                    );
                } else if (seconds < 3600) {
                    const minutes = parseInt(seconds / 60);
                    return (
                        minutes.toString() +
                        ' minute' +
                        (minutes < 1 ? '' : 's') +
                        ' ago'
                    );
                } else if (seconds < 3600 * 24) {
                    const hours = parseInt(seconds / 3600);
                    return (
                        hours.toString() +
                        ' hour' +
                        (hours < 1 ? '' : 's') +
                        ' ago'
                    );
                } else {
                    const days = parseInt(seconds / 3600 / 24);
                    return (
                        days.toString() +
                        ' day' +
                        (days < 1 ? '' : 's') +
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
                this.addItem(item);
                if (this.$q.platform.is.electron) {
                    if (item.type == 'text') {
                        window.myAPI.writeClipboardText(item.value);
                    } else if (item.type == 'png') {
                        window.myAPI.writeClipboardImage(item.value);
                    }
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
                if (!this.githubRepoExist) return;
                this.githubRepo
                    .getContents('main', '', true)
                    .then(({ data }) => {
                        for (let i = 0; i < data.length; i++) {
                            ((i) => {
                                let name = data[i].name;
                                let nameSplit = name.split('-');
                                if (nameSplit.length < 2) return;
                                let sha = data[i].sha;
                                let fileType =
                                    nameSplit.length > 2
                                        ? nameSplit[2].split('.')[0]
                                        : 'text';
                                let raw = fileType == 'text' ? true : false;
                                this.githubRepo
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
                let treeItems = [];
                let toUpload = [];
                for (let j = 0; j < this.items.length; j++) {
                    if (!this.items[j].uploaded && this.items[j].value != '') {
                        toUpload.push(this.items[j]);
                        this.setItemUploaded(j);
                    }
                }
                if (toUpload.length <= 0) {
                    console.log('no item to upload');
                    return;
                }
                // const tempPath = path.join(remote.app.getPath("temp"), "clipbroad");
                // if (!fs.existsSync(tempPath)) {
                //     fs.mkdirSync(tempPath);
                // }
                for (var i = 0; i < toUpload.length; i++) {
                    ((i) => {
                        let fileName =
                            toUpload[i].time.toString() + '-' + toUpload[i].md5;
                        let content = toUpload[i].value;
                        switch (toUpload[i].type) {
                            case 'png':
                                fileName += '-png.png';
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
                        this.githubRepo
                            .createBlob(content)
                            .then(({ data }) => {
                                treeItems.push({
                                    sha: data.sha,
                                    path: fileName,
                                    mode: '100644',
                                    type: 'blob',
                                });
                                if (treeItems.length == toUpload.length) {
                                    this.GetSha()
                                        .then((data) => {
                                            ghsha = data;
                                        })
                                        .then(() =>
                                            this.githubRepo.createTree(
                                                treeItems,
                                                ghsha.commit
                                            )
                                        )
                                        .then(({ data }) => {
                                            return this.githubRepo.commit(
                                                ghsha.parent,
                                                data.sha,
                                                'update'
                                            );
                                        })
                                        .then(({ data }) => {
                                            this.githubRepo.updateHead(
                                                'heads/main',
                                                data.sha,
                                                true
                                            );
                                        })
                                        .then(() => {
                                            console.log('Upload complete');
                                            // fs.rmdir(tempPath, { recursive: true, force: true }, () => {
                                            //     console.log("dir deleted");
                                            // });
                                        })
                                        .catch((error) => {
                                            console.log(error);
                                        });
                                }
                            })
                            .catch((error) => {
                                console.log(error);
                            });
                    })(i);
                }
            },
            GetSha() {
                return new Promise(function (resolve, reject) {
                    let refSha;
                    let commitSha;

                    this.githubRepo
                        .getRef('heads/main')
                        .then(({ data }) => {
                            refSha = data.object.sha;
                        })
                        .then(() => this.githubRepo.getCommit(refSha))
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
        },
        mounted() {
            this.updateFromGithub();
            setInterval(() => {
                this.checkClipboard();
            }, 500);
            setInterval(() => {
                this.UploadToGithub();
            }, 10000);
        },
        created() {
            this.setDarkMode();
        },
    });
</script>

<style></style>
