/**
 * Created by PanJiaChen on 16/11/18.
 */

import { isNumber } from "lodash";
import { Message } from "element-ui";

/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
export function parseTime(time, cFormat) {
  if (arguments.length === 0 || !time) {
    return null;
  }
  const format = cFormat || "{y}-{m}-{d} {h}:{i}:{s}";
  let date;
  if (typeof time === "object") {
    date = time;
  } else {
    if (typeof time === "string") {
      if (/^[0-9]+$/.test(time)) {
        // support "1548221490638"
        time = parseInt(time);
      } else {
        // support safari
        // https://stackoverflow.com/questions/4310953/invalid-date-in-safari
        time = time.replace(new RegExp(/-/gm), "/");
      }
    }

    if (typeof time === "number" && time.toString().length === 10) {
      time = time * 1000;
    }
    date = new Date(time);
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay(),
  };
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key];
    // Note: getDay() returns 0 on Sunday
    if (key === "a") {
      return ["日", "一", "二", "三", "四", "五", "六"][value];
    }
    return value.toString().padStart(2, "0");
  });
  return time_str;
}

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime(time, option) {
  if (("" + time).length === 10) {
    time = parseInt(time) * 1000;
  } else {
    time = +time;
  }
  const d = new Date(time);
  const now = Date.now();

  const diff = (now - d) / 1000;

  if (diff < 30) {
    return "刚刚";
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + "分钟前";
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + "小时前";
  } else if (diff < 3600 * 24 * 2) {
    return "1天前";
  }
  if (option) {
    return parseTime(time, option);
  } else {
    return (
      d.getMonth() +
      1 +
      "月" +
      d.getDate() +
      "日" +
      d.getHours() +
      "时" +
      d.getMinutes() +
      "分"
    );
  }
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function getQueryObject(url) {
  url = url == null ? window.location.href : url;
  const search = url.substring(url.lastIndexOf("?") + 1);
  const obj = {};
  const reg = /([^?&=]+)=([^?&=]*)/g;
  search.replace(reg, (rs, $1, $2) => {
    const name = decodeURIComponent($1);
    let val = decodeURIComponent($2);
    val = String(val);
    obj[name] = val;
    return rs;
  });
  return obj;
}

/**
 * @param {string} input value
 * @returns {number} output value
 */
export function byteLength(str) {
  // returns the byte length of an utf8 string
  let s = str.length;
  for (var i = str.length - 1; i >= 0; i--) {
    const code = str.charCodeAt(i);
    if (code > 0x7f && code <= 0x7ff) s++;
    else if (code > 0x7ff && code <= 0xffff) s += 2;
    if (code >= 0xdc00 && code <= 0xdfff) i--;
  }
  return s;
}

/**
 * @param {Array} actual
 * @returns {Array}
 */
export function cleanArray(actual) {
  const newArray = [];
  for (let i = 0; i < actual.length; i++) {
    if (actual[i]) {
      newArray.push(actual[i]);
    }
  }
  return newArray;
}

/**
 * @param {Object} json
 * @returns {Array}
 */
export function param(json) {
  if (!json) return "";
  return cleanArray(
    Object.keys(json).map((key) => {
      if (json[key] === undefined) return "";
      return encodeURIComponent(key) + "=" + encodeURIComponent(json[key]);
    })
  ).join("&");
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
  const search = decodeURIComponent(url.split("?")[1]).replace(/\+/g, " ");
  if (!search) {
    return {};
  }
  const obj = {};
  const searchArr = search.split("&");
  searchArr.forEach((v) => {
    const index = v.indexOf("=");
    if (index !== -1) {
      const name = v.substring(0, index);
      const val = v.substring(index + 1, v.length);
      obj[name] = val;
    }
  });
  return obj;
}

/**
 * @param {string} val
 * @returns {string}
 */
export function html2Text(val) {
  const div = document.createElement("div");
  div.innerHTML = val;
  return div.textContent || div.innerText;
}

/**
 * Merges two objects, giving the last one precedence
 * @param {Object} target
 * @param {(Object|Array)} source
 * @returns {Object}
 */
export function objectMerge(target, source) {
  if (typeof target !== "object") {
    target = {};
  }
  if (Array.isArray(source)) {
    return source.slice();
  }
  Object.keys(source).forEach((property) => {
    const sourceProperty = source[property];
    if (typeof sourceProperty === "object") {
      target[property] = objectMerge(target[property], sourceProperty);
    } else {
      target[property] = sourceProperty;
    }
  });
  return target;
}

/**
 * @param {HTMLElement} element
 * @param {string} className
 */
export function toggleClass(element, className) {
  if (!element || !className) {
    return;
  }
  let classString = element.className;
  const nameIndex = classString.indexOf(className);
  if (nameIndex === -1) {
    classString += "" + className;
  } else {
    classString =
      classString.substr(0, nameIndex) +
      classString.substr(nameIndex + className.length);
  }
  element.className = classString;
}

/**
 * @param {string} type
 * @returns {Date}
 */
export function getTime(type) {
  if (type === "start") {
    return new Date().getTime() - 3600 * 1000 * 24 * 90;
  } else {
    return new Date(new Date().toDateString());
  }
}

/**
 * @param {Function} func
 * @param {number} wait
 * @param {boolean} immediate
 * @return {*}
 */
export function debounce(func, wait, immediate) {
  let timeout, args, context, timestamp, result;

  const later = function () {
    // 据上一次触发时间间隔
    const last = +new Date() - timestamp;

    // 上次被包装函数被调用时间间隔 last 小于设定时间间隔 wait
    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      }
    }
  };

  return function (...args) {
    context = this;
    timestamp = +new Date();
    const callNow = immediate && !timeout;
    // 如果延时不存在，重新设定延时
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };
}

