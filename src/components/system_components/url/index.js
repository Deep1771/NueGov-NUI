import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { SystemTimeout } from "utils/services/helper_services/timeout";
import {
  DisplayFormControl,
  DisplayHelperText,
  DisplayInput,
  DisplayIcon,
  DisplayIconButton,
  DisplayText,
} from "components/display_components";
import { SystemLabel } from "../index";
import { GridWrapper } from "components/wrapper_components/grid_wrapper";
import { SystemIcons } from "utils/icons";
import { globalProps } from "../global-props";
import { ToolTipWrapper } from "components/wrapper_components";
import { UserFactory } from "utils/services/factory_services";
import { getActualValues, getAgencyInfo } from "./helper";

export const SystemUrl = (props) => {
  let {
    callbackError,
    callbackValue,
    data,
    fieldError,
    testid,
    stateParams,
    formData,
  } = props;
  let fieldmeta = { ...SystemUrl.defaultProps.fieldmeta, ...props.fieldmeta };
  let {
    canUpdate,
    defaultValue,
    disable,
    name,
    placeHolder,
    required,
    title,
    validationRegEx,
    autoFillPattern = "",
    ...others
  } = fieldmeta;
  let { displayOnCsv, info, length, type, visible, visibleOnCsv, ...rest } =
    others;
  let { mode = "EDIT" } = stateParams || {};

  let { Info, OpenInBrowser } = SystemIcons;
  let { getAgencyName, isNJAdmin } = UserFactory();

  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState();
  const [mounted, setMounted] = useState(false);
  const [value, setValue] = useState();

  const regexp = new RegExp(
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/
  );

  //custom functions

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
      validateData(data);
    }, 500);
  };

  const showError = (msg) => {
    if (canUpdate && !disable) {
      callbackError(msg, props);
      setError(true);
      setHelperText(msg);
    }
  };

  const validateData = (value) => {
    if (value) {
      if (regexp.test(value)) clearError();
      else showError("Invalid URL");
    } else {
      required ? showError("Required") : clearError();
    }
  };

  useEffect(() => {
    if (fieldError) showError(fieldError);
    dataInit(data ? data : defaultValue);
    setMounted(true);
    if (
      autoFillPattern?.length &&
      ["new", "clone"]?.includes(mode?.toLowerCase())
    ) {
      let autoFillValue = autoFillPattern?.toString();
      let agencyName = "";
      if (isNJAdmin()) {
        let agencyInfo = getAgencyInfo(formData);
        if (agencyInfo?.found) agencyName = agencyInfo?.name;
        else showError("Please select Agency name");
      } else {
        agencyName = getAgencyName();
      }
      if (agencyName?.length > 0) {
        let updatedValue, uniqueId;
        if (autoFillValue?.indexOf("#{") > 0) {
          [updatedValue, uniqueId] = getActualValues(autoFillPattern, {
            agencyName: agencyName,
          });
        }
        setValue(updatedValue);
        callbackValue(updatedValue ? updatedValue : null, props);
        callbackValue(uniqueId ? uniqueId : null, {
          fieldmeta: { name: "publicUniqueId" },
        });
        validateData(updatedValue);
      }
    }
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
      }}
    >
      <DisplayFormControl
        disabled={!canUpdate || disable}
        required={required}
        error={error}
        testid={testid}
      >
        <div
          className="system-component"
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <div style={{ display: "flex" }}>
            <DisplayText
              style={{
                color: "#5F6368",
                fontWeight: "400",
                fontSize: "12px",
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
          <div style={{ display: "flex", alignItems: "center" }}>
            <DisplayInput
              // label={title}
              hddenLabel={true}
              disabled={!canUpdate || disable}
              error={error}
              onChange={onChange}
              testid={fieldmeta.name}
              placeholder={placeHolder}
              value={value ? value : ""}
              variant="outlined"
              style={{ width: "100%" }}
              {...globalProps}
              {...rest}
            />{" "}
            &nbsp;
            <DisplayIconButton
              disabled={!value}
              onClick={() => window.open(value, "_blank")}
              testid="open-in-browser"
            >
              <DisplayIcon size="large" name={OpenInBrowser} />
            </DisplayIconButton>
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
        </div>
      </DisplayFormControl>
    </div>
  );
};

SystemUrl.defaultProps = {
  fieldmeta: {
    canUpdate: true,
    disable: false,
    displayOnCsv: true,
    required: false,
    visibleOnCsv: false,
  },
};
SystemUrl.propTypes = {
  data: PropTypes.string,
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

export default GridWrapper(SystemUrl);
