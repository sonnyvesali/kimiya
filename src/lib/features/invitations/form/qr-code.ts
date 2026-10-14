import { qrcodegen } from "$lib/vendor/qr-code-generator";
export function qrMatrix(value: string) {
  const code = qrcodegen.QrCode.encodeText(value, qrcodegen.QrCode.Ecc.MEDIUM);
  return Array.from({ length: code.size }, (_, y) =>
    Array.from({ length: code.size }, (_, x) => code.getModule(x, y)),
  );
}
export function qrSvg(value: string) {
  const modules = qrMatrix(value),
    size = modules.length;
  let path = "";
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++)
      if (modules[y][x]) path += `M${x + 4},${y + 4}h1v1h-1z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="520" height="520" viewBox="0 0 ${size + 8} ${size + 8}" shape-rendering="crispEdges"><rect width="${size + 8}" height="${size + 8}" fill="white"/><path d="${path}" fill="black"/></svg>`;
}
