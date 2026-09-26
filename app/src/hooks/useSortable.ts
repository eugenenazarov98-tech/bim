import { useMemo, useState } from "react";

export interface SortState {
  key: string;
  dir: "asc" | "desc";
}

export function useSortable<T>(
  rows: T[],
  initialKey: string,
  getValue: (row: T, key: string) => string
) {
  const [sort, setSort] = useState<SortState>({ key: initialKey, dir: "asc" });

  const toggle = (key: string) =>
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );

  const sorted = useMemo(() => {
    const arr = [...rows];
    arr.sort((a, b) => {
      const cmp = getValue(a, sort.key).localeCompare(getValue(b, sort.key), "ru");
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [rows, sort, getValue]);

  return { sort, toggle, sorted };
}

export function sortMark(sort: SortState, key: string): string {
  if (sort.key !== key) return "";
  return sort.dir === "asc" ? " ▲" : " ▼";
}
