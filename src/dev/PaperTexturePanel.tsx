import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { z } from "zod";
import { paperSchema } from "../models/paper";
import {
  BAEKSANGJI,
  type PaperParams,
  paperCssVars,
} from "../styles/paper-texture";
import panelCss from "./paper-panel.css?inline";

const PARAMS_KEY = "dev:paper-texture";
const UI_KEY = "dev:paper-texture:ui";
const FMIN = 0.008;
const FMAX = 1.4;
type Point = { x: number; y: number };
const uiSchema = z.object({
  open: z.boolean(),
  x: z.number().nullable(),
  y: z.number().nullable(),
});
const controls = [
  { key: "freq", label: "결의 크기", min: 0, max: 1000, step: 1 },
  { key: "oct", label: "결의 겹 수", min: 1, max: 6, step: 1 },
  { key: "ss", label: "요철 깊이", min: 0, max: 6, step: 0.1 },
  { key: "k", label: "진하기", min: 0, max: 1, step: 0.01 },
  { key: "fib", label: "섬유", min: 0, max: 1, step: 0.01 },
  { key: "sp", label: "티끌", min: 0, max: 1, step: 0.01 },
  { key: "tile", label: "타일 크기", min: 160, max: 640, step: 20 },
] as const;

function readJson(key: string): unknown {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null");
  } catch {
    return null;
  }
}

