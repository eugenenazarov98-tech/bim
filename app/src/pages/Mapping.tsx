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
import { mappingSections, type MappingRow } from "@/data/mappingData";
import { linkClass } from "@/data/links";
import { sortMark, useSortable } from "@/hooks/useSortable";

interface FlatRow extends MappingRow {
  section: string;
  ifcClass: string;
}

const allRows: FlatRow[] = mappingSections.flatMap((s) =>
  s.rows.map((r) => ({ ...r, section: s.title, ifcClass: s.ifcClass }))
);

const COLUMNS: { key: string; title: string; mono?: boolean }[] = [
  { key: "section", title: "Элемент ЦИМ" },
  { key: "ifcClass", title: "Класс IFC" },
  { key: "pset", title: "PropertySet" },
  { key: "ifc", title: "Наименование IFC", mono: true },
  { key: "type", title: "Тип данных IFC" },
  { key: "fop", title: "Наименование в ФОП" },
  { key: "mge", title: "Параметр по требованиям МГЭ" },
  { key: "example", title: "Пример заполнения", mono: true },
];

const ALL = "all";

function uniqSorted(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "ru"));
}

function FilterSelect({
  id,
  label,
  value,
  onChange,
  allLabel,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  allLabel: string;
  options: string[];
}) {
  return (
    <div className="grid min-w-0 gap-2">
      <Label htmlFor={id} className="text-slate-600">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          id={id}
          className="w-full border-slate-300 bg-slate-100 font-normal text-slate-900"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="border-slate-300 bg-white">
          <SelectItem value={ALL}>{allLabel}</SelectItem>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function Mapping() {
  const [query, setQuery] = useState("");
  const [fSection, setFSection] = useState(ALL);
  const [fIfcClass, setFIfcClass] = useState(ALL);
  const [fPset, setFPset] = useState(ALL);
  const [fType, setFType] = useState(ALL);

  const sectionOptions = useMemo(() => mappingSections.map((s) => s.title), []);
  const ifcClassOptions = useMemo(() => uniqSorted(allRows.map((r) => r.ifcClass)), []);
  const psetOptions = useMemo(() => uniqSorted(allRows.map((r) => r.pset)), []);
  const typeOptions = useMemo(() => uniqSorted(allRows.map((r) => r.type)), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allRows.filter((r) => {
      if (fSection !== ALL && r.section !== fSection) return false;
      if (fIfcClass !== ALL && r.ifcClass !== fIfcClass) return false;
      if (fPset !== ALL && r.pset !== fPset) return false;
      if (fType !== ALL && r.type !== fType) return false;
      if (!q) return true;
      return [r.section, r.ifcClass, r.pset, r.ifc, r.type, r.fop, r.mge, r.example]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [query, fSection, fIfcClass, fPset, fType]);

  const getValue = (r: FlatRow, key: string): string =>
    key === "section" ? r.section : key === "ifcClass" ? r.ifcClass : ((r as unknown as Record<string, string>)[key] ?? "");

  const { sort, toggle, sorted } = useSortable(filtered, "section", getValue);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <header className="mb-8">
          <a href="../" className="text-sm text-slate-400 hover:text-slate-600">
            ← На главную
          </a>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Наполнение элементов информационной модели
          </h1>
          <p className="mt-2 text-slate-500">
            Mapping ЦИМ АР · соответствие параметров IFC, ФОП и требований МГЭ
          </p>
        </header>

        <Card className="mb-6 border-slate-200 bg-white">
          <CardContent className="grid gap-4 p-4 sm:grid-cols-[repeat(2,minmax(0,1fr))] lg:grid-cols-[repeat(5,minmax(0,1fr))]">
            <div className="grid gap-2 lg:col-span-1">
              <Label htmlFor="q" className="text-slate-600">
                Поиск
              </Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="q"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="По всем колонкам…"
                  className="border-slate-300 bg-slate-100 pl-9 text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>
            <FilterSelect
              id="f-section"
              label="Элемент ЦИМ"
              value={fSection}
              onChange={setFSection}
              allLabel="Все"
              options={sectionOptions}
            />
            <FilterSelect
              id="f-ifcclass"
              label="Класс IFC"
              value={fIfcClass}
              onChange={setFIfcClass}
              allLabel="Все"
              options={ifcClassOptions}
            />
            <FilterSelect
              id="f-pset"
              label="PropertySet"
              value={fPset}
              onChange={setFPset}
              allLabel="Все"
              options={psetOptions}
            />
            <FilterSelect
              id="f-type"
              label="Тип данных"
              value={fType}
              onChange={setFType}
              allLabel="Все"
              options={typeOptions}
            />
          </CardContent>
        </Card>

        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-medium uppercase tracking-wider text-slate-400">
            Найдено параметров: {sorted.length}
          </h2>
          <div className="text-sm">
            <a href="dictionaries/" className={linkClass}>
              Справочники значений →
            </a>
            <span className="mx-2 text-slate-300">·</span>
            <a href="ifc-classes/" className={linkClass}>
              Приложение Ж (классы IFC) →
            </a>
          </div>
        </div>

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
                    key={`${r.section}-${r.ifc}-${i}`}
                    className="border-slate-200 align-top hover:bg-slate-50"
                  >
                    {COLUMNS.map((c) => (
                      <TableCell
                        key={c.key}
                        className={`whitespace-normal break-words text-sm ${
                          c.mono ? "font-mono text-[13px] text-slate-700" : "text-slate-600"
                        } ${c.key === "section" ? "font-medium text-slate-900" : ""}`}
                      >
                        {getValue(r, c.key) || "—"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {sorted.length === 0 && (
                  <TableRow className="border-slate-200 hover:bg-transparent">
                    <TableCell colSpan={COLUMNS.length} className="p-8 text-center text-slate-400">
                      Ничего не найдено, попробуйте изменить фильтры
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
