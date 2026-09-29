import { useEffect, useRef, useState } from "react";
import { Cat, X } from "lucide-react";

const BLUE = "#2563eb";
const BLUE_DARK = "#60a5fa";
const INK = "#1e293b";
const INK_DARK = "#e2e8f0";
const SIZE = 120; // px, ширина котика (в 3 раза больше прежнего)
const STORAGE_KEY = "cat-enabled";

/** 5 поз аниме-котика: сидит, бежит-1, бежит-2, прыжок, атака-прыжок */
function catSvg(pose: number, body: string, ink: string): string {
  const E = (cx: number, cy: number) =>
    `<circle cx="${cx}" cy="${cy}" r="4.5" fill="${ink}"/><circle cx="${cx + 1.5}" cy="${cy - 1.5}" r="1.6" fill="white"/>`;
  const head = (cy: number, tilt = 0) =>
    `<g transform="rotate(${tilt} 60 ${cy})">
      <path d="M42 ${cy - 12} L36 ${cy - 30} L54 ${cy - 20} Z" fill="${body}" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M78 ${cy - 12} L84 ${cy - 30} L66 ${cy - 20} Z" fill="${body}" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="60" cy="${cy}" r="22" fill="${body}" stroke="${ink}" stroke-width="2.5"/>
      ${E(51, cy - 2)}${E(69, cy - 2)}
      <path d="M57 ${cy + 6} Q60 ${cy + 9} 63 ${cy + 6}" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>
    </g>`;
  const bodyE = (cy: number, rx: number, ry: number) =>
    `<ellipse cx="60" cy="${cy}" rx="${rx}" ry="${ry}" fill="${body}" stroke="${ink}" stroke-width="2.5"/>`;
  const paws = (pts: [number, number][]) =>
    pts.map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="7" ry="5" fill="${body}" stroke="${ink}" stroke-width="2.5"/>`).join("");
  const tail = (d: string) =>
    `<path d="${d}" fill="none" stroke="${body}" stroke-width="9" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${ink}" stroke-width="12" stroke-linecap="round" opacity="0" stroke-dasharray="0"/>`;

  let inner = "";
  switch (pose) {
    case 0: // сидит
      inner = bodyE(84, 24, 18) + head(52) + paws([[46, 100], [74, 100]]) +
        tail("M38 88 Q18 84 22 62");
      break;
    case 1: // бег 1 — передние лапы вперёд
      inner = bodyE(60, 30, 15) + head(38, -6) + paws([[88, 62], [82, 74], [34, 78], [28, 90]]) +
        tail("M32 62 Q10 56 12 38");
      break;
    case 2: // бег 2 — задние лапы вперёд
      inner = bodyE(60, 30, 15) + head(38, 6) + paws([[80, 84], [86, 72], [38, 62], [30, 74]]) +
        tail("M32 62 Q12 66 14 82");
      break;
    case 3: // прыжок — все лапы подтянуты
      inner = bodyE(60, 28, 16) + head(34, 0) + paws([[84, 66], [88, 58], [36, 66], [32, 58]]) +
        tail("M34 58 Q16 48 22 32");
      break;
    default: // 4 — атака: лапы вытянуты вперёд
      inner = bodyE(54, 30, 14) + head(34, -10) + paws([[98, 52], [100, 64], [30, 72], [24, 84]]) +
        tail("M28 60 Q8 54 10 36");
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
  const btnRef = useRef<HTMLButtonElement>(null);
  const touch = isTouchDevice();

  // применяем курсор всегда (десктоп), котик — только если включён
  useEffect(() => {
    if (touch) return; // на мобильных котик и кастомный курсор не нужны
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

  // анимация котика
  useEffect(() => {
    if (touch || !enabled) return;
    const el = catRef.current;
    if (!el) return;
    el.style.display = "block";

    let tx = window.innerWidth / 2, ty = window.innerHeight / 2;
    let x = tx, y = ty, vx = 0, vy = 0, raf = 0, t = 0;
    let pose = 0, poseAge = 0, lastPose = -1;

    const render = () => {
      const dark = document.documentElement.classList.contains("dark");
      const body = dark ? BLUE_DARK : BLUE;
      const ink = dark ? INK_DARK : INK;
      if (el) el.innerHTML = catSvg(pose, body, ink);
    };

    const onMove = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY; };
    window.addEventListener("mousemove", onMove);

    const loop = () => {
      t += 1 / 60; poseAge += 1 / 60;
      // чуть замедленное преследование: пружина послабее
      const k = 0.035, damp = 0.88;
      vx = (vx + (tx - x) * k) * damp;
      vy = (vy + (ty - y) * k) * damp;
      x += vx; y += vy;
      const speed = Math.hypot(vx, vy);

      // выбор позы
      if (speed > 14) pose = 4;                       // атака на догонялках
      else if (speed > 3.5) pose = poseAge > 0.14 ? (pose === 1 ? 2 : 1) : pose; // бег: чередование
      else if (Math.hypot(tx - x, ty - y) > 60) pose = 3; // прыжок к цели
      else pose = 0;                                   // сидит у курсора
      if (pose === 1 || pose === 2) { if (poseAge > 0.14) poseAge = 0; }
      if (pose !== lastPose) { lastPose = pose; render(); }

      const bounce = speed > 1 ? Math.abs(Math.sin(t * 10)) * Math.min(18, 4 + speed * 0.5) : 0;
      const rot = Math.max(-16, Math.min(16, vx * 0.7));
      const flip = vx < -0.4 ? -1 : 1;
      el.style.transform = `translate(${x - SIZE / 2}px, ${y - SIZE - 10 - bounce}px) rotate(${rot}deg) scaleX(${flip})`;
      raf = requestAnimationFrame(loop);
    };
    render();
    raf = requestAnimationFrame(loop);

    // перекраска при смене темы
    const obs = new MutationObserver(render);
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
        ref={btnRef}
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
