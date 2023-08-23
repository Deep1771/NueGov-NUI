import React from "react";
import PropTypes from "prop-types";
import { ThemeFactory } from "utils/services/factory_services";
import Stylesheet from "utils/stylesheets/display_component";

export const DisplayIcon = React.forwardRef((props, ref) => {
  const { name, systemVariant, ...rest } = props;
  const { useIconStyles } = Stylesheet();
  const { getVariantForComponent } = ThemeFactory();
  const defaultVariant = systemVariant ? systemVariant : "primary";
  const classes = useIconStyles(getVariantForComponent("ICON", defaultVariant));
  let Icon = name;
  return (
    <Icon
      classes={{
        root: classes.root,
      }}
      ref={ref}
      {...rest}
    />
  );
});

DisplayIcon.defaultProps = {
  fontSize: "default", // inherit | default | small | large
};

DisplayIcon.propTypes = {
  name: PropTypes.object.isRequired,
};
