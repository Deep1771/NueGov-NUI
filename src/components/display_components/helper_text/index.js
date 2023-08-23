import React from "react";
import { DisplayText } from "../text/";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
  iconContainer: {
    flexShrink: 1,
    alignItems: "center",
  },
  mainContainer: {
    display: "flex",
    flexDirection: "row",
    flex: 1,
    color: "red",
  },
  textContainer: {
    flexGrow: 11,
    alignItems: "center",
    color: "red",
  },
});
export const DisplayHelperText = ({ children, icon: Icon }) => {
  const classes = useStyles();
  return (
    <div className={classes.mainContainer}>
      <div className={classes.textContainer}>
        <DisplayText style={{ fontSize: 12 }}> {children} </DisplayText>
      </div>
    </div>
  );
};