/**
 * This is just a simple version of deep copy
 * Has a lot of edge cases bug
 * If you want to use a perfect deep copy, use lodash's _.cloneDeep
 * @param {Object} source
 * @returns {Object}
 */
export function deepClone(source) {
  if (!source && typeof source !== "object") {
    throw new Error("error arguments", "deepClone");
  }
  const targetObj = source.constructor === Array ? [] : {};
  Object.keys(source).forEach((keys) => {
    if (source[keys] && typeof source[keys] === "object") {
      targetObj[keys] = deepClone(source[keys]);
    } else {
      targetObj[keys] = source[keys];
    }
  });
  return targetObj;
}

/**
 * @param {Array} arr
 * @returns {Array}
 */
export function uniqueArr(arr) {
  return Array.from(new Set(arr));
}

/**
 * @returns {string}
 */
export function createUniqueString() {
  const timestamp = +new Date() + "";
  const randomNum = parseInt((1 + Math.random()) * 65536) + "";
  return (+(randomNum + timestamp)).toString(32);
}

/**
 * Check if an element has a class
 * @param {HTMLElement} elm
 * @param {string} cls
 * @returns {boolean}
 */
export function hasClass(ele, cls) {
  return !!ele.className.match(new RegExp("(\\s|^)" + cls + "(\\s|$)"));
}

/**
 * Add class to element
 * @param {HTMLElement} elm
 * @param {string} cls
 */
export function addClass(ele, cls) {
  if (!hasClass(ele, cls)) ele.className += " " + cls;
}

/**
 * Remove class from element
 * @param {HTMLElement} elm
 * @param {string} cls
 */
