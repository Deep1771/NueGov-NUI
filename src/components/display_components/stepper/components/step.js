import React from "react";
import { Step } from "@material-ui/core";

const DisplayStep = ({ children, ...props }) => {
  return <Step {...props}>{children}</Step>;
};

export default DisplayStep;
