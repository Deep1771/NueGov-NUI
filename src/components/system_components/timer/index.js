import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core";
import PropTypes from "prop-types";
import {
  DisplayButton,
  DisplayGrid,
  DisplayText,
  DisplayDialog,
} from "components/display_components/index";
import { SystemIcons } from "utils/icons";
let timer;
const useStyles = makeStyles({
  border: {
    borderColor: "#CCCCCC",
    borderStyle: "solid",
    borderWidth: "0.5px",
    height: "100%",
    textAlign: "center ",
  },
  container: {
    height: "80%",
  },
  span: {
    color: "212121",
    fontFamily: "inherit Regular",
    fontSize: 16,
  },
});

export const SystemTimer = (props) => {
  const {
    disableOptions,
    endDate,
    endLabel,
    mode: MODE,
    onReset,
    onStart,
    onStop,
    resetLabel,
    startDate,
    startLabel,
    timerTitle,
    hideButtons,
  } = props;
  const classes = useStyles();
  const { Cached, Timer, TimerOff } = SystemIcons;

  const [dialog, setDialog] = useState(false);
  const [mode, setMode] = useState();
  const [timerOn, setTimerOn] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const startTime = startDate
      ? Math.floor(new Date(startDate).getTime() / 1000)
      : 0,
    endTime = endDate ? Math.floor(new Date(endDate).getTime() / 1000) : 0;

  const displayTimer = (totalSeconds) => {
    let minutes = Math.floor(totalSeconds / 60);
    totalSeconds -= minutes * 60;
    let hours = Math.floor(minutes / 60);
    minutes -= hours * 60;
    let days = Math.floor(hours / 24);
    hours -= days * 24;
    return `
            ${days > 99 ? days : days > 9 ? "0" + days : "00" + days} : 
            ${hours < 10 ? "0" + hours : hours} :
            ${minutes < 10 ? "0" + minutes : minutes} : 
            ${
              Math.floor(totalSeconds) < 10
                ? "0" + Math.floor(totalSeconds)
                : Math.floor(totalSeconds)
            }
            `;
  };

  const handleTimer = () => {
    timerOn ? stopTimer() : startTimer();
  };

  const resetTimer = () => {
    setTimerOn(false);
    setTimerSeconds(0);
    onReset();
  };

  const startTimer = () => {
    let date = new Date().toISOString();
    onStart(date);
  };

  const stopTimer = () => {
    let date = new Date().toISOString();
    setTimerOn(false);
    clearInterval(timer);
    onStop(date);
  };

  useEffect(() => {
    setMode(MODE);
  }, [MODE]);

  useEffect(() => {
    if (startDate && !endDate) {
      setTimerOn(true);
      timer = setInterval(() => {
        let diff = (Date.now() - new Date(startDate).getTime()) / 1000;
        setTimerSeconds(diff);
      }, 1000);
    } else if (!startDate) {
      setTimerSeconds(0);
      setTimerOn(false);
      clearInterval(timer);
    } else if (startDate && endDate) {
      setTimerOn(false);
      let diff = endTime - startTime;
      setTimerSeconds(diff);
      clearInterval(timer);
    }
  }, [startDate, endDate]);

  return (
    <div style={{ display: "flex", flex: 1 }}>
      <DisplayGrid
        container
        className={classes.border}
        direction="column"
        style={{ padding: "0px 10px 0 10px", ...props.style }}
      >
        <DisplayGrid
          container
          item
          xs={12}
          className={classes.container}
          style={{
            display: "flex",
            flex: 2,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <DisplayText variant="body2">
            <DisplayText>{timerTitle}</DisplayText>
          </DisplayText>
        </DisplayGrid>

        <DisplayGrid
          container
          item
          xs={12}
          className={classes.container}
          style={{
            display: "flex",
            flex: 4,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <DisplayText variant="h1">{"DDD : HH : MM : SS"}</DisplayText>
          <DisplayText variant="h5">{displayTimer(timerSeconds)}</DisplayText>
        </DisplayGrid>

        {!hideButtons && (
          <DisplayGrid
            container
            item
            xs={12}
            className={classes.container}
            style={{
              display: "flex",
              flex: 3,
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <DisplayButton
              disabled={
                mode !== "EDIT" || !disableOptions() || endDate ? true : false
              }
              startIcon={timerOn ? <TimerOff /> : <Timer />}
              variant="text"
              color="secondary"
              onClick={handleTimer}
            >
              {timerOn ? endLabel : startLabel}
            </DisplayButton>

            <DisplayButton
              disabled={mode === "EDIT" && startDate ? false : true}
              startIcon={<Cached />}
              variant="text"
              color="secondary"
              onClick={() => setDialog(true)}
            >
              {resetLabel}
            </DisplayButton>
          </DisplayGrid>
        )}
      </DisplayGrid>
      {dialog && (
        <DisplayDialog
          open={true}
          title={"Are you sure?"}
          message={"Once you reset,this action cannot be undone"}
          confirmLabel={"RESET"}
          onConfirm={() => {
            resetTimer();
            setDialog(false);
          }}
          onCancel={() => {
            setDialog(false);
          }}
        ></DisplayDialog>
      )}
    </div>
  );
};

SystemTimer.defaultProps = {
  endLabel: "End",
  startLabel: "Start",
  resetLabel: "Reset",
  MODE: "READ",
};

SystemTimer.propTypes = {
  endDate: PropTypes.string,
  endLabel: PropTypes.string.isRequired,
  onReset: PropTypes.func.isRequired,
  onStart: PropTypes.func.isRequired,
  onStop: PropTypes.func.isRequired,
  resetLabel: PropTypes.string.isRequired,
  startDate: PropTypes.string,
  startLabel: PropTypes.string.isRequired,
  timerTitle: PropTypes.string.isRequired,
};
