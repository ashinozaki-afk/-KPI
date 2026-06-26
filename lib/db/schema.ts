import { pgTable, text, timestamp, boolean, serial, integer, uniqueIndex } from "drizzle-orm/pg-core"

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// --- App tables ------------------------------------------------------------
// KPI 値はチームで共有する1つのデータセット。ユーザーごとに分けず、
// (kpi, fiscalYear, monthIndex) の組で一意な1行に格納する。
// 認証は「閲覧・編集できる人」を制限する門番として機能し、
// updatedBy / updatedByName に最後に更新した人を記録する。
export const kpiEntries = pgTable(
  "kpi_entries",
  {
    id: serial("id").primaryKey(),
    kpi: text("kpi").notNull(), // "受注" | "面談" | "提案" | "アポ"
    fiscalYear: integer("fiscalYear").notNull(), // 年度（11月始まり）例: 2025
    monthIndex: integer("monthIndex").notNull(), // 0=11月 ... 11=10月
    value: integer("value").notNull(),
    updatedBy: text("updatedBy").notNull(), // 更新したユーザーの id
    updatedByName: text("updatedByName").notNull(), // 表示用の名前
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (t) => ({
    uniqueCell: uniqueIndex("kpi_entries_cell_unique").on(t.kpi, t.fiscalYear, t.monthIndex),
  }),
)
