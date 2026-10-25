// Returns a finite number >= 0 from text, or null when invalid/empty.
export function parsePrice(text) {
  const clean = String(text ?? '').replace(/[,\s]/g, '');

  if (!/^\d+(\.\d+)?$/.test(clean)) return null;

  const value = Number(clean);

  return Number.isFinite(value) && value >= 0 ? value : null;
}

// Escape % and _ so ilike matches the text literally.
export function escapeLike(text) {
  return text.replace(/[\\%_]/g, (c) => `\\${c}`);
}
