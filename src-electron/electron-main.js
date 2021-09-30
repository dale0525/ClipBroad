import {
    app,
    BrowserWindow,
    nativeTheme,
    Tray,
    Menu,
    ipcMain,
    globalShortcut,
    powerMonitor,
} from 'electron';
import path from 'path';
const AutoLaunch = require('auto-launch');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

try {
    if (
        process.platform === 'win32' &&
        nativeTheme.shouldUseDarkColors === true
    ) {
        require('fs').unlinkSync(
            require('path').join(app.getPath('userData'), 'DevTools Extensions')
        );
    }
} catch (_) {}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, argv, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            mainWindow.show();
            setTimeout(() => {
                shouldHide = true;
            }, 1000);
        }
        if (argv.length > 2) {
            const uri = argv[2];
            if (!uri.includes('clipbroad://token/')) return;
            const token = uri
                .replace('clipbroad://token/', '')
                .replace('/', '');
            mainWindow.webContents.send('getToken', token);
        }
    });
}

// for mac url scheme
app.on('open-url', (event, url) => {
    if (!url.includes('clipbroad://token/')) return;
    const token = url.replace('clipbroad://token/', '').replace('/', '');
    mainWindow.webContents.send('getToken', token);
});

let mainWindow;
let tray = null;
let contextMenu = null;
let shouldHide = true;

function createWindow() {
    /**
     * Initial window options
     */
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        useContentSize: true,
        frame: false,
        webPreferences: {
            contextIsolation: true,
            // More info: /quasar-cli/developing-electron-apps/electron-preload-script
            preload: path.resolve(
                __dirname,
                process.env.QUASAR_ELECTRON_PRELOAD
            ),
            enableRemoteModule: true,
        },
    });

    mainWindow.setMenu(null);

    mainWindow.loadURL(process.env.APP_URL);

    if (process.env.DEBUGGING) {
        // if on DEV or Production with debug enabled
        mainWindow.webContents.openDevTools();
    } else {
        // we're on production; no access to devtools pls
        mainWindow.webContents.on('devtools-opened', () => {
            mainWindow.webContents.closeDevTools();
        });
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function checkUpdate() {
    if (process.platform === 'darwin') {
        autoUpdater.autoDownload = false;
    } else {
        autoUpdater.autoDownload = true;
    }
    autoUpdater.checkForUpdates();
}

app.on('ready', () => {
    createWindow();
    // tray = new Tray(require('path').resolve(__statics, 'favicon-16x16.png'));
    const path = process.env.PROD
        ? require('path').join(__dirname, 'tray-icon.png')
        : require('path').join(__dirname, 'icons/icon-dev.png');
    tray = new Tray(path);
    contextMenu = Menu.buildFromTemplate([
        {
            label: 'Sync Now',
            click: () => {
                mainWindow.webContents.send('Sync');
            },
        },
        {
            label: 'Quit',
            click: () => {
                app.quit();
            },
        },
    ]);

    tray.setToolTip('ClipBroad');
    tray.setIgnoreDoubleClickEvents(true);
    tray.on('right-click', () => {
        tray.popUpContextMenu(contextMenu);
    });
    tray.on('click', () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
        }
    });

    if (process.platform === 'win32') {
        app.setAppUserModelId(app.name);
    }

    app.setAsDefaultProtocolClient('clipbroad');

    checkUpdate();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

app.on('browser-window-blur', () => {
    if (shouldHide) {
        mainWindow.hide();
    }
});

ipcMain.on('hideWindow', () => {
    mainWindow.hide();
});

ipcMain.on('hideIcon', (e, hide) => {
    if (hide) {
        if (process.platform === 'darwin') {
            app.dock.hide();
        } else {
            mainWindow.setSkipTaskbar(true);
        }
    } else {
        if (process.platform === 'darwin') {
            app.dock.show();
        } else {
            mainWindow.setSkipTaskbar(false);
        }
    }
});

ipcMain.on('registerAutoLaunch', (e, enable) => {
    let autoLaunch = new AutoLaunch({
        name: 'ClipBroad',
        path: app.getPath('exe'),
        isHidden: true,
    });
    autoLaunch.isEnabled().then((isEnabled) => {
        if (!isEnabled && enable)
            autoLaunch
                .enable()
                .then(console.log('Auto Launch Enabled!'))
                .catch((error) => console.log(error));
        else if (isEnabled && !enable)
            autoLaunch
                .disable()
                .then(console.log('Auto Launch Disabled!'))
                .catch((error) => console.log(error));
    });
});

ipcMain.handle('registerShortcut', async (e, shortcut) => {
    shortcut = JSON.parse(shortcut);
    var shortcutString = '';
    shortcut.forEach((key) => {
        if (key == 'Meta') {
            shortcutString += '+' + 'Command';
        } else {
            shortcutString += '+' + key;
        }
    });
    shortcutString = shortcutString.substr(1, shortcutString.length - 1);
    return globalShortcut.register(shortcutString, () => {
        mainWindow.show();
    });
});

ipcMain.on('showWindow', (e, show) => {
    show ? mainWindow.show() : mainWindow.hide();
});

ipcMain.on('doNotHide', () => {
    shouldHide = false;
});

ipcMain.on('checkVersion', () => {
    checkUpdate();
});

autoUpdater.on('checking-for-update', () => {
    mainWindow.webContents.send('version-check', {
        message: 'newVersionCheck',
        value: 0,
    });
});

autoUpdater.on('update-available', (info) => {
    mainWindow.webContents.send('version-check', {
        message: 'newVersionAvailable',
        value: info.releaseNotes,
    });
});

autoUpdater.on('update-not-available', () => {
    mainWindow.webContents.send('version-check', {
        message: 'newVersionNotAvailable',
        value: 0,
    });
});

autoUpdater.on('error', (error) => {
    mainWindow.webContents.send('version-check', {
        message: 'error',
        value: JSON.stringify(error),
    });
});

autoUpdater.on('download-progress', (progressObj) => {
    let log_message =
        Math.round(progressObj.percent * 100) / 100 +
        '% (' +
        (progressObj.transferred > 1024 * 1024
            ? Math.round((progressObj.transferred / 1024 / 1024) * 100) / 100 +
              'MB'
            : Math.round((progressObj.transferred / 1024) * 100) / 100 + 'KB') +
        '/' +
        (progressObj.total > 1024 * 1024
            ? Math.round((progressObj.total / 1024 / 1024) * 100) / 100 + 'MB'
            : Math.round((progressObj.total / 1024) * 100) / 100 + 'KB') +
        ') @ ' +
        (progressObj.bytesPerSecond > 1024 * 1024
            ? Math.round((progressObj.bytesPerSecond / 1024 / 1024) * 100) /
                  100 +
              'MB/s'
            : Math.round(progressObj.bytesPerSecond / 1024) + 'KB/s');
    let progressValue = progressObj.percent / 100;
    mainWindow.webContents.send('version-check', {
        message: log_message,
        value: progressValue,
    });
});

autoUpdater.on('update-downloaded', () => {
    autoUpdater.quitAndInstall();
});

powerMonitor.on('resume', () => {
    app.relaunch();
    app.exit();
    mainWindow.hide();
});

powerMonitor.on('unlock-screen', () => {
    app.relaunch();
    app.exit();
    mainWindow.hide();
});

app.on('before-quit', ()=>{
    mainWindow.webContents.send('Sync');
});