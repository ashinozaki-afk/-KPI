"use client"

import { useEffect, useMemo, useState } from "react"

import { DataInput } from "@/components/data-input"
import { KpiCards } from "@/components/kpi-cards"
import { KpiChart } from "@/components/kpi-chart"
import {
  KPI_KEYS,
  STORAGE_TS_KEY,
  getMergedData,
  loadExtra,
  saveExtra,
  type ExtraData,
  type KpiKey,
} from "@/lib/kpi-data"

export default function Page() {
  const [mounted, setMounted] = useState(false)
  const [extra, setExtra] = useState<ExtraData>({})
  const [activeKpi, setActiveKpi] = useState<KpiKey>("受注")
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [toast, setToast] = useState(false)

  // localStorage はクライアントでのみ読み込む（ハイドレーション不一致を防ぐ）
  useEffect(() => {
    setExtra(loadExtra())
    setLastUpdated(localStorage.getItem(STORAGE_TS_KEY))
    setMounted(true)
  }, [])

  const data = useMemo(() => getMergedData(extra), [extra])

  const handleSave = (monthIndex: number, values: Partial<Record<KpiKey, number>>) => {
    setExtra((prev) => {
      const next: ExtraData = JSON.parse(JSON.stringify(prev))
      KPI_KEYS.forEach((k) => {
        if (values[k] === undefined) return
        if (!next[k]) next[k] = Array(12).fill(null)
        next[k]![monthIndex] = values[k]!
      })
      const ts = saveExtra(next)
      setLastUpdated(ts)
      return next
    })
    setToast(true)
    window.setTimeout(() => setToast(false), 2500)
  }

  const handleDelete = (monthIndex: number) => {
    setExtra((prev) => {
      const next: ExtraData = JSON.parse(JSON.stringify(prev))
      KPI_KEYS.forEach((k) => {
        if (next[k]) next[k]![monthIndex] = null
      })
      saveExtra(next)
      return next
    })
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="flex h-14 items-center justify-between bg-brand-dark px-8 text-white">
        <div className="flex items-center gap-2 text-[15px] font-semibold tracking-wide">
          <span className="text-brand-red-mid">▮</span>
          FLARETECH SI営業部
        </div>
        <div className="text-[11px] text-white/50">
          {mounted && lastUpdated ? `最終更新：${lastUpdated}` : ""}
        </div>
      </header>

      <div className="mx-auto max-w-[1100px] px-6 py-8">
        <h1 className="text-balance text-[22px] font-bold text-brand-dark">KPIダッシュボード</h1>
        <p className="mb-6 text-xs text-muted-foreground">
          幹部会報告用 — 2023〜2025年度 月次推移（期初11月〜期末翌10月）
        </p>

        <KpiCards data={data} />
        <KpiChart activeKpi={activeKpi} onSelectKpi={setActiveKpi} series={data[activeKpi]} />
        {mounted && <DataInput extra={extra} onSave={handleSave} onDelete={handleDelete} />}
      </div>

      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-6 right-6 z-50 rounded-md bg-brand-dark px-5 py-2.5 text-[13px] text-white transition-all ${
          toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        保存しました
      </div>
    </main>
  )
}
