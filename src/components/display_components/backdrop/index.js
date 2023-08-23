import React from "react";
import { Backdrop, CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { DisplayText } from "../text";

const useStyles = makeStyles(() => ({
  backdrop: {
    zIndex: 1500,
    display: "flex",
    flexDirection: "column",
    color: "#fff",
  },
}));

export const DisplayBackdrop = (props) => {
  let { message, ...rest } = props;
  const classes = useStyles();

  return (
    <Backdrop className={classes.backdrop} {...rest}>
      <CircularProgress color="inherit" />
      <DisplayText variant="h4">{message}</DisplayText>
    </Backdrop>
  );
};
