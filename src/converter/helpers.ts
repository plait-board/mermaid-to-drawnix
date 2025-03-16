import {
  CONTAINER_STYLE_PROPERTY,
  LABEL_STYLE_PROPERTY,
  SubGraph,
  Vertex,
} from "../interfaces.js";
import { Edge } from "../parser/flowchart.js";
import { RectangleClient } from "@plait/core";
import {
  ArrowLineHandle,
  ArrowLineMarkerType,
  PlaitArrowLine,
  PlaitCommonGeometry,
} from "@plait/draw";
import { CustomText, StrokeStyle } from "@plait/common";
import { Container, Text } from "../elementSkeleton.js";

/**
 * Convert mermaid edge type to Drawnix arrow type
 */
const MERMAID_EDGE_TYPE_MAPPER: {
  [key: string]: { source: ArrowLineHandle; target: ArrowLineHandle };
} = {
  arrow_point: {
    source: { marker: ArrowLineMarkerType.none },
    target: { marker: ArrowLineMarkerType.arrow },
  },
  arrow_circle: {
    source: { marker: ArrowLineMarkerType.none },
    target: { marker: ArrowLineMarkerType.arrow },
  },
  arrow_cross: {
    source: { marker: ArrowLineMarkerType.none },
    target: { marker: ArrowLineMarkerType.arrow },
  },
  arrow_open: {
    source: { marker: ArrowLineMarkerType.none },
    target: { marker: ArrowLineMarkerType.none },
  },
  double_arrow_circle: {
    source: { marker: ArrowLineMarkerType.arrow },
    target: { marker: ArrowLineMarkerType.arrow },
  },
  double_arrow_cross: {
    source: { marker: ArrowLineMarkerType.arrow },
    target: { marker: ArrowLineMarkerType.arrow },
  },
  double_arrow_point: {
    source: { marker: ArrowLineMarkerType.arrow },
    target: { marker: ArrowLineMarkerType.arrow },
  },
};

export const computeDrawnixArrowType = (
  mermaidArrowType: string
): { source: ArrowLineHandle; target: ArrowLineHandle } => {
  return MERMAID_EDGE_TYPE_MAPPER[mermaidArrowType];
};

export const computeDrawnixArrowStyle = (
  edge: Edge
): Partial<PlaitArrowLine> => {
  const arrowStyle: Partial<PlaitArrowLine> = {};
  if (edge.stroke === "dotted") {
    arrowStyle.strokeStyle = StrokeStyle.dotted;
  }
  return arrowStyle;
};

// Get text from graph elements, fallback markdown to text
export const getText = (element: Vertex | Edge | SubGraph): string => {
  let text = element.text;
  if (element.labelType === "markdown") {
    // TODO: MD
    text = element.text;
  }

  if (text.includes("<br>")) {
    text = text.replace("<br>", "\n");
  }

  text = text.replace("<sub>", "");
  text = text.replace("</sub>", "");

  return removeFontAwesomeIcons(text);
};

/**
 * Remove font awesome icons support from text
 */
const removeFontAwesomeIcons = (input: string): string => {
  const fontAwesomeRegex = /\s?(fa|fab):[a-zA-Z0-9-]+/g;
  return input.replace(fontAwesomeRegex, "");
};

/**
 * Compute style for vertex
 */
export const computeDrawnixVertexStyle = (
  style: Vertex["containerStyle"]
): Partial<PlaitCommonGeometry> => {
  const plaitElementProperty: Partial<PlaitCommonGeometry> = {};
  Object.keys(style).forEach((property) => {
    switch (property) {
      case CONTAINER_STYLE_PROPERTY.FILL: {
        plaitElementProperty.fill = style[property];
        break;
      }
      case CONTAINER_STYLE_PROPERTY.STROKE: {
        plaitElementProperty.strokeColor = style[property];
        break;
      }
      case CONTAINER_STYLE_PROPERTY.STROKE_WIDTH: {
        plaitElementProperty.strokeWidth = Number(
          style[property]?.split("px")[0]
        );
        break;
      }
      case CONTAINER_STYLE_PROPERTY.STROKE_DASHARRAY: {
        plaitElementProperty.strokeStyle = StrokeStyle.dashed;
        break;
      }
    }
  });
  return plaitElementProperty;
};

/**
 * Compute style for label
 */
export const computeDrawnixTextStyle = (
  style: Vertex["labelStyle"]
): Partial<CustomText> => {
  const textProperty: Partial<CustomText> = {};
  Object.keys(style).forEach((property) => {
    switch (property) {
      case LABEL_STYLE_PROPERTY.COLOR: {
        textProperty.color = style[property];
        break;
      }
    }
  });
  return textProperty;
};

export const getRectangleByMermaidElement = (
  vertex: Vertex | SubGraph | Container | Text
) => {
  return vertex as RectangleClient;
};

export const normalizeText = (text: string) => {
  return text.replace(/\\n/g, "\n");
};
