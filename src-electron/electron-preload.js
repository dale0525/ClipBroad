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
    writeClipboardText: (text) => {
        clipboard.writeText(text);
    },
    writeClipboardHTML: (html) => {
        clipboard.writeHTML(html);
    },
    writeClipboardImage: (imageString) => {
        const buffer = Buffer.from(imageString, 'base64');
        const image = nativeImage.createFromBuffer(buffer);
        clipboard.writeImage(image);
    },
    readClipboard: (maxFileSize) => {
        if (process.platform === 'darwin') {
            // if (clipboard.has('NSFilenamesPboardType')) {
            //     console.log('multiple files found');
            //     return null; // do not handle multiple files
            if (!clipboard.has('public.file-url')) {
                let image = clipboard.readImage();
                if (image != null && !image.isEmpty()) {
                    return {
                        type: 'png',
                        value: image.toPNG().toString('base64'),
                        fileName: null,
                    };
                }
                let html = clipboard.readHTML();
                if (html != null && html != '') {
                    let temporalDivElement = document.createElement('div');
                    temporalDivElement.innerHTML = html;
                    let aNode = temporalDivElement.querySelector('a');
                    if (aNode != null) {
                        return {
                            type: 'txt',
                            value: aNode.href,
                            fileName: null,
                        };
                    } else {
                        html =
                            html.substr(0, "<meta charset='utf-8'>".length) ==
                            "<meta charset='utf-8'>"
                                ? html.replace("<meta charset='utf-8'>", '')
                                : html;
                        if (html.substr(0, 1) == '<') {
                            return {
                                type: 'html',
                                value: html,
                                fileName: null,
                            };
                        }
                    }
                }
                let text = clipboard.readText();
                if (text != null && text != '') {
                    return { type: 'txt', value: text, fileName: null };
                }
                return null;
            } else {
                let filePath = clipboard
                    .read('public.file-url')
                    .replace('file://', '');
                filePath = decodeURI(filePath);
                const fs = require('fs');
                if (
                    !fs.existsSync(filePath) ||
                    fs.statSync(filePath).size / (1024 * 1024) > maxFileSize
                )
                    return null;
                let filePathSplit = filePath.split('/');
                let fileNameFull = filePathSplit[filePathSplit.length - 1];
                let fileNameFullSplit = fileNameFull.split('.');
                let fileExt = fileNameFullSplit[fileNameFullSplit.length - 1];
                let fileName = fileNameFull.replace('.' + fileExt, '');
                return {
                    type: fileExt,
                    value: require('fs').readFileSync(filePath, {
                        encoding: 'base64',
                    }),
                    fileName: fileName,
                };
            }
        } else {
            //electron no longer supports CF_HDROP, so multiple files cannot be detected
            if (!clipboard.has('FileNameW')) {
                let image = clipboard.readImage();
                if (image != null && !image.isEmpty()) {
                    return {
                        type: 'png',
                        value: image.toPNG().toString('base64'),
                        fileName: null,
                    };
                }
                let html = clipboard.readHTML();
                if (html != null && html != '') {
                    let temporalDivElement = document.createElement('div');
                    temporalDivElement.innerHTML = html;
                    let aNode = temporalDivElement.querySelector('a');
                    if (aNode != null) {
                        return {
                            type: 'txt',
                            value: aNode.href,
                            fileName: null,
                        };
                    } else if (html.substr(0, 1) == '<') {
                        return {
                            type: 'html',
                            value: html,
                            fileName: null,
                        };
                    }
                }
                let text = clipboard.readText();
                if (text != null && text != '') {
                    return { type: 'txt', value: text, fileName: null };
                }
                return null;
            } else {
                let filePath = clipboard
                    .readBuffer('FileNameW')
                    .toString('ucs2')
                    .replace(RegExp(String.fromCharCode(0), 'g'), '');
                const fs = require('fs');
                if (
                    !fs.existsSync(filePath) ||
                    fs.statSync(filePath).size / (1024 * 1024) > maxFileSize
                )
                    return null;
                let filePathSplit = filePath.split('\\');
                let fileNameFull = filePathSplit[filePathSplit.length - 1];
                let fileNameFullSplit = fileNameFull.split('.');
                let fileExt = fileNameFullSplit[fileNameFullSplit.length - 1];
                let fileName = fileNameFull.replace('.' + fileExt, '');
                return {
                    type: fileExt,
                    value: require('fs').readFileSync(filePath, {
                        encoding: 'base64',
                    }),
                    fileName: fileName,
                };
            }
        }
    },
    clearClipboard: () => {
        clipboard.clear();
    },
    isDarkMode: () => {
        return remote.nativeTheme.shouldUseDarkColors;
    },
    hideWindow: () => {
        ipcRenderer.send('hideWindow');
    },
    showNotification: (title, caption = null) => {
        new Notification(title, caption == null ? null : { body: caption });
    },
    setHideIcon: (hide) => {
        ipcRenderer.send('hideIcon', hide);
    },
    registerAutoLaunch: (enable) => {
        ipcRenderer.send('registerAutoLaunch', enable);
    },
});

ipcRenderer.on('Sync', () => {
    var evt = new CustomEvent('Sync');
    window.dispatchEvent(evt);
});
