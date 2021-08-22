<template>
    <q-page class="q-pa-md">
        <q-list bordered separator>
            <q-item
                v-for="(item, index) in items"
                :key="index"
                clickable
                v-ripple
                @click="copyItem(index)"
            >
                <q-item-section avatar>
                    <q-icon color="primary" :name="itemIcon(item.type)" />
                </q-item-section>
                <q-item-section v-if="item.type == 'text'">{{
                    item.value
                }}</q-item-section>
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
    const GitHub = require('github-api');
    var gh = null;

    export default defineComponent({
        computed: {
            ...mapGetters('clipboard', ['items']),
        },
        methods: {
            ...mapActions('clipboard', ['addItem', 'filterItem', 'removeItem']),
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
        },
        mounted() {
            setInterval(() => {
                this.checkClipboard();
            }, 500);
        },
        created() {
            this.setDarkMode();
        },
    });
</script>

<style></style>
