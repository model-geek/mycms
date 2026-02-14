import { DEFAULT_LIST_LIMIT, MAX_LIST_LIMIT } from "../constants";

import { parseFilters } from "./filter-parser";
import type { ContentApiQuery } from "./model";

export function parseContentApiQuery(
  searchParams: URLSearchParams,
): ContentApiQuery {
  const limitParam = searchParams.get("limit");
  const offsetParam = searchParams.get("offset");
  const orders = searchParams.get("orders") ?? undefined;
  const fieldsParam = searchParams.get("fields");
  const q = searchParams.get("q") ?? undefined;
  const idsParam = searchParams.get("ids");
  const filtersParam = searchParams.get("filters");
  const depthParam = searchParams.get("depth");
  const draftKey = searchParams.get("draftKey") ?? undefined;

  const limit = limitParam
    ? Math.min(Math.max(parseInt(limitParam, 10) || DEFAULT_LIST_LIMIT, 1), MAX_LIST_LIMIT)
    : DEFAULT_LIST_LIMIT;

  const offset = offsetParam
    ? Math.max(parseInt(offsetParam, 10) || 0, 0)
    : 0;

  const fields = fieldsParam
    ? fieldsParam.split(",").map((f) => f.trim()).filter(Boolean)
    : undefined;

  const ids = idsParam
    ? idsParam.split(",").map((id) => id.trim()).filter(Boolean)
    : undefined;

  const filters = filtersParam
    ? parseFilters(filtersParam)
    : undefined;

  const depth = depthParam
    ? Math.max(parseInt(depthParam, 10) || 1, 1)
    : undefined;

  return { limit, offset, orders, fields, q, ids, filters, depth, draftKey };
}
