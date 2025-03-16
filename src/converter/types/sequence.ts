import { GraphConverter } from "../GraphConverter.js";
import { Sequence } from "../../parser/sequence.js";
import { PlaitElement, RectangleClient } from "@plait/core";
import { DrawnixConfig } from "../../index.js";
import {
  transformToDrawnixArrowElement,
  transformToDrawnixRectangleElement,
  transformToDrawnixLineElement,
  transformToDrawnixTextElement,
  transformToDrawnixGroupElement,
} from "../transformToDrawnixElement.js";
import {
  BasicShapes,
  createGeometryElement,
  getTextShapeProperty,
  PlaitCommonGeometry,
  PlaitGeometry,
} from "@plait/draw";
import { Element, Node } from "slate";
import { buildText } from "@plait/common";

export const sequenceToDrawnixConvertor = new GraphConverter({
  converter: (chart: Sequence, config: DrawnixConfig) => {
    const elements: PlaitElement[] = [];
    const activations: PlaitElement[] = [];
    Object.values(chart.nodes).forEach((node) => {
      if (!node || !node.length) {
        return;
      }
      node.forEach((element) => {
        let plaitElement: PlaitElement;

        switch (element.type) {
          case "line":
            plaitElement = transformToDrawnixLineElement(element, config);
            break;
          case "rectangle":
          case "ellipse":
            plaitElement = transformToDrawnixRectangleElement(element, config);
            break;
          case "text":
            plaitElement = transformToDrawnixTextElement(element, config);
            break;
          default:
            throw `unknown type ${element.type}`;
            break;
        }
        // 基于 origin.id 查询和 group 中 actorKeys 的对应关系
        plaitElement.origin = element;
        if (element.type === "rectangle" && element?.subtype === "activation") {
          activations.push(plaitElement);
        } else {
          elements.push(plaitElement);
        }
      });
    });

    Object.values(chart.lines).forEach((line) => {
      if (!line) {
        return;
      }
      elements.push(transformToDrawnixLineElement(line, config));
    });

    Object.values(chart.arrows).forEach((arrow) => {
      if (!arrow) {
        return;
      }

      elements.push(transformToDrawnixArrowElement(arrow, config));
      if (arrow.sequenceNumber) {
        elements.push(
          transformToDrawnixRectangleElement(arrow.sequenceNumber, config)
        );
      }
    });
    elements.push(...activations);

    // loops
    if (chart.loops) {
      const { lines, texts, nodes } = chart.loops;
      lines.forEach((line) => {
        elements.push(transformToDrawnixLineElement(line, config));
      });
      texts.forEach((text) => {
        elements.push(transformToDrawnixTextElement(text, config));
      });
      nodes.forEach((node) => {
        elements.push(transformToDrawnixRectangleElement(node, config));
      });
    }

    if (chart.groups) {
      chart.groups.forEach((group) => {
        const { actorKeys, name } = group;
        if (!actorKeys.length) {
          return;
        }
        const actors = elements.filter((ele) => {
          const element = ele as PlaitGeometry;
          if (element.origin && element.origin.id) {
            const hyphenIndex = element.origin.id.indexOf("-");
            const id = element.origin.id.substring(0, hyphenIndex);
            return actorKeys.includes(id);
          }
          return false;
        });
        const { textElement, containerElement } =
          transformToDrawnixGroupElement(
            actors as PlaitCommonGeometry[],
            name,
            { fill: group.fill }
          );
        elements.unshift(textElement);
        elements.unshift(containerElement);
      });
    }
    elements.forEach((ele) => {
      if (ele.origin) {
        delete ele.origin;
      }
    });
    return { elements };
  },
});
