import React from "react";
import { Fab } from "@material-ui/core";
import { ThemeFactory } from "utils/services/factory_services";
import Stylesheet from "utils/stylesheets/display_component";

export const DisplayFab = ({ children, color, systemVariant, ...rest }) => {
  const { getVariantForComponent } = ThemeFactory();
  const { useFABStyles } = Stylesheet();
  const defaultVariant = systemVariant ? systemVariant : "primary";
  const classes = useFABStyles(getVariantForComponent("FAB", defaultVariant));
  return (
    <Fab
      classes={{
        root: classes.root,
      }}
      {...rest}
    >
      {children}
    </Fab>
  );
};
