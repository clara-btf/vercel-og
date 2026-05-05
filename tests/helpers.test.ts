import { describe, expect, it } from "vitest";

import {
  darken,
  lighten,
  luminance,
  pickContrast,
  sanitizeHex,
  withAlpha,
} from "@/lib/og/color";
import { fitSubtitle, fitTitle } from "@/lib/og/typography";
import {
  sanitizeImageUrl,
  sanitizeLayout,
  sanitizeSvgBase64,
} from "@/lib/og/validators";
import { signParams, verifyParams } from "@/lib/og/sign";

describe("color", () => {
  it("sanitizeHex accepts 3-char and 6-char hex with or without #", () => {
    expect(sanitizeHex("ffffff", "#000")).toBe("#ffffff");
    expect(sanitizeHex("#abc", "#000")).toBe("#abc");
    expect(sanitizeHex("not-a-color", "#000")).toBe("#000");
    expect(sanitizeHex(null, "#000")).toBe("#000");
  });

  it("withAlpha returns rgba()", () => {
    expect(withAlpha("#ffffff", 0.5)).toBe("rgba(255, 255, 255, 0.5)");
    expect(withAlpha("#000", 0)).toBe("rgba(0, 0, 0, 0)");
  });

  it("darken / lighten move towards black / white", () => {
    expect(darken("#808080", 0.5)).toBe("rgb(64, 64, 64)");
    expect(lighten("#808080", 0.5)).toBe("rgb(191, 191, 191)");
  });

  it("luminance gives white > black", () => {
    expect(luminance("#ffffff")).toBeGreaterThan(luminance("#000000"));
  });

  it("pickContrast returns dark text on light bg and vice versa", () => {
    expect(pickContrast("#ffffff")).toBe("#0f0f1a");
    expect(pickContrast("#000000")).toBe("#ffffff");
    expect(pickContrast("#0f172a")).toBe("#ffffff");
    expect(pickContrast("#fef3c7")).toBe("#0f0f1a");
  });
});

describe("typography", () => {
  it("fitTitle scales down as text gets longer", () => {
    expect(fitTitle("hi").fontSize).toBeGreaterThan(fitTitle("a".repeat(50)).fontSize);
    expect(fitTitle("a".repeat(50)).fontSize).toBeGreaterThan(
      fitTitle("a".repeat(150)).fontSize
    );
  });

  it("fitSubtitle scales down too", () => {
    expect(fitSubtitle("hi").fontSize).toBeGreaterThan(
      fitSubtitle("a".repeat(200)).fontSize
    );
  });
});

describe("validators", () => {
  it("sanitizeImageUrl requires http(s)", () => {
    expect(sanitizeImageUrl("https://example.com/x.png")).toBe("https://example.com/x.png");
    expect(sanitizeImageUrl("ftp://example.com/x.png")).toBeNull();
    expect(sanitizeImageUrl("javascript:alert(1)")).toBeNull();
    expect(sanitizeImageUrl(null)).toBeNull();
    expect(sanitizeImageUrl("not a url")).toBeNull();
  });

  it("sanitizeSvgBase64 accepts valid base64 of an SVG", () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>';
    const b64 = Buffer.from(svg).toString("base64");
    expect(sanitizeSvgBase64(b64)).toBe(`data:image/svg+xml;base64,${b64}`);
  });

  it("sanitizeSvgBase64 rejects non-svg or invalid base64", () => {
    const notSvg = Buffer.from("<html>nope</html>").toString("base64");
    expect(sanitizeSvgBase64(notSvg)).toBeNull();
    expect(sanitizeSvgBase64("not!base64!!")).toBeNull();
    expect(sanitizeSvgBase64(null)).toBeNull();
  });

  it("sanitizeLayout falls back to center", () => {
    expect(sanitizeLayout("split")).toBe("split");
    expect(sanitizeLayout("minimal")).toBe("minimal");
    expect(sanitizeLayout("center")).toBe("center");
    expect(sanitizeLayout("evil")).toBe("center");
    expect(sanitizeLayout(null)).toBe("center");
  });
});

describe("sign", () => {
  it("verifyParams accepts the signature it produced", async () => {
    const sp = new URLSearchParams({ titulo: "hola", bg: "0f172a", layout: "split" });
    const sig = await signParams(sp, "secret");
    expect(await verifyParams(sp, sig, "secret")).toBe(true);
  });

  it("verifyParams rejects wrong sig or wrong secret", async () => {
    const sp = new URLSearchParams({ titulo: "hola" });
    const sig = await signParams(sp, "secret");
    expect(await verifyParams(sp, sig, "other")).toBe(false);
    expect(await verifyParams(sp, "deadbeef", "secret")).toBe(false);
  });

  it("verifyParams ignores param order", async () => {
    const a = new URLSearchParams("titulo=x&bg=000");
    const b = new URLSearchParams("bg=000&titulo=x");
    const sig = await signParams(a, "secret");
    expect(await verifyParams(b, sig, "secret")).toBe(true);
  });

  it("verifyParams ignores unsigned params", async () => {
    const a = new URLSearchParams("titulo=x");
    const b = new URLSearchParams("titulo=x&utm_source=mail");
    const sig = await signParams(a, "secret");
    expect(await verifyParams(b, sig, "secret")).toBe(true);
  });
});
