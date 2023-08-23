import React from "react";
import { BoxWrapper } from "components/wrapper_components";

const BubbleLoader = (props) => {
  return (
    <BoxWrapper
      style={{
        color: "#f8f8f8",
        opacity: "0.1",
        display: "flex",
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
      className="loader"
      id="bubbles"
    >
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </BoxWrapper>
  );
};

export default BubbleLoader;
