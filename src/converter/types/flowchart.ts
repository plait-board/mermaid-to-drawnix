import { GraphConverter } from "../GraphConverter.js";
import {
  getText,
  computeDrawnixTextStyle,
  computeDrawnixArrowType,
  getRectangleByMermaidElement,
  computeDrawnixVertexStyle,
  computeDrawnixArrowStyle,
} from "../helpers.js";
import { VERTEX_TYPE } from "../../interfaces.js";
import { Flowchart } from "../../parser/flowchart.js";
import {
  createGeometryElement,
  BasicShapes,
  createArrowLineElement,
  ArrowLineShape,
  DefaultLineStyle,
  ArrowLineText,
  getTextShapeProperty,
  FlowchartSymbols,
} from "@plait/draw";
import { PlaitElement, Point, RectangleClient } from "@plait/core";
import { buildText, DEFAULT_FONT_FAMILY, measureElement } from "@plait/common";
import { DEFAULT_FONT_SIZE } from "@plait/text-plugins";

const computeGroupIds = (
  graph: Flowchart
): {
  getGroupIds: (elementId: string) => string[];
  getParentId: (elementId: string) => string | null;
} => {
  // Parse the diagram into a tree for rendering and grouping
  const tree: {
    [key: string]: {
      id: string;
      parent: string | null;
      isLeaf: boolean; // true = vertex, false = subGraph
    };
  } = {};
  graph.subGraphs.map((subGraph) => {
    subGraph.nodeIds.forEach((nodeId) => {
      tree[subGraph.id] = {
        id: subGraph.id,
        parent: null,
        isLeaf: false,
      };
      tree[nodeId] = {
        id: nodeId,
        parent: subGraph.id,
        isLeaf: graph.vertices[nodeId] !== undefined,
      };
    });
  });
  const mapper: {
    [key: string]: string[];
  } = {};
  [...Object.keys(graph.vertices), ...graph.subGraphs.map((c) => c.id)].forEach(
    (id) => {
      if (!tree[id]) {
        return;
      }
      let curr = tree[id];
      const groupIds: string[] = [];
      if (!curr.isLeaf) {
        groupIds.push(`subgraph_group_${curr.id}`);
      }

      while (true) {
        if (curr.parent) {
          groupIds.push(`subgraph_group_${curr.parent}`);
          curr = tree[curr.parent];
        } else {
          break;
        }
      }

      mapper[id] = groupIds;
    }
  );

  return {
    getGroupIds: (elementId) => {
      return mapper[elementId] || [];
    },
    getParentId: (elementId) => {
      return tree[elementId] ? tree[elementId].parent : null;
    },
  };
};

