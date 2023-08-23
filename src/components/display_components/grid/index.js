import React from "react";
import { Grid } from "@material-ui/core";

export const DisplayGrid = ({ children, ...props }) => {
  return <Grid {...props}>{children}</Grid>;
};
