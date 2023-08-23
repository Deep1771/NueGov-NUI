import React, { useState, useEffect } from "react";
import { IconButton, InputAdornment } from "@material-ui/core";
import { isValid } from "date-fns";
import PropTypes from "prop-types";
import {
  DisplayTime,
  DisplayHelperText,
  DisplayFormControl,
  DisplayText,
} from "components/display_components/";
import { GridWrapper } from "components/wrapper_components/grid_wrapper";
import { SystemLabel } from "components/system_components/";
import { SystemIcons } from "utils/icons";
import { ToolTipWrapper } from "components/wrapper_components";

export const SystemTime = (props) => {
  const {
    callbackError,
    callbackValue,
    data,
    fieldError,
    fieldmeta,
    stateParams,
  } = props;
  const {
    canUpdate,
    defaultValue,
    disable,
    name,
    placeHolder,
    required,
    title,
    type,
    minutesStep,
    skipReadMode,
    ...rest
  } = fieldmeta;
  const isReadMode =
    stateParams?.mode?.toLowerCase() == "read" && !skipReadMode;

  const [error, setError] = useState(false);
  const [errorText, setText] = useState("Invalid Time");
  const [value, setValue] = useState(null);

  const clearError = () => {
    callbackError(null, props);
    setError(false);
    setText();
  };

  const handleClear = () => {
    setValue(null);
    if (required) showError("Required");
    else clearError();
  };

  const convertTime = (e) => {
    let dateSplitString = e.toISOString().split("T");
    let currentDate = new Date();
    let schedule = `${currentDate.getFullYear()}-${(
      "0" +
      (currentDate.getMonth() + 1)
    ).slice(-2)}-${("0" + currentDate.getDate()).slice(-2)}T${
      dateSplitString[1]
    }`;
    return schedule;
  };

  const onChange = (e) => {
    if (!e) {
      if (required) showError("Required");
      else clearError();
      setValue(null);
    } else {
      if (!isValid(e)) showError("Invalid Time");
      else {
        let timeConvertedForToday = convertTime(e);
        setValue(timeConvertedForToday);
        clearError();
      }
    }
  };

  const showError = (msg) => {
    if (canUpdate && !disable) {
      callbackError(msg, props);
      setError(true);
      setText(msg);
    }
  };

  // UseEffects
  useEffect(() => {
    if (!data) {
      if (defaultValue) setValue(new Date());
      else if (required) showError("Required");
    }
    if (fieldError) showError(fieldError);
  }, []);

  useEffect(() => {
    if (data) setValue(data);
    if (!data && !defaultValue) required ? showError("Required") : clearError();
    else clearError();
  }, [data, name]);

  useEffect(() => {
    callbackValue(value ? value : null, props);
  }, [value]);

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        width: "100%",
      }}
    >
      <DisplayFormControl required={required} error={error}>
        <div className="system-components">
          <DisplayText
            style={{
              color: "#5F6368",
              fontWeight: "400",
              fontSize: "12px",
              paddingBottom: "4px",
            }}
          >
            {title}
          </DisplayText>
          <DisplayTime
            onChange={onChange}
            value={value}
            // label={title}
            disabled={disable || !canUpdate || isReadMode}
            minutesStep={minutesStep}
            error={error}
            required={required}
            InputAdornmentProps={{ position: "start" }}
            inputVariant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    testId={"clear" + "-" + fieldmeta.name}
                    disabled={!value || disable || !canUpdate || isReadMode}
                  >
                    <SystemIcons.Close
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClear();
                      }}
                    />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            {...rest}
          />
        </div>
        <div className="system-helpertext">
          {error && (
            <DisplayHelperText icon={SystemIcons.Error}>
              {errorText}
            </DisplayHelperText>
          )}
        </div>
        <ToolTipWrapper
          title={
            fieldmeta?.description?.length > 57 ? fieldmeta?.description : ""
          }
          placement="bottom-start"
        >
          <div
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "pre",
              maxWidth: "100%",
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
      </DisplayFormControl>
    </div>
  );
};

SystemTime.propTypes = {
  Data: PropTypes.string,
  fieldmeta: PropTypes.shape({
    disable: PropTypes.bool,
    info: PropTypes.string.isRequired,
    required: PropTypes.bool,
    name: PropTypes.string.isRequired,
    placeHolder: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    colors: PropTypes.array,
  }),
};

export default GridWrapper(SystemTime);
