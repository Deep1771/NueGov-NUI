import React from "react";
import { FormControl } from "@material-ui/core";
import { FormThemeWrapper } from "utils/stylesheets/form_theme_wrapper";

const DisplayFormControl = ({ children, testid, ...rest }) => {
  return (
    <FormControl testid={testid} {...rest}>
      {children}
    </FormControl>
  );
};

export default FormThemeWrapper(DisplayFormControl);
