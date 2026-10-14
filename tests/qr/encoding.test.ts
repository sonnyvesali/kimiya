import { it, expect } from "vitest";
import { qrMatrix, qrSvg } from "$lib/features/invitations/form/qr-code";
it("produces a local SVG with a four-module white quiet zone", () => {
  const url = "https://kimiya.example/join/" + "a".repeat(48);
  const matrix = qrMatrix(url);
  const svg = qrSvg(url);
  expect(svg).toContain(
    `viewBox="0 0 ${matrix.length + 8} ${matrix.length + 8}"`,
  );
  expect(svg).toContain('fill="white"');
  expect(svg).not.toContain("https://");
});
it("supports long invite URLs and rejects payloads beyond QR capacity", () => {
  expect(() => qrSvg("a".repeat(400))).not.toThrow();
  expect(() => qrSvg("a".repeat(4000))).toThrow();
});
