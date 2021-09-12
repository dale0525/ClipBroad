import {
    app,
    BrowserWindow,
    nativeTheme,
    Tray,
    Menu,
    ipcMain,
    globalShortcut,
} from 'electron';
import path from 'path';
const AutoLaunch = require('auto-launch');

try {
    if (
        process.platform === 'win32' &&
        nativeTheme.shouldUseDarkColors === true
    ) {
        require('fs').unlinkSync(
            require('path').join(app.getPath('userData'), 'DevTools Extensions')
        );
    }
    if (process.env.PROD) {
        global.__statics = __dirname;
    }
} catch (_) {}

let mainWindow;
let tray = null;
let contextMenu = null;

function createWindow() {
    /**
     * Initial window options
     */
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        useContentSize: true,
        frame: process.env.PROD ? false : true,
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

app.on('ready', () => {
    createWindow();
    // tray = new Tray(require('path').resolve(__statics, 'favicon-16x16.png'));
    const path = process.env.PROD
        ? require('path').resolve(__statics, 'tray-icon.png')
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

    globalShortcut.register('CommandOrControl+Shift+V', () => {
        mainWindow.show();
    });
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

// app.on('browser-window-blur', () => {
//     mainWindow.hide();
// });

ipcMain.on('hideWindow', () => {
    mainWindow.hide();
});

ipcMain.on('hideIcon', (e, hide) => {
    if (process.platform !== 'darwin') return;
    if (hide) {
        app.dock.hide();
    } else {
        app.dock.show();
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
