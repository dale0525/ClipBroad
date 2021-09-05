# ClipBroad
跨平台同步剪贴板工具。[下载最新版本。](https://github.com/dale0525/ClipBroad/releases)

## 介绍
此工具利用Github私人仓库存储并同步剪贴板。默认情况下，它只会和其他剪贴板工具一样记录剪贴板历史。在授权登录Github后，本地历史记录会被上传到Github私人仓库，并将私人仓库的其他历史记录同步到本地。

**当前只支持文字和图片**

*当前版本只是个人使用的早期版本。尽管本工具耗费的设备占用和电量很低，但在同步时会消耗流量。请酌情使用。*

**目前只支持Windows、Mac和Android。Linux和iOS理论上也支持，但是需要[自行编译](https://github.com/dale0525/ClipBroad#build)。**

## 使用方法
- 在设置界面登录Github
- 在主界面下拉可以手动上传和更新记录
- 在桌面端双击任一记录可将其复制到剪贴板
- 在移动端双击文字可将其复制到剪贴板，双击图片可分享到其他应用
- 每30秒会自动上传到Github(后续版本可配置)
- 单击桌面端图标可显示/隐藏主界面
- 唤起主界面的快捷键为Ctrl+Shift+V(Windows)和Cmd+Shift+V(Mac)(后续版本可配置)
- 移动端无法将图片复制进剪贴板，但可以分享图片到本应用(ClipBroad)

## 截图
Android:

![](https://github.com/dale0525/ClipBroad/blob/3f675dad97854aebab2d3e357c1fe55501758a74/screenshot/android.png)

Mac:

![](https://github.com/dale0525/ClipBroad/blob/3f675dad97854aebab2d3e357c1fe55501758a74/screenshot/mac.png)

Windows:

![](https://github.com/dale0525/ClipBroad/blob/3f675dad97854aebab2d3e357c1fe55501758a74/screenshot/win.png)

Github私人仓库:

![](https://github.com/dale0525/ClipBroad/blob/d7c47d37ba073998caa1c8bfda457d23acd7f135/screenshot/GithubPrivateRepo.png)


## 编译
1. 复制此仓库
```
git clone https://github.com/dale0525/ClipBroad.git
```
2. 安装Quasar
```
$ npm install -g @quasar/cli
```
3. 安装依赖库
```
cd ClipBroad
npm install
cd src-electron
npm install
cd ../src-cordova
npm install
```
4. 编译
```
cd ..
# 桌面版
quasar build -m electron [-T darwin] [-T win32] [-T linux]
# 手机版
quasar build -m cordova [-T android] [-T ios]
```

## 待办
- [ ] 设置最大同步条数
- [ ] 设置桌面端开机启动
- [ ] 设置是否显示已复制的提醒
- [ ] 设置上传间隔
- [ ] 移动端设置网络情况
- [ ] 关于页面
- [ ] 本地化（中、英）
- [ ] 删除本地记录
- [ ] 删除对应的Github记录
- [ ] 支持常用文件类型
- [ ] 设置夜间模式
- [ ] 设置唤起快捷键
- [ ] 搜索功能
- [ ] 移动端登录Github后自动跳转到APP
- [ ] 桌面端自动更新
- [ ] 移动端自动更新
- [ ] 提交iOS应用商店
- [ ] 提交Google Play
- [ ] Linux打包

## 感谢
1. [Quasar Framework](https://github.com/quasarframework/quasar)
2. [github-tools/github](https://github.com/github-tools/github)
    - *修改了node_modules/github-api/dist/components/Repository.js文件212行的getBlob方法，以获得二进制文件的base64字符串*
    - *修改了node_modules/github-api/dist/components/Repository.js文件404行的_getContentObject方法，避免重复utf8编码*
3. [j3k0/cordova-plugin-openwith](https://github.com/j3k0/cordova-plugin-openwith)
4. [EddyVerbruggen/SocialSharing-PhoneGap-Plugin](https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin)
5. [ihadeed/cordova-clipboard](https://github.com/ihadeed/cordova-clipboard)