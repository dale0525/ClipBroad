/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src-electron/electron-preload.js":
/*!******************************************!*\
  !*** ./src-electron/electron-preload.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

eval("/**\n * This file is used specifically for security reasons.\n * Here you can access Nodejs stuff and inject functionality into\n * the renderer thread (accessible there through the \"window\" object)\n *\n * WARNING!\n * If you import anything from node_modules, then make sure that the package is specified\n * in package.json > dependencies and NOT in devDependencies\n *\n * Example (injects window.myAPI.doAThing() into renderer thread):\n *\n *   import { contextBridge } from 'electron'\n *\n *   contextBridge.exposeInMainWorld('myAPI', {\n *     doAThing: () => {}\n *   })\n */\nconst {\n  clipboard,\n  contextBridge,\n  nativeImage,\n  remote,\n  ipcRenderer\n} = __webpack_require__(/*! electron */ \"electron\");\n\ncontextBridge.exposeInMainWorld('myAPI', {\n  readClipboardText: () => {\n    return clipboard.readText();\n  },\n  writeClipboardText: text => {\n    clipboard.writeText(text);\n  },\n  readClipboardImage: () => {\n    const image = clipboard.readImage();\n    return image.isEmpty() ? null : image.toPNG().toString('base64');\n  },\n  writeClipboardImage: imageString => {\n    const buffer = Buffer.from(imageString, 'base64');\n    const image = nativeImage.createFromBuffer(buffer);\n    clipboard.writeImage(image);\n  },\n  isDarkMode: () => {\n    return remote.nativeTheme.shouldUseDarkColors;\n  },\n  hideWindow: () => {\n    ipcRenderer.send('hideWindow');\n  }\n});\nipcRenderer.on('Sync', () => {\n  var evt = new CustomEvent('Sync');\n  window.dispatchEvent(evt);\n});\n\n//# sourceURL=webpack://clipbroad/./src-electron/electron-preload.js?");

/***/ }),

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("electron");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src-electron/electron-preload.js");
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;