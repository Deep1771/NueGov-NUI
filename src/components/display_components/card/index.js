import React from "react";
import { Card } from "@material-ui/core";
import { ThemeFactory } from "utils/services/factory_services";
import Stylesheet from "utils/stylesheets/display_component";

export const DisplayCard = ({ children, systemVariant, ...rest }) => {
  const { getVariantForComponent } = ThemeFactory();
  const { useCardStyles } = Stylesheet();
  const defaultVariant = systemVariant ? systemVariant : "default";
  const classes = useCardStyles(getVariantForComponent("CARD", defaultVariant));
  return (
    <Card
      classes={{
        root: classes.root,
      }}
      {...rest}
    >
      {children}
    </Card>
  );
};
