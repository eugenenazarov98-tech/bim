import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronsUpDown,
  Copy,
  Download,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { revitCategories, type RevitCategory } from "@/data/categories";
import { MGE_PDF_URL, linkClass } from "@/data/links";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CursorCat } from "@/components/CursorCat";

/* ---------- types ---------- */

interface ClassifierEntry {
  code: string;
  name: string;
  path: string[];
  depth: number;
  ifc?: string;
}

type SourceKey = "elements" | "products" | "machinery" | "systems" | "rooms";

interface PreparedEntry {
  entry: ClassifierEntry;
  source: SourceKey;
  badge: string;
  nameN: string;
  nameWords: string[];
  pathExNameN: string;
  allN: string;
}

export interface ScoredEntry extends ClassifierEntry {
  source: SourceKey;
  badge: string;
  score: number;
}

interface SelectionItem {
  code: string;
  name: string;
  path: string[];
  badge: string;
  ifc?: string;
  categoryRu: string;
  familyName: string;
  addedAt: number;
}

const SOURCES: { key: SourceKey; badge: string; title: string }[] = [
  { key: "elements", badge: "ЭЛ", title: "Элементы" },
  { key: "products", badge: "СТ", title: "Строительные изделия и материалы" },
  { key: "machinery", badge: "ТО", title: "Строительная техника и оборудование" },
  { key: "systems", badge: "СС", title: "Системы" },
  { key: "rooms", badge: "ПЗ", title: "Помещения и зоны" },
];

const BADGE_STYLES: Record<string, string> = {
  ЭЛ: "bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-400 border-sky-300 dark:border-sky-700",
  СТ: "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700",
  ТО: "bg-amber-100 text-amber-800 border-amber-300",
  СС: "bg-violet-100 text-violet-800 border-violet-300",
  ПЗ: "bg-rose-100 text-rose-800 border-rose-300",
};

const DEFAULT_CATEGORY =
  revitCategories.find((c) => c.id === "walls") ??
  revitCategories.find((c) => c.keywords.length > 0) ??
  revitCategories[0];

const ALL_CATEGORY: RevitCategory = { id: "all", ru: "Все категории", en: "", keywords: [] };
const CATEGORIES = [ALL_CATEGORY, ...revitCategories];
const ALL_SOURCES = "all";

/* ---------- search logic ---------- */

const STOP_WORDS = new Set(["из", "для", "и", "на", "с", "по", "тип", "типа", "семейство"]);

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9]+/gi, " ")
    .trim();
}

function queryWords(q: string): string[] {
  return q.trim()
    ? normalize(q)
        .split(" ")
        .filter((w) => w.length > 0 && !STOP_WORDS.has(w) && !/^\d+$/.test(w))
    : [];
}

function prepareEntry(entry: ClassifierEntry, source: SourceKey, badge: string): PreparedEntry {
  const nameN = normalize(entry.name);
  const path = entry.path.filter((p) => normalize(p) !== nameN);
  return {
    entry,
    source,
    badge,
    nameN,
    nameWords: nameN.split(" ").filter(Boolean),
    pathExNameN: path.map(normalize).join(" "),
    allN: normalize(entry.name + " " + entry.path.join(" ")),
  };
}

const SOURCE_WEIGHT: Record<SourceKey, number> = {
  elements: 3,
  systems: 1.5,
  products: 1,
  machinery: 0.8,
  rooms: 1,
};

