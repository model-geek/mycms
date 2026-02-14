import { type SQL, type Column, sql, and, or } from "drizzle-orm";

import { contents } from "@/db/schema";

/** フィルタ条件 */
export interface FilterCondition {
  field: string;
  operator: string;
  value?: string;
}

/** フィルタグループ（AND条件の集まり） */
export interface FilterGroup {
  conditions: FilterCondition[];
  logic: "and";
}

/** サポートするフィルタ演算子 */
const VALID_OPERATORS = new Set([
  "equals",
  "not_equals",
  "less_than",
  "greater_than",
  "contains",
  "not_contains",
  "exists",
  "not_exists",
  "begins_with",
]);

/** システムフィールド（実カラム） */
const SYSTEM_COLUMN_MAP: Record<string, Column> = {
  createdAt: contents.createdAt,
  updatedAt: contents.updatedAt,
  publishedAt: contents.publishedAt,
  revisedAt: contents.revisedAt,
};

/**
 * microCMS 互換フィルタ文字列をパースする
 *
 * @example "title[equals]Hello[and]count[greater_than]5"
 * @example "category[equals]news[or]category[equals]blog"
 */
export function parseFilters(filterString: string): FilterGroup[] {
  if (!filterString.trim()) return [];

  // [or] で分割して OR グループを生成
  const orGroups = filterString.split("[or]");

  return orGroups.map((group) => {
    // 各 OR グループ内を [and] で分割して AND 条件を生成
    const andParts = group.split("[and]");
    const conditions = andParts.map(parseCondition);
    return { conditions, logic: "and" as const };
  });
}

function parseCondition(conditionStr: string): FilterCondition {
  const trimmed = conditionStr.trim();
  // field[operator]value or field[operator] (for exists/not_exists)
  const match = trimmed.match(/^([^[]+)\[([^\]]+)\](.*)$/);
  if (!match) {
    throw new Error(`無効なフィルタ条件です: ${trimmed}`);
  }

  const [, field, operator, value] = match;

  if (!VALID_OPERATORS.has(operator)) {
    throw new Error(`サポートされていない演算子です: ${operator}`);
  }

  return {
    field,
    operator,
    value: value || undefined,
  };
}

/**
 * パースしたフィルタグループを Drizzle SQL 条件に変換する
 *
 * システムフィールド（createdAt, updatedAt, publishedAt, revisedAt）は実カラムに対してクエリ、
 * それ以外は JSONB data カラムに対してクエリを生成する
 */
export function buildFilterSql(groups: FilterGroup[]): SQL | undefined {
  if (groups.length === 0) return undefined;

  const orConditions: SQL[] = [];

  for (const group of groups) {
    const andConditions: SQL[] = [];

    for (const condition of group.conditions) {
      const sqlCondition = buildConditionSql(condition);
      if (sqlCondition) {
        andConditions.push(sqlCondition);
      }
    }

    if (andConditions.length > 0) {
      const combined = and(...andConditions);
      if (combined) orConditions.push(combined);
    }
  }

  if (orConditions.length === 0) return undefined;
  if (orConditions.length === 1) return orConditions[0];

  return or(...orConditions);
}

function buildConditionSql(condition: FilterCondition): SQL | undefined {
  const { field, operator, value } = condition;

  // システムフィールドの場合は実カラムを使用
  const systemColumn = SYSTEM_COLUMN_MAP[field];
  if (systemColumn) {
    return buildSystemFieldCondition(systemColumn, operator, value);
  }

  // id フィールドの場合
  if (field === "id") {
    return buildIdFieldCondition(operator, value);
  }

  // JSONB data カラムに対するクエリ
  return buildJsonbCondition(field, operator, value);
}

function buildSystemFieldCondition(
  col: Column,
  operator: string,
  value?: string,
): SQL | undefined {

  switch (operator) {
    case "equals":
      return sql`${col} = ${value}`;
    case "not_equals":
      return sql`${col} != ${value}`;
    case "less_than":
      return sql`${col} < ${value}`;
    case "greater_than":
      return sql`${col} > ${value}`;
    case "exists":
      return sql`${col} IS NOT NULL`;
    case "not_exists":
      return sql`${col} IS NULL`;
    default:
      return undefined;
  }
}

function buildIdFieldCondition(operator: string, value?: string): SQL | undefined {
  switch (operator) {
    case "equals":
      return sql`${contents.id} = ${value}`;
    case "not_equals":
      return sql`${contents.id} != ${value}`;
    case "exists":
      return sql`${contents.id} IS NOT NULL`;
    case "not_exists":
      return sql`${contents.id} IS NULL`;
    default:
      return undefined;
  }
}

function buildJsonbCondition(field: string, operator: string, value?: string): SQL | undefined {
  // JSONB フィールドアクセス: data->>'field_name'
  const jsonField = sql`${contents.data}->>${field}`;

  switch (operator) {
    case "equals":
      return sql`${jsonField} = ${value}`;
    case "not_equals":
      return sql`${jsonField} != ${value}`;
    case "less_than":
      return sql`${jsonField} < ${value}`;
    case "greater_than":
      return sql`${jsonField} > ${value}`;
    case "contains":
      return sql`${jsonField} ILIKE ${"%" + (value ?? "") + "%"}`;
    case "not_contains":
      return sql`${jsonField} NOT ILIKE ${"%" + (value ?? "") + "%"}`;
    case "exists":
      return sql`${contents.data} ? ${field}`;
    case "not_exists":
      return sql`NOT (${contents.data} ? ${field})`;
    case "begins_with":
      return sql`${jsonField} ILIKE ${(value ?? "") + "%"}`;
    default:
      return undefined;
  }
}
