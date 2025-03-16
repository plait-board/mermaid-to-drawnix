import { DrawnixConfig } from "./index.js";
import { flowchartToDrawnixConverter } from "./converter/types/flowchart.js";
import { GraphImage, MermaidToDrawnixResult } from "./interfaces.js";
import { Sequence } from "./parser/sequence.js";
import { Flowchart } from "./parser/flowchart.js";
import { Class } from "./parser/class.js";
import { sequenceToDrawnixConvertor } from "./converter/types/sequence.js";
import { classToDrawnixConvertor } from "./converter/types/class.js";
import { graphImageConverter } from "./converter/types/graphImage.js";

export const graphToDrawnix = (
  graph: Flowchart | GraphImage | Sequence | Class,
  options: DrawnixConfig = { fontSize: 20 }
): MermaidToDrawnixResult => {
  switch (graph.type) {
    case "graphImage": {
      return graphImageConverter.convert(graph, options);
    }

    case "flowchart": {
      return flowchartToDrawnixConverter.convert(graph as Flowchart, options);
    }

    case "sequence": {
      return sequenceToDrawnixConvertor.convert(graph, options);
    }

    case "class": {
      return classToDrawnixConvertor.convert(graph, options);
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
