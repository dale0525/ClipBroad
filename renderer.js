const electron = require("electron");
const { ipcRenderer, clipboard, remote } = electron;
const GitHub = require("github-api");
const SparkMD5 = require("spark-md5");
const fs = require("fs");
const path = require("path");
const { nativeImage } = require("electron");
var gh;
var ghuser;
var ghrepo;
var ghrepoExist = false;
var username;
var accessToken;
var history = [];
var ghsha;
var container = document.querySelector(".collection");

ipcRenderer.on("accessToken", (e, access_token) => {
    accessToken = access_token;
    gh = new GitHub({
        token: accessToken,
    });
    ghuser = gh.getUser();
    ghuser
        .getProfile()
        .then(({ data }) => {
            username = data.login;
            ghrepo = gh.getRepo(username, "ClipBroadHistory");
            ghrepo
                .getDetails()
                .then(() => {
                    ghrepoExist = true;
                    UpdateFromGithub();
                }) //测试
                // .then(() => ListClipboard())
                .catch((error) => {
                    console.log("Repo is not inited, create one");
                    ghuser
                        .createRepo({
                            name: "ClipBroadHistory",
                            private: true,
                            has_projects: false,
                            has_wiki: false,
                            auto_init: true,
                        })
                        .then(() => {
                            ghrepoExist = true;
                            ghrepo = gh.getRepo(username, "ClipBroadHistory");
                        })
                        // .then(() => ListClipboard())
                        .catch((error) => {
                            console.log(error);
                        });
                });
        })
        .catch((error) => {
            console.log(error);
        });
});

ipcRenderer.on("pullgithub", (e) => {
    UpdateFromGithub();
});

container.addEventListener("dblclick", SelectItem);

function SelectItem(e) {
    let targetClassString = e.target.className;
    let targetClass = targetClassString.split(" ");
    if (targetClass[1] == "cb-png") {
        let imgSrc = e.target.innerHTML.replace('<img src="data:image/png;base64,', '').replace('">', '');
        let buffer = Buffer.from(imgSrc, "base64");
        let image = nativeImage.createFromBuffer(buffer);
        clipboard.writeImage(image);
        ipcRenderer.send("copied", buffer, "image");
    } else if (targetClass[1] == "cb-text") {
        let text = e.target.innerHTML;
        clipboard.writeText(text);
        ipcRenderer.send("copied", text, "text");
    }
}

function UpdateFromGithub() {
    if (!ghrepoExist) return;
    ghrepo.getContents("main", "", true).then(({ data }) => {
        for (let i = 0; i < data.length; i++) {
            (function (i) {
                let name = data[i].name;
                let nameSplit = name.split("-");
                if (nameSplit.length < 2) return;
                let sha = data[i].sha;
                let fileType = nameSplit.length > 2 ? nameSplit[2].split(".")[0] : "text";
                let raw = fileType == 'text' ? true : false;
                ghrepo.getBlob(sha, raw).then(({ data }) => {
                    dataValue = fileType == 'text' ? data : data.content;
                    let oldValue = history.find((item) => item.md5 == nameSplit[1]);
                    let newTime = parseInt(nameSplit[0]);
                    let newMD5 = nameSplit[1];
                    if (oldValue != null && oldValue.time > newTime) return;
                    history = history.filter((item) => item.md5 != newMD5);
                    history.unshift({
                        time: newTime,
                        md5: newMD5,
                        uploaded: true,
                        value: dataValue,
                        type: fileType,
                    });
                    UpdateUl();
                });
            })(i);
        }
    });
}

function CheckClipboard() {
    const text = clipboard.readText();
    const textMD5 = SparkMD5.hash(text);
    const image = clipboard.readImage();
    let imageBuffer;
    let imageMD5;
    if (!image.isEmpty()) {
        imageBuffer = image.toPNG();
        let imageBufferString = imageBuffer.toString("base64");
        imageMD5 = SparkMD5.hash(imageBufferString);
        if (history.length < 1 || history[0].md5 != imageMD5) {
            history = history.filter((item) => item.md5 != imageMD5);
            history.unshift({
                time: new Date().getTime(),
                value: imageBufferString,
                md5: imageMD5,
                uploaded: false,
                type: "image",
            });
            UpdateUl();
        }
    } else if (history.length < 1 || history[0].md5 != textMD5) {
        history = history.filter((item) => item.md5 != textMD5);
        history.unshift({
            time: new Date().getTime(),
            value: text,
            md5: textMD5,
            uploaded: false,
            type: "text",
        });
        UpdateUl();
    }
}

