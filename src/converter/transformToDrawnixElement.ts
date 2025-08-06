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
  GeometryStyleOptions,
  getTextShapeProperty,
  PlaitArrowLine,
  PlaitCommonGeometry,
  ShapeDefaultSpace,
} from "@plait/draw";
import { DrawnixConfig } from "../index.js";
import { createGroup, PlaitGroup, Point, RectangleClient } from "@plait/core";
import { Node as SlateNode } from "slate";
import { DEFAULT_FONT_SIZE as PLAIT_DEFAULT_FONT_SIZE } from "@plait/text-plugins";

export const transformToDrawnixLineElement = (
  element: Line,
  mermaidGroupIdToElementMap: Record<string, PlaitGroup>,
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
  if (element.groupId) {
    let groupElement = mermaidGroupIdToElementMap[element.groupId];
    if (!groupElement) {
      groupElement = createGroup();
      mermaidGroupIdToElementMap[element.groupId] = groupElement;
    }
    line.groupId = groupElement.id;
  }
  return line;
};

export const transformToDrawnixArrowElement = (
  element: Arrow,
  mermaidGroupIdToElementMap: Record<string, PlaitGroup>,
  config: DrawnixConfig & { arrowLineShape?: ArrowLineShape }
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
        element.strokeColor !== "none" &&
        element.strokeColor) ||
      "#000",
    strokeWidth: element.strokeWidth || 1,
    strokeStyle: (element.strokeStyle || StrokeStyle.solid) as StrokeStyle,
  };
  const arrowText = buildText(
    normalizeText(element?.label?.text || ""),
    undefined
  );
  const texts = [];
  if (SlateNode.string(arrowText).trim().length > 0) {
    const textSize = measureElement(null, arrowText, {
      fontFamily: DEFAULT_FONT_FAMILY,
      fontSize: PLAIT_DEFAULT_FONT_SIZE,
    });
    texts.push({
      position: 0.5,
      text: arrowText,
      width: textSize.width,
      height: textSize.height,
    });
  }
  const arrow = createArrowLineElement(
    config.arrowLineShape || ArrowLineShape.curve,
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
    texts,
    { ...arrowOptions }
  );
  if (element.groupId) {
    let groupElement = mermaidGroupIdToElementMap[element.groupId];
    if (!groupElement) {
      groupElement = createGroup();
      mermaidGroupIdToElementMap[element.groupId] = groupElement;
    }
    arrow.groupId = groupElement.id;
  }
  return arrow;
};

export const transformToDrawnixRectangleElement = (
  element: Exclude<Node, Line | Arrow | Text>,
  mermaidGroupIdToElementMap: Record<string, PlaitGroup>,
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
  const textSize = measureElement(null, verticesText, {
    fontFamily: DEFAULT_FONT_FAMILY,
    fontSize: PLAIT_DEFAULT_FONT_SIZE,
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
  if (element.groupId) {
    let groupElement = mermaidGroupIdToElementMap[element.groupId];
    if (!groupElement) {
      groupElement = createGroup();
      mermaidGroupIdToElementMap[element.groupId] = groupElement;
    }
    container.groupId = groupElement.id;
  }
  return container;
};

export const transformToDrawnixTextElement = (
  element: Text,
  mermaidGroupIdToElementMap: Record<string, PlaitGroup>,
  config: DrawnixConfig
) => {
  const text = buildText(normalizeText(element.text || ""), undefined);
  const textSize = getTextShapeProperty({} as any, text);
  const textRectangle = RectangleClient.getRectangleByCenterPoint(
    [element.x + textSize.width / 2, element.y],
    textSize.width,
    textSize.height
  );
  const textElement = createGeometryElement(
    BasicShapes.text,
    RectangleClient.getPoints(textRectangle),
    text,
    {},
    {
      textHeight: textSize.height,
    }
  );
  if (element.groupId) {
    let groupElement = mermaidGroupIdToElementMap[element.groupId];
    if (!groupElement) {
      groupElement = createGroup();
      mermaidGroupIdToElementMap[element.groupId] = groupElement;
    }
    textElement.groupId = groupElement.id;
  }
  return textElement;
};

export const transformToDrawnixGroupElement = (
  childrenElements: PlaitCommonGeometry[],
  text: string,
  options: Partial<GeometryStyleOptions> = {}
) => {
  const childrenRectangle = RectangleClient.getBoundingRectangle(
    childrenElements.map((ele) =>
      RectangleClient.getRectangleByPoints(ele.points!)
    )
  );
  const PADDING = 60;
  const groupRectangle = RectangleClient.inflate(childrenRectangle, PADDING);
  const containerElement = createGeometryElement(
    BasicShapes.rectangle,
    [...RectangleClient.getPoints(groupRectangle)],
    "",
    { strokeWidth: 1, ...options }
  );
  const slateTextElement = buildText(text, undefined);
  const textSize = getTextShapeProperty({} as any, text);
  const points = RectangleClient.getPoints(
    RectangleClient.getRectangleByCenterPoint(
      [
        groupRectangle.x + groupRectangle.width / 2,
        groupRectangle.y + 4 + textSize.height / 2,
      ],
      textSize.width,
      textSize.height
    )
  );
  const textElement = createGeometryElement(
    BasicShapes.text,
    points,
    slateTextElement
  );
  return { textElement, containerElement };
};
