import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  FileUp,
  ArrowRight,
  Download,
  Copy,
  Check,
  FileCode2,
  AlertTriangle,
  Sparkles,
  ClipboardPaste,
  FileCheck2,
  ListChecks,
  Building2,
} from "lucide-react";
import { convertHtmlToIds, type ConversionResult } from "@/lib/idsConverter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CursorCat } from "@/components/CursorCat";

const SAMPLE_HTML = `<html><body>
<section class="specification">
<h2>IfcWall (Стены)</h2>
<p><strong>Applicability</strong></p>
<ul><li>All IFCWALL data</li></ul>
<p><strong>Requirements</strong></p>
<ol>
<li><details><summary>IsExternal data shall be provided in the dataset Pset_WallCommon</summary></details></li>
<li><details><summary>LoadBearing data shall be ИСТИНА and in the dataset Pset_WallCommon</summary></details></li>
<li><details><summary>FireRating data may be provided in the dataset Pset_WallCommon</summary></details></li>
</ol>
</section>
<section class="specification">
<h2>IfcDoor (Двери)</h2>
<p><strong>Applicability</strong></p>
<ul><li>All IFCDOOR data</li></ul>
<p><strong>Requirements</strong></p>
<ol>
<li><details><summary>MGE_ElementCode data shall be {'minLength': 1} and in the dataset ExpCheck_Door</summary></details></li>
</ol>
</section>
</body></html>`;

function highlightXml(xml: string): ReactNode[] {
  const lines = xml.split("\n");
  return lines.map((line, i) => {
    // Простая подсветка: теги, атрибуты, значения
    const parts: ReactNode[] = [];
    let key = 0;
    const regex = /(<\/?[a-zA-Z:?][^>]*>)|("[^"]*")|([^<"]+)/g;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(line)) !== null) {
      const [full, tag, attr, text] = m;
      if (tag) {
        parts.push(
          <span key={key++} className="text-sky-700 dark:text-sky-400">
            {tag}
          </span>
        );
      } else if (attr) {
        parts.push(
          <span key={key++} className="text-amber-700">
            {attr}
          </span>
        );
      } else if (text) {
        parts.push(
          <span key={key++} className="text-slate-700 dark:text-slate-300">
            {text}
          </span>
        );
      }
      void full;
    }
    return (
      <div key={i} className="whitespace-pre leading-6">
        {parts}
      </div>
    );
  });
}

