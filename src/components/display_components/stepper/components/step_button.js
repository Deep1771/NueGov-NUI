import React from "react";
import { StepButton } from "@material-ui/core";

const DisplayStepButton = ({ children, ...props }) => {
  return <StepButton {...props}>{children}</StepButton>;
};

export default DisplayStepButton;
