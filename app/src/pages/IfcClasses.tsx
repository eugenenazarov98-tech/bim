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
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <header className="mb-8">
          <div className="flex gap-4 text-sm">
            <a href="../../" className="text-slate-400 hover:text-slate-600">
              ← На главную
            </a>
            <a href="../" className="text-slate-400 hover:text-slate-600">
              ← К mapping
            </a>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Приложение Ж (классы IFC)
          </h1>
          <p className="mt-2 text-slate-500">
            Mapping ЦИМ АР · соответствие категорий элементов ЦИМ классам IFC
          </p>
        </header>

        <Card className="mb-6 border-slate-200 bg-white">
          <CardContent className="grid gap-2 p-4">
            <Label htmlFor="q" className="text-slate-600">
              Поиск
            </Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="По категории или классу IFC…"
                className="border-slate-300 bg-slate-100 pl-9 text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </CardContent>
        </Card>

        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-slate-400">
          Найдено записей: {sorted.length}
        </h2>

        <Card className="border-slate-200 bg-white">
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 hover:bg-transparent">
                  {COLUMNS.map((c) => (
                    <TableHead key={c.key} className="whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => toggle(c.key)}
                        className="inline-flex items-center gap-1 font-medium text-slate-600 hover:text-slate-900"
                        title="Сортировать"
                      >
                        {c.title}
                        {sort.key === c.key ? (
                          <span>{sortMark(sort, c.key)}</span>
                        ) : (
                          <ArrowDownUp className="h-3 w-3 text-slate-300" />
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
                    className="border-slate-200 align-top hover:bg-slate-50"
                  >
                    <TableCell className="whitespace-normal break-words text-sm text-slate-600">
                      {r.category}
                    </TableCell>
                    <TableCell className="whitespace-normal break-words font-mono text-[13px] text-slate-700">
                      {r.ifcClass}
                    </TableCell>
                  </TableRow>
                ))}
                {sorted.length === 0 && (
                  <TableRow className="border-slate-200 hover:bg-transparent">
                    <TableCell colSpan={2} className="p-8 text-center text-slate-400">
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