function UpdateUl() {
    while (history.length > 100) {
        history.pop();
    }
    history.sort(function (a, b) {
        var x = a.time;
        var y = b.time;
        return x < y ? 1 : x > y ? -1 : 0;
    });
    container.innerHTML = "";
    const itemCount = history.length;
    for (let i = 0; i < Math.min(itemCount, 100); i++) {
        if (history[i].type == "text") {
            const childElement = document.createElement("a");
            childElement.className = "collection-item cb-text";
            const itemText = document.createTextNode(history[i].value);
            childElement.appendChild(itemText);
            container.appendChild(childElement);
        } else if (history[i].type == "image") {
            const childElement = document.createElement("a");
            childElement.className = "collection-item cb-png";
            const imageNode = document.createElement("img");
            imageNode.src = "data:image/png;base64," + history[i].value;
            childElement.appendChild(imageNode);
            container.appendChild(childElement);
        }
    }
}

function UploadGithub() {
    let treeItems = [];
    let toUpload = [];
    for (let j = 0; j < history.length; j++) {
        if (!history[j].uploaded && history[j].value != "") {
            toUpload.push(history[j]);
            history[j].uploaded = true;
        }
    }
    if (toUpload.length <= 0) {
        console.log("no item to upload");
        return;
    }
    // const tempPath = path.join(remote.app.getPath("temp"), "clipbroad");
    // if (!fs.existsSync(tempPath)) {
    //     fs.mkdirSync(tempPath);
    // }
    for (var i = 0; i < toUpload.length; i++) {
        (function (i) {
            let fileName = toUpload[i].time.toString() + "-" + toUpload[i].md5;
            let content = toUpload[i].value;
            switch (toUpload[i].type) {
                case 'image':
                    fileName += "-image.png"
                    content = Buffer.from(content, "base64");
                    break;
                default:
                    fileName += "-text"
                    break;
            }
            // filePath = path.join(
            //     tempPath,
            //     fileName,
            // );
            // fs.writeFileSync(filePath, toUpload[i].value);
            // console.log("file saved");
            ghrepo
                .createBlob(content)
                .then(({ data }) => {
                    treeItems.push({
                        sha: data.sha,
                        path: fileName,
                        mode: "100644",
                        type: "blob",
                    });
                    if (treeItems.length == toUpload.length) {
                        GetSha()
                            .then((data) => {
                                ghsha = data;
                            })
                            .then(() =>
                                ghrepo.createTree(treeItems, ghsha.commit)
                            )
                            .then(({ data }) => {
                                return ghrepo.commit(
                                    ghsha.parent,
                                    data.sha,
                                    "update"
                                );
                            })
                            .then(({ data }) => {
                                ghrepo.updateHead("heads/main", data.sha, true);
                            })
                            .then(() => {
                                console.log("Upload complete");
                                // fs.rmdir(tempPath, { recursive: true, force: true }, () => {
                                //     console.log("dir deleted");
                                // });
                            })
                            .catch((error) => {
                                console.log(error);
                            });
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        })(i);
    }
}

function GetSha() {
    return new Promise(function (resolve, reject) {
        let refSha;
        let commitSha;

        ghrepo
            .getRef("heads/main")
            .then(({ data }) => {
                refSha = data.object.sha;
            })
            .then(() => ghrepo.getCommit(refSha))
            .then(({ data }) => {
                commitSha = data.tree.sha;
                return resolve({
                    parent: refSha,
                    commit: commitSha,
                });
            })
            .catch((error) => {
                return reject(error);
            });
    });
}

setInterval(() => {
    if (!ghrepoExist) return;
    CheckClipboard();
}, 500);

// setInterval(() => {
//     UploadGithub();
// }, 30000);
