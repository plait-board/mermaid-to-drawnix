import { GraphConverter } from "../GraphConverter.js";
import { Sequence } from "../../parser/sequence.js";
import {
  createGroup,
  PlaitElement,
  PlaitGroup,
  PlaitGroupElement,
  RectangleClient,
} from "@plait/core";
import { DrawnixConfig } from "../../index.js";
import {
  transformToDrawnixArrowElement,
  transformToDrawnixRectangleElement,
  transformToDrawnixLineElement,
  transformToDrawnixTextElement,
  transformToDrawnixGroupElement,
} from "../transformToDrawnixElement.js";
import { PlaitCommonGeometry, PlaitGeometry } from "@plait/draw";

export const sequenceToDrawnixConvertor = new GraphConverter({
  converter: (chart: Sequence, config: DrawnixConfig) => {
    const elements: PlaitElement[] = [];
    const activations: PlaitElement[] = [];
    const notes: PlaitElement[] = [];
    const mermaidGroupIdToElementMap: Record<string, PlaitGroup> = {};
    Object.values(chart.nodes).forEach((node) => {
      if (!node || !node.length) {
        return;
      }
      node.forEach((element) => {
        let plaitElement: PlaitElement;
        switch (element.type) {
          case "line":
            plaitElement = transformToDrawnixLineElement(
              element,
              mermaidGroupIdToElementMap,
              config
            );
            break;
          case "rectangle":
          case "ellipse":
            plaitElement = transformToDrawnixRectangleElement(
              element,
              mermaidGroupIdToElementMap,
              config
            );
            break;
          case "text":
            plaitElement = transformToDrawnixTextElement(
              element,
              mermaidGroupIdToElementMap,
              config
            );
            break;
          default:
            throw `unknown type ${element.type}`;
            break;
        }
        // 基于 origin.id 查询和 group 中 actorKeys 的对应关系
        plaitElement.origin = element;
        if (element.type === "rectangle" && element?.subtype === "activation") {
          activations.push(plaitElement);
        } else if (
          element.type === "rectangle" &&
          element?.subtype === "note"
        ) {
          notes.push(plaitElement);
        } else {
          elements.push(plaitElement);
        }
      });
    });
    Object.values(chart.lines).forEach((line) => {
      if (!line) {
        return;
      }
      elements.push(
        transformToDrawnixLineElement(line, mermaidGroupIdToElementMap, config)
      );
    });
    Object.values(chart.arrows).forEach((arrow) => {
      if (!arrow) {
        return;
      }
      elements.push(
        transformToDrawnixArrowElement(
          arrow,
          mermaidGroupIdToElementMap,
          config
        )
      );
      if (arrow.sequenceNumber) {
        elements.push(
          transformToDrawnixRectangleElement(
            arrow.sequenceNumber,
            mermaidGroupIdToElementMap,
            config
          )
        );
      }
    });
    elements.push(...activations);

    // loops
    if (chart.loops) {
      const { lines, texts, nodes } = chart.loops;
      lines.forEach((line) => {
        elements.push(
          transformToDrawnixLineElement(
            line,
            mermaidGroupIdToElementMap,
            config
          )
        );
      });
      texts.forEach((text) => {
        elements.push(
          transformToDrawnixTextElement(
            text,
            mermaidGroupIdToElementMap,
            config
          )
        );
      });
      nodes.forEach((node) => {
        elements.push(
          transformToDrawnixRectangleElement(
            node,
            mermaidGroupIdToElementMap,
            config
          )
        );
      });
    }
    elements.push(...notes);

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
        const groupElement = createGroup();
        containerElement.groupId = groupElement.id;
        elements.forEach((ele) => {
          if (PlaitGroupElement.isGroup(ele)) {
            return;
          }
          const element = ele as PlaitGeometry;
          const containerRectangle = RectangleClient.getRectangleByPoints(
            containerElement.points
          );
          const isInContainer = element.points.every((point) => {
            return RectangleClient.isPointInRectangle(
              containerRectangle,
              point
            );
          });
          if (isInContainer) {
            element.groupId = groupElement.id;
          }
        });
        elements.push(groupElement);
      });
    }
    elements.forEach((ele) => {
      if (ele.origin) {
        delete ele.origin;
      }
    });
    Object.values(mermaidGroupIdToElementMap).forEach((groupElement) => {
      elements.push(groupElement);
    });
    return { elements };
  },
});
