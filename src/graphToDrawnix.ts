import { DrawnixConfig } from "./index.js";
import { FlowchartToDrawnixSkeletonConverter } from "./converter/types/flowchart.js";
import { GraphImage, MermaidToDrawnixResult } from "./interfaces.js";
import { Sequence } from "./parser/sequence.js";
import { Flowchart } from "./parser/flowchart.js";
import { Class } from "./parser/class.js";

export const graphToDrawnix = (
  graph: Flowchart | GraphImage | Sequence | Class,
  options: DrawnixConfig = {}
): MermaidToDrawnixResult => {
  switch (graph.type) {
    case "graphImage": {
    }

    case "flowchart": {
      return FlowchartToDrawnixSkeletonConverter.convert(graph, options);
    }

    // case "sequence": {
    //   return SequenceToDrawnixSkeletonConvertor.convert(graph, options);
    // }

    // case "class": {
    //   return classToDrawnixSkeletonConvertor.convert(graph, options);
    // }

    default: {
      throw new Error(
        `graphToDrawnix: unknown graph type "${
          (graph as any).type
        }, only flowcharts are supported!"`
      );
    }
  }
};
