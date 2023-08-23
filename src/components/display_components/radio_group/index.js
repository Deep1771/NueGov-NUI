import React from "react";
import { RadioGroup } from "@material-ui/core";

export const DisplayRadioGroup = ({ children, ...rest }) => {
  return <RadioGroup {...rest}>{children}</RadioGroup>;
};
