"use client"

import { CURRENT_FY, KPI_KEYS, PREV_FY, type KpiKey, type KpiSeries, sum, yoyDiff } from "@/lib/kpi-data"

function Card({ kpi, series }: { kpi: KpiKey; series: KpiSeries }) {
  const cur = series[CURRENT_FY]
  const prev = series[PREV_FY]
  const n = cur.filter((v) => v !== null).length
  const total = sum(cur.slice(0, n))
  const diff = yoyDiff(cur, prev)

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-4">
      <span className="absolute inset-x-0 top-0 h-[3px] bg-brand-red" aria-hidden />
      <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {kpi}（2025年度累計）
      </div>
      <div className="text-3xl font-bold leading-none text-brand-dark">
        {total.toLocaleString()}
        <span className="ml-0.5 text-xs text-muted-foreground">件</span>
      </div>
      <div className="mt-1.5 flex items-center gap-1 text-[11px]">
        {diff !== null && (
          <>
            <span className={diff >= 0 ? "text-brand-green" : "text-brand-red"}>
              {diff >= 0 ? "▲" : "▼"} {diff >= 0 ? "+" : ""}
              {diff}%
            </span>
            <span className="text-brand-gray">前年度同期比</span>
          </>
        )}
      </div>
    </div>
  )
}

export function KpiCards({ data }: { data: Record<KpiKey, KpiSeries> }) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
      {KPI_KEYS.map((kpi) => (
        <Card key={kpi} kpi={kpi} series={data[kpi]} />
      ))}
    </div>
  )
}
