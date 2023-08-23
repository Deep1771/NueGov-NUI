import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  DisplaySelect,
  DisplayHelperText,
  DisplayFormControl,
  DisplayReadMode,
} from "components/display_components/";
import { SystemLabel } from "components/system_components/";
import { GridWrapper } from "../../wrapper_components/grid_wrapper";
import { SystemIcons } from "utils/icons";
import { globalProps } from "../global-props";
import { ToolTipWrapper } from "components/wrapper_components";
import { DisplayText } from "components/display_components/";

export const SystemColorCodedList = (props) => {
  let { data, callbackValue, callbackError, fieldError, stateParams, testid } =
    props;
  let fieldmeta = {
    ...SystemColorCodedList.defaultProps.fieldmeta,
    ...props.fieldmeta,
  };
  let {
    name,
    title,
    required,
    values,
    disable,
    canUpdate,
    defaultValue,
    info,
    ...others
  } = fieldmeta;
  let { visible, visibleOnCsv, displayOnCsv, ...rest } = others;

  const [color, setColor] = useState("inherit");
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState();
  const [mounted, setMounted] = useState(false);
  const [value, setValue] = useState();

  const clearError = () => {
    callbackError(null, props);
    setError(false);
    setHelperText();
  };

  const dataInit = (data) => {
    setValue(data);
    callbackValue(data ? data : null, props);
    validateData(data);
    let selected = values.find((i) => i.id === data);
    selected ? setColor(selected.color) : setColor("inherit");
  };

  const onChange = (val) => {
    dataInit(val);
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
      clearError();
    } else {
      required ? showError("Required") : clearError();
    }
  };

  useEffect(() => {
    mounted && dataInit(data);
  }, [data, name]);

  useEffect(() => {
    if (fieldError) showError(fieldError);
    dataInit(data ? data : defaultValue);
    setMounted(true);
  }, []);

  return (
    <>
      {stateParams.mode === "READ" && !fieldmeta.skipReadMode ? (
        <>
          <DisplayReadMode data={data} fieldmeta={fieldmeta} />
          <div
            style={{
              display: "flex",
              flex: 1,
              justifyContent: "center",
              alignItems: "flex-end",
            }}
          >
            <div
              style={{
                background: color,
                width: "30px",
                height: "30px",
                border: "1px solid black",
                margin: "3px",
                borderRadius: "5px",
              }}
            />
          </div>
        </>
      ) : (
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            width: "100%",
          }}
        >
          <DisplayFormControl required={required} error={error} testid={testid}>
            <div
              className="system-component"
              style={{ display: "flex", flex: 1, flexDirection: "row" }}
            >
              <div style={{ display: "flex", flex: 11 }}>
                <DisplaySelect
                  // label={title}
                  hiddenLabel={true}
                  disabled={!canUpdate || disable}
                  labelKey="value"
                  valueKey="id"
                  values={values}
                  error={error}
                  testid={fieldmeta.name}
                  onChange={onChange}
                  value={value ? value : ""}
                  {...globalProps}
                  {...rest}
                />
              </div>{" "}
              &nbsp;&nbsp;
              <div
                style={{
                  display: "flex",
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "flex-end",
                }}
              >
                <div
                  style={{
                    background: color,
                    width: "30px",
                    height: "30px",
                    border: "1px solid black",
                    margin: "3px",
                    borderRadius: "5px",
                  }}
                />
              </div>
            </div>
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
            <div className="system-helpertext">
              {error && (
                <DisplayHelperText icon={SystemIcons.Error}>
                  {helperText}
                </DisplayHelperText>
              )}
            </div>
          </DisplayFormControl>
        </div>
      )}
    </>
  );
};

SystemColorCodedList.defaultProps = {
  fieldmeta: {
    canUpdate: false,
    visible: false,
    disable: false,
    required: false,
    visibleOnCsv: false,
    displayOnCsv: true,
  },
};

SystemColorCodedList.propTypes = {
  Data: PropTypes.object,
  fieldmeta: PropTypes.shape({
    info: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    placeHolder: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    values: PropTypes.array.isRequired,
    canUpdate: PropTypes.bool,
    disable: PropTypes.bool,
    required: PropTypes.bool,
    visible: PropTypes.bool,
  }),
};

export default GridWrapper(SystemColorCodedList);
