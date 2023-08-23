import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  DisplayInput,
  DisplayHelperText,
  DisplayFormControl,
  DisplayText,
} from "components/display_components/";
import { GridWrapper } from "components/wrapper_components/grid_wrapper";
import { SystemIcons } from "utils/icons";
import { SystemLabel } from "components/system_components/";
import { isDefined } from "utils/services/helper_services/object_methods";
import { SystemTimeout } from "utils/services/helper_services/timeout";
import { globalProps } from "../global-props";
import { ToolTipWrapper } from "components/wrapper_components";

export const SystemDecimal = (props) => {
  let {
    callbackValue,
    compIndex,
    data,
    callbackError,
    fieldError,
    formData,
    testid,
  } = props;
  let fieldmeta = {
    ...SystemDecimal.defaultProps.fieldmeta,
    ...props.fieldmeta,
  };
  let {
    canUpdate,
    defaultValue,
    disable,
    maxValue,
    minValue,
    name,
    numberOfDecimals,
    placeHolder,
    required,
    title,
    hideIncrement = false,
    ...others
  } = fieldmeta;
  let { displayOnCsv, info, length, type, visible, visibleOnCsv, ...rest } =
    others;

  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState();
  const [mounted, setMounted] = useState(false);
  const [fieldType, setFieldType] = useState("number");
  const [value, setValue] = useState();
  const regexp = new RegExp("^[+-]?([0-9]*([.][0-9]*)?|[0-9]+)$");
  const { AddOutline, RemoveOutline } = SystemIcons;

  const appendDecimals = (number) =>
    Number.parseFloat(number).toFixed(numberOfDecimals);

  useEffect(() => {
    mounted && dataInit(isDefined(data) ? appendDecimals(data) : data);
  }, [name, data]);

  useEffect(() => {
    if (fieldError) showError(fieldError);
    let val = isDefined(data) ? data : defaultValue;
    dataInit(isDefined(val) ? appendDecimals(val) : val);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (formData && formData.sys_entityAttributes && !compIndex) {
      let data = formData.sys_entityAttributes[fieldmeta.name];
      setValue(isDefined(data) ? appendDecimals(data) : data);
    }
  }, [
    formData &&
      formData.sys_entityAttributes &&
      formData.sys_entityAttributes[fieldmeta.name],
  ]);

  const dataInit = (data) => {
    setValue(data);
    callbackValue(
      isDefined(data) ? (isNaN(data) ? data : Number(data)) : null,
      props
    );
    validateData(data);
  };

  const onChange = (value, append = false) => {
    if (value && value[value.length - 1] === ".") setFieldType("text");
    else setFieldType("number");
    setValue(value);

    SystemTimeout(() => {
      callbackValue(
        isDefined(value) ? (isNaN(value) ? value : Number(value)) : null,
        props
      );
      validateData(value);
      dataInit(isDefined(value) ? appendDecimals(value) : value);
    }, 3000);
    if (append) {
      setValue(isDefined(value) ? appendDecimals(value) : value);
    }
  };

  const validateData = (value) => {
    if (isDefined(value)) {
      if (regexp.test(value)) clearError();
      else showError("Invalid number");

      if (!isNaN(value)) {
        Number(value) < minValue && showError(`Min value is ${minValue}`);
        Number(value) > maxValue && showError(`Max value is ${maxValue}`);
      }
    } else {
      required ? showError("Required") : clearError();
    }
  };

  const showError = (msg) => {
    if (canUpdate && !disable) {
      callbackError(msg, props);
      setError(true);
      setHelperText(msg);
    }
  };

  const clearError = () => {
    callbackError(null, props);
    setError(false);
    setHelperText();
  };

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
        <div className="system-components">
          {title && (
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
                  ({helperText})
                </DisplayHelperText>
              )}
            </div>
          )}
          <DisplayInput
            type={fieldType}
            error={error}
            disabled={!canUpdate || disable}
            placeholder={placeHolder}
            testid={fieldmeta.name}
            // label={title}
            onChange={onChange}
            value={isDefined(value) ? value : ""}
            startIconName={hideIncrement ? "" : RemoveOutline}
            iconName={hideIncrement ? "" : AddOutline}
            startIconDisable={value <= minValue}
            endIconDisable={value >= maxValue}
            onIconClick={() => {
              onChange((Number(value) || 0) + 1.0, true);
            }}
            startIconClick={() => {
              onChange((Number(value) || 0) - 1.0, true);
            }}
            {...globalProps}
            {...rest}
          />
          {title && (
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
          )}
        </div>
      </DisplayFormControl>
    </div>
  );
};

SystemDecimal.propTypes = {
  data: PropTypes.number,
  fieldmeta: PropTypes.shape({
    canUpdate: PropTypes.bool,
    defaultValue: PropTypes.number,
    disable: PropTypes.bool,
    info: PropTypes.string.isRequired,
    maxValue: PropTypes.number,
    minValue: PropTypes.number,
    name: PropTypes.string.isRequired,
    numberOfDecimals: PropTypes.number,
    placeHolder: PropTypes.string.isRequired,
    required: PropTypes.bool,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    visible: PropTypes.bool,
    visibleOnCsv: PropTypes.bool,
  }),
};

SystemDecimal.defaultProps = {
  fieldmeta: {
    canUpdate: true,
    disable: false,
    displayOnCsv: true,
    visibleOnCsv: false,
    required: false,
    numberOfDecimals: 3,
  },
};

export default GridWrapper(SystemDecimal);
