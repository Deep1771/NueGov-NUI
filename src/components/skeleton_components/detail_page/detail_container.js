import React from "react";
import { DisplayButton } from "components/display_components";
import Skeleton from "@material-ui/lab/Skeleton";
import ChromeReaderModeOutlined from "@material-ui/icons/ChromeReaderModeOutlined";

export const DetailContainerSkeleton = () => {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
      }}
    >
      <div style={{ flex: 2, display: "flex" }}>
        <div style={{ flex: 4, display: "flex", margin: "1vh 0vh" }}>
          <div style={{ flex: 7, display: "flex", flexDirection: "column" }}>
            <Skeleton variant="rect" style={{ flex: 1, height: "100%" }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              {[1, 1.3].map((e, i) => (
                <div key={i} style={{ flex: 1, display: "flex" }}>
                  <Skeleton
                    variant="text"
                    style={{ flexBasis: "40%", marginRight: "1vw" }}
                  />
                  <Skeleton
                    variant="text"
                    style={{ flexBasis: `calc(50%/${e})` }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: 7 }} />
        </div>
        <div style={{ flex: 7, display: "flex", flexDirection: "column" }}>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "flex-end",
            }}
          >
            <Skeleton
              variant="rect"
              width="5vw"
              height="3vh"
              style={{ margin: "10px" }}
            />
          </div>
        </div>
      </div>
      <div style={{ flex: 2, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, display: "flex" }}>
          <div style={{ flex: 1, display: "flex", margin: "1vh 0vh" }}>
            {[1, 2, 3, 4].map((e, i) => (
              <Skeleton
                key={i}
                variant="rect"
                style={{
                  flex: 1,
                  height: "100%",
                  marginRight: "1vw",
                  borderRadius: "13px",
                }}
              />
            ))}
          </div>
          <div style={{ flex: 1 }} />
        </div>
        <Skeleton
          variant="rect"
          style={{ flex: 1, height: "100%", margin: "1vh 0vh" }}
        />
      </div>
      <div style={{ flex: 8, display: "flex" }}>
        <div style={{ flex: 9, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 2, display: "flex", margin: "1vh 0vh" }}>
            {[1, 2, 3].map((e, i) => (
              <Skeleton
                key={i}
                variant="rect"
                style={{ flex: 1, height: "100%", marginRight: "1vw" }}
              />
            ))}
          </div>
          <div style={{ flex: 1.7, display: "flex", margin: "1vh 0vh" }}>
            {[1, 2, 3].map((e, i) => (
              <Skeleton
                key={i}
                variant="rect"
                style={{ flex: 1, height: "100%", marginRight: "1vw" }}
              />
            ))}
          </div>
          <div style={{ flex: 2, display: "flex", margin: "1vh 0vh" }}>
            {[1, 2].map((e, i) => (
              <Skeleton
                key={i}
                variant="rect"
                style={{ flex: 1, height: "100%", marginRight: "1vw" }}
              />
            ))}
            <div style={{ flex: 1, marginRight: "1vw" }} />
          </div>
        </div>
        <div style={{ flex: 1 }} />
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "flex-end",
        }}
      >
        <Skeleton
          variant="rect"
          width="5vw"
          height="3vh"
          style={{ margin: "10px" }}
        />
      </div>
    </div>
  );
};
