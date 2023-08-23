import React from "react";

import { DisplayCard, DisplayIconButton } from "components/display_components";
import Background from "./map_background.png";
import Skeleton from "@material-ui/lab/Skeleton";
import AddSharpIcon from "@material-ui/icons/AddSharp";
import MyLocationSharpIcon from "@material-ui/icons/MyLocationSharp";
import RemoveSharpIcon from "@material-ui/icons/RemoveSharp";
import ZoomOutMapIcon from "@material-ui/icons/ZoomOutMap";

export const SummaryMapSkeleton = () => {
  return (
    <DisplayCard
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        elevation: "21",
        background: `url(${Background})`,
      }}
    >
      <div style={{ display: "flex", flex: 11 }}>
        <div style={{ display: "flex", flex: 11, padding: "12px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: "3vh",
              marginLeft: "1vh",
            }}
          >
            {[1, 2, 3].map((e, i) => (
              <Skeleton
                key={i}
                variant="text"
                height={10}
                width={30}
                style={{ background: "#e6e6e6" }}
              />
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ display: "flex", flex: 1, justifyContent: "center" }}>
              <Skeleton
                variant="rect"
                height={50}
                width={320}
                style={{
                  borderRadius: "25px",
                  marginTop: "5vh",
                  background: "#e6e6e6",
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flex: 1,
          justifyContent: "flex-end",
          alignItems: "center",
          padding: "4px",
        }}
      >
        {/* {['MyLocationSharpIcon','ZoomOutMapIcon','AddSharpIcon','RemoveSharpIcon'].map(e=>(
                     <DisplayIconButton style={{background:'white', marginRight:'0.8vw'}}>
                    {< e/>}
                    </DisplayIconButton> 
                ))} */}

        <DisplayIconButton
          style={{ background: "white", marginRight: "0.8vw" }}
        >
          <MyLocationSharpIcon />
        </DisplayIconButton>
        <DisplayIconButton
          style={{ background: "white", marginRight: "0.8vw" }}
        >
          <ZoomOutMapIcon />
        </DisplayIconButton>
        <DisplayIconButton
          style={{ background: "white", marginRight: "0.8vw" }}
        >
          <AddSharpIcon />
        </DisplayIconButton>
        <DisplayIconButton
          style={{ background: "white", marginRight: "0.8vw" }}
        >
          <RemoveSharpIcon />
        </DisplayIconButton>
      </div>
    </DisplayCard>
  );
};
