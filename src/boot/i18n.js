import { boot } from 'quasar/wrappers';
import { createI18n } from 'vue-i18n';
import messages from 'src/i18n';

const i18n = createI18n({
    locale: 'en-US',
    fallbackLocale: 'en-US',
    messages,
});

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(({ app }) => {
    app.use(i18n);
    app.config.globalProperties.$i18n = i18n;
});

export { i18n };
