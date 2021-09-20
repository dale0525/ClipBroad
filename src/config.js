export default {
    imageExt: [
        'png',
        'jpg',
        'jpeg',
        'gif',
        'svg',
        'tiff',
        'bmp',
        'ico',
        'webp',
    ],
    videoExt: [
        'mp4',
        'mov',
        'mkv',
        'avi',
        'wmv',
        'rmvb',
        'swf',
        'flv',
        'mpg',
        'mpeg',
    ],
    audioExt: ['mp3', 'ape', 'flac', 'wav', 'aac', 'wma', 'ogg', 'mpga'],
    archieveExt: ['zip', '7z', 'rar'],
    excelExt: ['xls', 'xlsx', 'xlsm'],
    wordExt: ['doc', 'docx'],
    textExt: ['txt', 'inf', 'rtf', 'json', 'yaml', 'yml', 'md'],
    defaultSettings: {
        hideIcon: false,
        autoLaunch: false,
        showCopiedNotification: true,
        syncUseMobileData: false,
        maxItem: 40,
        darkMode: 'auto',
        maxFileSize: 5,
        shortcut: {
            win: ['Control', 'Shift', 'V'],
            mac: ['Meta', 'Shift', 'V'],
        },
    },
    githubClientID: 'fa79756f53d8c0a88ddd',
    autoSyncInterval: 30000,
    checkClipboardInterval: 500,
    githubTokenResetThreshold: 5,
    clickTipMax: 3,
    doubleClickThreshold: 300,
};
