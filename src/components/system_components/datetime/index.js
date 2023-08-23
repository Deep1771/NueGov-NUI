import React, { useState, useEffect } from "react";
import { IconButton, InputAdornment } from "@material-ui/core";
import { isValid } from "date-fns";
import PropTypes from "prop-types";
import {
  DisplayDateTimePicker,
  DisplayHelperText,
  DisplayFormControl,
  DisplayText,
} from "components/display_components/";
import { GridWrapper } from "components/wrapper_components/grid_wrapper";
import { SystemLabel } from "components/system_components/";
import { SystemIcons } from "utils/icons";
import { globalProps } from "../global-props";
import { ToolTipWrapper } from "components/wrapper_components";

export const SystemDateTime = (props) => {
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
    minDate,
    name,
    placeHolder,
    required,
    title,
    type,
    hideCurrentDate = false,
    ...rest
  } = fieldmeta;

  const { appname, modulename, groupname } = stateParams;
  const [error, setError] = useState(false);
  const [errorText, setText] = useState("Invalid date");
  const [value, setValue] = useState(null);
  let minValue;
  if (minDate) {
    if (minDate === "current") minValue = data ? new Date(data) : new Date();
    else minValue = new Date(minDate);
  } else minValue = new Date("1900-01-01");

  const clearError = () => {
    callbackError(null, props);
    setError(false);
    setText();
  };

  const compareDate = (selectedDate, minDate) => {
    if (fieldmeta.minDate === "current") {
      minDate.setHours(0, 0, 0, 0);
      if (selectedDate.getTime() < minDate.getTime()) return true;
    }
    if (selectedDate.getTime() < minDate.getTime()) return true;
  };

  const handleCurrentDate = () => {
    setValue(new Date().toISOString());
    clearError();
  };

  const handleClear = () => {
    setValue(null);
    if (required) showError("Required");
    else clearError();
  };

  const onChange = (e) => {
    if (!e) {
      if (required) showError("Required");
      else clearError();
      setValue(null);
    } else {
      if (!isValid(e)) showError("Invalid date");
      else {
        if (minValue) {
          if (!compareDate(new Date(e), minValue)) {
            setValue(new Date(e).toISOString());
            clearError();
          } else {
            showError("Date is less than minimum date");
          }
        } else {
          setValue(new Date(e).toISOString());
          clearError();
        }
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
        <div style={{ display: "flex" }}>
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
          &nbsp;&nbsp;
          {error && (
            <DisplayHelperText icon={SystemIcons.Error}>
              ({errorText})
            </DisplayHelperText>
          )}
        </div>
        <div className="system-component">
          <DisplayDateTimePicker
            style={{ backgroundColor: "#fdfdfd", width: "100%" }}
            disabled={disable || !canUpdate}
            inputVariant="outlined"
            onChange={onChange}
            error={error}
            required={required}
            value={value}
            hiddenLabel={true}
            InputAdornmentProps={{ position: "start" }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {!hideCurrentDate && (
                    <IconButton size="small" disabled={disable || !canUpdate}>
                      <SystemIcons.Update onClick={handleCurrentDate} />
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    disabled={!value || disable || !canUpdate}
                  >
                    <SystemIcons.Close onClick={handleClear} />
                  </IconButton>
                </InputAdornment>
              ),
              ...globalProps.InputProps,
            }}
            inputProps={{ ...globalProps.inputProps }}
            placeholder={placeHolder}
            minDate={minValue}
            {...rest}
          />
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

SystemDateTime.propTypes = {
  data: PropTypes.string,
  fieldmeta: PropTypes.shape({
    disable: PropTypes.bool,
    info: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    placeHolder: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    colors: PropTypes.array,
    visibleOnCsv: PropTypes.bool,
  }),
};

export default GridWrapper(SystemDateTime);
