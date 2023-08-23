import React, { useState, useEffect, startTransition } from "react";
import { IconButton, InputAdornment } from "@material-ui/core";
import { isValid } from "date-fns";
import PropTypes from "prop-types";
import {
  DisplayDatePicker,
  DisplayFormControl,
  DisplayHelperText,
  DisplayText,
} from "components/display_components/";
import { SystemLabel } from "components/system_components/";
import { GridWrapper } from "components/wrapper_components/grid_wrapper";
import { SystemIcons } from "utils/icons";
import { globalProps } from "../global-props";
import { ToolTipWrapper } from "components/wrapper_components";
import { performOperation } from "utils/helper_functions";

export const SystemDate = (props) => {
  const {
    callbackValue,
    callbackError,
    data,
    fieldError,
    fieldmeta,
    stateParams,
    testid,
    formData,
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
    inputFrom,
    ...rest
  } = fieldmeta;
  const {
    name: inputFromName = "",
    fieldToCalc = "",
    operation,
  } = inputFrom || {};
  const { appname, modulename, groupname } = stateParams;
  const [error, setError] = useState(false);
  const [errorText, setText] = useState("Invalid Date");
  const [value, setValue] = useState(null);
  let minValue;
  if (minDate) {
    if (minDate === "current") minValue = data ? new Date(data) : new Date();
    else minValue = new Date(minDate);
  } else minValue = new Date("1900-01-01");

  //Setters
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

  const compareDate = (selectedDate, minDate) => {
    if (fieldmeta.minDate === "current") {
      minDate.setHours(0, 0, 0, 0);
      if (selectedDate.getTime() < minDate.getTime()) return true;
    }
    if (selectedDate.getTime() < minDate.getTime()) return true;
  };

  const showError = (msg) => {
    if (canUpdate && !disable) {
      // callbackError(msg, props);
      setError(true);
      setText(msg);
    }
  };
  // Custom Functions

  const handleCurrentDate = () => {
    setValue(new Date().toISOString());
    clearError();
  };

  let handleOnBlur = () => {
    callbackError(errorText, props);
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
          } else showError("Date is less than minimum date");
        } else {
          setValue(new Date(e).toISOString());
          clearError();
        }
      }
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
    return () => {
      setValue(null);
    };
  }, [data, name]);

  useEffect(() => {
    callbackValue(value ? value : null, props);
  }, [value]);

  useEffect(() => {
    if (inputFrom && Object.keys(inputFrom).length > 0) {
      setValue(
        performOperation(formData, operation, fieldToCalc, inputFromName)
      );
    }
  }, [
    JSON.stringify(
      formData?.sys_entityAttributes &&
        formData?.sys_entityAttributes[inputFromName]
    ),
    JSON.stringify(
      formData?.sys_entityAttributes &&
        formData?.sys_entityAttributes[fieldToCalc]
    ),
    JSON.stringify(inputFrom),
  ]);

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        width: "100%",
      }}
    >
      <DisplayFormControl required={required} error={error} testid={testid}>
        <div className="system-component">
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
          <DisplayDatePicker
            style={{ backgroundColor: "#fdfdfd", width: "100%" }}
            hiddenLabel={true}
            disabled={disable || !canUpdate}
            onChange={onChange}
            onBlur={handleOnBlur}
            required={required}
            // label={title}
            inputVariant="outlined"
            value={value}
            testid={fieldmeta.name}
            InputAdornmentProps={{ position: "start" }}
            inputProps={{ testid: fieldmeta.name, ...globalProps.inputProps }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {!hideCurrentDate && (
                    <IconButton
                      size="small"
                      testid={"update" + "-" + fieldmeta.name}
                      disabled={disable || !canUpdate}
                    >
                      <SystemIcons.Update onClick={handleCurrentDate} />
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    testid={"clear" + "-" + fieldmeta.name}
                    disabled={!value || disable || !canUpdate}
                  >
                    <SystemIcons.Close onClick={handleClear} />
                  </IconButton>
                </InputAdornment>
              ),
              ...globalProps.InputProps,
            }}
            error={error ? true : false}
            minDate={minValue}
            placeholder={placeHolder}
            {...rest}
          />
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
        </div>
      </DisplayFormControl>
    </div>
  );
};

SystemDate.propTypes = {
  Data: PropTypes.string,
  fieldmeta: PropTypes.shape({
    info: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    placeHolder: PropTypes.string.isRequired,
    required: PropTypes.bool,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    visibleOnCsv: PropTypes.bool,
  }),
};

export default GridWrapper(SystemDate);
