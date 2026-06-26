"use client"

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import {
  INSIGHTS,
  KPI_KEYS,
  MONTHS,
  type KpiKey,
  type KpiSeries,
} from "@/lib/kpi-data"

const SERIES = [
  { year: 2023 as const, color: "var(--series-2024)", dash: undefined, width: 1.5 },
  { year: 2024 as const, color: "var(--series-2025)", dash: "5 3", width: 1.5 },
  { year: 2025 as const, color: "var(--series-2026)", dash: undefined, width: 2.5 },
]

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { dataKey: string; value: number | null; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-sm">
      <div className="mb-1 font-medium text-brand-dark">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-muted-foreground">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color }} />
          {p.dataKey}：{p.value !== null && p.value !== undefined ? p.value.toLocaleString() : "―"}
        </div>
      ))}
    </div>
  )
}

export function KpiChart({
  activeKpi,
  onSelectKpi,
  series,
}: {
  activeKpi: KpiKey
  onSelectKpi: (kpi: KpiKey) => void
  series: KpiSeries
}) {
  const chartData = MONTHS.map((month, i) => ({
    month,
    "2023年度": series[2023][i],
    "2024年度": series[2024][i],
    "2025年度": series[2025][i],
  }))

  return (
    <section className="mb-5 rounded-xl border border-border bg-card p-5">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-brand-dark">
        <span className="h-3.5 w-[3px] rounded-sm bg-brand-red" aria-hidden />
        月次KPI推移（年度別比較・期初11月）
      </h2>

      <div className="mb-4 flex flex-wrap gap-1.5" role="tablist" aria-label="KPI選択">
        {KPI_KEYS.map((kpi) => {
          const active = kpi === activeKpi
          return (
            <button
              key={kpi}
              role="tab"
              aria-selected={active}
              onClick={() => onSelectKpi(kpi)}
              className={`rounded-full border px-4 py-1 text-xs transition-colors ${
                active
                  ? "border-brand-dark bg-brand-dark font-medium text-white"
                  : "border-border text-muted-foreground hover:border-brand-gray hover:text-foreground"
              }`}
            >
              {kpi}
            </button>
          )
        })}
      </div>

      <div className="mb-2.5 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
        <Legend color="var(--series-2024)" label="2023年度" />
        <Legend color="var(--series-2025)" label="2024年度" dashed />
        <Legend color="var(--series-2026)" label="2025年度" />
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
            <CartesianGrid stroke="rgba(0,0,0,0.05)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "var(--brand-gray)" }}
              tickLine={false}
              axisLine={{ stroke: "rgba(0,0,0,0.08)" }}
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--brand-gray)" }}
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(v: number) => v.toLocaleString()}
            />
            <Tooltip content={<CustomTooltip />} />
            {SERIES.map((s) => (
              <Line
                key={s.year}
                type="monotone"
                dataKey={`${s.year}年度`}
                stroke={s.color}
                strokeWidth={s.width}
                strokeDasharray={s.dash}
                dot={{ r: s.year === 2025 ? 3 : 2, strokeWidth: 0, fill: s.color }}
                activeDot={{ r: 5 }}
                connectNulls={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-3 rounded-lg border-l-[3px] border-brand-red bg-muted px-3.5 py-2.5 text-xs leading-relaxed text-muted-foreground">
        {INSIGHTS[activeKpi]}
      </p>
    </section>
  )
}

function Legend({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="inline-block h-0 w-5"
        style={{ borderTop: `2px ${dashed ? "dashed" : "solid"} ${color}` }}
        aria-hidden
      />
      {label}
    </span>
  )
}
