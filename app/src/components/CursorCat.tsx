import { useEffect, useRef } from "react";

const BLUE = "#2563eb";
const BLUE_DARK = "#60a5fa";

/** Прыгающий котик (стиль Bongo Cat), бегущий за курсором */
const CAT_SVG = (c: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 36" fill="${c}">
    <!-- ушки -->
    <path d="M10 15 L7 5 L17 11 Z"/>
    <path d="M30 15 L33 5 L23 11 Z"/>
    <!-- голова -->
    <ellipse cx="20" cy="16" rx="13" ry="10"/>
    <!-- тело -->
    <ellipse cx="20" cy="29" rx="10" ry="6"/>
    <!-- лапки -->
    <ellipse cx="13" cy="33" rx="4" ry="2.5"/>
    <ellipse cx="27" cy="33" rx="4" ry="2.5"/>
  </svg>`;

/** Монохромная синяя стрелка-курсор */
const CURSOR_SVG = (c: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
    <path d="M4 2 L4 18 L8.4 13.8 L11 20 L13.6 18.6 L11 12.6 L16.8 12.6 Z" fill="${c}" stroke="white" stroke-width="1.2"/>
  </svg>`;

const dataUri = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

export function CursorCat() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dark = document.documentElement.classList.contains("dark");
    const color = dark ? BLUE_DARK : BLUE;

    document.body.style.cursor = dataUri(CURSOR_SVG(color)) + " 2 2, auto";

    const el = ref.current;
    if (!el) return;
    el.innerHTML = CAT_SVG(color);
    el.style.display = "block";

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let x = tx, y = ty, vx = 0, vy = 0, raf = 0, t = 0;

    const onMove = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY; };
    window.addEventListener("mousemove", onMove);

    const loop = () => {
      t += 1 / 60;
      // пружина: котик догоняет курсор
      const k = 0.06, damp = 0.82;
      vx = (vx + (tx - x) * k) * damp;
      vy = (vy + (ty - y) * k) * damp;
      x += vx; y += vy;
      const speed = Math.hypot(vx, vy);
      // подпрыгивание, сильнее при беге
      const bounce = Math.abs(Math.sin(t * 9)) * Math.min(10, 3 + speed * 0.25);
      const rot = Math.max(-14, Math.min(14, vx * 0.9));
      const flip = vx < -0.5 ? -1 : 1;
      el.style.transform = `translate(${x - 14}px, ${y - 58 - bounce}px) rotate(${rot}deg) scaleX(${flip})`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      document.body.style.cursor = "";
    };
  }, []);

  // отслеживаем смену темы, чтобы перекрасить курсор и котика
  useEffect(() => {
    const obs = new MutationObserver(() => {
      // триггерим пересоздание через смену состояния эффекта: просто обновим cursor
      const dark = document.documentElement.classList.contains("dark");
      document.body.style.cursor = dataUri(CURSOR_SVG(dark ? BLUE_DARK : BLUE)) + " 2 2, auto";
      const svg = ref.current?.querySelector("svg");
      svg?.setAttribute("fill", dark ? BLUE_DARK : BLUE);
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 40,
        height: 36,
        pointerEvents: "none",
        zIndex: 9999,
        display: "none",
        willChange: "transform",
      }}
    />
  );
}
