import React from "react";
import StyleSheet from "utils/stylesheets/wrapper_component";

export const ContainerWrapper = ({ children, ...rest }) => {
  const { useContainerStyles } = StyleSheet();
  const classes = useContainerStyles();
  return (
    <div className={classes.root} {...rest}>
      {children}
    </div>
  );
};
