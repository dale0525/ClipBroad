<template>
    <q-item-section v-if="type == 'txt'">
        <q-item-label lines="3">{{ value }}</q-item-label>
    </q-item-section>
    <q-item-section v-if="type == 'html'">
        <q-item-label lines="3" v-html="value"></q-item-label>
    </q-item-section>
    <q-item-section v-if="type == 'png'"
        ><img
            :src="'data:image/png;base64,' + value"
            style="max-height: 300px; object-fit: contain; max-width: 100%"
    /></q-item-section>
    <q-item-section v-if="type == 'gif'"
        ><img
            :src="'data:image/gif;base64,' + value"
            style="max-height: 300px; object-fit: contain; max-width: 100%"
    /></q-item-section>
    <q-item-section
        class="rounded-borders text-center bg-green"
        v-if="
            type != 'png' && type != 'txt' && type != 'html' && type != 'gif'
        "
        >{{ fileName + '.' + type }}</q-item-section
    >
</template>

<script>
    import { defineComponent } from 'vue';

    export default defineComponent({
        name: 'ClipboardItem',
        props: {
            type: {
                type: String,
                required: true,
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
    });
</script>
