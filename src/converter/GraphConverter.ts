import { DEFAULT_FONT_SIZE } from "@plait/text-plugins";
import { DrawnixConfig } from "../index.js";
import { MermaidToDrawnixResult } from "../interfaces.js";
import { Flowchart } from "../parser/flowchart.js";
import { Sequence } from "../parser/sequence.js";

export class GraphConverter<T = Flowchart | Sequence> {
  private converter;
  constructor({
    converter,
  }: {
    converter: (
      graph: T,
      config: Required<DrawnixConfig>
    ) => MermaidToDrawnixResult;
  }) {
    this.converter = converter;
  }
  convert = (graph: T, config: DrawnixConfig) => {
    return this.converter(graph, {
      ...config,
      fontSize: config.fontSize || DEFAULT_FONT_SIZE,
    });
  };
}
