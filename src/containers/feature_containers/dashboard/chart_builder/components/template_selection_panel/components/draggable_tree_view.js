import React from "react";
import { TreeItem } from "@material-ui/lab/";
import { useDrag } from "react-dnd";

const DraggableTreeView = ({ fieldMetadata, name, src, label, nodeId }) => {
  const [{ isDragging }, drag] = useDrag({
    item: { fieldMetadata, name, src, label, type: "DRAGGABLE" },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  return (
    <div ref={drag}>
      <TreeItem
        style={{
          opacity: isDragging ? 0.5 : 1,
          cursor: "move",
          padding: "5px 0px 5px 2px",
        }}
        nodeId={nodeId}
        label={label}
      ></TreeItem>
    </div>
  );
};

export default DraggableTreeView;
