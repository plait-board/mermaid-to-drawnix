import {
  transformToDrawnixArrowElement,
  transformToDrawnixRectangleElement,
  transformToDrawnixLineElement,
  transformToDrawnixTextElement,
  transformToDrawnixGroupElement,
} from "../transformToDrawnixElement.js";
import { GraphConverter } from "../GraphConverter.js";
import type { Class } from "../../parser/class.js";
import { PlaitElement, PlaitGroup } from "@plait/core";
import { DrawnixConfig } from "../../index.js";
import { ArrowLineShape, PlaitCommonGeometry } from "@plait/draw";

export const classToDrawnixConvertor = new GraphConverter({
  converter: (chart: Class, config: DrawnixConfig) => {
    const elements: PlaitElement[] = [];
    const mermaidGroupIdToElementMap: Record<string, PlaitGroup> = {};
    Object.values(chart.nodes).forEach((node) => {
      if (!node || !node.length) {
        return;
      }
      node.forEach((element) => {
        let drawnixElement: PlaitElement;

        switch (element.type) {
          case "line":
            drawnixElement = transformToDrawnixLineElement(
              element,
              mermaidGroupIdToElementMap,
              config
            );
            break;

          case "rectangle":
          case "ellipse":
            drawnixElement = transformToDrawnixRectangleElement(
              element,
              mermaidGroupIdToElementMap,
              config
            );
            break;

          case "text":
            drawnixElement = transformToDrawnixTextElement(
              element,
              mermaidGroupIdToElementMap,
              config
            );
            break;
          default:
            throw `unknown type ${element.type}`;
            break;
        }
        drawnixElement.origin = element;
        elements.push(drawnixElement);
      });
    });

    Object.values(chart.lines).forEach((line) => {
      if (!line) {
        return;
      }
      let drawnixElement = transformToDrawnixLineElement(
        line,
        mermaidGroupIdToElementMap,
        config
      );
      drawnixElement.origin = line;
      elements.push(drawnixElement);
    });

    Object.values(chart.arrows).forEach((arrow) => {
      if (!arrow) {
        return;
      }
      const drawnixElement = transformToDrawnixArrowElement(
        arrow,
        mermaidGroupIdToElementMap,
        {
          ...config,
          arrowLineShape: ArrowLineShape.straight,
        }
      );
      drawnixElement.origin = arrow;
      elements.push(drawnixElement);
    });

    Object.values(chart.text).forEach((ele) => {
      const drawnixElement = transformToDrawnixTextElement(
        ele,
        mermaidGroupIdToElementMap,
        config
      );
      drawnixElement.origin = ele;
      elements.push(drawnixElement);
    });

    Object.values(chart.namespaces).forEach((namespace) => {
      const classIds = Object.keys(namespace.classes);
      const children = [...classIds];
      const chartElements = [...chart.lines, ...chart.arrows, ...chart.text];
      classIds.forEach((classId) => {
        const childIds = chartElements
          .filter((ele) => ele.metadata && ele.metadata.classId === classId)
          .map((ele) => ele.id);

        if (childIds.length) {
          children.push(...(childIds as string[]));
        }
      });
      const childrenElements = elements.filter(
        (ele) => ele.origin && ele.origin.id && children.includes(ele.origin.id)
      );
      const { textElement, containerElement } = transformToDrawnixGroupElement(
        childrenElements as PlaitCommonGeometry[],
        namespace.id
      );
      elements.unshift(textElement);
      elements.unshift(containerElement);
    });
    elements.forEach((ele) => {
      if (ele.origin) {
        delete ele.origin;
      }
    });
    return { elements };
  },
});