export default function IdsConverter() {
  const [html, setHtml] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [idsTitle, setIdsTitle] = useState("IDS, сгенерированный из HTML-отчёта ifctester");
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const highlighted = useMemo(
    () => (result ? highlightXml(result.xml) : null),
    [result]
  );

  const handleFile = useCallback((file: File) => {
    // Читаем как ArrayBuffer и декодируем вручную: так надёжнее на мобильных
    // браузерах и для отчётов в кодировке windows-1251.
    const reader = new FileReader();
    reader.onload = () => {
      const buf = reader.result as ArrayBuffer;
      const bytes = new Uint8Array(buf);
      // BOM UTF-8
      let text: string;
      if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
        text = new TextDecoder("utf-8").decode(bytes.subarray(3));
      } else {
        text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
        // если много U+FFFD (replacement chars) — вероятно windows-1251
        const bad = text.split("�").length - 1;
        if (bad > text.length / 200) {
          try {
            text = new TextDecoder("windows-1251").decode(bytes);
          } catch {
            /* оставляем utf-8 */
          }
        }
      }
      setHtml(text);
      setFileName(file.name);
      setResult(null);
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const onConvert = useCallback(() => {
    if (!html.trim()) return;
    setResult(convertHtmlToIds(html, idsTitle.trim() || undefined));
  }, [html, idsTitle]);

  const onDownload = useCallback(() => {
    if (!result) return;
    const blob = new Blob([result.xml], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const base = (fileName ?? "ifctester-report").replace(/\.(html?|ids)$/i, "");
    a.href = url;
    a.download = `${base}.ids`;
    a.click();
    URL.revokeObjectURL(url);
  }, [result, fileName]);

  const onCopy = useCallback(async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.xml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  const totalRequirements = result
    ? result.specifications.reduce(
        (sum, s) => sum + s.requirements.length + s.materials.length,
        0
      )
    : 0;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <CursorCat />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <header className="mb-2">
          <div className="flex items-center justify-between">
            <a href="../" className="text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
              ← На главную
            </a>
            <ThemeToggle />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Конвертер отчётов ifctester в IDS
            </h1>
            <Badge variant="outline" className="border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              IDS v0.9.3
            </Badge>
          </div>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Преобразование HTML-отчёта проверки IFC-модели в файл IDS 0.9.3 (ifctester 0.8.1)
          </p>
        </header>

        {/* Steps */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { icon: FileUp, title: "1. Загрузите отчёт", text: "Вставьте HTML или перетащите файл отчёта ifctester" },
            { icon: ArrowRight, title: "2. Конвертируйте", text: "Секции превратятся в спецификации IDS 0.9.3" },
            { icon: Download, title: "3. Скачайте .ids", text: "Готовый файл для проверки IFC-модели" },
          ].map((s) => (
            <Card key={s.title} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              <CardContent className="pt-5 flex gap-3 items-start">
                <div className="h-8 w-8 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  <s.icon className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm">{s.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.text}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 items-start min-w-0">
          {/* Input */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 min-w-0">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardPaste className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                HTML-отчёт ifctester
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Вставьте содержимое отчёта или загрузите файл .html
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFile(file);
                }}
                className={`border-2 border-dashed rounded-lg p-5 text-center transition-colors cursor-pointer ${
                  dragOver
                    ? "border-sky-500 bg-sky-50 dark:bg-sky-950/60"
                    : "border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500"
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <FileUp className="h-6 w-6 mx-auto text-slate-400 dark:text-slate-500 mb-2" />
                {fileName ? (
                  <p className="text-sm text-sky-700 dark:text-sky-400 flex items-center justify-center gap-2 break-all">
                    <FileCheck2 className="h-4 w-4 shrink-0" /> {fileName}
                  </p>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Перетащите файл отчёта сюда или нажмите для выбора
                  </p>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".html,.htm"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
              </div>

              <Textarea
                value={html}
                onChange={(e) => {
                  setHtml(e.target.value);
                  setFileName(null);
                }}
                placeholder="<html>… вставьте HTML-отчёт ifctester …</html>"
                className="min-h-[220px] font-mono text-xs bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 w-full max-w-full break-all whitespace-pre-wrap"
              />

              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 dark:text-slate-400">Название IDS (элемент &lt;title&gt;)</label>
                <Input
                  value={idsTitle}
                  onChange={(e) => setIdsTitle(e.target.value)}
                  className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-sm"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={onConvert}
                  disabled={!html.trim()}
                  className="flex-1 bg-sky-600 hover:bg-sky-500 text-white"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Конвертировать в IDS
                </Button>
                <Button
                  variant="outline"
                  className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => {
                    setHtml(SAMPLE_HTML);
                    setFileName(null);
                    setResult(null);
                  }}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Пример
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Output */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 min-w-0">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileCode2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                IDS 0.9.3 XML
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                {result
                  ? "Готовый IDS-файл — скопируйте или скачайте"
                  : "Результат появится после конвертации"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {result ? (
                <>
                  {result.warnings.length > 0 && (
                    <Alert className="bg-amber-50 border-amber-300">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <AlertTitle className="text-amber-800 text-sm">Предупреждения</AlertTitle>
                      <AlertDescription className="text-amber-800/80 text-xs">
                        <ul className="list-disc pl-4 space-y-1">
                          {result.warnings.map((w, i) => (
                            <li key={i}>{w}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 gap-1.5">
                      <Building2 className="h-3 w-3" />
                      Спецификаций: {result.specifications.length}
                    </Badge>
                    <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 gap-1.5">
                      <ListChecks className="h-3 w-3" />
                      Требований: {totalRequirements}
                    </Badge>
                  </div>

                  <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 max-h-[420px] overflow-auto w-full max-w-full">
                    <div className="p-4 font-mono text-xs w-max">{highlighted}</div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={onDownload}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 dark:hover:bg-emerald-500 text-white"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Скачать .ids
                    </Button>
                    <Button
                      variant="outline"
                      onClick={onCopy}
                      className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                          Скопировано
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Копировать
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Specifications summary */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Найденные спецификации
                    </p>
                    <div className="space-y-1.5 max-h-48 overflow-auto pr-1">
                      {result.specifications.map((s, i) => (
                        <div
                          key={i}
                          className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 flex items-center gap-2"
                        >
                          <Badge variant="outline" className="border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-400 font-mono shrink-0">
                            {s.ifcClass ?? "—"}
                          </Badge>
                          <span className="text-slate-700 dark:text-slate-300 truncate">{s.name}</span>
                          <span className="ml-auto text-slate-500 dark:text-slate-400 shrink-0">
                            {s.requirements.length + s.materials.length} треб.
                            {s.applicabilityProperties.length > 0 &&
                              ` · ${s.applicabilityProperties.length} фасет применимости`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-600 p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                  <FileCode2 className="h-10 w-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                  Загрузите HTML-отчёт и нажмите «Конвертировать в IDS»
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Rules */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-base">Правила конвертации</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs text-slate-500 dark:text-slate-400">
              <div className="space-y-1">
                <p className="text-slate-800 dark:text-slate-200 font-medium">Секция → specification</p>
                <p>
                  Заголовок «<span className="font-mono text-sky-700 dark:text-sky-400">IfcClass/Название</span>»
                  становится спецификацией с именем секции.
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-800 dark:text-slate-200 font-medium">Applicability</p>
                <p>
                  «<span className="font-mono text-sky-700 dark:text-sky-400">All IFC… data</span>» → фасет{" "}
                  <span className="font-mono">entity</span>. «
                  <span className="font-mono text-sky-700 dark:text-sky-400">
                    Elements with … in the dataset …
                  </span>
                  » → фасет <span className="font-mono">property</span> применимости.
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-800 dark:text-slate-200 font-medium">Requirements</p>
                <p>
                  «<span className="font-mono text-sky-700 dark:text-sky-400">
                    … data shall/may be [значение and] in the dataset …
                  </span>
                  » → фасеты <span className="font-mono">property</span> с{" "}
                  <span className="font-mono">minOccurs</span> (shall → 1, may → 0); значения-
                  перечисления → <span className="font-mono">xs:restriction</span>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <footer className="text-center text-xs text-slate-600 dark:text-slate-300 pb-6">
          Конвертация выполняется локально в браузере — данные не покидают ваш компьютер.
        </footer>
      </main>
    </div>
  );
}
