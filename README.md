# ClipBroad
[README](https://github.com/dale0525/ClipBroad/blob/main/README.md) | [中文文档](https://github.com/dale0525/ClipBroad/blob/main/README_zh.md)

Sync your clipboard across multiple platforms. [Download the latest release here.](https://github.com/dale0525/ClipBroad/releases)

## Introduction
This tools uses Github private repo to store and sync your clipboard items. By default, it listens to your local clipboard change like other clipboard tools do. After login to Github, local clipboard items will be uploaded to Github on a frequent basis, while remote items will be fetched to local.

*By login to Github, ClipBroad will ask for your **user** and **repo** permission. These permissions are used to get your avatar, username, Github API rate limit, as well as creating a private repository named **ClipBroadHistory** for you, uploading and deleting clipboard items to this repository.*

**Currently only available on Windows, Mac & Android. Linux and iOS should also work, but you need to [build on your own](https://github.com/dale0525/ClipBroad#build).**

## Features
- Free to use
- Record and reuse clipboard history
- Sync clipboard history to Github if login with Github
- Sync through Windows, Mac and Android devices
- Support common binary file formats

## Usage
- Login at the Settings page
- Drag to upload & update on the main page
- On desktop, double click text and image to copy them, or double click other files to save to local
- On mobile, double tap text to copy, or double tap other files to share
- Items are automatically uploaded every 30 seconds
- Click tray icon on desktop to show/hide main panel
- Keyboard shortcut is Control+Shift+V on Windows and Cmd+Shift+V on Mac (configurable)
- Files of common type can be shared to this app (ClipBroad) on mobile

## Screenshots
Android:

<img src="https://github.com/dale0525/ClipBroad/blob/main/screenshot/android.png?raw=true" width="600">

Mac:

<img src="https://github.com/dale0525/ClipBroad/blob/main/screenshot/mac.png?raw=true" width="600">

Windows:

<img src="https://github.com/dale0525/ClipBroad/blob/main/screenshot/win.png?raw=true" width="600">

Github Private Repo:

<img src="https://github.com/dale0525/ClipBroad/blob/main/screenshot/GithubPrivateRepo.png?raw=true" width="600">


## Build
1. Clone this repository
```
git clone https://github.com/dale0525/ClipBroad.git
```
2. Install Quasar
```
$ npm install -g @quasar/cli
```
3. Install node dependencies
```
cd ClipBroad
npm install
cd src-electron
npm install
cd ../src-cordova
npm install
```
4. Modify Github API plugin
```
cd ..
rm node_modules/github-api/dist/components/Repository.js
cp Repository_modified.js node_modules/github-api/dist/components/Repository.js
```
5. Build
```
# Desktop verison
quasar build -m electron [-T darwin] [-T win32] [-T linux]
# Mobile version
quasar build -m cordova [-T android] [-T ios]
```

## TODO
- [x] Settings for max sync item
- [x] Settings for launch on system boot on desktop
- [x] Settings for copied notification
- [x] Settings for network connection on mobile
- [x] About page
- [x] Localization (US, zhCN)
- [x] Delete local item
- [x] Delete related Github item
- [x] Support other common binary files
- [x] Settings for dark mode
- [x] Settings for desktop shortcut
- [x] Search function
- [x] Redirect to app after Github login on mobile
- [ ] Auto update for Windows & Mac
- [ ] Auto update for iOS & Android
- [ ] Upload to App Store(iOS)
- [ ] Upload to Google Play
- [ ] Linux build

## Credits
- [Quasar Framework](https://github.com/quasarframework/quasar)
- [github-tools/github](https://github.com/github-tools/github)
    - *getBlob function at line 212 in node_modules/github-api/dist/components/Repository.js is modified in order to get base64 string for binary files*
    - *_getContentObject function at line 404 in node_modules/github-api/dist/components/Repository.js is modified to avoid duplicate utf8 encoding*
- [j3k0/cordova-plugin-openwith](https://github.com/j3k0/cordova-plugin-openwith)
- [EddyVerbruggen/SocialSharing-PhoneGap-Plugin](https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin)
- [ihadeed/cordova-clipboard](https://github.com/ihadeed/cordova-clipboard)
- [Teamwork/node-auto-launch](https://github.com/Teamwork/node-auto-launch)
- [broofa/mime](https://github.com/broofa/mime)
- [EddyVerbruggen/Custom-URL-scheme](https://github.com/EddyVerbruggen/Custom-URL-scheme)

## Donation
[Paypal](https://paypal.me/logictan)