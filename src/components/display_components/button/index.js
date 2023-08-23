import React from "react";
import { Button } from "@material-ui/core";
import { ThemeFactory } from "utils/services/factory_services";
import Stylesheet from "utils/stylesheets/display_component";

export const DisplayButton = (props) => {
  let { children, systemVariant, ...rest } = props;
  const { getVariantForComponent } = ThemeFactory();
  const { useButtonStyles } = Stylesheet();
  const defaultVariant = systemVariant ? systemVariant : "primary";
  const classes = useButtonStyles(
    getVariantForComponent("BUTTON", defaultVariant)
  );

  return (
    <Button
      {...rest}
      classes={{
        root: classes.root,
        text: classes.text,
        disabled: classes.disabled,
        outlined: classes.outlined,
        contained: classes.contained,
      }}
    >
      {children}
    </Button>
  );
};
