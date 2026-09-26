/**
 * Конвертер HTML-отчёта ifctester → IDS 0.9.3 (ifctester 0.8.1)
 *
 * Реальная структура отчёта ifctester:
 *  - <section class="specification"> — одна спецификация
 *  - <h2> — заголовок: "IfcBuilding" | "10 IfcSpace (Помещения…)" | "ЭЛ 10 20 10" (без класса)
 *  - Applicability: <ul><li>…</li></ul>
 *      "All <IFCCLASS> data"
 *      "All {'enumeration': ['IFCA','IFCB',…]} data"
 *      "Elements with <Prop> data in the dataset <Pset>"
 *      "Elements with <Prop> data of <Value> in the dataset <Pset>"
 *  - Requirements: <ol><li><details><summary>…</summary>
 *      "<Prop> data shall be provided in the dataset <Pset>"
 *      "<Prop> data shall be <Value> and in the dataset <Pset>"
 *
 * Значения могут быть Python-представлением restriction:
 *   {'enumeration': ['a','b']}, {'minLength': 1}, {'pattern': '…'} и комбинации.
 */

export interface ValueSpec {
  kind: "simple" | "restriction";
  simple?: string;
  enumeration?: string[];
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface EntitySpec {
  value: ValueSpec;
}

export interface PropertySpec {
  propertyName: string;
  propertySet: ValueSpec;
  value?: ValueSpec;
  /** shall → minOccurs=1, may → minOccurs=0 */
  required: boolean;
}

export interface MaterialSpec {
  value?: ValueSpec;
  required: boolean;
}

export interface Specification {
  name: string;
  ifcClass: string | null;
  entity: EntitySpec | null;
  applicabilityProperties: PropertySpec[];
  requirements: PropertySpec[];
  materials: MaterialSpec[];
}

export interface ConversionResult {
  xml: string;
  specifications: Specification[];
  warnings: string[];
}

/* ---------------- Python-dict restriction parsing ---------------- */

const RE_DICT = /^\s*\{[\s\S]*\}\s*$/;

function unquotePyString(s: string): string {
  // строки вида 'a' или "a"; двойная кавычка внутри одинарных — как есть
  return s.replace(/^'([\s\S]*)'$/, "$1").replace(/^"([\s\S]*)"$/, "$1");
}

/** Парсит Python-представление restriction-словаря: {'enumeration': [...], 'minLength': 1, ...} */
export function parseValueSpec(raw: string): ValueSpec {
  const s = raw.trim();
  if (!RE_DICT.test(s)) {
    return { kind: "simple", simple: s };
  }
  const spec: ValueSpec = { kind: "restriction" };

  // enumeration: ['a', 'b', ...] — берём все строковые литералы внутри скобок
  const enumMatch = s.match(/'enumeration'\s*:\s*\[([\s\S]*?)\]/);
  if (enumMatch) {
    spec.enumeration = [];
    const reStr = /'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"/g;
    let m: RegExpExecArray | null;
    while ((m = reStr.exec(enumMatch[1])) !== null) {
      spec.enumeration.push(unquotePyString(m[1] ?? m[2] ?? ""));
    }
  }

  const numField = (name: string): number | undefined => {
    const m = s.match(new RegExp(`'${name}'\\s*:\\s*(\\d+)`));
    return m ? parseInt(m[1], 10) : undefined;
  };
  spec.minLength = numField("minLength");
  spec.maxLength = numField("maxLength");

  const patMatch = s.match(/'pattern'\s*:\s*('((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")/);
  if (patMatch) spec.pattern = unquotePyString(patMatch[1]);

  // Словарь без распознанных ключей — вернём как есть
  if (!spec.enumeration && spec.minLength === undefined && spec.maxLength === undefined && !spec.pattern) {
    return { kind: "simple", simple: s };
  }
  return spec;
}

/* ---------------- DOM parsing of the report ---------------- */

const RE_H2_CLASS = /\bIfc\w+\b/;

function norm(s: string | null | undefined): string {
  return (s ?? "").replace(/\s+/g, " ").trim();
}

function parseApplicabilityLi(text: string, spec: Specification, warnings: string[]): void {
  // "All X data" (X — класс или словарь enumeration)
  const all = text.match(/^All\s+(.+?)\s+data$/i);
  if (all) {
    const value = parseValueSpec(all[1]);
    // Если это просто класс в верхнем регистре, а в заголовке секции есть
    // аккуратное написание (IfcWall), используем его.
    if (value.kind === "simple" && spec.ifcClass) {
      if (value.simple!.toUpperCase() === spec.ifcClass.toUpperCase()) {
        spec.entity = { value: { kind: "simple", simple: spec.ifcClass } };
      } else {
        spec.entity = { value };
      }
    } else {
      spec.entity = { value };
    }
    return;
  }

  // "Elements with <Prop> data [of <Value>] in the dataset <Pset>"
  const el = text.match(/^Elements with\s+(.+?)\s+data(?:\s+of\s+(.+?))?\s+in the dataset\s+(.+)$/i);
  if (el) {
    spec.applicabilityProperties.push({
      propertyName: el[1].trim(),
      propertySet: parseValueSpec(el[3]),
      value: el[2] ? parseValueSpec(el[2]) : undefined,
      required: true,
    });
    return;
  }

  warnings.push(`Не распознана строка применимости: «${text.slice(0, 120)}»`);
}

function parseRequirementSummary(text: string, spec: Specification, warnings: string[]): void {
  // "<Prop> data shall/may be provided in the dataset <Pset>"
  const provided = text.match(/^(.+?)\s+data (shall|may) be provided in the dataset\s+(.+)$/i);
  if (provided) {
    spec.requirements.push({
      propertyName: provided[1].trim(),
      propertySet: parseValueSpec(provided[3]),
      required: provided[2].toLowerCase() === "shall",
    });
    return;
  }
  // "<Prop> data shall/may be <Value> and in the dataset <Pset>"
  const valued = text.match(/^(.+?)\s+data (shall|may) be\s+(.+?)\s+and in the dataset\s+(.+)$/i);
  if (valued) {
    spec.requirements.push({
      propertyName: valued[1].trim(),
      propertySet: parseValueSpec(valued[4]),
      value: parseValueSpec(valued[3]),
      required: valued[2].toLowerCase() === "shall",
    });
    return;
  }
  // "Shall/May have a material of <Value>"
  const material = text.match(/^(shall|may) have a material of\s+(.+)$/i);
  if (material) {
    spec.materials.push({
      value: parseValueSpec(material[2]),
      required: material[1].toLowerCase() === "shall",
    });
    return;
  }
  warnings.push(`Не распознано требование: «${text.slice(0, 120)}»`);
}

/** Парсит HTML-отчёт ifctester в список спецификаций */
export function parseSpecifications(html: string): {
  specifications: Specification[];
  warnings: string[];
} {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const specifications: Specification[] = [];
  const warnings: string[] = [];

  const sections = Array.from(doc.querySelectorAll("section.specification"));
  // запасной вариант — любые section
  const blocks = sections.length > 0 ? sections : Array.from(doc.querySelectorAll("section"));

  for (const section of blocks) {
    const h2 = section.querySelector("h2");
    if (!h2) continue;
    const heading = norm(h2.textContent);
    const classMatch = heading.match(RE_H2_CLASS);

    const spec: Specification = {
      name: heading,
      ifcClass: classMatch ? classMatch[0] : null,
      entity: null,
      applicabilityProperties: [],
      requirements: [],
      materials: [],
    };

    const ul = section.querySelector("ul");
    if (ul) {
      for (const li of Array.from(ul.querySelectorAll(":scope > li"))) {
        parseApplicabilityLi(norm(li.textContent), spec, warnings);
      }
    }

    const ol = section.querySelector("ol");
    if (ol) {
      for (const li of Array.from(ol.querySelectorAll(":scope > li"))) {
        const summary = li.querySelector("summary");
        const text = norm(summary ? summary.textContent : li.textContent);
        if (text) parseRequirementSummary(text, spec, warnings);
      }
    }

    if (spec.entity) {
      specifications.push(spec);
    } else if (spec.applicabilityProperties.length > 0) {
      // entity отсутствует — попробуем вывести из класса заголовка
      if (spec.ifcClass) {
        spec.entity = { value: { kind: "simple", simple: spec.ifcClass } };
        specifications.push(spec);
      } else {
        warnings.push(
          `Секция «${spec.name}»: не найден entity-класс в применимости — секция пропущена.`
        );
      }
    } else {
      warnings.push(`Секция «${spec.name}»: применимость пуста — секция пропущена.`);
    }
  }

  if (specifications.length === 0) {
    warnings.push(
      "Не найдено ни одной спецификации (section.specification с заголовком h2). Проверьте, что загружен HTML-отчёт ifctester."
    );
  }
  for (const spec of specifications) {
    if (spec.requirements.length === 0 && spec.materials.length === 0) {
      warnings.push(`Секция «${spec.name}»: не найдено ни одного требования.`);
    }
  }

  return { specifications, warnings };
}

/* ---------------- IDS 0.9.3 XML generation ---------------- */

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function simpleValue(value: string): string {
  return `<simpleValue>${escapeXml(value)}</simpleValue>`;
}

/** Рендерит <simpleValue>…</simpleValue> или <xs:restriction base="xs:string">…</xs:restriction> */
function valueXml(spec: ValueSpec, indent: string): string[] {
  if (spec.kind === "simple") {
    return [`${indent}${simpleValue(spec.simple ?? "")}`];
  }
  const lines = [`${indent}<xs:restriction base="xs:string">`];
  for (const v of spec.enumeration ?? []) {
    lines.push(`${indent}  <xs:enumeration value="${escapeXml(v)}"/>`);
  }
  if (spec.minLength !== undefined) {
    lines.push(`${indent}  <xs:minLength value="${spec.minLength}"/>`);
  }
  if (spec.maxLength !== undefined) {
    lines.push(`${indent}  <xs:maxLength value="${spec.maxLength}"/>`);
  }
  if (spec.pattern) {
    lines.push(`${indent}  <xs:pattern value="${escapeXml(spec.pattern)}"/>`);
  }
  lines.push(`${indent}</xs:restriction>`);
  return lines;
}

function entityFacet(entity: EntitySpec, indent: string): string[] {
  return [
    `${indent}<entity>`,
    `${indent}  <name>`,
    ...valueXml(entity.value, indent + "    "),
    `${indent}  </name>`,
    `${indent}</entity>`,
  ];
}

function materialFacet(m: MaterialSpec, indent: string): string[] {
  const minOccurs = m.required ? 1 : 0;
  const lines = [
    `${indent}<material minOccurs="${minOccurs}" maxOccurs="1">`,
  ];
  if (m.value) {
    lines.push(`${indent}  <value>`);
    lines.push(...valueXml(m.value, indent + "    "));
    lines.push(`${indent}  </value>`);
  }
  lines.push(`${indent}</material>`);
  return lines;
}

/**
 * Фасет property. По схеме IDS 0.9.x атрибуты minOccurs/maxOccurs допустимы
 * только в <requirements> — в <applicability> property идёт без атрибутов.
 */
function propertyFacet(p: PropertySpec, indent: string, withOccurs: boolean): string[] {
  const minOccurs = p.required ? 1 : 0;
  const open = withOccurs
    ? `${indent}<property minOccurs="${minOccurs}" maxOccurs="1">`
    : `${indent}<property>`;
  const lines = [
    open,
    `${indent}  <propertySet>`,
    ...valueXml(p.propertySet, indent + "    "),
    `${indent}  </propertySet>`,
    `${indent}  <name>`,
    `${indent}  ${simpleValue(p.propertyName)}`,
    `${indent}  </name>`,
  ];
  if (p.value) {
    lines.push(`${indent}  <value>`);
    lines.push(...valueXml(p.value, indent + "    "));
    lines.push(`${indent}  </value>`);
  }
  lines.push(`${indent}</property>`);
  return lines;
}

/** Генерирует валидный IDS 0.9.3 XML из спецификаций */
export function generateIdsXml(
  specifications: Specification[],
  title: string = "IDS, сгенерированный из HTML-отчёта ifctester"
): string {
  const specsXml = specifications
    .map((spec) => {
      const applicabilityLines: string[] = [
        ...entityFacet(spec.entity!, "          "),
      ];
      for (const p of spec.applicabilityProperties) {
        applicabilityLines.push(...propertyFacet(p, "          ", false));
      }
      const requirementLines: string[] = [];
      for (const r of spec.requirements) {
        requirementLines.push(...propertyFacet(r, "          ", true));
      }
      for (const m of spec.materials) {
        requirementLines.push(...materialFacet(m, "          "));
      }

      return [
        `      <specification name="${escapeXml(spec.name)}" minOccurs="0" maxOccurs="unbounded" ifcVersion="IFC2X3 IFC4">`,
        `        <applicability>`,
        ...applicabilityLines,
        `        </applicability>`,
        `        <requirements>`,
        ...requirementLines,
        `        </requirements>`,
        `      </specification>`,
      ].join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<ids xmlns="http://standards.buildingsmart.org/IDS" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://standards.buildingsmart.org/IDS http://standards.buildingsmart.org/IDS/0.9.3/ids.xsd">
  <info>
    <title>${escapeXml(title)}</title>
  </info>
  <specifications>
${specsXml}
  </specifications>
</ids>
`;
}

/** Полный цикл: HTML → IDS XML */
export function convertHtmlToIds(html: string, title?: string): ConversionResult {
  const { specifications, warnings } = parseSpecifications(html);
  const xml = generateIdsXml(specifications, title);
  return { xml, specifications, warnings };
}
