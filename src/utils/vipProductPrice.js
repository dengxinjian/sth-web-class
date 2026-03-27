import { getData } from "@/api/common"

export const VIP_PRODUCT_PRICE_KEYS = Object.freeze({
  vipEliteMonthly: "VIP_R_M1",
  vipEliteYearly: "VIP_R_Y1",
  vipProMonthly: "VIP_C_M1",
  vipProYearly: "VIP_C_Y1",
  coachSeat: "SEAT_COACH",
  athleteSeat: "SEAT_ATHLETE",
})

export const DEFAULT_VIP_PRODUCT_PRICE_FEN_MAP = Object.freeze({
  [VIP_PRODUCT_PRICE_KEYS.vipEliteMonthly]: 5000,
  [VIP_PRODUCT_PRICE_KEYS.vipEliteYearly]: 36500,
  [VIP_PRODUCT_PRICE_KEYS.vipProMonthly]: 8000,
  [VIP_PRODUCT_PRICE_KEYS.vipProYearly]: 64800,
  [VIP_PRODUCT_PRICE_KEYS.coachSeat]: 9900,
  [VIP_PRODUCT_PRICE_KEYS.athleteSeat]: 5000,
})

function normalizePriceFen(value) {
  const priceFen = Number(value)
  if (!Number.isFinite(priceFen) || priceFen < 0) {
    return null
  }
  return Math.round(priceFen)
}

function buildPriceMap(list = []) {
  return list.reduce((acc, item) => {
    const priceKey = String(item?.priceKey || "")
    const priceFen = normalizePriceFen(item?.priceFen)
    if (!priceKey || priceFen === null) {
      return acc
    }
    acc[priceKey] = {
      ...item,
      priceFen,
    }
    return acc
  }, {})
}

export function getDefaultPriceFen(priceKey) {
  return DEFAULT_VIP_PRODUCT_PRICE_FEN_MAP[priceKey] ?? 0
}

export function getProductPriceFen(priceMap, priceKey) {
  return priceMap?.[priceKey]?.priceFen ?? getDefaultPriceFen(priceKey)
}

export function priceFenToYuanNumber(priceFen) {
  const normalizedPriceFen = normalizePriceFen(priceFen)
  if (normalizedPriceFen === null) {
    return 0
  }
  return normalizedPriceFen / 100
}

export function formatPriceFen(priceFen) {
  const amount = priceFenToYuanNumber(priceFen)
  return Number.isInteger(amount)
    ? String(amount)
    : amount.toFixed(2).replace(/\.?0+$/, "")
}

export async function getVipProductPriceMap(options = {}) {
  const { systemType = "web" } = options
  const res = await getData({
    url: "operate/api/vipProductPrice/list",
    systemType,
  })
  return buildPriceMap(Array.isArray(res?.result) ? res.result : [])
}
