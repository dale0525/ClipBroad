# ClipBroad
 Sync your clipboard across multiple platforms

## TODO
- [ ] Settings for max sync item
- [ ] Settings for launch on system boot on desktop
- [ ] Settings for copied notification
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