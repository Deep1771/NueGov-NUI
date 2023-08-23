import React from "react";
import { Tooltip } from "@material-ui/core";
import StyleSheet from "utils/stylesheets/wrapper_component";
import { ThemeFactory } from "utils/services/factory_services";
export const ToolTipWrapper = ({
  children,
  title = "",
  placement,
  systemVariant,
  ...rest
}) => {
  const { useToolTipStyles } = StyleSheet();
  const { getVariantForComponent } = ThemeFactory();
  const defaultVariant = systemVariant ? systemVariant : "primary";
  const classes = useToolTipStyles(
    getVariantForComponent("TOOLTIP", defaultVariant)
  );
  return (
    <Tooltip
      title={title}
      placement={placement}
      classes={{
        tooltip: classes.tooltip,
        arrow: classes.arrow,
      }}
      {...rest}
    >
      {children}
    </Tooltip>
  );
};
ToolTipWrapper.defaultProps = {
  placement: "top-start",
  arrow: true,
};
