import { Node as SlateNode } from "slate";
import { sequenceToDrawnixConvertor } from "../src/converter/types/sequence.js";
import type { Sequence } from "../src/parser/sequence.js";

const getText = (element: any) => {
  if (element.text) {
    return SlateNode.string(element.text);
  }
  if (element.texts) {
    return element.texts
      .map((text: { text: any }) => SlateNode.string(text.text))
      .join(" ");
  }
  return "";
};

describe("sequenceToDrawnixConvertor", () => {
  beforeAll(() => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
      () =>
        ({
          font: "",
          measureText: (text: string) => ({
            width: text.length * 8,
            actualBoundingBoxAscent: 12,
            actualBoundingBoxDescent: 4,
          }),
        } as any)
    );
  });

  it("keeps sequence notes above background highlights and lifelines", () => {
    const chart: Sequence = {
      type: "sequence",
      nodes: [
        [
          {
            type: "rectangle",
            x: 0,
            y: 0,
            width: 240,
            height: 160,
            label: { text: "", fontSize: 16 },
            bgColor: "#fff0e6",
            subtype: "highlight",
          },
        ],
        [
          {
            type: "rectangle",
            x: 80,
            y: 40,
            width: 120,
            height: 32,
            label: { text: "Preparing Phase", fontSize: 16 },
            subtype: "note",
          },
        ],
      ],
      lines: [
        {
          type: "line",
          startX: 120,
          startY: 0,
          endX: 120,
          endY: 160,
          strokeColor: "#adb5bd",
        },
      ],
      arrows: [],
      loops: undefined,
      groups: [],
    };

    const { elements } = sequenceToDrawnixConvertor.convert(chart, {
      fontSize: 20,
    });

    const backgroundIndex = elements.findIndex(
      (element: any) => element.fill === "#fff0e6"
    );
    const lineIndex = elements.findIndex(
      (element: any) =>
        element.type === "arrow-line" && element.strokeColor === "#adb5bd"
    );
    const noteIndex = elements.findIndex(
      (element) => getText(element) === "Preparing Phase"
    );

    expect(backgroundIndex).toBeGreaterThanOrEqual(0);
    expect(lineIndex).toBeGreaterThanOrEqual(0);
    expect(noteIndex).toBeGreaterThanOrEqual(0);
    expect(backgroundIndex).toBeLessThan(lineIndex);
    expect(lineIndex).toBeLessThan(noteIndex);
  });
});
