/**
 * 构建后生成版本文件，版本號從 prepare-version.js 產生，確保與 VUE_APP_VERSION 一致
 */
const fs = require('fs')
const path = require('path')

// 從 prepare-version.js 產生的版本檔讀取
const sourceVersionFile = path.join(__dirname, 'version-timestamp.json')
const version = (() => {
  try {
    const content = fs.readFileSync(sourceVersionFile, 'utf8')
    return JSON.parse(content).version
  } catch {
    return new Date().getTime().toString()
  }
})()
const versionInfo = {
  version: version,
  buildTime: new Date().toISOString(),
  environment: process.env.NODE_ENV || 'production'
}

// 确保dist目录存在
const distDir = path.join(__dirname, 'dist')
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true })
}

// 写入版本文件
const versionFile = path.join(distDir, 'version.json')
fs.writeFileSync(versionFile, JSON.stringify(versionInfo, null, 2))

console.log('✅ 版本文件已生成:', versionFile)
console.log('📋 版本信息:', versionInfo)