export function PaperTexturePanel({
  initialParams,
  onGridChange,
}: {
  initialParams: PaperParams;
  onGridChange: (visible: boolean) => void;
}) {
  const [initial] = useState(() => ({
    params: paperSchema.safeParse(readJson(PARAMS_KEY)),
    ui: uiSchema.safeParse(readJson(UI_KEY)),
  }));
  const [params, setParams] = useState(initial.params.data ?? initialParams);
  const [open, setOpen] = useState(
    window.innerWidth > 480 && (initial.ui.data?.open ?? false),
  );
  const [position, setPosition] = useState<Point | null>(() => {
    const ui = initial.ui.data;
    return ui && ui.x !== null && ui.y !== null ? { x: ui.x, y: ui.y } : null;
  });
  const [grid, setGrid] = useState(false);
  const [message, setMessage] = useState("");
  const [copyFallback, setCopyFallback] = useState("");
  const wrapper = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const drag = useRef<(Point & { startX: number; startY: number }) | null>(
    null,
  );
  const skipSave = useRef(true);
  const previousOpen = useRef(open);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      for (const [name, value] of Object.entries(paperCssVars(params))) {
        document.documentElement.style.setProperty(name, value);
      }
    });
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (skipSave.current) skipSave.current = false;
    else {
      timer = setTimeout(() => {
        try {
          localStorage.setItem(PARAMS_KEY, JSON.stringify(params));
        } catch {
          setMessage("이 브라우저에서는 조정값을 저장할 수 없습니다.");
        }
      }, 150);
    }
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [params]);

  useEffect(() => {
    try {
      localStorage.setItem(
        UI_KEY,
        JSON.stringify({
          open,
          x: position?.x ?? null,
          y: position?.y ?? null,
        }),
      );
    } catch {
      setMessage("이 브라우저에서는 패널 위치를 저장할 수 없습니다.");
    }
  }, [open, position]);

  useEffect(() => {
    onGridChange(grid);
    return () => onGridChange(false);
  }, [grid, onGridChange]);

  useEffect(() => {
    const shortcut = (event: globalThis.KeyboardEvent) => {
      if (
        event.altKey &&
        event.shiftKey &&
        event.code === "KeyP" &&
        !event.metaKey &&
        !event.ctrlKey
      ) {
        event.preventDefault();
        setOpen((value) => !value);
      } else if (event.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, [open]);

  const clamp = useCallback((point: Point): Point => {
    const rect = wrapper.current?.getBoundingClientRect();
    return {
      x: Math.max(
        12,
        Math.min(point.x, window.innerWidth - (rect?.width ?? 0) - 12),
      ),
      y: Math.max(
        12,
        Math.min(point.y, window.innerHeight - (rect?.height ?? 0) - 12),
      ),
    };
  }, []);

  useLayoutEffect(() => {
    const fitToViewport = () =>
      setPosition((point) => {
        if (!point) return null;
        const next = clamp(point);
        return point.x === next.x && point.y === next.y ? point : next;
      });
    const observer = new ResizeObserver(fitToViewport);
    if (wrapper.current) observer.observe(wrapper.current);
    fitToViewport();
    window.addEventListener("resize", fitToViewport);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fitToViewport);
    };
  }, [clamp]);

  useEffect(() => {
    if (!previousOpen.current && open)
      wrapper.current
        ?.querySelector<HTMLButtonElement>(".drag-handle")
        ?.focus({ preventScroll: true });
    else if (previousOpen.current && !open)
      toggle.current?.focus({ preventScroll: true });
    previousOpen.current = open;
  }, [open]);

  function startDrag(event: PointerEvent<HTMLButtonElement>) {
    const rect = wrapper.current?.getBoundingClientRect();
    if (!rect || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      x: rect.x,
      y: rect.y,
      startX: event.clientX,
      startY: event.clientY,
    };
  }

  function moveDrag(event: PointerEvent<HTMLButtonElement>) {
    const start = drag.current;
    if (!start) return;
    setPosition(
      clamp({
        x: start.x + event.clientX - start.startX,
        y: start.y + event.clientY - start.startY,
      }),
    );
  }

  function moveWithKeyboard(event: KeyboardEvent<HTMLButtonElement>) {
    const directions: Record<string, Point> = {
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
    };
    const delta = directions[event.key];
    const rect = wrapper.current?.getBoundingClientRect();
    if (!delta || !rect) return;
    event.preventDefault();
    const step = event.shiftKey ? 1 : 10;
    setPosition(
      clamp({ x: rect.x + delta.x * step, y: rect.y + delta.y * step }),
    );
  }

  function reset() {
    skipSave.current = true;
    setParams({ ...BAEKSANGJI });
    setCopyFallback("");
    try {
      localStorage.removeItem(PARAMS_KEY);
      setMessage("백상지 기본값으로 되돌리고 저장된 조정값을 지웠습니다.");
    } catch {
      setMessage(
        "백상지 기본값으로 되돌렸습니다. 저장소에는 접근할 수 없습니다.",
      );
    }
  }

  async function copy(kind: "CSS" | "JSON") {
    const text =
      kind === "JSON"
        ? JSON.stringify(params, null, 2)
        : `:root {\n${Object.entries(paperCssVars(params))
            .map(([key, value]) => `  ${key}: ${value};`)
            .join("\n")}\n}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopyFallback("");
      setMessage(`${kind}를 복사했습니다.`);
    } catch {
      setCopyFallback(text);
      setMessage(
        "자동 복사를 사용할 수 없습니다. 아래 내용을 선택해 복사하세요.",
      );
    }
  }

  const placement: CSSProperties = position
    ? { left: position.x, top: position.y }
    : { right: 16, bottom: 16 };

  return (
    <>
      <style>{panelCss}</style>
      <div className="wrapper" ref={wrapper} style={placement}>
        {open && (
          <section
            id="paper-panel"
            className="panel"
            aria-label="종이 질감 조절"
          >
            <header>
              <button
                type="button"
                className="drag-handle"
                aria-label="종이 질감 패널 이동, 드래그 또는 방향키 사용"
                onPointerDown={startDrag}
                onPointerMove={moveDrag}
                onPointerUp={() => {
                  drag.current = null;
                }}
                onPointerCancel={() => {
                  drag.current = null;
                }}
                onKeyDown={moveWithKeyboard}
              >
                종이 질감 <small>개발 전용</small>
              </button>
              <button
                type="button"
                aria-label="종이 질감 패널 닫기"
                onClick={() => setOpen(false)}
              >
                닫기
              </button>
            </header>
            <div className="controls">
              <label className="color-control" htmlFor="paper-color">
                종이 색
                <input
                  id="paper-color"
                  type="color"
                  value={params.color}
                  onChange={(event) =>
                    setParams((p) => ({ ...p, color: event.target.value }))
                  }
                />
                <output htmlFor="paper-color">
                  {params.color.toUpperCase()}
                </output>
              </label>
              {controls.map(({ key, label, min, max, step }) => (
                <div className="range-control" key={key}>
                  <label htmlFor={`paper-${key}`}>{label}</label>
                  <output htmlFor={`paper-${key}`}>
                    {Number(params[key].toFixed(4))}
                    {key === "tile" ? "px" : ""}
                  </output>
                  <input
                    id={`paper-${key}`}
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    aria-valuetext={
                      key === "freq"
                        ? params.freq.toFixed(4)
                        : key === "tile"
                          ? `${params.tile}px`
                          : undefined
                    }
                    value={
                      key === "freq"
                        ? Math.round(
                            (1000 * Math.log(params.freq / FMIN)) /
                              Math.log(FMAX / FMIN),
                          )
                        : params[key]
                    }
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setParams((p) => ({
                        ...p,
                        [key]:
                          key === "freq"
                            ? FMIN * (FMAX / FMIN) ** (value / 1000)
                            : value,
                      }));
                    }}
                  />
                </div>
              ))}
              <div className="actions">
                <button
                  type="button"
                  onClick={() =>
                    setParams((p) => ({
                      ...p,
                      seed: 1 + Math.floor(Math.random() * 9999),
                    }))
                  }
                >
                  다른 무늬
                </button>
                <button type="button" onClick={reset}>
                  백상지로 되돌리기
                </button>
              </div>
              <label className="checkbox-control">
                <input
                  type="checkbox"
                  checked={grid}
                  onChange={(event) => setGrid(event.target.checked)}
                />
                타일 경계 보기
              </label>
              <div className="actions">
                <button type="button" onClick={() => void copy("CSS")}>
                  CSS 복사
                </button>
                <button type="button" onClick={() => void copy("JSON")}>
                  JSON 복사
                </button>
                <button type="button" onClick={() => setPosition(null)}>
                  위치 초기화
                </button>
              </div>
              <label htmlFor="paper-json">현재 PaperParams</label>
              <textarea
                id="paper-json"
                rows={7}
                readOnly
                value={JSON.stringify(params, null, 2)}
              />
              {copyFallback && (
                <textarea
                  aria-label="직접 복사할 내용"
                  readOnly
                  rows={4}
                  value={copyFallback}
                />
              )}
              <p className="message" aria-live="polite">
                {message}
              </p>
              <small>
                Alt+Shift+P로 열고 닫기 · 이동 버튼에서 방향키로 위치 조정
              </small>
            </div>
          </section>
        )}
        <button
          type="button"
          className="toggle"
          ref={toggle}
          aria-expanded={open}
          aria-keyshortcuts="Alt+Shift+P"
          aria-controls={open ? "paper-panel" : undefined}
          onClick={() => setOpen((value) => !value)}
        >
          종이
        </button>
      </div>
    </>
  );
}
