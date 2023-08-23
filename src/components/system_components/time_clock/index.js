import React, { useEffect, useMemo, useReducer, useState } from "react";
import { makeStyles } from "@material-ui/core";
import PropTypes from "prop-types";
import { reducer } from "./reducer";
import { styles } from "./styles";
import {
  DisplayFormControl,
  DisplayGrid,
  DisplayIcon,
  DisplayInput,
  DisplayReadMode,
  DisplayText,
} from "../../display_components/";
import { SystemLabel, SystemTimer } from "../index";
import { MapComponent } from "../map_component";
import { UsePosition } from "../latlong/UsePosition";
import { GridWrapper } from "components/wrapper_components/grid_wrapper";
import { SystemIcons } from "../../../utils/icons";
import { globalProps } from "../global-props";
import { ToolTipWrapper } from "components/wrapper_components";

const useStyles = makeStyles(styles);
const initValue = (data) => {
  return data;
};

export const SystemTimeClock = (props) => {
  const { callbackValue, data, formData, stateParams } = props;
  const { mode } = stateParams;
  let fieldmeta = {
    ...SystemTimeClock.defaultProps.fieldmeta,
    ...props.fieldmeta,
  };
  let { ...others } = fieldmeta;
  let {
    canUpdate,
    disable,
    displayOnCsv,
    info,
    name,
    required,
    title,
    type,
    visible,
    visibleOnCsv,
    ...rest
  } = others;

  const [state, dispatch] = useReducer(reducer, {}, initValue);
  const classes = useStyles();
  const { latitude, longitude } = UsePosition();
  const { LocationOn } = SystemIcons;

  const [addressComponent, setAddressComponent] = useState();
  const [currentPosition, setCurrentPosition] = useState({});
  const [markerData, setMarkerData] = useState([]);
  const [mounted, setMounted] = useState(false);

  let setUpStartTime =
    formData?.sys_entityAttributes &&
    formData?.sys_entityAttributes?.startSetUp &&
    formData?.sys_entityAttributes?.startSetUp?.clockInDateTime
      ? formData.sys_entityAttributes?.startSetUp?.clockInDateTime
      : undefined;
  let setUpEndTime =
    formData?.sys_entityAttributes &&
    formData?.sys_entityAttributes?.startSetUp &&
    formData?.sys_entityAttributes?.startSetUp?.clockOutDateTime
      ? formData?.sys_entityAttributes?.startSetUp?.clockOutDateTime
      : undefined;
  let geocoder = new window.google.maps.Geocoder();

  //custom functions
  const clockIn = (date) => {
    let currentPosition = { lat: latitude, lng: longitude };
    geocoder.geocode({ location: currentPosition }, function (results, status) {
      if (status === "OK") {
        if (results[0]) {
          dispatch({
            type: "SET_CLOCKIN_ADDRESS",
            payload: results[0].formatted_address,
          });
        } else console.log("No address found");
      } else console.log("Geocoder failed due to", status);
    });
    dispatch({ type: "SET_CLOCKIN_LATLONG", payload: currentPosition });
    dispatch({ type: "SET_CLOCKIN_TIME", payload: date });
  };

  const clockInDescriptionHandler = (value) =>
    dispatch({ type: "SET_CLOCKIN_DESCRIPTION", payload: value });

  const clockOut = (date) => {
    let currentPosition = { lat: latitude, lng: longitude };
    geocoder.geocode({ location: currentPosition }, function (results, status) {
      if (status === "OK") {
        if (results[0]) {
          dispatch({
            type: "SET_CLOCKOUT_ADDRESS",
            payload: results[0].formatted_address,
          });
        } else console.log("No address found");
      } else console.log("Geocoder failed due to", status);
    });

    dispatch({ type: "SET_CLOCKOUT_LATLONG", payload: currentPosition });

    let time_duration = computeTimeDuration(state.clockInDateTime, date);

    dispatch({ type: "SET_CLOCKOUT_TIME", payload: date });
    dispatch({ type: "SET_TIME_DURATION", payload: time_duration });

    if (fieldmeta.hasOwnProperty("startField") && setUpStartTime) {
      let startTimeInSeconds = Math.floor(
        new Date(setUpStartTime).getTime() / 1000
      );
      let endTimeInSeconds = Math.floor(new Date(date).getTime() / 1000);
      let totalSeconds = endTimeInSeconds - startTimeInSeconds;
      dispatch({ type: "SET_TOTAL_TIME_DIFFERENCE", payload: totalSeconds });
    }
  };

  const clockOutDescriptionHandler = (value) =>
    dispatch({ type: "SET_CLOCKOUT_DESCRIPTION", payload: value });

  const computeTimeDuration = (start, end) => {
    return (
      Math.floor(new Date(end).getTime() / 1000) -
      Math.floor(new Date(start).getTime() / 1000)
    );
  };

  const dataInit = (data) => {
    dispatch({ type: "SET_DATA", payload: data ? data : {} });
    if (data && data.totalTimeDifference) {
      getTotalDuration(data.totalTimeDifference);
    }
    callbackValue(data ? data : null, props);
  };

  const displayDate = (date) => {
    let monthInWords = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    let current_time = new Date(date),
      day =
        current_time.getDate() < 10
          ? "0" + current_time.getDate()
          : current_time.getDate(),
      month = monthInWords[current_time.getMonth()],
      year = current_time.getFullYear(),
      hours =
        current_time.getHours() > 12
          ? current_time.getHours() - 12
          : current_time.getHours(),
      meridian = current_time.getHours() >= 12 ? "P.M." : "A.M.",
      minutes =
        current_time.getMinutes() < 10
          ? "0" + current_time.getMinutes()
          : current_time.getMinutes(),
      seconds =
        current_time.getSeconds() < 10
          ? "0" + current_time.getSeconds()
          : current_time.getSeconds();
    if (date)
      return `${month} ${day}, ${year} ${hours}:${minutes}:${seconds} ${meridian}`;
  };

  const enableTearDown = () => {
    if (!fieldmeta.hasOwnProperty("startField") && canUpdate && !disable) {
      return true;
    } else
      return !!(
        fieldmeta.hasOwnProperty("startField") &&
        setUpStartTime &&
        setUpEndTime &&
        canUpdate &&
        !disable
      );
  };

  const getTotalDuration = (totalSeconds) => {
    let minutes = Math.floor(totalSeconds / 60);
    totalSeconds -= minutes * 60;
    let hours = Math.floor(minutes / 60);
    minutes -= hours * 60;
    let days = Math.floor(hours / 24);
    hours -= days * 24;
    return `${
      days > 99 ? days + "d" : days > 9 ? "0" + days + "d" : "00" + days + "d"
    } : 
        ${hours < 10 ? "0" + hours + "h" : hours + "h"} :
        ${minutes < 10 ? "0" + minutes + "m" : minutes + "m"} : 
        ${
          Math.floor(totalSeconds) < 10
            ? "0" + Math.floor(totalSeconds) + "s"
            : Math.floor(totalSeconds) + "s"
        }
        `;
  };

  const reset = () => {
    setMarkerData([]);
    dispatch({ type: "RESET" });
  };

  useEffect(() => {
    dataInit(data);
    setMounted(true);
  }, []);

  useEffect(() => {
    mounted && dataInit(data);
  }, [data]);

  useEffect(() => {
    setTimeout(() => {
      callbackValue(Object.keys(state).length ? state : null, props);
    }, 200);
  }, [state]);

  useEffect(() => {
    if (state.clockInLocation) {
      setMarkerData([
        {
          position: state.clockInLocation,
          title: "start Point",
          draggable: false,
          color: "green",
        },
      ]);
    }
  }, [state.clockInLocation]);

  useEffect(() => {
    let clockInLoc = {
      position: state.clockInLocation,
      title: "start Point",
      draggable: false,
      color: "green",
    };
    if (state.clockOutLocation) {
      setMarkerData([
        clockInLoc,
        {
          position: state.clockOutLocation,
          title: "end Point",
          draggable: false,
          color: "red",
        },
      ]);
    }
  }, [state.clockOutLocation]);

  return useMemo(
    () => (
      <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
        <DisplayFormControl
          disabled={mode === "READ" || "NEW" || !canUpdate || disable}
        >
          {title && (
            <div className="system-label">
              <SystemLabel
                toolTipMsg={info}
                disabled={mode === "READ" || "NEW" || !canUpdate || disable}
                filled={Object.keys(state).length}
                required={required}
              >
                {title}
              </SystemLabel>
            </div>
          )}
          <div className="system-components">
            <div style={{ display: "flex", flex: 11 }}>
              <DisplayGrid container direction="row">
                <DisplayGrid container item xs={12} sm={12} md={12}>
                  <DisplayGrid
                    container
                    item
                    xs={12}
                    sm={12}
                    md={12}
                    lg={6}
                    alignItems="flex-start"
                    justify="space-around"
                    className={classes.container}
                    wrap="wrap"
                  >
                    <DisplayGrid
                      container
                      style={{
                        display: "flex",
                        flex: 1,
                        flexDirection: "column",
                      }}
                    >
                      <DisplayGrid
                        container
                        item
                        xs={12}
                        style={{
                          display: "flex",
                          flex: 4,
                          flexDirection: "row",
                        }}
                      >
                        {mode === "READ" ? (
                          <DisplayReadMode
                            fieldmeta={{
                              title: fieldmeta.clockIn.descriptionLabel,
                            }}
                            data={
                              state.clockInDescription
                                ? state.clockInDescription
                                : ""
                            }
                          />
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              flex: 1,
                              flexDirection: "column",
                            }}
                          >
                            <DisplayFormControl
                              disabled={
                                mode === "NEW" || state.clockInDateTime
                                  ? true
                                  : false
                              }
                            >
                              <DisplayText
                                style={{
                                  color: "#5F6368",
                                  fontWeight: "400",
                                  fontSize: "12px",
                                  paddingBottom: "4px",
                                }}
                              >
                                {fieldmeta.clockIn.descriptionLabel}
                              </DisplayText>
                              <DisplayInput
                                disabled={
                                  mode === "NEW" ||
                                  !enableTearDown() ||
                                  state.clockInDateTime
                                    ? true
                                    : false
                                }
                                hiddenLabel={true}
                                fullWidth={true}
                                multiline={true}
                                placeholder={fieldmeta.clockIn.placeHolder}
                                rowsMax={4}
                                onChange={clockInDescriptionHandler}
                                value={
                                  state.clockInDescription
                                    ? state.clockInDescription
                                    : " "
                                }
                                {...globalProps}
                              />
                            </DisplayFormControl>
                            <ToolTipWrapper
                              title={
                                fieldmeta?.description?.length > 57
                                  ? fieldmeta?.description
                                  : ""
                              }
                              placement="bottom-start"
                            >
                              <div
                                style={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "pre",
                                  maxWidth: "20vw",
                                  fontSize: "11px",
                                  opacity: "0.65",
                                  height: "16px",
                                }}
                              >
                                <DisplayText
                                  style={{
                                    fontSize: "11px",
                                  }}
                                >
                                  {fieldmeta?.description}
                                </DisplayText>
                              </div>
                            </ToolTipWrapper>
                          </div>
                        )}
                      </DisplayGrid>
                      <DisplayGrid
                        container
                        item
                        xs={12}
                        className={classes.displayDate}
                        style={{
                          display: "flex",
                          flex: 2,
                          flexDirection: "row",
                        }}
                      >
                        <DisplayGrid
                          container
                          item
                          xs={3}
                          className={classes.label}
                        >
                          <DisplayText variant="subtitle2">
                            {fieldmeta.clockIn.dateTimeLabel}
                          </DisplayText>
                        </DisplayGrid>
                        <DisplayGrid
                          container
                          item
                          xs={9}
                          className={classes.label}
                        >
                          <DisplayText variant="body2">
                            {displayDate(state.clockInDateTime)}
                          </DisplayText>
                        </DisplayGrid>
                      </DisplayGrid>

                      <DisplayGrid
                        container
                        item
                        xs={12}
                        className={classes.displayAddress}
                        style={{
                          display: "flex",
                          flex: 6,
                          flexDirection: "row",
                        }}
                      >
                        <DisplayGrid
                          container
                          item
                          xs={3}
                          className={classes.label}
                        >
                          <DisplayIcon name={LocationOn} />
                        </DisplayGrid>
                        <DisplayGrid
                          container
                          item
                          xs={9}
                          className={classes.label}
                        >
                          <DisplayText variant="body2">
                            {state.clockInAddress}
                          </DisplayText>
                        </DisplayGrid>
                      </DisplayGrid>
                    </DisplayGrid>
                  </DisplayGrid>

                  <DisplayGrid
                    container
                    item
                    xs={12}
                    sm={12}
                    md={12}
                    lg={6}
                    className={classes.container}
                    alignItems="flex-start"
                    justify="space-around"
                    wrap="wrap"
                  >
                    <DisplayGrid
                      container
                      style={{
                        display: "flex",
                        flex: 1,
                        flexDirection: "column",
                      }}
                    >
                      <DisplayGrid
                        container
                        item
                        xs={12}
                        style={{
                          display: "flex",
                          flex: 4,
                          flexDirection: "row",
                        }}
                      >
                        {mode === "READ" ? (
                          <DisplayReadMode
                            fieldmeta={{
                              title: fieldmeta.clockOut.descriptionLabel,
                            }}
                            data={state.clockOutDescription}
                          />
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              flex: 1,
                              flexDirection: "column",
                            }}
                          >
                            <DisplayFormControl
                              disabled={
                                mode === "NEW" ||
                                !state.clockInDateTime ||
                                state.clockOutDateTime
                                  ? true
                                  : false
                              }
                            >
                              <DisplayText
                                style={{
                                  color: "#666666",
                                  fontWeight: "400",
                                  fontSize: "12px",
                                  paddingBottom: "4px",
                                }}
                              >
                                {fieldmeta.clockOut.descriptionLabel}
                              </DisplayText>
                              <DisplayInput
                                disabled={
                                  mode === "NEW" ||
                                  !enableTearDown() ||
                                  !state.clockInDateTime ||
                                  state.clockOutDateTime
                                    ? true
                                    : false
                                }
                                hiddenLabel={true}
                                placeholder={fieldmeta.clockIn.placeHolder}
                                multiline={true}
                                fullWidth={true}
                                rowsMax={4}
                                onChange={clockOutDescriptionHandler}
                                value={
                                  state.clockOutDescription
                                    ? state.clockOutDescription
                                    : " "
                                }
                                {...globalProps}
                              />
                            </DisplayFormControl>
                          </div>
                        )}
                      </DisplayGrid>
                      <DisplayGrid
                        container
                        item
                        xs={12}
                        className={classes.displayDate}
                        style={{
                          display: "flex",
                          flex: 2,
                          flexDirection: "row",
                        }}
                      >
                        <DisplayGrid
                          container
                          item
                          xs={3}
                          className={classes.label}
                        >
                          <DisplayText variant="subtitle2">
                            {fieldmeta.clockOut.dateTimeLabel}
                          </DisplayText>
                        </DisplayGrid>
                        <DisplayGrid
                          container
                          item
                          xs={9}
                          className={classes.label}
                        >
                          <DisplayText variant="body2">
                            {displayDate(state.clockOutDateTime)}
                          </DisplayText>
                        </DisplayGrid>
                      </DisplayGrid>

                      <DisplayGrid
                        container
                        item
                        xs={12}
                        className={classes.displayAddress}
                        style={{
                          display: "flex",
                          flex: 6,
                          flexDirection: "row",
                        }}
                      >
                        <DisplayGrid
                          container
                          item
                          xs={3}
                          className={classes.label}
                        >
                          <DisplayIcon name={LocationOn} />
                        </DisplayGrid>
                        <DisplayGrid
                          container
                          item
                          xs={9}
                          className={classes.label}
                        >
                          <DisplayText variant="body2">
                            {state.clockOutAddress}
                          </DisplayText>
                        </DisplayGrid>
                      </DisplayGrid>
                    </DisplayGrid>
                  </DisplayGrid>
                </DisplayGrid>

                <DisplayGrid item xs={12} sm={12} md={12}>
                  <DisplayGrid container style={{ height: "100%" }}>
                    <DisplayGrid item xs={12} sm={12} md={12} lg={6}>
                      <DisplayGrid container className={classes.timerContainer}>
                        <DisplayGrid item xs={12}>
                          <div className={classes.border}>
                            <MapComponent
                              marker={markerData}
                              setAddressComponent={setAddressComponent}
                              setCurrentPosition={setCurrentPosition}
                            />
                          </div>
                        </DisplayGrid>
                      </DisplayGrid>
                    </DisplayGrid>

                    <DisplayGrid item xs={12} sm={12} md={12} lg={6}>
                      <DisplayGrid
                        container
                        className={classes.timerContainer}
                        justify="center"
                        direction="row"
                      >
                        <SystemTimer
                          endDate={state.clockOutDateTime}
                          endLabel={fieldmeta.clockOut.buttonLabel}
                          onReset={reset}
                          onStart={clockIn}
                          onStop={clockOut}
                          resetLabel="Reset"
                          startDate={state.clockInDateTime}
                          startLabel={fieldmeta.clockIn.buttonLabel}
                          timerTitle={fieldmeta.timerTitle}
                          mode={mode}
                          disableOptions={enableTearDown}
                        />
                      </DisplayGrid>
                    </DisplayGrid>
                  </DisplayGrid>
                </DisplayGrid>
              </DisplayGrid>
            </div>
            {fieldmeta.hasOwnProperty("startField") &&
              setUpStartTime &&
              state.clockOutDateTime && (
                <div style={{ display: "flex", flex: 1 }}>
                  <DisplayGrid container item xs={12} justify="center">
                    <DisplayGrid
                      container
                      item
                      xs={6}
                      sm={6}
                      md={6}
                      lg={6}
                      justify="flex-end"
                      style={{ padding: 10 }}
                    >
                      <DisplayText variant="h6">
                        {" "}
                        {fieldmeta.finalTimerTitle}{" "}
                      </DisplayText>
                    </DisplayGrid>
                    <DisplayGrid
                      container
                      item
                      xs={6}
                      sm={6}
                      md={6}
                      lg={6}
                      justify="flex-start"
                      style={{ padding: 10 }}
                    >
                      <DisplayText variant="h6">
                        {" "}
                        {getTotalDuration(state.totalTimeDifference)}
                      </DisplayText>
                    </DisplayGrid>
                  </DisplayGrid>
                </div>
              )}
          </div>
        </DisplayFormControl>
      </div>
    ),
    [
      data,
      state,
      setUpStartTime,
      setUpEndTime,
      mode,
      latitude,
      longitude,
      markerData,
    ]
  );
};

SystemTimeClock.defaultProps = {
  fieldmeta: {
    displayOnCsv: true,
    visible: true,
    visibleOnCsv: true,
    required: false,
  },
};

SystemTimeClock.propTypes = {
  data: PropTypes.object,
  fieldmeta: PropTypes.shape({
    clockIn: PropTypes.shape({
      buttonLabel: PropTypes.string.isRequired,
      descriptionLabel: PropTypes.string.isRequired,
      dateTimeLabel: PropTypes.string.isRequired,
    }),
    clockOut: PropTypes.shape({
      buttonLabel: PropTypes.string.isRequired,
      descriptionLabel: PropTypes.string.isRequired,
      dateTimeLabel: PropTypes.string.isRequired,
    }),
    info: PropTypes.string.isRequired,
    mapType: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    timerTitle: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    visible: PropTypes.bool,
    visibleOnCsv: PropTypes.bool,
  }),
};

export default GridWrapper(SystemTimeClock);