function searchEntries(
  prepared: PreparedEntry[],
  query: string,
  category: RevitCategory,
  limit = 12,
  source: SourceKey | null = null
): ScoredEntry[] {
  let pool = prepared;
  if (source) pool = pool.filter((p) => p.source === source);
  const words = queryWords(query);
  const keywords = category.keywords.map(normalize).filter(Boolean);
  const matchKeywords = (p: PreparedEntry) =>
    keywords.length > 0 && keywords.some((k) => p.allN.includes(k));

  if (words.length === 0) {
    if (keywords.length === 0) return [];
    return pool
      .filter((p) => p.entry.depth > 1 && matchKeywords(p))
      .map((p) => ({
        ...p.entry,
        source: p.source,
        badge: p.badge,
        score: (10 + 2 * p.entry.depth) * SOURCE_WEIGHT[p.source],
      }))
      .sort(
        (a, b) => b.score - a.score || a.code.localeCompare(b.code, "ru")
      )
      .slice(0, limit);
  }

  const scored: ScoredEntry[] = [];
  for (const p of pool) {
    if (p.entry.depth === 1) continue;
    let score = 0;
    for (const w of words) {
      if (p.nameN.includes(w)) {
        score += 10 * w.length;
        if (p.nameWords.some((nw) => nw.startsWith(w))) score += 5;
      }
      if (p.pathExNameN.includes(w)) score += 3 * w.length;
    }
    if (score <= 0) continue;
    score += p.entry.depth >= 3 ? 15 : 5;
    if (matchKeywords(p)) score *= 2.5;
    score *= SOURCE_WEIGHT[p.source];
    scored.push({ ...p.entry, source: p.source, badge: p.badge, score });
  }
  const byCode = new Map<string, ScoredEntry>();
  for (const s of scored) {
    const existing = byCode.get(s.code);
    if (!existing || s.score > existing.score) byCode.set(s.code, s);
  }
  return [...byCode.values()].sort((a, b) => b.score - a.score).slice(0, limit);
}

/* ---------- data loading ---------- */

async function loadClassifier(): Promise<Record<SourceKey, ClassifierEntry[]>> {
  const candidates = ["/data/classifier.txt", "../data/classifier.txt", "../../data/classifier.txt", "./data/classifier.txt"];
  let res: Response | null = null;
  for (const url of candidates) {
    try {
      const r = await fetch(url);
      if (r.ok) { res = r; break; }
    } catch { /* try next */ }
  }
  if (!res) throw new Error("classifier.txt не найден");
  const b64 = (await res.text()).trim();
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
  const text = await new Response(stream).text();
  return JSON.parse(text);
}

interface ClassifierData {
  prepared: PreparedEntry[];
  sourceCounts: { badge: string; title: string; count: number }[];
}

