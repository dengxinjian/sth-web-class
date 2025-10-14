/**
 * 辅助工具函数
 */

import { SPORT_TYPE_ICONS, COMPLETION_COLORS } from '../constants'

/**
 * 获取运动类型图标
 * @param {String} sportType 运动类型
 * @returns {String} 图标路径
 */
export function getSportImageIcon(sportType) {
  return SPORT_TYPE_ICONS[sportType] || SPORT_TYPE_ICONS.OTHER
}

/**
 * 根据运动类型获取图标（兼容数字类型）
 * @param {Number|String} sportType 运动类型
 * @returns {String} 图标路径
 */
export function getClassImageIcon(sportType) {
  const typeMap = {
    1: 'CYCLE',
    2: 'RUN',
    3: 'SWIM',
    4: 'STRENGTH',
    5: 'OTHER'
  }
  const type = typeof sportType === 'number' ? typeMap[sportType] : sportType
  return SPORT_TYPE_ICONS[type] || SPORT_TYPE_ICONS.OTHER
}

/**
 * 根据完成百分比获取背景颜色
 * @param {Number} percent 完成百分比
 * @returns {Array} [backgroundColor, textColor]
 */
export function getSportBackgroundColor(percent) {
  if (!percent) return ['#fff', '#333']

  if (percent >= 80 && percent <= 120) {
    return ['#83dfa1', '#fff'] // 绿色 - 完成良好
  } else if (percent < 60) {
    return ['#ffd18d', '#333'] // 浅橙色 - 完成不足
  } else {
    return ['#dc8605', '#fff'] // 深橙色 - 偏离计划
  }
}

/**
 * 计算运动完成度标识
 * @param {Number} percent 完成百分比
 * @returns {String} 完成度标识
 */
export function getCompletionStatus(percent) {
  if (!percent) return ''

  if (percent >= 80 && percent <= 120) {
    return COMPLETION_COLORS.GREEN
  } else if (percent < 60) {
    return COMPLETION_COLORS.SHALLOW_ORANGE
  } else {
    return COMPLETION_COLORS.DEEP_ORANGE
  }
}

/**
 * 判断是否是今天
 * @param {String} date 日期字符串 YYYY-MM-DD
 * @returns {Boolean}
 */
export function isToday(date) {
  const today = new Date()
    .toLocaleDateString('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    .replace(/\//g, '-')
  return date === today
}

/**
 * 按行截断文本
 * @param {String} text 文本内容
 * @param {Number} maxLines 最大行数
 * @returns {String} 截断后的文本
 */
export function truncateByLines(text, maxLines = 3) {
  if (!text) return ''
  const lines = text.split('\n')
  if (lines.length <= maxLines) return text
  return lines.slice(0, maxLines).join('\n') + '...'
}

/**
 * 格式化日期为 YYYY-MM-DD
 * @param {Date|String} date 日期
 * @returns {String}
 */
export function formatDate(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 获取设备品牌图标
 * @param {Number} deviceType 设备类型
 * @returns {String} 图标路径
 */
export function getDeviceBrandIcon(deviceType) {
  const iconMap = {
    1: require('@/assets/addClass/device-coros.png'),
    2: require('@/assets/addClass/device-garmin.png'),
    3: require('@/assets/addClass/device-garmin.png'),
    4: require('@/assets/addClass/device-zepp.png'),
    5: require('@/assets/addClass/device-suunto.png'),
    6: require('@/assets/addClass/device-suunto.png')
  }
  return iconMap[deviceType] || ''
}

/**
 * 检查课程是否过期
 * @param {String} date 日期 YYYY-MM-DD
 * @returns {Boolean}
 */
export function isExpired(date) {
  const today = new Date().toISOString().split('T')[0]
  return date < today
}

/**
 * 解析课程JSON
 * @param {String} jsonString JSON字符串
 * @returns {Object} 解析后的对象
 */
export function parseClassesJson(jsonString) {
  try {
    return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString
  } catch (e) {
    console.error('解析课程JSON失败:', e)
    return {}
  }
}

/**
 * 判断运动类型是否匹配
 * @param {String} classType 课程类型
 * @param {Number} activityType 运动类型（数字）
 * @returns {Boolean}
 */
export function isSportTypeMatch(classType, activityType) {
  const activityTypeMap = {
    1: 'CYCLE',
    2: 'RUN',
    3: 'SWIM',
    4: 'STRENGTH',
    5: 'OTHER'
  }
  return classType === activityTypeMap[activityType]
}

/**
 * 生成排序数据
 * @param {Array} items 项目列表
 * @returns {Array} 排序数据 [{id, sort}]
 */
export function generateSortData(items) {
  return items.map((item, index) => ({
    id: item.id,
    sort: index
  }))
}

