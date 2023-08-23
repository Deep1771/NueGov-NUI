import React from "react";

import Skeleton from "@material-ui/lab/Skeleton";
import { SummaryCardSkeleton } from "./summary_card";

export const SummaryContainerSkeleton = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
      }}
    >
      <div style={{ display: "flex", height: "6%" }}>
        <div
          style={{
            display: "flex",
            flex: 8,
            alignItems: "center",
            padding: "15px 0 0 15px",
          }}
        >
          <Skeleton variant="rect" width={150} height={30} />
        </div>
        <div
          style={{
            flex: 4,
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            padding: "15px 15px 0 0",
          }}
        >
          {[1, 2, 3].map((e, i) => {
            return <Skeleton variant="rect" width={30} height={30} key={i} />;
          })}
        </div>
      </div>
      <div
        style={{
          height: "85%",
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          paddingTop: "5px",
        }}
        className="hide_scroll"
      >
        {[1, 2, 3, 4].map((e, i) => {
          return <SummaryCardSkeleton key={i} />;
        })}
      </div>
      <div
        style={{
          display: "flex",
          height: "6%",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flex: 1, padding: "20px 0 0 15px" }}>
          <Skeleton variant="rect" width={80} height={30} />
        </div>
        <div
          style={{
            display: "flex",
            flex: 1,
            justifyContent: "flex-end",
            padding: "20px 15px 0 0",
          }}
        >
          <Skeleton variant="rect" width={80} height={30} />
        </div>
      </div>
    </div>
  );
};

// {
//   [1, 2, 3, 4].map((item, i) => {
//     return (
//       <SummaryCardSkeleton />
//     )

//   })
// }
