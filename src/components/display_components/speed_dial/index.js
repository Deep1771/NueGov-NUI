import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import SpeedDial from "@material-ui/lab/SpeedDial";
import SpeedDialAction from "@material-ui/lab/SpeedDialAction";
import SpeedDialIcon from "@material-ui/lab/SpeedDialIcon";

const useStyles = makeStyles((theme) => ({
  speedDial: {
    position: "absolute",
    "&.MuiSpeedDial-directionUp, &.MuiSpeedDial-directionLeft": {
      bottom: theme.spacing(0),
      right: theme.spacing(0),
    },
    "&.MuiSpeedDial-directionDown, &.MuiSpeedDial-directionRight": {
      top: theme.spacing(0),
      left: theme.spacing(0),
    },
  },
}));

export const DisplaySpeedDial = ({ actions, ...rest }) => {
  const classes = useStyles();
  return (
    <SpeedDial
      ariaLabel="DisplaySpeedDial"
      className={classes.speedDial}
      icon={<SpeedDialIcon />}
      {...rest}
    >
      {actions.map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          tooltipTitle={action.name}
          tooltipOpen
          onClick={action.onClick}
        />
      ))}
    </SpeedDial>
  );
};
