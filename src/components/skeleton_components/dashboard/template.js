import React from "react";
import { Skeleton } from "@material-ui/lab/";

export const TemplateSkeleton = () => {
  return (
    <div style={{ padding: "10px" }}>
      <Skeleton
        variant="text"
        style={{ backgroundColor: "#dde2e5", width: "60%" }}
      />
      <Skeleton
        variant="text"
        style={{ backgroundColor: "#dde2e5", width: "60%", marginLeft: "30px" }}
      />
      <Skeleton
        variant="text"
        style={{ backgroundColor: "#dde2e5", width: "60%", marginLeft: "60px" }}
      />
      <Skeleton
        variant="text"
        style={{ backgroundColor: "#dde2e5", width: "60%", marginLeft: "60px" }}
      />
      {[1, 4, 5].map((e, i) => (
        <Skeleton
          variant="text"
          key={i}
          style={{
            backgroundColor: "#dde2e5",
            width: "60%",
            marginLeft: "90px",
          }}
        />
      ))}
      {[1, 5].map((e, i) => (
        <Skeleton
          variant="text"
          key={i}
          style={{
            backgroundColor: "#dde2e5",
            width: "60%",
            marginLeft: "30px",
          }}
        />
      ))}
      <Skeleton
        variant="text"
        style={{ backgroundColor: "#dde2e5", width: "60%", marginLeft: "60px" }}
      />
      {[1, 5].map((e, i) => (
        <Skeleton
          variant="text"
          key={i}
          style={{
            backgroundColor: "#dde2e5",
            width: "60%",
            marginLeft: "90px",
          }}
        />
      ))}
      {[1, 5].map((e, i) => (
        <Skeleton
          variant="text"
          key={i}
          style={{ backgroundColor: "#dde2e5", width: "60%" }}
        />
      ))}
    </div>
  );
};
