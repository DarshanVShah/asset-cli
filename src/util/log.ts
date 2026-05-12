// Tiny logger with ANSI colors. Falls back to plain text when not a TTY.
const isTTY = process.stdout.isTTY ?? false;

function color(code: number, s: string): string {
  if (!isTTY) return s;
  return `[${code}m${s}[0m`;
}

export const log = {
  info: (msg: string) => console.log(msg),
  ok: (msg: string) => console.log(color(32, "✓") + " " + msg),
  warn: (msg: string) => console.warn(color(33, "!") + " " + msg),
  err: (msg: string) => console.error(color(31, "✗") + " " + msg),
  dim: (msg: string) => console.log(color(90, msg)),
  bold: (msg: string) => console.log(color(1, msg)),
  header: (msg: string) => console.log("\n" + color(1, msg)),
};

export const c = {
  green: (s: string) => color(32, s),
  yellow: (s: string) => color(33, s),
  red: (s: string) => color(31, s),
  cyan: (s: string) => color(36, s),
  dim: (s: string) => color(90, s),
  bold: (s: string) => color(1, s),
};
