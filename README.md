# ClipBroad
[README](https://github.com/dale0525/ClipBroad/blob/main/README.md) | [中文文档](https://github.com/dale0525/ClipBroad/blob/main/README_zh.md)

Sync your clipboard across multiple platforms. [Download the latest release here.](https://github.com/dale0525/ClipBroad/releases)

## Introduction
This tools uses Github private repo to store and sync your clipboard items. By default, it listens to your local clipboard change like other clipboard tools do. After login to Github, local clipboard items will be uploaded to Github on a frequent basis, while remote items will be fetched to local.

**Currently only text and images are supported**

*This is a very early version solely for personal use. Though CPU/RAM/Battery usages are very low, it may consume network traffic during sync process. Use on your own risk.*

**Currently only available on Windows, Mac & Android. Linux and iOS should also work, but you need to [build on your own](https://github.com/dale0525/ClipBroad#build).**

## Usage
- Login at the Settings page
- Drag to upload & update on the main page
- Double click to copy item on desktop
- Double tap to copy text or share image on mobile
- Items are automatically uploaded every 30 seconds (will be configurable in the future)
- Click tray icon on desktop to show/hide main panel
- Keyboard shortcut is Control+Shift+V on Windows and Cmd+Shift+V on Mac (will be configurable in the future)
- Images on mobile are not in clipboard, but can be shared to this app (ClipBroad)

## Screenshots
Android:

![](https://github.com/dale0525/ClipBroad/blob/3f675dad97854aebab2d3e357c1fe55501758a74/screenshot/android.png)

Mac:

![](https://github.com/dale0525/ClipBroad/blob/3f675dad97854aebab2d3e357c1fe55501758a74/screenshot/mac.png)

Windows:

![](https://github.com/dale0525/ClipBroad/blob/3f675dad97854aebab2d3e357c1fe55501758a74/screenshot/win.png)

Github Private Repo:

![](https://github.com/dale0525/ClipBroad/blob/d7c47d37ba073998caa1c8bfda457d23acd7f135/screenshot/GithubPrivateRepo.png)


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
4. Build
```
cd ..
# Desktop verison
quasar build -m electron [-T darwin] [-T win32] [-T linux]
# Mobile version
quasar build -m cordova [-T android] [-T ios]
```

## TODO
- [ ] Settings for max sync item
- [ ] Settings for launch on system boot on desktop
- [ ] Settings for copied notification
- [ ] Settings for upload interval
- [ ] Settings for network connection on mobile
- [ ] About page
- [ ] Localization (US, zhCN)
- [ ] Delete local item
- [ ] Delete related Github item
- [ ] Support other common binary files
- [ ] Settings for dark mode
- [ ] Settings for desktop shortcut
- [ ] Search function
- [ ] Redirect to app after Github login on mobile
- [ ] Auto update for Windows & Mac
- [ ] Auto update for iOS & Android
- [ ] Upload to App Store(iOS)
- [ ] Upload to Google Play
- [ ] Linux build

## Credits
1. [Quasar Framework](https://github.com/quasarframework/quasar)
2. [github-tools/github](https://github.com/github-tools/github)
    - *getBlob function at line 212 in node_modules/github-api/dist/components/Repository.js is modified in order to get base64 string for binary files*
    - *_getContentObject function at line 404 in node_modules/github-api/dist/components/Repository.js is modified to avoid duplicate utf8 encoding*
3. [j3k0/cordova-plugin-openwith](https://github.com/j3k0/cordova-plugin-openwith)
4. [EddyVerbruggen/SocialSharing-PhoneGap-Plugin](https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin)
5. [ihadeed/cordova-clipboard](https://github.com/ihadeed/cordova-clipboard)