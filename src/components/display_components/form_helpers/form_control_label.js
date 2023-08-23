import React from "react";
import { FormControlLabel } from "@material-ui/core";
import { FormThemeWrapper } from "utils/stylesheets/form_theme_wrapper";

const DisplayFormControlLabel = ({ children, ...rest }) => {
  return <FormControlLabel {...rest} control={children}></FormControlLabel>;
};

export default FormThemeWrapper(DisplayFormControlLabel);
