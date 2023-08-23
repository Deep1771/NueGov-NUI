import React from "react";

import { DisplayCard } from "components/display_components";
import Skeleton from "@material-ui/lab/Skeleton";

export const SummaryCardSkeleton = ({ ...rest }) => {
  return (
    <DisplayCard
      {...rest}
      style={{
        display: "flex",
        flex: 1,
        margin: "15px 10px 0 10px",
        minHeight: "160px",
      }}
    >
      <div
        style={{
          flex: "1",
          margin: "2%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", flex: 12 }}>
          <div
            style={{
              flex: 11.5,
              display: "flex",
              flexDirection: "column",
              margin: "10px",
            }}
          >
            {[5, 5.8, 4, 5.6].map((e, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flex: 1,
                  alignItems: "center",
                  margin: "5% 2% 0 2%",
                }}
              >
                <Skeleton
                  variant="rect"
                  style={{ height: "75%", width: "35%", marginRight: "5%" }}
                />
                <Skeleton
                  variant="rect"
                  style={{ height: "75%", width: `calc(${e}*10%)` }}
                />
              </div>
            ))}
            <div style={{ flex: 0.3 }} />
          </div>
          <div style={{ flex: 1.7, display: "flex", flexDirection: "column" }}>
            <div
              style={{
                flex: 4,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Skeleton variant="circle" height="85%" width="85%" />
            </div>
            <div style={{ flex: 11 }} />
          </div>
        </div>
      </div>
    </DisplayCard>
  );
};
