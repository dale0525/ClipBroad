/**
 * This file is used specifically for security reasons.
 * Here you can access Nodejs stuff and inject functionality into
 * the renderer thread (accessible there through the "window" object)
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 *
 * Example (injects window.myAPI.doAThing() into renderer thread):
 *
 *   import { contextBridge } from 'electron'
 *
 *   contextBridge.exposeInMainWorld('myAPI', {
 *     doAThing: () => {}
 *   })
 */
const {
    clipboard,
    contextBridge,
    nativeImage,
    remote,
    ipcRenderer,
} = require('electron');
contextBridge.exposeInMainWorld('myAPI', {
    readClipboardText: () => {
        return clipboard.readText();
    },
    writeClipboardText: (text) => {
        clipboard.writeText(text);
    },
    readClipboardImage: () => {
        const image = clipboard.readImage();
        return image.isEmpty() ? null : image.toPNG().toString('base64');
    },
    writeClipboardImage: (imageString) => {
        const buffer = Buffer.from(imageString, 'base64');
        const image = nativeImage.createFromBuffer(buffer);
        clipboard.writeImage(image);
    },
    isDarkMode: () => {
        return remote.nativeTheme.shouldUseDarkColors;
    },
    hideWindow: () => {
        ipcRenderer.send('hideWindow');
    },
    showNotification: (title, caption = null)=>{
        new Notification(title, caption == null ? null : { body: caption });
    },
    setHideIcon: (hide)=>{
        ipcRenderer.send('hideIcon', hide);
    }
});

ipcRenderer.on('Sync', () => {
    var evt = new CustomEvent('Sync');
    window.dispatchEvent(evt);
});
