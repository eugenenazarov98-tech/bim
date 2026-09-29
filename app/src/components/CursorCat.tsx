import { useEffect, useRef, useState } from "react";
import { Cat, X } from "lucide-react";

const BLUE = "#2563eb";
const BLUE_DARK = "#60a5fa";
const INK = "#1e293b";
const INK_DARK = "#e2e8f0";
const BELLY = "#dbeafe";
const BELLY_DARK = "#1e3a5f";
const PINK = "#f9a8d4";
const SIZE = 180; // px, ширина котика (в 1,5 раза больше прежнего)
const STORAGE_KEY = "cat-enabled";

/**
 * 11 поз аниме-котика:
 * 0 сидит · 1 бег-1 · 2 бег-2 · 3 прыжок · 4 атака · 5 лежит ·
 * 6 зевота · 7 потягушки · 8 лапка вверх (ловит) · 9 умывается · 10 виляет хвостом
 */
function catSvg(pose: number, body: string, ink: string, belly: string): string {
  const S = 2.5; // толщина контура
  const eyes = (cx: number, cy: number, closed = false) =>
    closed
      ? `<path d="M${cx - 5} ${cy} Q${cx} ${cy + 4} ${cx + 5} ${cy}" fill="none" stroke="${ink}" stroke-width="2.2" stroke-linecap="round"/>`
      : `<ellipse cx="${cx}" cy="${cy}" rx="4.6" ry="5.4" fill="${ink}"/><circle cx="${cx + 1.6}" cy="${cy - 1.8}" r="1.7" fill="white"/>`;
  const nose = (cy: number) =>
    `<path d="M58.5 ${cy} L61.5 ${cy} L60 ${cy + 2.4} Z" fill="${PINK}"/>`;
  const mouth = (cy: number, open = false) =>
    open
      ? `<ellipse cx="60" cy="${cy + 3.5}" rx="3.4" ry="4.4" fill="${PINK}" stroke="${ink}" stroke-width="1.6"/>`
      : `<path d="M56.5 ${cy + 2.5} Q60 ${cy + 5.5} 63.5 ${cy + 2.5}" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>`;
  const whiskers = (cy: number) =>
    `<g stroke="${ink}" stroke-width="1.3" stroke-linecap="round" opacity="0.65">
      <line x1="40" y1="${cy}" x2="30" y2="${cy - 3}"/><line x1="40" y1="${cy + 3.5}" x2="30" y2="${cy + 5}"/>
      <line x1="80" y1="${cy}" x2="90" y2="${cy - 3}"/><line x1="80" y1="${cy + 3.5}" x2="90" y2="${cy + 5}"/>
    </g>`;
  const ears = (cy: number) =>
    `<path d="M42 ${cy - 12} L35 ${cy - 32} L55 ${cy - 20} Z" fill="${body}" stroke="${ink}" stroke-width="${S}" stroke-linejoin="round"/>
     <path d="M43.5 ${cy - 16} L39.5 ${cy - 27} L51 ${cy - 19.5} Z" fill="${PINK}"/>
     <path d="M78 ${cy - 12} L85 ${cy - 32} L65 ${cy - 20} Z" fill="${body}" stroke="${ink}" stroke-width="${S}" stroke-linejoin="round"/>
     <path d="M76.5 ${cy - 16} L80.5 ${cy - 27} L69 ${cy - 19.5} Z" fill="${PINK}"/>`;
  const head = (cy: number, tilt = 0, closedEyes = false, openMouth = false) =>
    `<g transform="rotate(${tilt} 60 ${cy})">
      ${ears(cy)}
      <circle cx="60" cy="${cy}" r="22" fill="${body}" stroke="${ink}" stroke-width="${S}"/>
      ${eyes(51, cy - 2, closedEyes)}${eyes(69, cy - 2, closedEyes)}
      ${nose(cy + 2)}${mouth(cy + 2, openMouth)}
      ${whiskers(cy + 1)}
    </g>`;
  const bodyE = (cx: number, cy: number, rx: number, ry: number, rot = 0) =>
    `<g transform="rotate(${rot} ${cx} ${cy})"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${body}" stroke="${ink}" stroke-width="${S}"/>
     <ellipse cx="${cx}" cy="${cy + ry * 0.25}" rx="${rx * 0.55}" ry="${ry * 0.6}" fill="${belly}"/></g>`;
  const paws = (pts: [number, number][], r = 7) =>
    pts.map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.72}" fill="${body}" stroke="${ink}" stroke-width="${S}"/>`).join("");
  const tail = (d: string) =>
    `<path d="${d}" fill="none" stroke="${body}" stroke-width="10" stroke-linecap="round"/>
     <path d="${d}" fill="none" stroke="${ink}" stroke-width="10" stroke-linecap="round" stroke-dasharray="0.1 999" opacity="0"/>`;
  const tailTip = (x: number, y: number) => `<circle cx="${x}" cy="${y}" r="5.5" fill="${belly}"/>`;

  let inner = "";
  switch (pose) {
    case 0: // сидит
      inner = tail("M38 92 Q16 88 20 64") + tailTip(20, 64) + bodyE(60, 88, 25, 19) + paws([[46, 105], [74, 105]]) + head(54);
      break;
    case 1: // бег 1 — передние лапы вперёд
      inner = tail("M32 62 Q8 56 10 36") + tailTip(10, 36) + bodyE(60, 62, 31, 15) + paws([[90, 62], [84, 76], [32, 80], [26, 92]]) + head(38, -6);
      break;
    case 2: // бег 2 — задние лапы вперёд
      inner = tail("M32 62 Q10 68 12 86") + tailTip(12, 86) + bodyE(60, 62, 31, 15) + paws([[82, 86], [88, 74], [38, 60], [30, 74]]) + head(38, 6);
      break;
    case 3: // прыжок — лапы подтянуты
      inner = tail("M34 58 Q14 48 20 30") + tailTip(20, 30) + bodyE(60, 58, 29, 16) + paws([[86, 66], [90, 56], [36, 66], [32, 56]]) + head(34, 0);
      break;
    case 4: // атака — лапы вытянуты вперёд, коготки
      inner = tail("M28 60 Q6 54 8 34") + tailTip(8, 34) + bodyE(52, 62, 31, 14) +
        paws([[100, 52], [102, 66], [30, 74], [24, 86]]) +
        `<g stroke="${ink}" stroke-width="1.6" stroke-linecap="round"><line x1="103" y1="50" x2="109" y2="47"/><line x1="104" y1="54" x2="110" y2="53"/><line x1="105" y1="64" x2="111" y2="63"/></g>` +
        head(34, -10);
      break;
    case 5: // лежит, свесив лапки
      inner = tail("M34 84 Q14 84 12 96") + tailTip(12, 96) + bodyE(62, 84, 32, 14) + paws([[84, 96], [94, 96], [40, 96], [50, 96]], 6) + head(62, -8);
      break;
    case 6: // зевает
      inner = tail("M38 92 Q18 90 20 70") + tailTip(20, 70) + bodyE(60, 88, 25, 19) + paws([[46, 105], [74, 105]]) + head(54, 0, true, true);
      break;
    case 7: // потягушки — вытянулся вверх
      inner = tail("M40 100 Q20 104 18 92") + tailTip(18, 92) +
        bodyE(60, 84, 18, 26, -8) + paws([[52, 44], [68, 44], [50, 108], [70, 108]], 6) + head(34, 4, true);
      break;
    case 8: // лапка вверх — ловит курсор
      inner = tail("M36 94 Q16 92 18 72") + tailTip(18, 72) + bodyE(60, 88, 25, 19) +
        paws([[46, 105], [74, 105]]) +
        `<ellipse cx="88" cy="30" rx="7" ry="9" fill="${body}" stroke="${ink}" stroke-width="${S}" transform="rotate(30 88 30)"/>` +
        head(52, 8);
      break;
    case 9: // умывается — лапка у мордочки
      inner = tail("M38 92 Q18 90 20 70") + tailTip(20, 70) + bodyE(60, 88, 25, 19) + paws([[46, 105], [74, 105]]) +
        `<ellipse cx="72" cy="52" rx="7" ry="8" fill="${body}" stroke="${ink}" stroke-width="${S}" transform="rotate(-25 72 52)"/>` +
        head(54, 6, true);
      break;
    default: // 10 — виляет хвостом стоя
      inner = tail("M34 76 Q10 60 22 44") + tailTip(22, 44) + bodyE(60, 74, 20, 24) + paws([[50, 102], [70, 102]]) + head(44, -4);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 112" width="${SIZE}" height="${SIZE}">${inner}</svg>`;
}

