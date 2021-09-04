#!/bin/bash
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore dist/cordova/android/apk/release/app-release-unsigned.apk alias_name
~/Library/Android/sdk/build-tools/30.0.2/zipalign -v 4 dist/cordova/android/apk/release/app-release-unsigned.apk dist/cordova/android/apk/release/ClipBroad.apk