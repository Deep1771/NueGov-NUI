import React from "react";
import { SummaryMapSkeleton } from "./summary_map";
import { SummaryContainerSkeleton } from "./summary_container";
import { RibbonSkeleton } from "../navigation/ribbon";

export const SummaryPageSkeleton = () => {
  return (
    <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
      <div style={{ flex: 18, display: "flex" }}>
        <div style={{ flex: 3, display: "flex" }}>
          <SummaryContainerSkeleton />
        </div>
        <div style={{ flex: 9, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 18, display: "flex" }}>
            <SummaryMapSkeleton />
          </div>
          <div style={{ flex: 2, display: "flex" }}>
            <RibbonSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
};