export const FlowchartToDrawnixSkeletonConverter = new GraphConverter({
  converter: (graph: Flowchart) => {
    const elements: PlaitElement[] = [];
    const { getGroupIds, getParentId } = computeGroupIds(graph);
    // SubGraphs
    graph.subGraphs.reverse().forEach((subGraph) => {
      const groupIds = getGroupIds(subGraph.id);
      const text = buildText(getText(subGraph), undefined);
      const textSize = getTextShapeProperty({} as any, text);
      const points = RectangleClient.getPoints(
        RectangleClient.getRectangleByCenterPoint(
          [
            subGraph.x + subGraph.width / 2,
            subGraph.y + 4 + textSize.height / 2,
          ],
          textSize.width,
          textSize.height
        )
      );
      const textElement = createGeometryElement(BasicShapes.text, points, text);
      let containerElement = createGeometryElement(
        BasicShapes.rectangle,
        RectangleClient.getPoints(getRectangleByMermaidElement(subGraph)),
        "",
        { fill: "#ffffde", strokeColor: "#aaaa33", strokeWidth: 1 }
      );
      elements.push(containerElement);
      elements.push(textElement);
    });

    // Vertices
    Object.values(graph.vertices).forEach((vertex) => {
      if (!vertex) {
        return;
      }
      // const groupIds = getGroupIds(vertex.id);
      // Compute custom style
      const elementStyle = computeDrawnixVertexStyle(vertex.containerStyle);
      const textStyle = computeDrawnixTextStyle(vertex.labelStyle);

      const verticesText = buildText(getText(vertex), undefined, textStyle);

      const textSize = measureElement(verticesText, {
        fontFamily: DEFAULT_FONT_FAMILY,
        fontSize: DEFAULT_FONT_SIZE,
      });

      const styleOptions = {
        fill: "#ECECFF",
        strokeColor: "#9370DB",
        strokeWidth: 1,
        ...elementStyle,
      };

      let geometryElement = createGeometryElement(
        BasicShapes.rectangle,
        RectangleClient.getPoints(getRectangleByMermaidElement(vertex)),
        buildText(getText(vertex), undefined, textStyle),
        {
          ...styleOptions,
        },
        {
          textHeight: textSize.height,
        }
      );
      switch (vertex.type) {
        case VERTEX_TYPE.ROUND: {
          geometryElement.shape = BasicShapes.roundRectangle;
          break;
        }
        case VERTEX_TYPE.STADIUM: {
          geometryElement.shape = FlowchartSymbols.terminal;
          break;
        }
        case VERTEX_TYPE.DOUBLECIRCLE: {
          const CIRCLE_MARGIN = 5;
          // Create new groupId for double circle
          // groupIds.push(`doublecircle_${vertex.id}}`);
          // Create inner circle element
          const innerRectangle = RectangleClient.inflate(
            getRectangleByMermaidElement(vertex),
            -CIRCLE_MARGIN * 2
          );
          const innerCircle = createGeometryElement(
            BasicShapes.ellipse,
            RectangleClient.getPoints(innerRectangle),
            buildText(getText(vertex)),
            {
              ...styleOptions,
            }
          );
          geometryElement = { ...geometryElement, shape: BasicShapes.ellipse };
          geometryElement.text = buildText("");
          elements.push(geometryElement);
          elements.push(innerCircle);
          return;
        }
        case VERTEX_TYPE.CIRCLE: {
          geometryElement.shape = BasicShapes.ellipse;
          break;
        }
        case VERTEX_TYPE.DIAMOND: {
          geometryElement.shape = BasicShapes.diamond;
          break;
        }
      }

      elements.push(geometryElement);
    });

    // Edges
    graph.edges.forEach((edge) => {
      let groupIds: string[] = [];
      // const startParentId = getParentId(edge.start);
      // const endParentId = getParentId(edge.end);
      // if (startParentId && startParentId === endParentId) {
      //   groupIds = getGroupIds(startParentId);
      // }
      console.log(edge);
      // Get arrow position data
      const { startX, startY, reflectionPoints } = edge;
      // Calculate arrow's points
      const arrowType = computeDrawnixArrowType(edge.type);
      const points = reflectionPoints.map(
        (point) => [point.x, point.y] as Point
      ) as [Point, Point];
      const texts: ArrowLineText[] = [];
      if (edge.text) {
        const textValue = buildText(getText(edge));
        const { width, height } = measureElement(textValue, {
          fontSize: DEFAULT_FONT_SIZE,
          fontFamily: DEFAULT_FONT_FAMILY,
        });
        texts.push({
          position: 0.5,
          text: buildText(getText(edge)),
          width,
          height,
        });
      }
      const arrowStyle = computeDrawnixArrowStyle(edge);
      const arrowOptions = {
        strokeWidth: DefaultLineStyle.strokeWidth,
        ...arrowStyle,
      };
      const arrowLineElement = createArrowLineElement(
        ArrowLineShape.straight,
        [...points],
        {
          ...arrowType.source,
        },
        {
          ...arrowType.target,
        },
        texts,
        { ...arrowOptions }
      );
      elements.push(arrowLineElement);
    });

    return {
      elements,
    };
  },
});
