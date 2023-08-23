import React from "react";
import { Stepper } from "@material-ui/core";
import DisplayStepConnector from "./step_connector";
import ThemeWrapper from "../theme";

const DisplayStepper = ({ children, connector, ...props }) => {
  return (
    <Stepper {...props} connector={<DisplayStepConnector />}>
      {children}
    </Stepper>
  );
};

export default ThemeWrapper(DisplayStepper);
