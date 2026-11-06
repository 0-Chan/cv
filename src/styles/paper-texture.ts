export type PaperParams = {
  color: string;
  freq: number;
  oct: number;
  ss: number;
  k: number;
  fib: number;
  sp: number;
  seed: number;
  tile: number;
};

export const BAEKSANGJI: PaperParams = {
  color: "#FAF9F5",
  freq: 0.85,
  oct: 4,
  ss: 1.2,
  k: 0.45,
  fib: 0,
  sp: 0,
  seed: 3,
  tile: 360,
};

const r = (n: number, d = 3) => Math.round(n * 10 ** d) / 10 ** d;
const funcs = (s: number, i: number) =>
  (["R", "G", "B"] as const)
    .map(
      (c) => `<feFunc${c} type='linear' slope='${r(s)}' intercept='${r(i)}'/>`,
    )
    .join("");
const GRAY_FROM_R = "1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 0 0 0 0 1";

export function luminance(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const [R, G, B] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}
export const isDarkPaper = (hex: string) => luminance(hex) < 0.12;

export function buildPaperSvg(p: PaperParams): string {
  const dark = isDarkPaper(p.color);
  let f =
    `<feTurbulence type='fractalNoise' baseFrequency='${r(p.freq, 4)}' numOctaves='${p.oct}' seed='${p.seed}' stitchTiles='stitch' result='n'/>` +
    `<feDiffuseLighting in='n' surfaceScale='${r(p.ss, 2)}' diffuseConstant='${dark ? 1 : 1.1}' lighting-color='#fff' result='l'>` +
    `<feDistantLight azimuth='225' elevation='60'/></feDiffuseLighting>`;

  let marks: string | null = null;
  if (p.fib > 0) {
    const d = p.fib * 0.45;
    f +=
      `<feTurbulence type='turbulence' baseFrequency='0.02' numOctaves='2' seed='${p.seed + 7}' stitchTiles='stitch'/>` +
      `<feColorMatrix type='matrix' values='${GRAY_FROM_R}'/>` +
      `<feComponentTransfer result='fb'>${funcs(d / 0.03, 1 - d)}</feComponentTransfer>`;
    marks = "fb";
  }
  if (p.sp > 0) {
    const K = 12 * p.sp;
    f +=
      `<feTurbulence type='fractalNoise' baseFrequency='0.16' numOctaves='1' seed='${p.seed + 13}' stitchTiles='stitch'/>` +
      `<feColorMatrix type='matrix' values='${GRAY_FROM_R}'/>` +
      `<feComponentTransfer result='sb'>${funcs(-K, 1 + 0.68 * K)}</feComponentTransfer>`;
    if (marks) {
      f += `<feBlend in='fb' in2='sb' mode='multiply' result='mk'/>`;
      marks = "mk";
    } else marks = "sb";
  }

  if (!dark) {
    let top = "l";
    if (marks) {
      f += `<feBlend in='l' in2='${marks}' mode='multiply' result='m'/>`;
      top = "m";
    }
    f += `<feComponentTransfer in='${top}'>${funcs(p.k, 1 - p.k)}</feComponentTransfer>`;
  } else {
    // 어두운 종이: 밝은 면만 남겨 screen으로 섞는다
    const sl = p.k * 3;
    f += `<feComponentTransfer in='l' result='hi'>${funcs(sl, -sl * 0.87)}</feComponentTransfer>`;
    if (marks) {
      const c = 0.6 * p.k;
      f += `<feComposite in='hi' in2='${marks}' operator='arithmetic' k1='0' k2='1' k3='${r(-c)}' k4='${r(c)}'/>`;
    }
  }

  return (
    `<svg xmlns='http://www.w3.org/2000/svg' width='${p.tile}' height='${p.tile}'>` +
    `<filter id='p' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'>${f}</filter>` +
    `<rect width='100%' height='100%' filter='url(#p)'/></svg>`
  );
}

export function toDataUri(svg: string) {
  return (
    "data:image/svg+xml," +
    svg
      .replace(/"/g, "'")
      .replace(/%/g, "%25") // 반드시 # 치환보다 먼저
      .replace(/#/g, "%23")
      .replace(/</g, "%3C")
      .replace(/>/g, "%3E")
  );
}

export function paperCssVars(p: PaperParams) {
  return {
    "--paper-color": p.color,
    "--paper-texture": `url("${toDataUri(buildPaperSvg(p))}")`,
    "--paper-tile": `${p.tile}px`,
    "--paper-blend": isDarkPaper(p.color) ? "screen" : "multiply",
  } as const;
}
