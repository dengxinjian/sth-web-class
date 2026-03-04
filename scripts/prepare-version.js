/**
 * 建置前預先產生版本號，確保 VUE_APP_VERSION 與 version.json 一致
 */
const fs = require('fs')
const path = require('path')

const version = new Date().getTime().toString()
const versionFile = path.join(__dirname, '..', 'version-timestamp.json')

fs.writeFileSync(versionFile, JSON.stringify({ version }, null, 2))
console.log('📌 版本號已生成:', version)
