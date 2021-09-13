# ClipBroad
跨平台同步剪贴板工具。[下载最新版本。](https://github.com/dale0525/ClipBroad/releases)

## 介绍
此工具利用Github私人仓库存储并同步剪贴板。默认情况下，它只会和其他剪贴板工具一样记录剪贴板历史。在授权登录Github后，本地历史记录会被上传到Github私人仓库，并将私人仓库的其他历史记录同步到本地。

*登录Github账号时，ClipBroad会请求获得**user**和**repo**权限。这两个权限将用来获得用户的头像、用户名和Github API次数限制等信息，以及创建一个名为**ClipBroadHistory**的私人仓库，并向这个仓库提交和删除剪贴板内容。*

**目前只支持Windows、Mac和Android。Linux和iOS理论上也支持，但是需要[自行编译](https://github.com/dale0525/ClipBroad#build)。**

## 功能
- 完全免费
- 记录并复用剪贴板历史
- 使用Github登录后，将剪贴板历史同步到Github
- 在Windows、Mac和Android设备间同步
- 支持同步常用文件格式

## 使用方法
- 在设置界面登录Github
- 在主界面下拉可以手动上传和更新记录
- 在桌面端双击文字和图片可将其复制到剪贴板，双击其他文件可保存到本地
- 在移动端双击文字可将其复制到剪贴板，双击其他文件可分享到其他应用
- 每30秒会自动上传到Github
- 单击桌面端图标可显示/隐藏主界面
- 唤起主界面的快捷键为Ctrl+Shift+V(Windows)和Cmd+Shift+V(Mac)(后续版本可配置)
- 移动端可以将常用格式文件分享到本应用(ClipBroad)

## 截图
Android:

<img src="https://github.com/dale0525/ClipBroad/blob/main/screenshot/android.png?raw=true" width="600">

Mac:

<img src="https://github.com/dale0525/ClipBroad/blob/main/screenshot/mac.png?raw=true" width="600">

Windows:

<img src="https://github.com/dale0525/ClipBroad/blob/main/screenshot/win.png?raw=true" width="600">

Github私人仓库:

<img src="https://github.com/dale0525/ClipBroad/blob/main/screenshot/GithubPrivateRepo.png?raw=true" width="600">


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
4. 修改Github API插件
```
cd ..
rm node_modules/github-api/dist/components/Repository.js
cp Repository_modified.js node_modules/github-api/dist/components/Repository.js
```
5. 编译
```
# 桌面版
quasar build -m electron [-T darwin] [-T win32] [-T linux]
# 手机版
quasar build -m cordova [-T android] [-T ios]
```

## 待办
- [x] 设置最大同步条数
- [x] 设置桌面端开机启动
- [x] 设置是否显示已复制的提醒
- [x] 移动端设置网络情况
- [x] 关于页面
- [x] 本地化（中、英）
- [x] 删除本地记录
- [x] 删除对应的Github记录
- [x] 支持常用文件类型
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
- [Quasar Framework](https://github.com/quasarframework/quasar)
- [github-tools/github](https://github.com/github-tools/github)
    - *修改了node_modules/github-api/dist/components/Repository.js文件212行的getBlob方法，以获得二进制文件的base64字符串*
    - *修改了node_modules/github-api/dist/components/Repository.js文件404行的_getContentObject方法，避免重复utf8编码*
- [j3k0/cordova-plugin-openwith](https://github.com/j3k0/cordova-plugin-openwith)
- [EddyVerbruggen/SocialSharing-PhoneGap-Plugin](https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin)
- [ihadeed/cordova-clipboard](https://github.com/ihadeed/cordova-clipboard)
- [Teamwork/node-auto-launch](https://github.com/Teamwork/node-auto-launch)
- [broofa/mime](https://github.com/broofa/mime)

## 赞助
支付宝：

<img src="https://github.com/dale0525/ClipBroad/blob/main/screenshot/donation_alipay.png?raw=true" width="200">

微信：

<img src="https://github.com/dale0525/ClipBroad/blob/main/screenshot/donation_wechat.png?raw=true" width="200">