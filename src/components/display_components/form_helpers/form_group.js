import React from "react";
import { FormGroup } from "@material-ui/core";
import { FormThemeWrapper } from "utils/stylesheets/form_theme_wrapper";

export const DisplayFormGroup = ({ children, ...rest }) => {
  return <FormGroup {...rest}>{children}</FormGroup>;
};

export default FormThemeWrapper(DisplayFormGroup);
