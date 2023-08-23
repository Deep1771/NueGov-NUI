import React from "react";
import { StepLabel } from "@material-ui/core";

const DisplayStepLabel = ({ children, ...props }) => {
  return <StepLabel {...props}>{children}</StepLabel>;
};

export default DisplayStepLabel;
