<template>
    <q-route-tab :icon="icon" :label="label" :to="to">
    </q-route-tab>
</template>

<script>
    import { defineComponent } from 'vue';

    export default defineComponent({
        name: 'Footer',
        props: {
            icon: {
                type: String,
                required: true,
            },

            label: {
                type: String,
                required: true,
            },

            to: {
                type: String,
                required: true,
            },
        },
    });
</script>
