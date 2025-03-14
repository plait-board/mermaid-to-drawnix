import { useEffect, useState } from "react";
import {
  Excalidraw,
  convertToExcalidrawElements,
} from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types.js";
import { graphToDrawnix } from "../src/graphToDrawnix";
import { DEFAULT_FONT_SIZE } from "../src/constants";
import type { MermaidData } from "./";

interface DrawnixWrapperProps {
  mermaidDefinition: MermaidData["definition"];
  mermaidOutput: MermaidData["output"];
}

const DrawnixWrapper = ({
  mermaidDefinition,
  mermaidOutput,
}: DrawnixWrapperProps) => {
  const [drawnixAPI, setDrawnixAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);

  useEffect(() => {
    if (!drawnixAPI) {
      return;
    }

    if (mermaidDefinition === "" || mermaidOutput === null) {
      drawnixAPI.resetScene();
      return;
    }

    const { elements, files } = graphToDrawnix(mermaidOutput, {
      fontSize: DEFAULT_FONT_SIZE,
    });

    drawnixAPI.updateScene({
      elements: convertToExcalidrawElements(elements),
    });
    drawnixAPI.scrollToContent(drawnixAPI.getSceneElements(), {
      fitToContent: true,
    });

    if (files) {
      drawnixAPI.addFiles(Object.values(files));
    }
  }, [mermaidDefinition, mermaidOutput]);

  return (
    <div className="drawnix-wrapper">
      <Excalidraw
        initialData={{
          appState: {
            viewBackgroundColor: "#fafafa",
            currentItemFontFamily: 1,
          },
        }}
        excalidrawAPI={(api) => setDrawnixAPI(api)}
      />
    </div>
  );
};

export default DrawnixWrapper;
