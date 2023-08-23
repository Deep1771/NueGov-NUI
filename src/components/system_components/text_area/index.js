import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { SystemTimeout } from "utils/services/helper_services/timeout";
import { SystemLabel } from "../index";
import {
  DisplayFormControl,
  DisplayHelperText,
  DisplayInput,
  DisplayText,
} from "components/display_components";
import { GridWrapper } from "components/wrapper_components/grid_wrapper";
import { SystemIcons } from "utils/icons";
import { globalProps } from "../global-props";
import { ToolTipWrapper } from "components/wrapper_components";

export const SystemTextarea = (props) => {
  let { data, callbackValue, callbackError, fieldError, testid } = props;
  let fieldmeta = {
    ...SystemTextarea.defaultProps.fieldmeta,
    ...props.fieldmeta,
  };
  let {
    cols,
    canUpdate,
    disable,
    defaultValue,
    name,
    placeHolder,
    required,
    title,
    ...others
  } = fieldmeta;
  let { displayOnCsv, info, visible, visibleOnCsv, validationRegEx, ...rest } =
    others;

  const regexp = new RegExp(validationRegEx);
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState();
  const [mounted, setMounted] = useState(false);
  const [value, setValue] = useState();

  // Setters
  const clearError = () => {
    callbackError(null, props);
    setError(false);
    setHelperText();
  };

  const dataInit = (data) => {
    setValue(data);
    callbackValue(data ? data : null, props);
    validateData(data);
  };

  const showError = (msg) => {
    if (canUpdate && !disable) {
      callbackError(msg, props);
      setError(true);
      setHelperText(msg);
    }
  };

  // Custom Functions
  const onChange = (value) => {
    setValue(value);
    SystemTimeout(() => {
      callbackValue(value ? value : null, props);
      validateData(value);
    }, 500);
  };

  const validateData = (value) => {
    if (value) {
      if (regexp.test(value)) clearError();
      else showError("Invalid data");
    } else {
      required ? showError("Required") : clearError();
    }
  };

  // UseEffects
  useEffect(() => {
    if (fieldError) showError(fieldError);
    dataInit(data ? data : defaultValue);
    setMounted(true);
  }, []);

  useEffect(() => {
    mounted && dataInit(data);
  }, [data, name]);

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        width: "100%",
        paddingRight: "0.9rem",
      }}
    >
      <DisplayFormControl
        disabled={!canUpdate || disable}
        required={required}
        error={error}
        testid={testid}
      >
        <div className="system-components">
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
          <DisplayInput
            // label={title}
            disabled={!canUpdate || disable}
            hiddenLabel={true}
            error={error}
            onChange={onChange}
            multiline={true}
            placeholder={placeHolder}
            testid={fieldmeta.name}
            value={value ? value : ""}
            {...globalProps}
            {...rest}
            InputProps={{
              ...globalProps.InputProps,
              style: {
                ...globalProps.InputProps.style,
                padding: "0px",
              },
            }}
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

SystemTextarea.defaultProps = {
  fieldmeta: {
    canUpdate: false,
    visible: false,
    disable: false,
    displayOnCsv: true,
    required: false,
    rows: 4,
    visibleOnCsv: false,
  },
};

SystemTextarea.propTypes = {
  value: PropTypes.string,
  fieldmeta: PropTypes.shape({
    canUpdate: PropTypes.bool,
    cols: PropTypes.number,
    disable: PropTypes.bool,
    info: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    placeHolder: PropTypes.string.isRequired,
    required: PropTypes.bool,
    rows: PropTypes.number,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    visible: PropTypes.bool,
    visibleOnCsv: PropTypes.bool,
  }),
};

export default GridWrapper(SystemTextarea);