const CURSOR_SVG = (c: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
    <path d="M4 2 L4 18 L8.4 13.8 L11 20 L13.6 18.6 L11 12.6 L16.8 12.6 Z" fill="${c}" stroke="white" stroke-width="1.2"/>
  </svg>`;

const dataUri = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

function isTouchDevice(): boolean {
  return typeof window !== "undefined" &&
    (window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window);
}

export function CursorCat() {
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === null ? true : saved === "1";
  });
  const catRef = useRef<HTMLDivElement>(null);
  const touch = isTouchDevice();

  useEffect(() => {
    if (touch) return;
    const apply = () => {
      const dark = document.documentElement.classList.contains("dark");
      document.body.style.cursor = dataUri(CURSOR_SVG(dark ? BLUE_DARK : BLUE)) + " 2 2, auto";
    };
    apply();
    const obs = new MutationObserver(apply);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => {
      obs.disconnect();
      document.body.style.cursor = "";
    };
  }, [touch]);

  useEffect(() => {
    if (touch || !enabled) return;
    const el = catRef.current;
    if (!el) return;
    el.style.display = "block";

    let tx = window.innerWidth / 2, ty = window.innerHeight / 2;
    let x = tx, y = ty, vx = 0, vy = 0, raf = 0, t = 0;
    let pose = 0, lastPose = -1;
    let runPhase = 0, idleTime = 0, blinkT = 0, breathing = 0;

    const render = (p: number) => {
      const dark = document.documentElement.classList.contains("dark");
      el.innerHTML = catSvg(p, dark ? BLUE_DARK : BLUE, dark ? INK_DARK : INK, dark ? BELLY_DARK : BELLY);
    };

    const onMove = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY; };
    window.addEventListener("mousemove", onMove);

    const loop = () => {
      t += 1 / 60;
      const k = 0.035, damp = 0.88;
      vx = (vx + (tx - x) * k) * damp;
      vy = (vy + (ty - y) * k) * damp;
      x += vx; y += vy;
      const speed = Math.hypot(vx, vy);
      const dist = Math.hypot(tx - x, ty - y);

      if (speed > 2) { idleTime = 0; } else { idleTime += 1 / 60; }

      // выбор позы
      if (speed > 14) pose = 4;                                  // атака
      else if (speed > 3.5) {                                    // бег: чередование фаз
        runPhase += speed / 60;
        pose = Math.floor(runPhase * 3) % 2 === 0 ? 1 : 2;
      }
      else if (dist > 60) pose = 3;                              // прыжок к цели
      else if (idleTime > 12) pose = 5;                          // долго сидит — лёг
      else if (idleTime > 8) pose = 9;                           // умывается
      else if (idleTime > 5) pose = 6;                           // зевает
      else if (idleTime > 2.5) pose = 10;                        // виляет хвостом
      else pose = 0;

      if (pose !== lastPose) { lastPose = pose; render(pose); }

      // живость: дыхание и покачивание на месте, подпрыгивание в движении
      breathing = Math.sin(t * 2.2) * 2;
      blinkT = speed > 1 ? Math.abs(Math.sin(t * 10)) * Math.min(18, 4 + speed * 0.5) : 0;
      const idleBob = speed <= 1 ? Math.sin(t * 3) * 3 : 0;
      const rot = Math.max(-16, Math.min(16, vx * 0.7)) + (speed <= 1 ? Math.sin(t * 1.7) * 2 : 0);
      const flip = vx < -0.4 ? -1 : 1;
      const squash = pose === 3 ? 1 + Math.sin(t * 8) * 0.04 : 1;
      el.style.transform =
        `translate(${x - SIZE / 2}px, ${y - SIZE - 10 - blinkT - idleBob + (speed <= 1 ? breathing : 0)}px) ` +
        `rotate(${rot}deg) scaleX(${flip}) scaleY(${squash})`;
      raf = requestAnimationFrame(loop);
    };
    render(0);
    raf = requestAnimationFrame(loop);

    const obs = new MutationObserver(() => render(lastPose < 0 ? 0 : lastPose));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      obs.disconnect();
      el.style.display = "none";
    };
  }, [enabled, touch]);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  };

  if (touch) return null;

  return (
    <>
      <div
        ref={catRef}
        aria-hidden="true"
        style={{
          position: "fixed", top: 0, left: 0, width: SIZE, height: SIZE,
          pointerEvents: "none", zIndex: 9999, display: "none", willChange: "transform",
        }}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={enabled ? "Отключить котика" : "Включить котика"}
        title={enabled ? "Отключить котика" : "Включить котика"}
        className={`fixed bottom-4 left-4 z-50 inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-medium shadow-sm transition-colors ${
          enabled
            ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-500"
            : "border-slate-200 bg-white text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
        }`}
      >
        {enabled ? <Cat className="h-4 w-4" /> : <X className="h-4 w-4" />}
        {enabled ? "Котик вкл" : "Котик выкл"}
      </button>
    </>
  );
}
