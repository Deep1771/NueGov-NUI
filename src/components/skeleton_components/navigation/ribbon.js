import React from "react";

import Skeleton from "@material-ui/lab/Skeleton";

export const RibbonSkeleton = () => {
  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        alignItems: "center",
        overflowX: "auto",
        backgroundColor: "#FAFAFA",
      }}
    >
      {[1, 2, 3].map((e, i) => (
        <div key={i} style={{ display: "flex", marginLeft: "30px" }}>
          <Skeleton
            variant="rect"
            width="2vw"
            height="5vh"
            style={{ borderRadius: "5px 0 0 5px" }}
          />
          <Skeleton
            variant="rect"
            width="8vw"
            height="5vh"
            animation="wave"
            style={{ borderRadius: "0 5px 5px 0" }}
          />
        </div>
      ))}
    </div>
  );
};
