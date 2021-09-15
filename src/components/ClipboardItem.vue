<template>
    <q-item-section v-if="type == 'text'">
        <q-item-label class="ellipsis-3-lines">{{ value }}</q-item-label>
    </q-item-section>
    <q-item-section v-if="textExt.includes(type)">
        <q-item-label class="ellipsis-3-lines">{{
            base64ToString(value)
        }}</q-item-label>
    </q-item-section>
    <q-item-section v-if="type == 'html'">
        <q-item-label class="ellipsis-3-lines" v-html="value"></q-item-label>
    </q-item-section>
    <q-item-section v-if="imageExt.includes(type)"
        ><img
            :src="'data:' + getMimeType(type) + ';base64,' + value"
            style="max-height: 300px; object-fit: contain; max-width: 100%"
    /></q-item-section>
    <q-item-section v-if="videoExt.includes(type)">
        <video
            controls
            :src="'data:' + getMimeType(type) + ';base64,' + value"
            height="320"
            style="object-fit: contain"
    /></q-item-section>
    <q-item-section v-if="audioExt.includes(type)">
        <q-item-section avatar>
            {{ fileName }}
        </q-item-section>
        <audio
            controls
            :src="'data:' + getMimeType(type) + ';base64,' + value"
            style="object-fit: contain; max-width: 100%"
    /></q-item-section>
    <q-item-section
        class="rounded-borders text-center bg-green ellipsis"
        v-if="
            !['text', 'html']
                .concat(imageExt)
                .concat(videoExt)
                .concat(audioExt)
                .concat(textExt)
                .includes(type)
        "
        >{{ fileName + (type == null ? '' : '.' + type) }}</q-item-section
    >
</template>

<script>
    import { defineComponent } from 'vue';
    const mime = require('mime');
    import config from 'src/config.js';

    export default defineComponent({
        name: 'ClipboardItem',
        props: {
            type: {
                type: String,
                required: false,
            },

            value: {
                type: String,
                required: true,
            },

            fileName: {
                type: String,
                required: false,
            },
        },
        data() {
            return {
                imageExt: config.imageExt,
                videoExt: config.videoExt,
                audioExt: config.audioExt,
                textExt: config.textExt,
            };
        },
        methods: {
            getMimeType(ext) {
                return mime.getType(ext);
            },
            base64ToString(str) {
                return Buffer.from(str, 'base64').toString('utf-8');
            },
        },
    });
</script>
