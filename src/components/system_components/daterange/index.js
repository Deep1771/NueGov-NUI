import React, { useState, useEffect } from "react";
import { IconButton, InputAdornment } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import { addDays, isValid } from "date-fns";
import {
  DisplayDatePicker,
  DisplayDateTimePicker,
  DisplayFormControl,
  DisplayHelperText,
  DisplayText,
} from "components/display_components/";
import { GridWrapper } from "components/wrapper_components/grid_wrapper";
import { SystemLabel, SystemTimer } from "components/system_components/";
import { SystemIcons } from "utils/icons";
import { globalProps } from "../global-props";
import { ToolTipWrapper } from "components/wrapper_components";

const useStyles = makeStyles({
  root: {
    display: "flex",
    justifyContent: "space-between",
    width: "550px",
  },
});
export const SystemDaterange = (props) => {
  const { callbackError, callbackValue, data, fieldmeta, fieldError } = props;
  const {
    canUpdate,
    defaultValue,
    disable,
    endPlaceHolder,
    endTitle,
    minDate,
    name,
    required,
    setTime,
    showTimer,
    timerTitle,
    hideButtons,
    startPlaceHolder,
    startTitle,
    title,
    ...rest
  } = fieldmeta;

  const classes = useStyles(props);

  const [endError, setEndError] = useState(false);
  const [error, setError] = useState();
  const [errorText, setText] = useState("Invalid date");
  const [helperText, setHelperText] = useState();
  const [startError, setStartError] = useState(false);
  const [value, setValue] = useState({});
  let minValue;
  if (minDate) {
    if (minDate === "current")
      minValue = data ? new Date(data.startDate) : new Date();
    else minValue = new Date(minDate);
  } else minValue = new Date("1900-01-01");

  const checkEmpty = (obj) => {
    if (obj) return Object.values(obj).every((e) => e === null || e === "");
    else return true;
  };

  const clearError = () => {
    callbackError(null, props);
    setError(false);
    setHelperText();
  };

  const compareDate = (selectedDate, minDate, type) => {
    if (fieldmeta.minDate === "current") {
      type === "start" && minDate.setHours(0, 0, 0, 0);
      if (selectedDate.getTime() < minDate.getTime()) return true;
    }
    if (selectedDate.getTime() < minDate.getTime()) return true;
    if (!setTime && selectedDate.getTime() <= minDate.getTime()) return true;
  };

  const handleClear = (type) => {
    if (type === "start") {
      setValue("");
      if (required) {
        showError("Required");
        setStartError(true);
        setEndError(false);
      }
    } else {
      setValue((prevValue, props) => {
        return {
          ...prevValue,
          endDate: null,
        };
      });
      required ? setEndError(true) : setEndError(false);
    }
  };
  const handleStartDate = () => {
    setValue({
      startDate: new Date().toISOString(),
      endDate: null,
    });
  };

  const handleEndDate = () => {
    setValue({
      endDate: new Date().toISOString(),
      startDate: value.startDate,
    });
  };

  const showError = (msg) => {
    if (canUpdate && !disable) {
      callbackError(msg, props);
      setError(true);
      setHelperText(msg);
    }
  };

  // Custom Functions
  const onChange = (e, value, type) => {
    //If there is no mindate value in metadata definition disable from the current date
    if (!e) {
      if (required) {
        if (type === "start") {
          setStartError(true);
          setEndError(false);
        } else setEndError(true);
        setText("Required");
      } else {
        type === "start" ? setStartError(false) : setEndError(false);
        //type === 'start' && setValue({ startDate: null, endDate: null })
      }
    } else {
      if (!isValid(e)) {
        if (type === "start") {
          setStartError(true);
          setEndError(false);
          showError("Invalid start date");
          setValue({
            startDate: "",
          });
        } else {
          setValue({});
          setEndError(true);
          showError("Invalid end date");
        }
      } else {
        if (type === "start") {
          if (minValue) {
            if (!compareDate(new Date(e), minValue, type)) {
              setValue({
                startDate: new Date(e).toISOString(),
                endDate: null,
              });
              setStartError(false);
              required ? setEndError(true) : setEndError(false);
              required && setText("Field is required");
            } else {
              setStartError(true);
              setEndError(false);
              setText("Date is less than minDate");
            }
          } else {
            setValue({
              startDate: new Date(e).toISOString(),
              endDate: null,
            });
            setStartError(false);
            required ? setEndError(true) : setEndError(false);
            required && setText("Required");
          }
        } else {
          if (!compareDate(new Date(e), new Date(value.startDate), type)) {
            setValue((prevValue, props) => {
              return {
                ...prevValue,
                endDate: new Date(e).toISOString(),
              };
            });
            setEndError(false);
          } else {
            setValue((prevValue, props) => {
              return {
                ...prevValue,
                endDate: new Date(e).toISOString(),
              };
            });
            setEndError(true);
            setText("End date is less than Start date");
          }
        }
      }
    }
  };

  // USeEffects
  useEffect(() => {
    if (!data) {
      if (defaultValue && setTime) {
        setValue({
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
        });
      } else if (defaultValue) {
        setValue({
          startDate: new Date().toISOString(),
          endDate: addDays(new Date(), 1),
        });
      } else {
        if (required) {
          setStartError(true);
          setText("Required");
          showError("Required");
        }
      }
    }
  }, []);

  useEffect(() => {
    if (fieldError) showError(fieldError);
  }, [fieldError]);

  useEffect(() => {
    if (data && !checkEmpty(data)) setValue(data);
    else setValue(null);

    if (required) {
      if (!data && checkEmpty(data)) {
        setStartError(true);
        setText("Required");
      } else {
        if (checkEmpty(data)) {
          setStartError(true);
          setText("Required");
        } else setStartError(false);
      }
      if (!data && required) {
        showError("Required");
      }
    } else {
      setStartError(false);
      setEndError(false);
    }
  }, [data, name]);

  useEffect(() => {
    if (!startError && !endError) callbackError(null, props);
    else callbackError(errorText, props);
  }, [startError, endError]);

  useEffect(() => {
    callbackValue(value ? value : null, props);
    if (value && Object.keys(value).length) {
      if (Object.values(value).every((e) => e !== null)) clearError();
      else if (required) showError("Required");
    }
  }, [value]);

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "row",
        flexWrap: "inherit",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: "inherit",
          flex: 8,
        }}
      >
        {/* {title && (
          <div className="system-label" style={{ display: "flex", flex: 1 }}>
            <SystemLabel toolTipMsg={rest.info} filled={title}>
              {title}
            </SystemLabel>
          </div>
        )}
        {title && <br />} */}
        {!setTime ? (
          <div className="system-components" style={{ display: "flex" }}>
            <div style={{ display: "flex", flex: 6, flexDirection: "column" }}>
              <div style={{ display: "flex" }}>
                <DisplayText
                  style={{
                    color: "#5F6368",
                    fontWeight: "400",
                    fontSize: "12px",
                    paddingBottom: "4px",
                  }}
                >
                  {startTitle}
                </DisplayText>
                &nbsp;&nbsp;
                {error && (
                  <DisplayHelperText icon={SystemIcons.Error}>
                    ({helperText})
                  </DisplayHelperText>
                )}
              </div>
              <DisplayDatePicker
                hiddenLabel={true}
                placeholder={startPlaceHolder}
                onChange={(e) => onChange(e, value, "start")}
                disabled={disable || !canUpdate}
                value={value && value.startDate ? value.startDate : null}
                error={startError ? true : false}
                minDate={minValue}
                //helperText={startError ? errorText : ''}
                InputAdornmentProps={{ position: "start" }}
                inputVariant="outlined"
                inputProps={{ ...globalProps.inputProps }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        disabled={
                          value && Object.keys(value).length ? false : true
                        }
                      >
                        <SystemIcons.Close
                          onClick={(e) => handleClear("start")}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                  readOnly: true,
                  ...globalProps.InputProps,
                }}
                {...rest}
              />
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
            </div>{" "}
            &nbsp;
            <div
              style={{
                display: "flex",
                flexShrink: 1,
                alignItems: "flex-end",
                justifyContent: "center",
                paddingBottom: "10px",
              }}
            >
              <SystemIcons.ArrowForward />
            </div>
            &nbsp;
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex" }}>
                <DisplayText
                  style={{
                    color: "#5F6368",
                    fontWeight: "400",
                    fontSize: "12px",
                    paddingBottom: "4px",
                  }}
                >
                  {endTitle}
                </DisplayText>
                &nbsp;&nbsp;
                {error && (
                  <DisplayHelperText icon={SystemIcons.Error}>
                    ({helperText})
                  </DisplayHelperText>
                )}
              </div>
              <DisplayDatePicker
                // label={endTitle}
                hiddenLabel={true}
                placeholder={endPlaceHolder}
                onChange={(e) => onChange(e, value, "end")}
                value={value && value.endDate ? value.endDate : null}
                error={endError ? true : false}
                disabled={
                  disable || !canUpdate
                    ? disable
                    : value && value.startDate && !startError
                    ? false
                    : true
                }
                //helperText={endError ? errorText : ''}
                inputVariant="filled"
                InputAdornmentProps={{ position: "start" }}
                inputProps={{ ...globalProps.inputProps }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        disabled={value && value.endDate ? false : true}
                      >
                        <SystemIcons.Close
                          onClick={(e) => handleClear("end")}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                  readOnly: true,
                  ...globalProps.InputProps,
                }}
                minDate={value ? addDays(new Date(value.startDate), 1) : ""}
                {...rest}
              />
            </div>
          </div>
        ) : (
          <div className="system-component" style={{ display: "flex" }}>
            <div
              style={{ display: "flex", flexDirection: "column", width: "47%" }}
            >
              <div style={{ display: "flex" }}>
                <DisplayText
                  style={{
                    color: "#5F6368",
                    fontWeight: "400",
                    fontSize: "12px",
                    paddingBottom: "4px",
                  }}
                >
                  {startTitle}
                </DisplayText>
                &nbsp;&nbsp;
                {error && (
                  <DisplayHelperText icon={SystemIcons.Error}>
                    ({helperText})
                  </DisplayHelperText>
                )}
              </div>
              <DisplayDateTimePicker
                // label={startTitle}
                hiddenLabel={true}
                onChange={(e) => onChange(e, value, "start")}
                value={value && value.startDate ? value.startDate : null}
                disabled={disable || !canUpdate}
                error={startError ? true : false}
                InputAdornmentProps={{ position: "start" }}
                inputVariant="filled"
                inputProps={{ ...globalProps.inputProps }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" disabled={disable || !canUpdate}>
                        <SystemIcons.Update onClick={handleStartDate} />
                      </IconButton>
                      <IconButton
                        size="small"
                        disabled={
                          value && Object.keys(value).length ? false : true
                        }
                      >
                        <SystemIcons.Close
                          onClick={(e) => handleClear("start")}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                  readOnly: true,
                  ...globalProps.InputProps,
                }}
                //helperText={startError ? errorText : ''}
                minDate={minValue}
                {...rest}
              />
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
            &nbsp;
            <div
              style={{
                display: "flex",
                flexShrink: 1,
                alignItems: "flex-end",
                justifyContent: "center",
                paddingBottom: "10px",
              }}
            >
              <SystemIcons.ArrowForward />
            </div>
            &nbsp;
            <div
              style={{ display: "flex", flexDirection: "column", width: "47%" }}
            >
              <div style={{ display: "flex" }}>
                <DisplayText
                  style={{
                    color: "#5F6368",
                    fontWeight: "400",
                    fontSize: "12px",
                    paddingBottom: "4px",
                  }}
                >
                  {endTitle}
                </DisplayText>
                &nbsp;&nbsp;
                {error && (
                  <DisplayHelperText icon={SystemIcons.Error}>
                    ({helperText})
                  </DisplayHelperText>
                )}
              </div>
              <DisplayDateTimePicker
                // label={endTitle}
                hiddenLabel={true}
                onChange={(e) => onChange(e, value, "end")}
                value={value && value.endDate ? value.endDate : null}
                error={endError ? true : false}
                disabled={
                  disable || !canUpdate
                    ? true
                    : value && value.startDate && !startError
                    ? false
                    : true
                }
                //helperText={endError ? errorText : ''}
                InputAdornmentProps={{ position: "start" }}
                inputVariant="filled"
                inputProps={{ ...globalProps.inputProps }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" disabled={disable || !canUpdate}>
                        <SystemIcons.Update onClick={handleEndDate} />
                      </IconButton>
                      <IconButton
                        size="small"
                        disabled={value && value.endDate ? false : true}
                      >
                        <SystemIcons.Close
                          onClick={(e) => handleClear("end")}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                  readOnly: true,
                  ...globalProps.InputProps,
                }}
                minDate={value ? new Date(value.startDate) : ""}
                {...rest}
              />
            </div>
          </div>
        )}
      </div>

      {showTimer ? (
        <div
          style={{
            display: "flex",
            flex: 4,
            flexDirection: "column",
          }}
        >
          <SystemTimer
            timerTitle={fieldmeta.timerTitle}
            hideButtons={fieldmeta.hideButtons}
            startDate={value ? value.startDate : null}
            endDate={value ? value.endDate : null}
          />
        </div>
      ) : null}
    </div>
  );
};
SystemDaterange.propTypes = {
  Data: PropTypes.string,
  fieldmeta: PropTypes.shape({
    info: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    visibleOnCsv: PropTypes.bool,
  }),
};

export default GridWrapper(SystemDaterange);
