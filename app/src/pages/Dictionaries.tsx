import { useMemo, useState } from "react";
import { ArrowDownUp, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dictionaries, type DictionaryRow } from "@/data/dictionaries";
import { sortMark, useSortable } from "@/hooks/useSortable";

const ALL = "all";

const COLUMNS = [
  { key: "value", title: "Значение" },
  { key: "desc", title: "Описание" },
];

function DictionaryTable({ rows }: { rows: DictionaryRow[] }) {
  const getValue = (r: DictionaryRow, key: string) =>
    (r as unknown as Record<string, string>)[key] ?? "";
  const { sort, toggle, sorted } = useSortable(rows, "value", getValue);

  return (
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
                key={`${r.value}-${i}`}
                className="border-slate-200 align-top hover:bg-slate-50"
              >
                <TableCell className="whitespace-normal break-all font-mono text-[13px] text-slate-700">
                  {r.value || "—"}
                </TableCell>
                <TableCell className="whitespace-normal break-words text-sm text-slate-600">
                  {r.desc || "—"}
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
  );
}

export default function Dictionaries() {
  const [dict, setDict] = useState(ALL);
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (dict === ALL ? dictionaries : dictionaries.filter((_, i) => String(i) === dict)).map(
      (d) => ({
        ...d,
        rows: q
          ? d.rows.filter(
              (r) =>
                r.value.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q)
            )
          : d.rows,
      })
    );
  }, [dict, query]);

  const total = visible.reduce((sum, d) => sum + d.rows.length, 0);

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
            Справочники значений
          </h1>
          <p className="mt-2 text-slate-500">Mapping ЦИМ АР · допустимые значения параметров</p>
        </header>

        <Card className="mb-6 border-slate-200 bg-white">
          <CardContent className="grid gap-4 p-4 sm:grid-cols-[repeat(2,minmax(0,1fr))]">
            <div className="grid min-w-0 gap-2">
              <Label htmlFor="dict" className="text-slate-600">
                Справочник
              </Label>
              <Select value={dict} onValueChange={setDict}>
                <SelectTrigger
                  id="dict"
                  className="w-full border-slate-300 bg-slate-100 font-normal text-slate-900"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-slate-300 bg-white">
                  <SelectItem value={ALL}>Все</SelectItem>
                  {dictionaries.map((d, i) => (
                    <SelectItem key={d.title} value={String(i)}>
                      {d.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="q" className="text-slate-600">
                Поиск
              </Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="q"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="По значению и описанию…"
                  className="border-slate-300 bg-slate-100 pl-9 text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-slate-400">
          Найдено значений: {total}
        </h2>

        <div className="grid gap-6">
          {visible.map((d) => (
            <section key={d.title}>
              {dict === ALL && (
                <h3 className="mb-2 text-base font-medium text-slate-900">{d.title}</h3>
              )}
              <DictionaryTable rows={d.rows} />
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
