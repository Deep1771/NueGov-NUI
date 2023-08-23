import React from "react";
import PropTypes from "prop-types";
import { Typography } from "@material-ui/core";
import { ThemeFactory } from "utils/services/factory_services";
import Stylesheet from "utils/stylesheets/display_component";

export const DisplayText = (props) => {
  let { children, ...rest } = props;
  const { useTextStyles } = Stylesheet();
  const { getAllClasses } = ThemeFactory();
  const classes = useTextStyles(getAllClasses("typography"));
  return (
    <Typography
      {...rest}
      classes={{
        root: classes.root,
        body1: classes.body1,
        body2: classes.body2,
        button: classes.button,
        caption: classes.caption,
        h1: classes.h1,
        h2: classes.h2,
        h3: classes.h3,
        h4: classes.h4,
        h5: classes.h5,
        h6: classes.h6,
        overline: classes.overline,
        srOnly: classes.srOnly,
        subtitle1: classes.subtitle1,
        subtitle2: classes.subtitle2,
      }}
      component={"span"}
    >
      {children}
    </Typography>
  );
};

DisplayText.propTypes = {
  children: PropTypes.node,
};
