import React from "react";
import AppBar from "@material-ui/core/AppBar";
import StyleSheet from "utils/stylesheets/wrapper_component";
import { ThemeFactory } from "utils/services/factory_services";

export const AppBarWrapper = ({ children, systemVariant, ...rest }) => {
  const { getVariantForComponent } = ThemeFactory();
  const { useAppBarStyles } = StyleSheet();
  const defaultVariant = systemVariant ? systemVariant : "primary";
  const classes = useAppBarStyles(
    getVariantForComponent("displayAppBar", defaultVariant)
  );

  return (
    <AppBar
      classes={{
        root: classes.root,
      }}
      {...rest}
    >
      {children}
    </AppBar>
  );
};
