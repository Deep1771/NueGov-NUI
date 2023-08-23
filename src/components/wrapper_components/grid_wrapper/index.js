import React from "react";
import Grid from "@material-ui/core/Grid";

export const GridWrapper =
  (Component) =>
  ({ gridProps, ...props }) => {
    return (
      <Grid item container {...gridProps}>
        <Component {...props} />
      </Grid>
    );
  };
