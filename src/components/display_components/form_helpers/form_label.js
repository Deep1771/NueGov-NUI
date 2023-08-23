import React from "react";
import { FormLabel } from "@material-ui/core";
import { FormThemeWrapper } from "utils/stylesheets/form_theme_wrapper";
import { ToolTipWrapper } from "components/wrapper_components";

export const DisplayFormLabel = (props) => {
  let { children, systemVariant, toolTipMsg, placement, ...rest } = props;
  return (
    <ToolTipWrapper title={toolTipMsg} placement={placement}>
      <FormLabel {...rest}>{children}</FormLabel>
    </ToolTipWrapper>
  );
};

export default FormThemeWrapper(DisplayFormLabel);
