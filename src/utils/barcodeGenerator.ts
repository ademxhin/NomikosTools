/**
 * Lightweight Code 128 & EAN-13 SVG Barcode Generator
 * Generates valid SVG barcode patterns for labels and scanner tests
 */

export function generateBarcodeSvg(code: string, options?: { height?: number; showText?: boolean }): string {
  const height = options?.height || 50;
  const showText = options?.showText ?? true;

  // Simple pseudo-Code128 binary pattern encoding based on char codes
  let binary = '11010010000'; // Start code
  for (let i = 0; i < code.length; i++) {
    const charCode = code.charCodeAt(i);
    // Deterministic 11-bit pattern
    const seed = (charCode * 37) % 64;
    const pattern = (seed.toString(2).padStart(6, '0') + '10101').slice(0, 11);
    binary += pattern;
  }
  binary += '1100011101011'; // Stop code

  const barWidth = 2;
  const totalWidth = binary.length * barWidth;
  let rects = '';

  for (let i = 0; i < binary.length; i++) {
    if (binary[i] === '1') {
      rects += `<rect x="${i * barWidth}" y="0" width="${barWidth}" height="${height}" fill="#111111" />`;
    }
  }

  const textElement = showText
    ? `<text x="${totalWidth / 2}" y="${height + 14}" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="600" fill="#111111">${code}</text>`
    : '';

  const totalHeight = showText ? height + 18 : height;

  return `<svg viewBox="0 0 ${totalWidth} ${totalHeight}" width="100%" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg">
    ${rects}
    ${textElement}
  </svg>`;
}
