import React from "react";
import { IconButton } from "@material-ui/core";
import PropTypes from "prop-types";
import { ThemeFactory } from "utils/services/factory_services";
import Stylesheet from "utils/stylesheets/display_component";

export const DisplayIconButton = (props) => {
  const { children, color, systemVariant, testid, ...rest } = props;
  const { getVariantForComponent } = ThemeFactory();
  const { useIconButtonStyles } = Stylesheet();
  const defaultVariant = systemVariant ? systemVariant : "default";
  const classes = useIconButtonStyles(
    getVariantForComponent("ICON_BUTTON", defaultVariant)
  );
  return (
    <IconButton
      testid={testid}
      classes={{
        root: classes.root,
      }}
      {...rest}
    >
      {children}
    </IconButton>
  );
};

DisplayIconButton.propTypes = {
  name: PropTypes.object,
};

DisplayIconButton.defaultProps = {
  size: "medium",
};
