import { useEffect, useRef, useState } from "react";
import { Drawnix } from "@drawnix/drawnix";
import { PlaitBoard, PlaitElement, PlaitTheme, Viewport } from "@plait/core";
import { graphToDrawnix } from "../src/graphToDrawnix";
import type { MermaidData } from "./";

import "./../node_modules/@drawnix/drawnix/style.css";
import "./../node_modules/@drawnix/react-board/style.css";
import "./../node_modules/@drawnix/react-text/style.css";

interface DrawnixWrapperProps {
  mermaidDefinition: MermaidData["definition"];
  mermaidOutput: MermaidData["output"];
}

const DrawnixWrapper = ({
  mermaidDefinition,
  mermaidOutput,
}: DrawnixWrapperProps) => {
  const boardRef = useRef<PlaitBoard | null>(null);
  const [elements, setElements] = useState<PlaitElement[]>([]);

  useEffect(() => {
    console.log(mermaidOutput, mermaidDefinition);

    if (mermaidDefinition === "" || mermaidOutput === null) {
      setElements([]);
      return;
    }

    const { elements: newElements, files } = graphToDrawnix(mermaidOutput);

    setElements(newElements);
    console.log(newElements);
  }, [mermaidDefinition, mermaidOutput]);

  return (
    <div className="drawnix-wrapper">
      <Drawnix
        value={elements}
        onChange={(value) => {}}
        afterInit={(board: PlaitBoard) => {
          boardRef.current = board;
        }}
      ></Drawnix>
    </div>
  );
};

export default DrawnixWrapper;