export function removeClass(ele, cls) {
  if (hasClass(ele, cls)) {
    const reg = new RegExp("(\\s|^)" + cls + "(\\s|$)");
    ele.className = ele.className.replace(reg, " ");
  }
}
export function downloadFile(res) {
  const reader = new FileReader();
  reader.readAsText(res.data, "utf-8");
  reader.onload = function (e) {
    const result = e.target.result;
    // 报错 兼容java和.net的情况 系统是两个后端开发
    if (result?.includes("success")) {
      return Message.error(JSON.parse(result).message);
    }
    // 文件返回成功
    const blob = new Blob([res.data]);
    const url = window.URL.createObjectURL(blob);
    const name = decodeURIComponent(
      res.headers["content-disposition"].split("=")[1]
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };
}
export function getTableData(headLlist, bodyList) {
  const head = headLlist.map((item, index) => ({ tit: item[0] }));
  for (let i = 0; i < head.length; i++) {
    for (let j = 0; j < bodyList.length; j++) {
      const value = bodyList[j][i];
      head[i][`k${j}`] = isNumber(value) ? value.toLocaleString() : value;
    }
  }
  return head;
}

/**
 * 数值分隔符
 * @param {*} number
 * @returns
 */
export function transfer(number) {
  // 补全代码
  const arr = String(number).slice().split("").reverse();
  if (number < 999 && number > -999) {
    return String(number);
  } else {
    for (let i = 3; i < arr.length; i = i + 3) {
      arr.splice(i, 0, ",");
      i++;
    }
    return arr.reverse().join("");
  }
}

export function calWeek(startDate, endDate) {
  const sYear = +startDate.substring(2, 4);
  const sSeason = +startDate.substring(5, 6);
  const sWeek = +startDate.substring(7);

  const eYear = +endDate.substring(2, 4);
  const eSeason = +endDate.substring(5, 6);
  const eWeek = +endDate.substring(7);

  const week =
    (eYear - sYear) * 4 * 13 + (eSeason - sSeason) * 13 + (eWeek - sWeek);
  return week;
}

export function calSeason(startDate, endDate) {
  const sYear = +startDate.substring(2, 4);
  const sSeason = +startDate.substring(5, 6);

  const eYear = +endDate.substring(2, 4);
  const eSeason = +endDate.substring(5, 6);

  const season = (eYear - sYear) * 4 + (eSeason - sSeason);
  return season;
}

/**
 * 将公历日期转换成农历日期
 * @param {Date|string|number} date - 公历日期，可以是Date对象、日期字符串或时间戳
 * @returns {Object} 返回农历日期对象，包含年、月、日、天干地支等信息
 */
export function getLunarDate(date) {
  // 农历数据表，从1900年到2100年
  // 每个数据包含该年的农历信息：闰月、闰月天数、12个月天数
  // 数据格式：0x[闰月][闰月天数][12个月天数]
  // 注意：这个数据表可能需要进一步验证和调整
  const lunarInfo = [
    0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
    0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
    0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
    0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
    0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
    0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5d0, 0x14573, 0x052d0, 0x0a9a8, 0x0e950, 0x06aa0,
    0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
    0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b5a0, 0x195a6,
    0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
    0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
    0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
    0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
    0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
    0x05aa0, 0x076a3, 0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
    0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0
  ];

  // 天干
  const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

  // 地支
  const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

  // 生肖
  const zodiacAnimals = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

  // 农历月份
  const lunarMonths = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];

  // 农历日期
  const lunarDays = [
    '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
  ];

  // 节气
  const solarTerms = [
    '小寒', '大寒', '立春', '雨水', '惊蛰', '春分',
    '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
    '小暑', '大暑', '立秋', '处暑', '白露', '秋分',
    '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'
  ];

  // 将输入转换为Date对象
  let inputDate;
  if (date instanceof Date) {
    inputDate = date;
  } else if (typeof date === 'string') {
    inputDate = new Date(date.replace(/-/g, '/'));
  } else if (typeof date === 'number') {
    inputDate = new Date(date);
  } else {
    inputDate = new Date();
  }

  // 检查日期是否有效
  if (isNaN(inputDate.getTime())) {
    throw new Error('无效的日期');
  }

  // 检查日期范围（1900-2100）
  const year = inputDate.getFullYear();
  if (year < 1900 || year > 2100) {
    throw new Error('日期超出范围，仅支持1900-2100年');
  }

  // 计算从1900年1月31日到输入日期的天数
  const baseDate = new Date(1900, 0, 31);
  const offset = Math.floor((inputDate.getTime() - baseDate.getTime()) / (24 * 60 * 60 * 1000));

  // 计算农历年
  let lunarYear = 1900;
  let temp = 0;
  let currentOffset = offset;

  // 遍历农历数据表，找到对应的农历年
  for (let i = 0; i < lunarInfo.length && currentOffset > 0; i++) {
    temp = getLunarYearDays(lunarInfo[i]);
    currentOffset -= temp;
    lunarYear++;
  }

  // 如果超出范围，回退一年
  if (currentOffset < 0) {
    currentOffset += temp;
    lunarYear--;
  }

  // 计算农历月
  let lunarMonth = 1;
  let isLeap = false;
  const leapMonth = getLeapMonth(lunarYear);

  // 遍历12个月，计算农历月
  for (let i = 1; i <= 12 && currentOffset > 0; i++) {
    if (leapMonth > 0 && i === leapMonth + 1) {
      if (!isLeap) {
        isLeap = true;
        i--;
        temp = getLeapDays(lunarYear);
      } else {
        isLeap = false;
        temp = getLunarMonthDays(lunarInfo[lunarYear - 1900], i);
      }
    } else {
      temp = getLunarMonthDays(lunarInfo[lunarYear - 1900], i);
    }
    currentOffset -= temp;
    if (!isLeap) lunarMonth++;
  }

  // 计算农历日
  if (currentOffset === 0 && leapMonth > 0 && lunarMonth === leapMonth + 1) {
    if (isLeap) {
      isLeap = false;
    } else {
      isLeap = true;
      lunarMonth--;
    }
  }
  if (currentOffset < 0) {
    currentOffset += temp;
    lunarMonth--;
  }
  const lunarDay = currentOffset + 1;

  // 计算天干地支年
  const stemYear = (lunarYear - 4) % 10;
  const branchYear = (lunarYear - 4) % 12;
  const yearGZ = heavenlyStems[stemYear] + earthlyBranches[branchYear];

  // 计算生肖
  const zodiac = zodiacAnimals[branchYear];

  // 计算天干地支月
  const monthGZ = getMonthGZ(lunarYear, lunarMonth);

  // 计算天干地支日
  const dayGZ = getDayGZ(inputDate);

  // 获取节气
  const solarTerm = getSolarTerm(inputDate);

  return {
    lunarYear, // 农历年
    lunarMonth, // 农历月
    lunarDay, // 农历日
    isLeap, // 是否闰月
    yearGZ, // 年干支
    monthGZ, // 月干支
    dayGZ, // 日干支
    zodiac, // 生肖
    solarTerm, // 节气
    lunarMonthName: lunarMonths[lunarMonth - 1] + '月', // 农历月份名称
    lunarDayName: lunarDays[lunarDay - 1], // 农历日期名称
    fullName: `${lunarMonths[lunarMonth - 1]}月${lunarDays[lunarDay - 1]}` // 完整农历名称
  };
}

