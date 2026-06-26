"use client"

import { useState } from "react"
import { Save } from "lucide-react"

import { CURRENT_FY, KPI_KEYS, MONTHS, fyLabel, type ExtraData, type KpiKey } from "@/lib/kpi-data"

const MONTH_OPTIONS = MONTHS.map((m, i) => ({ label: `${fyLabel(CURRENT_FY)} ${m}`, index: i }))

export function DataInput({
  extra,
  onSave,
  onDelete,
}: {
  extra: ExtraData
  onSave: (monthIndex: number, values: Partial<Record<KpiKey, number>>) => void
  onDelete: (monthIndex: number) => void
}) {
  const [monthIndex, setMonthIndex] = useState(7) // 既定: 2025年度の6月（直近実績月）
  const [values, setValues] = useState<Record<KpiKey, string>>({
    受注: "",
    面談: "",
    提案: "",
    アポ: "",
  })

  const handleSave = () => {
    const parsed: Partial<Record<KpiKey, number>> = {}
    let hasValue = false
    KPI_KEYS.forEach((k) => {
      if (values[k] !== "") {
        parsed[k] = Number.parseInt(values[k], 10)
        hasValue = true
      }
    })
    if (!hasValue) return
    onSave(monthIndex, parsed)
    setValues({ 受注: "", 面談: "", 提案: "", アポ: "" })
  }

  const rows = MONTHS.map((_, i) => i).filter((i) =>
    KPI_KEYS.some((k) => extra[k]?.[i] !== null && extra[k]?.[i] !== undefined),
  )

  const cell = (k: KpiKey, i: number) => {
    const v = extra[k]?.[i]
    return v !== null && v !== undefined ? v.toLocaleString() : "—"
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-brand-dark">
        <span className="h-3.5 w-[3px] rounded-sm bg-brand-red" aria-hidden />
        データ入力
      </h2>

      <div className="grid gap-5 md:grid-cols-2">
        {/* 入力フォーム */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="month-select"
            className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            対象月
          </label>
          <select
            id="month-select"
            value={monthIndex}
            onChange={(e) => setMonthIndex(Number(e.target.value))}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-red"
          >
            {MONTH_OPTIONS.map((o) => (
              <option key={o.index} value={o.index}>
                {o.label}
              </option>
            ))}
          </select>

          <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {KPI_KEYS.map((k) => (
              <div
                key={k}
                className="flex items-center gap-2 rounded-md border border-border bg-background px-2.5 py-2"
              >
                <label htmlFor={`inp-${k}`} className="w-8 shrink-0 text-xs text-muted-foreground">
                  {k}
                </label>
                <input
                  id={`inp-${k}`}
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={values[k]}
                  onChange={(e) => setValues((p) => ({ ...p, [k]: e.target.value }))}
                  className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-brand-gray/60 focus:outline-none"
                />
                <span className="text-[11px] text-brand-gray">件</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleSave}
            className="mt-3 flex items-center gap-1.5 self-start rounded-md bg-brand-red px-6 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-brand-red-strong active:scale-[0.98]"
          >
            <Save className="h-3.5 w-3.5" />
            保存してグラフ更新
          </button>
        </div>

        {/* 入力履歴 */}
        <div className="flex flex-col gap-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            入力履歴（2025年度）
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  {["月", "受注", "面談", "提案", "アポ", ""].map((h, i) => (
                    <th
                      key={i}
                      className="border-b border-border px-2.5 py-1.5 text-left font-medium text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-2.5 py-3 text-brand-gray">
                      入力データなし
                    </td>
                  </tr>
                ) : (
                  rows.map((i) => (
                    <tr key={i} className="hover:bg-background">
                      <td className="border-b border-muted px-2.5 py-1.5">{MONTHS[i]}</td>
                      <td className="border-b border-muted px-2.5 py-1.5">{cell("受注", i)}</td>
                      <td className="border-b border-muted px-2.5 py-1.5">{cell("面談", i)}</td>
                      <td className="border-b border-muted px-2.5 py-1.5">{cell("提案", i)}</td>
                      <td className="border-b border-muted px-2.5 py-1.5">{cell("アポ", i)}</td>
                      <td className="border-b border-muted px-2.5 py-1.5">
                        <button
                          onClick={() => onDelete(i)}
                          className="rounded border border-border px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:border-brand-red hover:bg-brand-red-light hover:text-brand-red"
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
