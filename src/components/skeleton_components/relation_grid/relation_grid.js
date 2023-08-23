import React from "react";

import { DisplayIconButton } from "components/display_components";
import { SummaryCardSkeleton } from "../summary_page/summary_card";
import Skeleton from "@material-ui/lab/Skeleton";
import ArrowBackIosRoundedIcon from "@material-ui/icons/ArrowBackIosRounded";
import ArrowForwardIosRoundedIcon from "@material-ui/icons/ArrowForwardIosRounded";

export const RelationGridSkeleton = (props) => {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div
        style={{
          flex: 0.8,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        {[1, 2, 3, 4].map((e) => (
          <Skeleton
            variant="rect"
            width="5vw"
            height="3vh"
            style={{ margin: "10px" }}
          />
        ))}
      </div>
      <div
        class="hide_scroll"
        style={{
          flex: 7,
          display: "flex",
          flexWrap: "wrap",
          overflowY: "auto",
          contain: "strict",
          marginBottom: "15px",
          alignItems: "flex-start",
        }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((e) => (
          <div
            style={{
              width: "33%",
              height: "170px",
              display: "flex",
              marginBottom: "20px",
            }}
          >
            <SummaryCardSkeleton elevation={1} />
          </div>
        ))}
      </div>
      <div
        style={{
          flex: 0.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        <div style={{ width: "17%", height: "100%", display: "flex" }}>
          <div
            style={{
              flex: 1.8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DisplayIconButton size="small">
              <ArrowBackIosRoundedIcon />
            </DisplayIconButton>
          </div>
          {[1, 2, 3].map((e) => (
            <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
              <Skeleton
                variant="circle"
                style={{ height: "30%", width: "60%" }}
              />
            </div>
          ))}
          <div
            style={{
              flex: 1.8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DisplayIconButton size="small">
              <ArrowForwardIosRoundedIcon />
            </DisplayIconButton>
          </div>
        </div>
      </div>
    </div>
  );
};
