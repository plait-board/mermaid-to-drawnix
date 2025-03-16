import { GraphConverter } from "../GraphConverter.js";
import { GraphImage } from "../../interfaces.js";
import { idCreator, Point } from "@plait/core";
import { CommonImageItem } from "@plait/common";

export const createImage = (startPoint: Point, imageItem: CommonImageItem) => {
  const { width, height, url } = imageItem;
  const points: Point[] = [
    startPoint,
    [startPoint[0] + width, startPoint[1] + height],
  ];
  const imageElement = {
    id: idCreator(),
    type: "image",
    points,
    url,
  };
  return imageElement;
};

export const graphImageConverter = new GraphConverter<GraphImage>({
  converter: (graph) => {
    const { width, height } = graph;
    const imageElement = createImage([0, 0], {
      width,
      height,
      url: graph.dataURL,
    });
    return { elements: [imageElement] };
  },
});
