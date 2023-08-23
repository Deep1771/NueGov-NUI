import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  DisplayColorPicker,
  DisplayHelperText,
  DisplayIcon,
  DisplayIconButton,
  DisplayText,
} from "components/display_components/";
import { GridWrapper, PaperWrapper } from "components/wrapper_components";
import { SystemIcons } from "utils/icons";
import { SystemLabel } from "../";
import { styles } from "./styles";
import { ToolTipWrapper } from "components/wrapper_components";

export const SystemColorPicker = (props) => {
  const { callbackValue, data, stateParams, callbackError, fieldError } = props;
  const fieldmeta = {
    ...SystemColorPicker.defaultProps.fieldmeta,
    ...props.fieldmeta,
  };
  const {
    canUpdate,
    defaultValue,
    disable,
    info,
    name,
    required,
    title,
    placeHolder,
    ...rest
  } = fieldmeta;
  const { mode } = stateParams;
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState();
  const [mounted, setMounted] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [value, setValue] = useState();

  useEffect(() => {
    if (fieldError) showError(fieldError);
    dataInit(data ? data : defaultValue);
    setMounted(true);
  }, []);

  useEffect(() => {
    mounted && dataInit(data);
  }, [data, name]);

  const dataInit = (value) => {
    setValue(value);
    callbackValue(value ? value : null, props);
    if (!value) required ? showError("Required") : clearError();
    else clearError();
  };

  const handleOpenClose = () =>
    (mode != "READ" || fieldmeta.skipReadMode) && setShowPicker(!showPicker);

  const handleClose = () => setShowPicker(false);

  const handleChange = (color) => {
    setValue(color.hex);
    callbackValue(color.hex, props);
    clearError();
  };

  const handleReset = () => {
    setValue(null);
    setShowPicker(false);
    callbackValue(null, props);
    required ? showError("Required") : clearError();
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
    <div style={styles.container}>
      <div style={styles.title}>
        <SystemLabel
          toolTipMsg={info}
          required={required}
          error={error}
          filled={!error && value}
        >
          {title}
        </SystemLabel>
      </div>{" "}
      <br />
      <div
        style={{
          ...styles.color_bar_c,
          opacity: !disable && canUpdate ? 1 : 0.2,
        }}
      >
        <div style={{ flexGrow: 2 }}>
          <PaperWrapper
            style={{
              ...styles.color_bar,
              backgroundColor: value ? value : "inherit",
            }}
            onClick={handleOpenClose}
          >
            <DisplayText variant="subtitle2">
              {(mode != "READ" || fieldmeta.skipReadMode) && !value
                ? placeHolder
                : ``}
            </DisplayText>
            {showPicker &&
              !disable &&
              canUpdate &&
              (mode != "READ" || fieldmeta.skipReadMode) && (
                <div
                  style={styles.picker_container}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={styles.cover} onClick={handleClose} />
                  <DisplayColorPicker
                    {...rest}
                    onChange={handleChange}
                    color={value ? value : ""}
                  />
                </div>
              )}
          </PaperWrapper>
        </div>

        <div style={{ flexShrink: 2 }}>
          <DisplayIconButton
            onClick={handleReset}
            style={{
              visibility:
                !disable &&
                canUpdate &&
                value &&
                (mode != "READ" || fieldmeta.skipReadMode)
                  ? "visible"
                  : "hidden",
            }}
          >
            <DisplayIcon name={SystemIcons.Close}></DisplayIcon>
          </DisplayIconButton>
        </div>
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
      <div className="system-helpertext">
        {error && (mode != "READ" || fieldmeta.skipReadMode) && (
          <DisplayHelperText icon={SystemIcons.Error}>
            {helperText}
          </DisplayHelperText>
        )}
      </div>
    </div>
  );
};

SystemColorPicker.defaultProps = {
  fieldmeta: {
    canUpdate: true,
    visible: false,
    disable: false,
    required: false,
  },
  stateParams: {
    mode: "READ",
  },
};

SystemColorPicker.propTypes = {
  data: PropTypes.string,
  fieldmeta: PropTypes.shape({
    disable: PropTypes.bool,
    info: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    placeHolder: PropTypes.string.isRequired,
    required: PropTypes.bool,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
    colors: PropTypes.array,
  }),
};

export default GridWrapper(SystemColorPicker);
