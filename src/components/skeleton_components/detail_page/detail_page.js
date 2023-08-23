import React from "react";
import { DetailContainerSkeleton } from "./detail_container";
import { NavbarSkeleton } from "../navigation/navbar";
import { RibbonSkeleton } from "../navigation/ribbon";
import { SummaryContainerSkeleton } from "../summary_page/summary_container";

export const DetailPageSkeleton = () => {
  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        height: "100vh",
        width: "100vw",
        flexDirection: "column",
      }}
    >
      <div style={{ flex: 2, display: "flex" }}>
        <NavbarSkeleton />
      </div>
      <div style={{ flex: 18, display: "flex" }}>
        <div style={{ flex: 3, display: "flex" }}>
          <SummaryContainerSkeleton />
        </div>
        <div style={{ flex: 9, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 18, display: "flex" }}>
            <DetailContainerSkeleton />
          </div>
          <div style={{ flex: 2, display: "flex" }}>
            <RibbonSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
};
