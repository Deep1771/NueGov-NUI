import React from "react";
import { ContentSkeleton } from "./content";
import { PaginationSkeleton } from "./pagination";

export const ControlPanelSkeleton = () => {
  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        height: "100%",
        width: "100%",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          backgroundColor: "#f5f5f5",
          width: "100%",
        }}
      >
        <ContentSkeleton />
        <div style={{ flexGrow: 1 }}>
          <PaginationSkeleton />
        </div>
      </div>
    </div>
  );
};
