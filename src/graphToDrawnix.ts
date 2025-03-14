import { DrawnixConfig } from "./index.js";
import { FlowchartToDrawnixSkeletonConverter } from "./converter/types/flowchart.js";
import { GraphImageConverter } from "./converter/types/graphImage.js";
import { GraphImage, MermaidToDrawnixResult } from "./interfaces.js";
import { SequenceToDrawnixSkeletonConvertor } from "./converter/types/sequence.js";
import { Sequence } from "./parser/sequence.js";
import { Flowchart } from "./parser/flowchart.js";
import { Class } from "./parser/class.js";
import { classToDrawnixSkeletonConvertor } from "./converter/types/class.js";

export const graphToDrawnix = (
  graph: Flowchart | GraphImage | Sequence | Class,
  options: DrawnixConfig = {}
): MermaidToDrawnixResult => {
  switch (graph.type) {
    case "graphImage": {
      return GraphImageConverter.convert(graph, options);
    }

    case "flowchart": {
      return FlowchartToDrawnixSkeletonConverter.convert(graph, options);
    }

    case "sequence": {
      return SequenceToDrawnixSkeletonConvertor.convert(graph, options);
    }

    case "class": {
      return classToDrawnixSkeletonConvertor.convert(graph, options);
    }

    default: {
      throw new Error(
        `graphToDrawnix: unknown graph type "${
          (graph as any).type
        }, only flowcharts are supported!"`
      );
    }
  }
};
