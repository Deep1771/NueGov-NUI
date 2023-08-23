import React, { useState, useEffect, startTransition } from "react";
import PropTypes from "prop-types";
import { SystemTimeout } from "utils/services/helper_services/timeout";
import { checkAvailability } from "../unique_check";
import { SystemLabel } from "../index";
import {
  DisplayFormControl,
  DisplayInput,
  DisplayHelperText,
  DisplayText,
} from "components/display_components";
import { GridWrapper } from "components/wrapper_components/grid_wrapper";
import { SystemIcons } from "utils/icons";
import { globalProps } from "../global-props";
import { ToolTipWrapper } from "components/wrapper_components";
import { isDefined } from "utils/services/helper_services/object_methods";
import { performOperation } from "utils/helper_functions";

export const SystemTextbox = (props) => {
  const {
    callbackError,
    callbackValue,
    compIndex,
    data,
    fieldError,
    stateParams,
    formData,
    testid,
  } = props;

  const fieldmeta = {
    ...SystemTextbox.defaultProps.fieldmeta,
    ...props.fieldmeta,
  };
  const {
    canUpdate,
    disable,
    defaultValue,
    name,
    placeHolder,
    required,
    title,
    unique,
    validationRegEx,
    regExErrorMessage = "",
    inputFrom,
    ...others
  } = fieldmeta;
  const { name: inputFromName = "", fieldToCalc, operation } = inputFrom || {};
  const { displayOnCsv, info, length, type, visible, visibleOnCsv, ...rest } =
    others;
  const regexp = new RegExp(validationRegEx);

  const [error, setError] = useState();
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
    stateParams?.mode?.toUpperCase() === "CLONE" && validateData(data);
  };
  const showError = (msg) => {
    if (canUpdate && !disable) {
      callbackError(msg, props);
      setError(true);
      setHelperText(msg);
    }
  };

  // Custom Functions
  const checkUniqueness = async (value) => {
    showError("Checking Availibility..");
    startTransition(async () => {
      let isUnique = await checkAvailability(fieldmeta, stateParams, value);
      if (isUnique) clearError();
      else showError("Already taken");
    });
  };

  const onChange = (data) => {
    setValue(data);
    if (unique || required) {
      startTransition(() => {
        SystemTimeout(() => {
          validateData(data, true);
        }, 500);
      });
    }
  };

  const handleOnBlur = () => {
    callbackValue(value ? value : null, props);
  };

  const handleClear = () => {
    // startTransition(() => {
    callbackValue(null, props);
    // });
  };

  const validateData = (value) => {
    if (value) {
      if (regexp.test(value)) {
        clearError();
        if (unique) checkUniqueness(value);
      } else showError(regExErrorMessage || "Invalid data");
    } else {
      required ? showError("Required") : clearError();
    }
  };

  // USeEffects
  useEffect(() => {
    if (fieldError) showError(fieldError);
    if (required && !data) showError("Required");
    dataInit(data ? data : defaultValue);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (fieldError) showError(fieldError);
    mounted && dataInit(data);
  }, [data, name]);

  useEffect(() => {
    if (formData && formData.sys_entityAttributes && !compIndex) {
      let data = formData.sys_entityAttributes[fieldmeta.name];
      setValue(data);
    }
  }, [
    formData &&
      formData.sys_entityAttributes &&
      formData.sys_entityAttributes[fieldmeta.name],
  ]);

  useEffect(() => {
    if (inputFrom && Object.keys(inputFrom).length > 0) {
      callbackValue(
        performOperation(formData, operation, fieldToCalc, inputFromName),
        props
      );
    }
  }, [
    JSON.stringify(
      formData?.sys_entityAttributes &&
        formData?.sys_entityAttributes[inputFromName]
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
            {...globalProps}
            disabled={!canUpdate || disable}
            error={error}
            testid={fieldmeta.name}
            onChange={onChange}
            onBlur={handleOnBlur}
            onClear={handleClear}
            placeholder={placeHolder}
            value={value ? value : ""}
            // systemVariant="filled"
            // disableUnderline={true}
            {...rest}
          />
          <ToolTipWrapper
            title={
              fieldmeta?.description && fieldmeta?.description?.length > 57
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
                {fieldmeta?.description && fieldmeta?.description}
              </DisplayText>
            </div>
          </ToolTipWrapper>
        </div>
      </DisplayFormControl>
    </div>
  );
};

SystemTextbox.defaultProps = {
  fieldmeta: {
    canUpdate: true,
    disable: false,
    displayOnCsv: true,
    required: false,
    visibleOnCsv: false,
  },
};

SystemTextbox.propTypes = {
  value: PropTypes.string,
  fieldmeta: PropTypes.shape({
    canUpdate: PropTypes.bool,
    disable: PropTypes.bool,
    info: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    placeHolder: PropTypes.string.isRequired,
    required: PropTypes.bool,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    visible: PropTypes.bool,
    visibleOnCsv: PropTypes.bool,
  }),
};

export default GridWrapper(SystemTextbox);
