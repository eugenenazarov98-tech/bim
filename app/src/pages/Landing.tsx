import { ArrowRight, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MGE_PDF_URL } from "@/data/links";
import { logoDataUri } from "@/assets/logo";

interface ServiceLink {
  title: string;
  desc: string;
  href: string;
  external: boolean;
}

const services: ServiceLink[] = [
  {
    title: "Классификация элементов информационной модели",
    desc: "Подбор класса и кода МССК по категории и наименованию элемента",
    href: "classificationmge/",
    external: false,
  },
  {
    title: "Наполнение элементов информационной модели",
    desc: "Mapping ЦИМ АР · соответствие параметров IFC, ФОП и требований МГЭ",
    href: "mapping/",
    external: false,
  },
  {
    title: "Требования к ЦИМ АР (МКЭ-ОД-24-178, ч. 2)",
    desc: "Внешний документ PDF на mos.ru",
    href: MGE_PDF_URL,
    external: true,
  },
  {
    title: "Конвертер отчётов ifctester в IDS",
    desc: "Преобразование HTML-отчёта проверки IFC-модели в файл IDS 0.9.3",
    href: "ids-converter/",
    external: false,
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-10">
        <img src={logoDataUri} alt="МОСПРОЕКТ" className="h-12 w-auto self-start" />
        <h1 className="mt-10 text-3xl font-bold tracking-tight">
          Сервисы МОСПРОЕКТ · Информационная модель
        </h1>
        <div className="mt-8 grid gap-4">
          {services.map((s) => (
            <a
              key={s.href}
              href={s.href}
              {...(s.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="group block"
            >
              <Card className="border-slate-200 bg-white transition-colors group-hover:border-sky-300 group-hover:bg-sky-50/50">
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div>
                    <div className="text-lg font-medium text-slate-900 group-hover:text-sky-800">
                      {s.title}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">{s.desc}</div>
                  </div>
                  {s.external ? (
                    <ExternalLink className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-sky-600" />
                  ) : (
                    <ArrowRight className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-sky-600" />
                  )}
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
        <p className="mt-auto pt-10 text-sm text-slate-400">
          МССК вер. 5.0 · Mapping ЦИМ АР v1.0
        </p>
      </div>
    </div>
  );
}
