export type KpiKey = "受注" | "面談" | "提案" | "アポ"

export const KPI_KEYS: KpiKey[] = ["受注", "面談", "提案", "アポ"]

// 期初=11月、期末=翌10月。配列の並びも 11月始まりに統一する。
export const MONTHS = [
  "11月",
  "12月",
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
]

// 年度（11月〜翌10月）。2023年度 = 2023年11月〜2024年10月。
export const YEARS = [2023, 2024, 2025] as const
export type Year = (typeof YEARS)[number]

// 最新（進行中）年度と前年度
export const CURRENT_FY: Year = 2025
export const PREV_FY: Year = 2024

export const fyLabel = (y: number) => `${y}年度`

export type KpiSeries = Record<Year, (number | null)[]>

// 暦年データを年度（11月始まり）へ再マッピング済み。
// 2023年度の 11月/12月（2023年）は未取得のため null。
// 2025年度の 7月〜10月（2026年）は未到来のため null。
export const BASE: Record<KpiKey, KpiSeries> = {
  受注: {
    2023: [null, null, 20, 18, 27, 12, 20, 18, 29, 32, 31, 26],
    2024: [16, 36, 22, 23, 23, 12, 26, 21, 20, 22, 23, 20],
    2025: [16, 25, 35, 27, 34, 29, 14, 27, null, null, null, null],
  },
  面談: {
    2023: [null, null, 101, 126, 139, 102, 147, 147, 190, 170, 153, 126],
    2024: [112, 187, 131, 155, 134, 102, 139, 103, 127, 122, 113, 133],
    2025: [118, 133, 164, 113, 139, 137, 96, 117, null, null, null, null],
  },
  提案: {
    2023: [null, null, 478, 370, 578, 693, 707, 894, 771, 636, 344, 478],
    2024: [563, 603, 514, 503, 664, 487, 832, 928, 1713, 1555, 1317, 1467],
    2025: [1124, 1406, 1717, 1627, 1504, 1356, 1764, 2067, null, null, null, null],
  },
  アポ: {
    2023: [null, null, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    2024: [0, 0, 0, 0, 0, 0, 1, 148, 388, 268, 313, 293],
    2025: [275, 359, 323, 568, 536, 719, 484, 342, null, null, null, null],
  },
}

export const INSIGHTS: Record<KpiKey, string> = {
  受注:
    "期初（11・12月）は安定。2025年度は1月35件と好スタートも5月14件まで失速。年度累計は前年度同期比で回復傾向。",
  面談:
    "2024年度以降、月平均が低下傾向で推移。2025年度5月の96件は直近最低値。期初からの面談積み上げに課題。",
  提案:
    "2024年度後半から月1,000件超が定常化。2025年度も高水準を維持するが、受注への転換率は低下傾向。",
  アポ:
    "本格計測は2024年度後半から。2025年度は期初から高水準で推移し、前年度同期比で大幅増。",
}

export const STORAGE_KEY = "si_kpi_fy_v3"
export const STORAGE_TS_KEY = "si_kpi_fy_v3_ts"

/** localStorage に保存される最新年度の上書きデータ */
export type ExtraData = Partial<Record<KpiKey, (number | null)[]>>

export function loadExtra(): ExtraData {
  if (typeof window === "undefined") return {}
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as ExtraData
  } catch {
    return {}
  }
}

export function saveExtra(obj: ExtraData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj))
  const ts = new Date().toLocaleString("ja-JP", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
  localStorage.setItem(STORAGE_TS_KEY, ts)
  return ts
}

/** BASE に localStorage の上書き（最新年度分）をマージした実データを返す */
export function getMergedData(extra: ExtraData): Record<KpiKey, KpiSeries> {
  const d: Record<KpiKey, KpiSeries> = JSON.parse(JSON.stringify(BASE))
  ;(Object.keys(extra) as KpiKey[]).forEach((kpi) => {
    if (!d[kpi]) return
    extra[kpi]?.forEach((v, i) => {
      if (v !== null && v !== undefined) d[kpi][CURRENT_FY][i] = v
    })
  })
  return d
}

export function sum(arr: (number | null)[]): number {
  return arr.reduce<number>((a, v) => a + (v || 0), 0)
}

/** 前年度同期比（％）。比較不能なら null */
export function yoyDiff(cur: (number | null)[], prev: (number | null)[]): number | null {
  const n = cur.filter((v) => v !== null).length
  const c = sum(cur.slice(0, n))
  const p = sum(prev.slice(0, n))
  if (!p) return null
  return Math.round(((c - p) / p) * 100)
}
