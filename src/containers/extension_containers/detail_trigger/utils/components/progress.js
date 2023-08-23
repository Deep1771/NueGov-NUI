import React from "react";
import { DisplayProgress, DisplayText } from "components/display_components";

const CircleProgress = (props) => {
  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <DisplayProgress />
      <br />
      <DisplayText style={{ color: "#666666" }}>{props.label}</DisplayText>
    </div>
  );
};

export default CircleProgress;
