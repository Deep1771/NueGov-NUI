import React from "react";
import Collapse from "@material-ui/core/Collapse";

export const DisplayCollapse = ({ children, ...rest }) => {
  return <Collapse {...rest}>{children}</Collapse>;
};