function useClassifier(): { status: "loading" | "error" | "ready"; data: ClassifierData | null } {
  const [state, setState] = useState<{
    status: "loading" | "error" | "ready";
    data: ClassifierData | null;
  }>({ status: "loading", data: null });

  useEffect(() => {
    let cancelled = false;
    loadClassifier()
      .then((raw) => {
        if (cancelled) return;
        const prepared = SOURCES.flatMap((s) =>
          (raw[s.key] ?? []).map((e) => prepareEntry(e, s.key, s.badge))
        );
        const sourceCounts = SOURCES.map((s) => ({
          badge: s.badge,
          title: s.title,
          count: (raw[s.key] ?? []).length,
        }));
        setState({ status: "ready", data: { prepared, sourceCounts } });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error", data: null });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

/* ---------- selection (localStorage) ---------- */

const LS_KEY = "mssk-selection";

function readSelection(): SelectionItem[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function csvCell(v: string): string {
  return /[;"\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
}

const CSV_HEADER = ["Код", "Классификатор", "Наименование", "Путь", "IFC", "Категория Revit", "Имя семейства"];

function selectionToCsv(items: SelectionItem[]): string {
  const rows = items.map((i) =>
    [i.code, i.badge, i.name, i.path.join(" › "), i.ifc ?? "", i.categoryRu, i.familyName]
      .map(csvCell)
      .join(";")
  );
  return "\uFEFF" + CSV_HEADER.join(";") + "\r\n" + rows.join("\r\n") + "\r\n";
}

function csvFileName(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `МССК_подборка_${y}-${m}-${day}.csv`;
}

async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
}

/* ---------- components ---------- */

function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const onClick = async () => {
    await copyText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
      title="Копировать код"
    >
      {copied ? (
        <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <Copy className="mr-1.5 h-3.5 w-3.5" />
      )}
      {copied ? "Скопировано" : "Копировать код"}
    </Button>
  );
}

function ResultCard({
  item,
  inSelection,
  onAdd,
}: {
  item: ScoredEntry;
  inSelection: boolean;
  onAdd: (item: ScoredEntry) => void;
}) {
  return (
    <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-lg font-semibold tracking-wide text-sky-700 dark:text-sky-400">
              {item.code}
            </span>
            <Badge variant="outline" className={BADGE_STYLES[item.badge] ?? ""} title="Классификатор">
              {item.badge}
            </Badge>
            {item.ifc && (
              <Badge
                variant="outline"
                className="border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-300"
                title="Класс IFC"
              >
                {item.ifc}
              </Badge>
            )}
          </div>
          <div className="mt-1.5 text-base font-medium text-slate-900 dark:text-slate-100">{item.name}</div>
          <div className="mt-1 text-sm text-slate-400 dark:text-slate-500">{item.path.join(" › ")}</div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAdd(item)}
            disabled={inSelection}
            className={
              inSelection
                ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                : "border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
            }
            title={inSelection ? "Уже в подборке" : "Добавить в подборку"}
          >
            {inSelection ? (
              <Check className="mr-1.5 h-3.5 w-3.5" />
            ) : (
              <Plus className="mr-1.5 h-3.5 w-3.5" />
            )}
            {inSelection ? "В подборке" : "В подборку"}
          </Button>
          <CopyCodeButton code={item.code} />
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------- page ---------- */

export default function Classification() {
  const [categoryId, setCategoryId] = useState(DEFAULT_CATEGORY.id);
  const [source, setSource] = useState<string>(ALL_SOURCES);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [selection, setSelection] = useState<SelectionItem[]>(readSelection);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(selection));
    } catch {
      /* ignore */
    }
  }, [selection]);

  const category = CATEGORIES.find((c) => c.id === categoryId) ?? DEFAULT_CATEGORY;

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query), 200);
    return () => window.clearTimeout(t);
  }, [query]);

  const { status, data } = useClassifier();

  const results = useMemo(
    () =>
      data
        ? searchEntries(
            data.prepared,
            debouncedQuery,
            category,
            12,
            source === ALL_SOURCES ? null : (source as SourceKey)
          )
        : [],
    [data, debouncedQuery, category, source]
  );

  const isEmptyQuery = debouncedQuery.trim().length === 0;
  const selectionCodes = useMemo(() => new Set(selection.map((i) => i.code)), [selection]);

  const addToSelection = (item: ScoredEntry) => {
    if (selectionCodes.has(item.code)) return;
    setSelection((s) => [
      ...s,
      {
        code: item.code,
        name: item.name,
        path: item.path,
        badge: item.badge,
        ifc: item.ifc,
        categoryRu: category.ru,
        familyName: debouncedQuery.trim(),
        addedAt: Date.now(),
      },
    ]);
  };

  const removeFromSelection = (code: string) =>
    setSelection((s) => s.filter((i) => i.code !== code));
  const clearSelection = () => setSelection([]);

  const exportCsv = () => {
    if (selection.length === 0) return;
    const blob = new Blob([selectionToCsv(selection)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = csvFileName();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <CursorCat />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <a href="../" className="text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
              ← На главную
            </a>
            <ThemeToggle />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Классификация элементов информационной модели
            </h1>
            <Badge variant="outline" className="border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              МССК вер. 5.0
            </Badge>
          </div>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Использовать данный сервис как вспомогательный к{" "}
            <a href={MGE_PDF_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
              МКЭ-ОД-24-178. Часть 2. Требования к ЦИМ АР (PDF)
            </a>
          </p>
        </header>

        <Card className="mb-6 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-slate-900 dark:text-slate-100">Параметры классификации</CardTitle>
            <CardDescription className="text-slate-400 dark:text-slate-500">
              Выберите категорию и начните вводить именование элемента — варианты обновятся
              автоматически
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,3fr)]">
            <div className="grid gap-2">
              <Label htmlFor="category" className="text-slate-600 dark:text-slate-300">
                Категория
              </Label>
              <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="category"
                    variant="outline"
                    role="combobox"
                    aria-expanded={categoryOpen}
                    className="w-full justify-between border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 font-normal text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    <span className="truncate">{category.ru}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-0"
                  align="start"
                >
                  <Command className="bg-white dark:bg-slate-900">
                    <CommandInput placeholder="Поиск категории…" className="text-slate-900 dark:text-slate-100" />
                    <CommandList>
                      <CommandEmpty className="text-slate-400 dark:text-slate-500">Категория не найдена</CommandEmpty>
                      <CommandGroup>
                        {CATEGORIES.map((c) => (
                          <CommandItem
                            key={c.id}
                            value={`${c.ru} ${c.en}`}
                            onSelect={() => {
                              setCategoryId(c.id);
                              setCategoryOpen(false);
                            }}
                            className="text-slate-900 dark:text-slate-100 aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800"
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${c.id === categoryId ? "opacity-100" : "opacity-0"}`}
                            />
                            {c.ru}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid min-w-0 gap-2">
              <Label htmlFor="mssk-source" className="text-slate-600 dark:text-slate-300">
                Категория МССК
              </Label>
              <Select value={source} onValueChange={(v) => setSource(v)}>
                <SelectTrigger
                  id="mssk-source"
                  className="w-full border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 font-normal text-slate-900 dark:text-slate-100"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
                  <SelectItem value={ALL_SOURCES}>Все классификаторы</SelectItem>
                  {SOURCES.map((s) => (
                    <SelectItem key={s.key} value={s.key}>
                      {s.badge} — {s.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="family" className="text-slate-600 dark:text-slate-300">
                Наименование элемента
              </Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <Input
                  id="family"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Например: Стена наружная трехслойная 420"
                  className="border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 pl-9 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-sm font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {status === "ready" &&
                  (isEmptyQuery
                    ? `Варианты для категории «${category.ru}»`
                    : `Найдено вариантов: ${results.length}`)}
              </h2>
            </div>
            {status === "loading" ? (
              <Card className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <CardContent className="flex items-center justify-center gap-3 p-8 text-slate-400 dark:text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin text-sky-600 dark:text-sky-400" />
                  Загрузка классификатора…
                </CardContent>
              </Card>
            ) : status === "error" ? (
              <Card className="border-dashed border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/60">
                <CardContent className="p-8 text-center text-red-700 dark:text-red-400">
                  Не удалось загрузить данные, обновите страницу
                </CardContent>
              </Card>
            ) : results.length === 0 ? (
              <Card className="border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <CardContent className="p-8 text-center text-slate-400 dark:text-slate-500">
                  Ничего не найдено, попробуйте изменить имя или категорию
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {results.map((r) => (
                  <ResultCard
                    key={`${r.source}-${r.code}`}
                    item={r}
                    inSelection={selectionCodes.has(r.code)}
                    onAdd={addToSelection}
                  />
                ))}
              </div>
            )}
          </section>

          <aside className="lg:sticky lg:top-4">
            <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-slate-900 dark:text-slate-100">Подборка</CardTitle>
                  <Badge variant="outline" className="border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {selection.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3">
                {selection.length === 0 ? (
                  <p className="text-sm text-slate-400 dark:text-slate-500">
                    Подборка пуста — добавляйте коды кнопкой «В подборку»
                  </p>
                ) : (
                  <>
                    <ul className="grid gap-2">
                      {selection.map((item) => (
                        <li
                          key={item.code}
                          className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="font-mono text-sm font-semibold text-sky-700 dark:text-sky-400">
                                  {item.code}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`${BADGE_STYLES[item.badge] ?? ""} px-1.5 py-0 text-[10px]`}
                                >
                                  {item.badge}
                                </Badge>
                              </div>
                              <div className="mt-0.5 truncate text-sm text-slate-900 dark:text-slate-100">
                                {item.name}
                              </div>
                              <div className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                                {item.categoryRu}
                                {item.familyName ? ` / ${item.familyName}` : ""}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFromSelection(item.code)}
                              className="h-7 w-7 shrink-0 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-red-400"
                              title="Удалить из подборки"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={exportCsv}
                        className="flex-1 bg-sky-600 text-white hover:bg-sky-500"
                      >
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        Экспорт CSV
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearSelection}
                        className="border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                        Очистить
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>

        <Collapsible open={aboutOpen} onOpenChange={setAboutOpen} className="mt-10">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
            >
              О классификаторе
              <ChevronsUpDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="mt-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <CardContent className="grid gap-3 p-4 text-sm text-slate-400 dark:text-slate-500">
                <p>
                  МССК — Международная система строительных классификаторов. Подбор ведётся
                  одновременно по пяти классификаторам:
                </p>
                {data ? (
                  <ul className="grid gap-2">
                    {data.sourceCounts.map((s) => (
                      <li key={s.badge} className="flex items-center gap-2">
                        <Badge variant="outline" className={BADGE_STYLES[s.badge] ?? ""}>
                          {s.badge}
                        </Badge>
                        <span className="text-slate-600 dark:text-slate-300">{s.title}</span>
                        <span className="text-slate-400 dark:text-slate-500">— {s.count} записей</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400 dark:text-slate-500">
                    {status === "error" ? "Данные не загружены" : "Загрузка данных…"}
                  </p>
                )}
                <p>
                  Код строится иерархически: категория › подкатегория › класс › подкласс. Для
                  записей классификатора «Элементы» дополнительно указано соответствие классу IFC.
                </p>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
