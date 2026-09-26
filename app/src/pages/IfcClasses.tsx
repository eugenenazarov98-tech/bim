import { useMemo, useState } from "react";
import { ArrowDownUp, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ifcClasses, type IfcClassRow } from "@/data/ifcClasses";
import { sortMark, useSortable } from "@/hooks/useSortable";
import { ThemeToggle } from "@/components/ThemeToggle";

const COLUMNS = [
  { key: "category", title: "Категория элементов ЦИМ" },
  { key: "ifcClass", title: "Класс IFC" },
];

export default function IfcClasses() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? ifcClasses.filter(
          (r) =>
            r.category.toLowerCase().includes(q) || r.ifcClass.toLowerCase().includes(q)
        )
      : ifcClasses;
  }, [query]);

  const getValue = (r: IfcClassRow, key: string) =>
    (r as unknown as Record<string, string>)[key] ?? "";
  const { sort, toggle, sorted } = useSortable(filtered, "category", getValue);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center gap-4 text-sm">
            <a href="../../" className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
              ← На главную
            </a>
            <a href="../" className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
              ← К mapping
            </a>
            <span className="ml-auto"><ThemeToggle /></span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Приложение Ж (классы IFC)
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Mapping ЦИМ АР · соответствие категорий элементов ЦИМ классам IFC
          </p>
        </header>

        <Card className="mb-6 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <CardContent className="grid gap-2 p-4">
            <Label htmlFor="q" className="text-slate-600 dark:text-slate-300">
              Поиск
            </Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <Input
                id="q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="По категории или классу IFC…"
                className="border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 pl-9 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
          </CardContent>
        </Card>

        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Найдено записей: {sorted.length}
        </h2>

        <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 dark:border-slate-700 hover:bg-transparent">
                  {COLUMNS.map((c) => (
                    <TableHead key={c.key} className="whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => toggle(c.key)}
                        className="inline-flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                        title="Сортировать"
                      >
                        {c.title}
                        {sort.key === c.key ? (
                          <span>{sortMark(sort, c.key)}</span>
                        ) : (
                          <ArrowDownUp className="h-3 w-3 text-slate-300 dark:text-slate-600" />
                        )}
                      </button>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((r, i) => (
                  <TableRow
                    key={`${r.category}-${i}`}
                    className="border-slate-200 dark:border-slate-700 align-top hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <TableCell className="whitespace-normal break-words text-sm text-slate-600 dark:text-slate-300">
                      {r.category}
                    </TableCell>
                    <TableCell className="whitespace-normal break-words font-mono text-[13px] text-slate-700 dark:text-slate-300">
                      {r.ifcClass}
                    </TableCell>
                  </TableRow>
                ))}
                {sorted.length === 0 && (
                  <TableRow className="border-slate-200 dark:border-slate-700 hover:bg-transparent">
                    <TableCell colSpan={2} className="p-8 text-center text-slate-400 dark:text-slate-500">
                      Ничего не найдено
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
