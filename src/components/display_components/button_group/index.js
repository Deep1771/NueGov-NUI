import React from "react";
import { ButtonGroup } from "@material-ui/core";
export const DisplayButtonGroup = ({ children, ...rest }) => {
  return <ButtonGroup {...rest}>{children}</ButtonGroup>;
};
