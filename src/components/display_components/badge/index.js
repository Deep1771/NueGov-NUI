import React from "react";
import { Badge } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { ThemeFactory } from "utils/services/factory_services";

const useStyles = makeStyles({
  badge: ({ colors, local }) => ({
    color: colors.dark.text,
    backgroundColor: colors.dark.bgColor,
  }),
  dot: { height: "10px", width: "10px", borderRadius: "50%" },
  root: ({ colors, local }) => ({
    color: colors.dark.bgColor,
  }),
});

export const DisplayBadge = ({ children, systemVariant, color, ...rest }) => {
  const { getVariantForComponent } = ThemeFactory();
  const defaultVariant = systemVariant ? systemVariant : "primary";
  const classes = useStyles(getVariantForComponent("BADGE", defaultVariant));
  return (
    <Badge
      classes={{
        root: classes.root,
        badge: classes.badge,
        dot: classes.dot,
      }}
      {...rest}
    >
      {children}
    </Badge>
  );
};
DisplayBadge.defaultProps = {
  color: "primary",
  max: 99,
};
