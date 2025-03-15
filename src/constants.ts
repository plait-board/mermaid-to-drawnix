import { DEFAULT_FONT_SIZE } from "@plait/text-plugins";

export const SVG_TO_SHAPE_MAPPER: { [key: string]: "rectangle" | "ellipse" } = {
  rect: "rectangle",
  circle: "ellipse",
};

// visit https://mermaid.js.org/schemas/config.schema.json for default schema
export const MERMAID_CONFIG = {
  startOnLoad: false,
  flowchart: { curve: "linear" },
  themeVariables: {
    fontSize: `${DEFAULT_FONT_SIZE}px`,
  },
  maxEdges: 500,
  maxTextSize: 50000,
};
