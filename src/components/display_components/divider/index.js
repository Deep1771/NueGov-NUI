import React from "react";
import Divider from "@material-ui/core/Divider";

export const DisplayDivider = (props) => {
  const { color, padding, ...rest } = props;
  return (
    <Divider
      style={{
        width: "100%",
        backgroundColor: color ? color : "#ebebeb",
        padding: padding ? padding : "0px 0px",
        // marginBottom: "0.5rem",
      }}
      {...rest}
    />
  );
};
