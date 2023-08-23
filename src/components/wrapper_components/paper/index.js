import React from "react";
import Paper from "@material-ui/core/Paper";
import StyleSheet from "utils/stylesheets/wrapper_component";

export const PaperWrapper = ({ children, ...rest }) => {
  const { usePaperStyles } = StyleSheet();
  const classes = usePaperStyles();
  return (
    <Paper className={classes.root} {...rest}>
      {children}
    </Paper>
  );
};
