import React from "react";
import { EntityCard } from "./entity_card";
import { useDrag } from "react-dnd";

export const DraggableEntityCard = (props) => {
  const [{ isDragging }, drag] = useDrag({
    item: { props, type: "DRAGGABLE_ENTITY_CARD" },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div ref={drag} style={{ display: "flex", flex: 1 }}>
      <EntityCard
        systemVariant={isDragging ? "primary" : "default"}
        {...props}
      />
    </div>
  );
};
