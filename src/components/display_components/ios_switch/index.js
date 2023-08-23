import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { Switch } from "@material-ui/core";

export const IOSSwitch = withStyles(() => ({
  root: {
    width: 42,
    height: 26,
    padding: 0,
    margin: "0px 10px 0px 10px",
  },
  switchBase: {
    padding: 1,
    "&$checked": {
      transform: "translateX(16px)",
      color: "white",
      "& + $track": {
        backgroundColor: "#68ad5a",
        opacity: 1,
        border: "none",
      },
    },
    "&$focusVisible $thumb": {
      color: "#52d869",
      border: "6px solid #fff",
    },
  },
  thumb: {
    width: 24,
    height: 24,
  },
  track: {
    borderRadius: 26 / 2,
    border: "1px solid #fa5050",
    backgroundColor: "#fa5050",
    opacity: 1,
  },
  checked: {},
  focusVisible: {},
}))(({ classes, ...props }) => {
  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked,
      }}
      {...props}
    />
  );
});
