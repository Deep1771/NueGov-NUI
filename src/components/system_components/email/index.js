import React, { useState, useEffect } from "react";
import { SystemTimeout } from "utils/services/helper_services/timeout";
import PropTypes from "prop-types";
import {
  DisplayFormControl,
  DisplayHelperText,
  DisplayInput,
  DisplayText,
} from "components/display_components";
import { SystemLabel } from "../index";
import { GridWrapper } from "components/wrapper_components/grid_wrapper";
import { SystemIcons } from "utils/icons";
import { checkAvailability } from "../unique_check";
import { globalProps } from "../global-props";
import { ToolTipWrapper } from "components/wrapper_components";

export const SystemEmail = (props) => {
  let { callbackError, callbackValue, data, fieldError, stateParams, testid } =
    props;
  let fieldmeta = { ...SystemEmail.defaultProps.fieldmeta, ...props.fieldmeta };
  let {
    canUpdate,
    defaultValue,
    disable,
    name,
    placeHolder,
    required,
    title,
    unique,
    validationRegEx,
    ...others
  } = fieldmeta;
  let { displayOnCsv, info, type, visible, visibleOnCsv, ...rest } = others;

  const { Info } = SystemIcons;

  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState();
  const [mounted, setMounted] = useState(false);
  const [value, setValue] = useState();

  const regexp = new RegExp(
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );

  //custom functions
  const checkUniqueness = async (value) => {
    showError("Checking Availibility..");
    SystemTimeout(async () => {
      let isUnique = await checkAvailability(fieldmeta, stateParams, value);
      if (isUnique) clearError();
      else showError("Already taken");
    }, 2000);
  };

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

  const onChange = (data) => {
    setValue(data);
    SystemTimeout(() => {
      callbackValue(data ? data : null, props);
      validateData(data, true);
    }, 500);
  };

  const showError = (msg) => {
    if (canUpdate && !disable) {
      callbackError(msg, props);
      setError(true);
      setHelperText(msg);
    }
  };

  const validateData = (value, uniqueCheck = false) => {
    if (value) {
      if (regexp.test(value)) {
        clearError();
        if (uniqueCheck && unique) checkUniqueness(value);
      } else showError("Invalid email");
    } else {
      required ? showError("Required") : clearError();
    }
  };

  useEffect(() => {
    if (fieldError) showError(fieldError);
    dataInit(data ? data : defaultValue);
    setMounted(true);
  }, []);

  useEffect(() => {
    mounted && dataInit(data);
    if (fieldError) showError(fieldError);
  }, [data, name]);

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
            disabled={!canUpdate || disable}
            error={error}
            testid={fieldmeta.name}
            onChange={onChange}
            placeholder={placeHolder}
            value={value ? value : ""}
            {...globalProps}
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

SystemEmail.defaultProps = {
  fieldmeta: {
    canUpdate: true,
    disable: false,
    displayOnCsv: true,
    required: false,
    visibleOnCsv: false,
  },
};

SystemEmail.propTypes = {
  data: PropTypes.string,
  fieldmeta: PropTypes.shape({
    disable: PropTypes.bool,
    info: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    placeHolder: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    visibleOnCsv: PropTypes.bool,
  }),
};

export default GridWrapper(SystemEmail);
