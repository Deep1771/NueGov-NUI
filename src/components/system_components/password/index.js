import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { SystemTimeout } from "utils/services/helper_services/timeout";
import {
  DisplayFormControl,
  DisplayHelperText,
  DisplayInput,
  DisplayText,
} from "components/display_components/";
import { GridWrapper } from "components/wrapper_components/grid_wrapper";
import { SystemLabel } from "../index";
import { SystemIcons } from "utils/icons";
import { globalProps } from "../global-props";
import { ToolTipWrapper } from "components/wrapper_components";

export const SystemPassword = (props) => {
  let {
    data,
    callbackValue,
    callbackError,
    fieldError,
    regex,
    testid,
    onPasswordChange = () => {},
    clearRetypePwd,
    successMsg = "",
  } = props;
  let fieldmeta = {
    ...SystemPassword.defaultProps.fieldmeta,
    ...props.fieldmeta,
  };
  let {
    canUpdate,
    disable,
    info,
    name,
    placeHolder,
    required,
    transient,
    title,
    errorMsg,
    noErrors,
    turnOffAutoFill,
    showInstructions = true,
    ...others
  } = fieldmeta;
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState();
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [value, setValue] = useState();

  const [containsUlLl, setContainsUlLl] = useState(false);
  const [checkPwd, setCheckPwd] = useState(0);
  const [containsN, setContainsN] = useState(false);
  const [contains6C, setContains6C] = useState(false);
  const [isPasswordDirty, setIsPasswordDirty] = useState(false);

  const mustContainPwdCriteria = [
    [
      "Must contain at least 1 Uppercase and 1 Lowercase letter (e.g.Aa)",
      containsUlLl,
    ],
    [
      "Must contain at least 1 digit (e.g.0-9) and 1 special character(s) (e.g.!@#$)",
      containsN,
    ],
    ["Minimun length should be at least 6", contains6C],
  ];

  let exp = regex
    ? regex.newPassword
    : /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?@]).{6,20})/;
  const regexp = new RegExp(exp);

  const iconHandler = () => setShowPassword(!showPassword);

  const dataInit = (data) => {
    setValue(data);
    callbackValue(data ? data : null, props);
    validateData(data);
  };

  const onChange = (value) => {
    setIsPasswordDirty(true);
    onPasswordChange(value);
    setValue(value);
    SystemTimeout(() => {
      callbackValue(value ? value : null, props);
      validateData(value);
    }, 500);
  };

  const validateData = (value) => {
    if (value) {
      if (regexp.test(value)) {
        clearError();
        showSuccess(successMsg);
        if (regex?.newPassword) {
          if (regex?.newPassword === value) {
            clearError();
            showSuccess(successMsg);
          } else showError(errorMsg);
        } else {
          if (regexp.test(value)) {
            clearError();
            showSuccess(successMsg);
          } else showError(errorMsg);
        }
      } else showError(errorMsg);
      if (value.toLowerCase() != value && value.toUpperCase() != value)
        setContainsUlLl(true);
      else setContainsUlLl(false);

      if (
        /\d/.test(value) &&
        /[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?@]/g.test(value)
      )
        setContainsN(true);
      else setContainsN(false);

      if (value.length >= 6) setContains6C(true);
      else setContains6C(false);
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

  const showSuccess = (msg) => {
    if (msg) {
      setHelperText(msg);
    }
  };

  const clearError = () => {
    callbackError(null, props);
    setError(false);
    setHelperText();
  };

  useEffect(() => {
    mounted && dataInit(data);
  }, [data, name]);

  useEffect(() => {
    setValue();
  }, [clearRetypePwd]);

  useEffect(() => {
    if (fieldError) showError(fieldError);
    dataInit(data);
    setMounted(true);
  }, []);

  useEffect(() => {
    value && showInstructions ? setCheckPwd(true) : setCheckPwd(false);
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
            {noErrors
              ? null
              : error && (
                  <div className="system-helpertext">
                    <DisplayHelperText icon={SystemIcons.Info}>
                      ({helperText})
                    </DisplayHelperText>
                  </div>
                )}
          </div>
          <DisplayInput
            // label={title}
            disabled={disable || !canUpdate}
            error={noErrors ? !noErrors : error}
            iconName={
              showPassword ? SystemIcons.Visibility : SystemIcons.VisibilityOff
            }
            turnOffAutoFill={turnOffAutoFill}
            onChange={onChange}
            onIconClick={iconHandler}
            testid={fieldmeta.name}
            placeholder={placeHolder}
            type={showPassword ? "text" : "password"}
            value={value ? value : ""}
            {...globalProps}
          />
        </div>
        {value?.length > 1 && successMsg && !error && (
          <div className="system-helpertext">
            <DisplayHelperText icon={SystemIcons.Info}>
              <span style={{ color: "green" }}>{helperText} </span>
            </DisplayHelperText>
          </div>
        )}
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
        {checkPwd > 0 && isPasswordDirty && (
          <>
            <span style={{ fontSize: "12px", opacity: "0.8" }}>
              Password must fulfill following criteria :
            </span>
            <p
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: "0px",
                // paddingLeft: "5px",
              }}
            >
              {mustContainPwdCriteria.map((item) => {
                return (
                  <span
                    style={{
                      color: item[1] ? "green" : "red",
                      fontSize: "11px",
                    }}
                  >
                    {item[0]}
                  </span>
                );
              })}
            </p>
          </>
        )}
      </DisplayFormControl>
    </div>
  );
};

SystemPassword.defaultProps = {
  fieldmeta: {
    canUpdate: true,
    visible: false,
    disable: false,
    required: false,
    visibleOnCsv: false,
    displayOnCsv: true,
    errorMsg: "Enter strong password ",
  },
};

SystemPassword.propTypes = {
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

export default GridWrapper(SystemPassword);