/**
 * 获取农历年总天数
 */
function getLunarYearDays(lunarYear) {
  let sum = 348;
  for (let i = 0x8000; i > 0x8; i >>= 1) {
    sum += (lunarYear & i) ? 1 : 0;
  }
  return sum + getLeapDays(lunarYear);
}

/**
 * 获取农历年闰月天数
 */
function getLeapDays(lunarYear) {
  if (getLeapMonth(lunarYear)) {
    return (lunarYear & 0x10000) ? 30 : 29;
  }
  return 0;
}

/**
 * 获取农历年闰月月份
 */
function getLeapMonth(lunarYear) {
  return lunarYear & 0xf;
}

/**
 * 获取农历月总天数
 */
function getLunarMonthDays(lunarYear, month) {
  return (lunarYear & (0x10000 >> month)) ? 30 : 29;
}

/**
 * 获取月干支
 */
function getMonthGZ(year, month) {
  // 天干
  const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  // 地支
  const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

  const stem = (year * 12 + month + 3) % 10;
  const branch = (month + 1) % 12;
  return heavenlyStems[stem] + earthlyBranches[branch];
}

/**
 * 获取日干支
 */
function getDayGZ(date) {
  // 天干
  const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  // 地支
  const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

  const baseDate = new Date(1900, 0, 1);
  const offset = Math.floor((date.getTime() - baseDate.getTime()) / (24 * 60 * 60 * 1000));
  const stem = (offset + 9) % 10;
  const branch = (offset + 1) % 12;
  return heavenlyStems[stem] + earthlyBranches[branch];
}

/**
 * 获取节气
 */
function getSolarTerm(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // 简化的节气计算（实际应用中可能需要更精确的算法）
  const solarTermDates = [
    [1, 6], [1, 20], [2, 4], [2, 19], [3, 6], [3, 21],
    [4, 5], [4, 20], [5, 6], [5, 21], [6, 6], [6, 22],
    [7, 7], [7, 23], [8, 8], [8, 23], [9, 8], [9, 23],
    [10, 8], [10, 24], [11, 8], [11, 22], [12, 7], [12, 22]
  ];

  // 节气
  const solarTerms = [
    '小寒', '大寒', '立春', '雨水', '惊蛰', '春分',
    '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
    '小暑', '大暑', '立秋', '处暑', '白露', '秋分',
    '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'
  ];

  for (let i = 0; i < solarTermDates.length; i++) {
    if (month + 1 === solarTermDates[i][0] && day === solarTermDates[i][1]) {
      return solarTerms[i];
    }
  }

  return '';
}

/**
 * 将秒数转换为 mm:ss 格式
 * @param {number} seconds - 秒数
 * @returns {string} 返回 mm:ss 格式的时间字符串
 */
export function secondsToMMSS(seconds) {
  if (typeof seconds !== 'number' || seconds < 0 || !isFinite(seconds)) {
    return '00:00';
  }

  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * 将 mm:ss 格式转换为秒数
 * @param {string} timeString - mm:ss 格式的时间字符串
 * @returns {number} 返回秒数
 */
export function mmssToSeconds(timeString) {
  if (typeof timeString !== 'string') {
    return 0;
  }

  // 匹配 mm:ss 格式的正则表达式
  const timeRegex = /^(\d{1,2}):(\d{2})$/;
  const match = timeString.match(timeRegex);

  if (!match) {
    return 0;
  }

  const minutes = parseInt(match[1], 10);
  const seconds = parseInt(match[2], 10);

  // 验证秒数是否在有效范围内
  if (seconds >= 60) {
    return 0;
  }

  return minutes * 60 + seconds;
}

/**
 * 将秒数转换为 hh:mm:ss 格式
 * @param {number} seconds - 秒数
 * @returns {string} 返回 hh:mm:ss 格式的时间字符串
 */
export function secondsToHHMMSS(seconds) {
  if (typeof seconds !== 'number' || seconds < 0 || !isFinite(seconds)) {
    return '00:00:00';
  }

  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}
