import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { SystemLabel } from "../index";
import {
  DisplayFormControl,
  DisplayHelperText,
  DisplayPhoneNumber,
  DisplayText,
} from "components/display_components";
import { GridWrapper } from "components/wrapper_components/grid_wrapper";
import { SystemIcons } from "utils/icons";
import { ThemeFactory } from "utils/services/factory_services";
import { globalProps } from "../global-props";
import { ToolTipWrapper } from "components/wrapper_components";
import "./style.css";

export const SystemPhoneNumber = (props) => {
  let { data, callbackValue, callbackError, fieldError } = props;
  let fieldmeta = {
    ...SystemPhoneNumber.defaultProps.fieldmeta,
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

  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState();
  const [mounted, setMounted] = useState(false);
  const [value, setValue] = useState();

  const { getVariantForComponent } = ThemeFactory();
  const themeColor = getVariantForComponent("", "primary");
  const componentColor = themeColor.colors.dark.bgColor;

  // Setters
  const clearError = () => {
    callbackError(null, props);
    setError(false);
    setHelperText();
  };

  const dataInit = (data) => {
    setValue(data);
    callbackValue(data && Object.keys(data).length > 1 ? data : null, props);
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
  const onChange = (value, country, e, fv) => {
    if (value)
      dataInit({
        phoneNumber: value,
        countryCode: country.countryCode,
        uiDisplay: fv,
      });
    else dataInit(null);
  };

  const onKeyDown = (event) => {
    if (event.target.value.length <= 2 && event.keyCode === 8)
      //library issue.. so did like this
      dataInit(null);
  };

  const validateData = (value) => {
    (!value || !value.phoneNumber) && required
      ? showError("Required")
      : clearError();
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
      }}
    >
      <DisplayFormControl>
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
          <DisplayPhoneNumber
            className="react-tel-input"
            value={value && value.phoneNumber ? value.phoneNumber : ""}
            country={value && value.countryCode ? value.countryCode : "us"}
            onChange={onChange}
            onKeyDown={onKeyDown}
            disabled={!canUpdate && disable}
            specialLabel={""}
            containerStyle={{
              color: componentColor,
            }}
            inputStyle={{
              width: "100%",
              border: "none",
              fontSize: "15px",
              background: "#fdfdfd",
              border: "1px solid #c3c3c3",
              ...globalProps.InputProps.style,
            }}
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

SystemPhoneNumber.defaultProps = {
  fieldmeta: {
    canUpdate: false,
    visible: false,
    disable: false,
    required: false,
  },
};

SystemPhoneNumber.propTypes = {
  value: PropTypes.object,
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
  }),
};

export default GridWrapper(SystemPhoneNumber);
