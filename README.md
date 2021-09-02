# ClipBroad
 Sync your clipboard across multiple platforms

*1. getBlob function at line 212 in node_modules/github-api/dist/components/Repository.js is modified in order to get base64 string for binary files*
*2. _getContentObject function at line 404 in node_modules/github-api/dist/components/Repository.js is modified to avoid duplicate utf8 encoding*