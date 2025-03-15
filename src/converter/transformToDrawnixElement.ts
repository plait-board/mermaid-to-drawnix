import {
  buildText,
  CustomText,
  DEFAULT_FONT_FAMILY,
  measureElement,
  StrokeStyle,
} from "@plait/common";
import { Arrow, Line, Node, Text } from "../elementSkeleton.js";
import { getRectangleByMermaidElement, normalizeText } from "./helpers.js";
import {
  ArrowLineMarkerType,
  ArrowLineShape,
  BasicShapes,
  createArrowLineElement,
  createGeometryElement,
  PlaitArrowLine,
  PlaitCommonGeometry,
  ShapeDefaultSpace,
} from "@plait/draw";
import { DrawnixConfig } from "../index.js";
import { Point, RectangleClient } from "@plait/core";
import { isValidColor } from "@drawnix/drawnix";

export const transformToDrawnixLineElement = (
  element: Line,
  config: DrawnixConfig
) => {
  const points = [
    [element.startX, element.startY],
    [element.endX, element.endY],
  ] as [Point, Point];
  const arrowOptions: Partial<PlaitArrowLine> = {
    strokeColor:
      element.strokeColor ||
      "hsl(259.6261682243, 59.7765363128%, 87.9019607843%)",
    strokeWidth: element.strokeWidth || 2,
    strokeStyle: (element.strokeStyle || StrokeStyle.solid) as StrokeStyle,
  };
  const line = createArrowLineElement(
    ArrowLineShape.straight,
    [...points],
    {
      marker: ArrowLineMarkerType.none,
    },
    {
      marker: ArrowLineMarkerType.none,
    },
    [],
    { ...arrowOptions }
  );

  return line;
};

export const transformToDrawnixArrowElement = (
  element: Arrow,
  config: DrawnixConfig
) => {
  let points = [
    [element.startX, element.startY],
    [element.endX, element.endY],
  ] as [Point, Point];
  if (element.points) {
    points = element.points.map((point) => [
      element.startX + point[0],
      element.startY + point[1],
    ]) as [Point, Point];
  }
  const arrowOptions: Partial<PlaitArrowLine> = {
    strokeColor:
      (element.strokeColor &&
        isValidColor(element.strokeColor) &&
        element.strokeColor) ||
      "#000",
    strokeWidth: element.strokeWidth || 1,
    strokeStyle: (element.strokeStyle || StrokeStyle.solid) as StrokeStyle,
  };
  const arrowText = buildText(
    normalizeText(element?.label?.text || ""),
    undefined
  );
  const textSize = measureElement(arrowText, {
    fontFamily: DEFAULT_FONT_FAMILY,
    fontSize: config.fontSize,
  });
  const arrow = createArrowLineElement(
    ArrowLineShape.curve,
    [...points],
    {
      marker: element.startArrowhead
        ? ArrowLineMarkerType.arrow
        : ArrowLineMarkerType.none,
    },
    {
      marker: element.endArrowhead
        ? ArrowLineMarkerType.arrow
        : ArrowLineMarkerType.none,
    },
    [
      {
        position: 0.5,
        text: arrowText,
        width: textSize.width,
        height: textSize.height,
      },
    ],
    { ...arrowOptions }
  );
  return arrow;
};

export const transformToDrawnixContainerElement = (
  element: Exclude<Node, Line | Arrow | Text>,
  config: DrawnixConfig
) => {
  let extraProps: Partial<PlaitCommonGeometry> = {};
  if (element.type === "rectangle" && element.subtype === "activation") {
    extraProps = {
      fill: "#e9ecef",
      strokeStyle: StrokeStyle.solid,
    };
  }
  const styleOptions: Partial<PlaitCommonGeometry> = {
    strokeStyle: (element?.strokeStyle || StrokeStyle.solid) as StrokeStyle,
    strokeWidth: element?.strokeWidth || 1,
    strokeColor:
      element?.strokeColor ||
      "hsl(259.6261682243, 59.7765363128%, 87.9019607843%)",
    fill: element?.bgColor || "#ECECFF",
    ...extraProps,
  };
  const textStyle: Partial<CustomText> = {
    color: element.label?.color || "#000",
  };
  const verticesText = buildText(
    normalizeText(element?.label?.text || ""),
    undefined,
    textStyle
  );
  const textSize = measureElement(verticesText, {
    fontFamily: DEFAULT_FONT_FAMILY,
    fontSize: config.fontSize,
  });
  const rectangle = getRectangleByMermaidElement({
    ...element,
    width:
      element.width ||
      textSize.width +
        ShapeDefaultSpace.rectangleAndText * 2 +
        styleOptions.strokeWidth! * 2,
  });
  const container = createGeometryElement(
    element.type as BasicShapes,
    RectangleClient.getPoints(rectangle),
    verticesText,
    {
      ...styleOptions,
    },
    {
      textHeight: textSize.height,
    }
  );

  return container;
};

export const transformToDrawnixEllipseElement = (
  element: Exclude<Node, Line | Arrow | Text>,
  config: DrawnixConfig
) => {
  const styleOptions: Partial<PlaitCommonGeometry> = {
    strokeStyle: (element?.strokeStyle || StrokeStyle.solid) as StrokeStyle,
    strokeWidth: element?.strokeWidth || 1,
    strokeColor:
      element?.strokeColor ||
      "hsl(259.6261682243, 59.7765363128%, 87.9019607843%)",
    fill: element?.bgColor || "#ECECFF",
  };
  const textStyle: Partial<CustomText> = {
    color: element.label?.color || "#000",
  };
  const verticesText = buildText(
    normalizeText(element?.label?.text || ""),
    undefined,
    textStyle
  );
  const textSize = measureElement(verticesText, {
    fontFamily: DEFAULT_FONT_FAMILY,
    fontSize: config.fontSize,
  });
  const rectangle = getRectangleByMermaidElement({
    ...element,
    width: element.width || element.height,
  });
  const container = createGeometryElement(
    element.type as BasicShapes,
    RectangleClient.getPoints(rectangle),
    verticesText,
    {
      ...styleOptions,
    },
    {
      textHeight: textSize.height,
    }
  );

  return container;
};

export const transformToDrawnixTextElement = (
  element: Text,
  config: DrawnixConfig
) => {
  const text = buildText(normalizeText(element.text || ""), undefined);
  const textSize = measureElement(text, {
    fontFamily: DEFAULT_FONT_FAMILY,
    fontSize: config.fontSize,
  });
  const rectangle = getRectangleByMermaidElement(element);
  const textElement = createGeometryElement(
    BasicShapes.text,
    RectangleClient.getPoints(rectangle),
    text,
    {},
    {
      textHeight: textSize.height,
    }
  );
  return textElement;
};
