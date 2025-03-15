import { GraphConverter } from "../GraphConverter.js";
import { Sequence } from "../../parser/sequence.js";
import { PlaitElement } from "@plait/core";
import { DrawnixConfig } from "../../index.js";
import {
  transformToDrawnixArrowElement,
  transformToDrawnixContainerElement,
  transformToDrawnixEllipseElement,
  transformToDrawnixLineElement,
  transformToDrawnixTextElement,
} from "../transformToDrawnixElement.js";

export const SequenceToDrawnixSkeletonConvertor = new GraphConverter({
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
            plaitElement = transformToDrawnixContainerElement(element, config);
            break;
          case "text":
            plaitElement = transformToDrawnixTextElement(element, config);
            break;
          default:
            throw `unknown type ${element.type}`;
            break;
        }
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
          transformToDrawnixContainerElement(arrow.sequenceNumber, config)
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
        elements.push(transformToDrawnixContainerElement(node, config));
      });
    }

    if (chart.groups) {
      chart.groups.forEach((group) => {
        // TODO: 没有 x,y,width,height
      });
    }
    return { elements };
  },
});
