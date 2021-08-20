const electron = require("electron");
const url = require("url");
const path = require("path");
const keytar = require("keytar");

const GITHUB_CLIENT_ID = "fa79756f53d8c0a88ddd";
const GITHUB_CLIENT_SECRET = "e3e61961e0cba97ac6b93082a72496b56b0d30d5";

const { app, BrowserWindow, ipcMain, Notification } = electron;
const { getAccessToken } = require("@electron-utils/electron-oauth-github");
const { Tray } = require("electron");

let mainWindow;
let tray = null;

// Listen app to be ready
app.on("ready", () => {
    // keytar.deletePassword('ClipBroad', 'github');

    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });
    // mainWindow.hide();
    mainWindow.webContents.openDevTools();

    tray = new Tray("./icon/icon.png");
    tray.on("click", () => {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    });

    mainWindow.on("show", () => {
        mainWindow.webContents.send("pullgithub");
    });
    keytar.getPassword("ClipBroad", "github").then((result) => {
        if (result == null) {
            mainWindow.loadURL(
                url.format({
                    pathname: path.join(__dirname, "authWindow.html"),
                    protocol: "file:",
                    slashes: true,
                })
            );
        } else {
            mainWindow.loadURL(
                url.format({
                    pathname: path.join(__dirname, "mainWindow.html"),
                    protocol: "file:",
                    slashes: true,
                })
            );
            mainWindow.webContents.on("did-finish-load", () => {
                mainWindow.webContents.send("accessToken", result);
            });
        }
    });
});

ipcMain.on("login", async (e) => {
    try {
        const { access_token } = await getAccessToken({
            clientId: GITHUB_CLIENT_ID,
            clientSecret: GITHUB_CLIENT_SECRET,
            redirectUri: "http://localhost:3000/auth/github/callback",
            scope: "repo",
        });

        keytar.setPassword("ClipBroad", "github", access_token).then(() => {
            mainWindow.loadURL(
                url.format({
                    pathname: path.join(__dirname, "mainWindow.html"),
                    protocol: "file:",
                    slashes: true,
                })
            );
            mainWindow.webContents.on("did-finish-load", () => {
                mainWindow.webContents.send("accessToken", access_token);
            });
        });
    } catch (error) {
        console.log("error happened");
        console.log(error);
    }
});

ipcMain.on("copied", (e, content, type) => {
    mainWindow.hide();
    switch (type) {
        case "text":
            new Notification({ title: "Text Copied!", body: content }).show();
            break;
        case "image":
            new Notification({ title: "Image Copied!"}).show();
            break;
        default:
            break;
    }
});
