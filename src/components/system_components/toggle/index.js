import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  DisplayFormControl,
  DisplayGrid,
  DisplayHelperText,
  DisplayText,
  DisplaySwitch,
} from "../../display_components";
import { GridWrapper, ToolTipWrapper } from "components/wrapper_components";
import { SystemIcons } from "utils/icons";
import { isDefined } from "utils/services/helper_services/object_methods";
import { makeStyles } from "@material-ui/core/styles";
import { IOSSwitch } from "components/display_components/ios_switch";

const useStyles = makeStyles(() => ({
  main: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    paddingRight: "1.5rem",
  },
}));
export const SystemToggle = (props) => {
  const {
    callbackError,
    callbackValue,
    data,
    fieldError,
    testid,
    stateParams,
  } = props;
  const classes = useStyles();
  const fieldmeta = {
    ...SystemToggle.defaultProps.fieldmeta,
    ...props.fieldmeta,
  };
  const {
    title,
    values,
    disable,
    required,
    canUpdate,
    defaultValue,
    skipReadMode,
    name,
    ...rest
  } = fieldmeta;

  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState();
  const [mounted, setMounted] = useState(false);
  const [value, setValue] = useState(null);
  const isReadMode =
    stateParams?.mode?.toLowerCase() == "read" && !skipReadMode;

  useEffect(() => {
    mounted && dataInit(isDefined(data) ? data : defaultValue);
  }, [data, name]);

  useEffect(() => {
    if (fieldError) showError(fieldError);
    dataInit(isDefined(data) ? data : defaultValue);
    setMounted(true);
  }, []);

  const dataInit = (data) => {
    let secData = values?.filter((e) => e?.value === data)[0]?.id;
    setValue(secData);
    callbackValue(isDefined(data) ? data : null, props);
    validateData(secData);
  };

  const handleChange = (selected) => {
    let valueToStore = values?.filter((e) => e?.id === selected)[0]?.value;
    dataInit(valueToStore);
  };

  const validateData = (dataToValidate) => {
    if (!isDefined(dataToValidate))
      required ? showError("Required") : clearError();
    else clearError();
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
  let readModeValue = values.find((item) => item?.value == data)?.title;

  return (
    <>
      {isReadMode ? (
        <DisplayGrid
          container
          style={{ flex: 1, height: "100%", flexDirection: "column" }}
        >
          <DisplayGrid item container>
            <ToolTipWrapper title={fieldmeta.info}>
              <div>
                <DisplayText
                  variant="h1"
                  style={{ color: "#666666", cursor: "default" }}
                >
                  {fieldmeta.title}
                </DisplayText>
              </div>
            </ToolTipWrapper>
          </DisplayGrid>
          <DisplayGrid
            item
            container
            style={{ paddingLeft: "15px", flex: 1, position: "relative" }}
          >
            {readModeValue ? (
              <>
                <DisplayText
                  variant="h2"
                  style={{ color: "#616161", wordBreak: "break-all" }}
                >
                  {readModeValue?.toUpperCase()}
                </DisplayText>
              </>
            ) : (
              ""
            )}
          </DisplayGrid>
        </DisplayGrid>
      ) : (
        <div style={{ display: "flex", flex: 1, width: "100%" }}>
          <DisplayFormControl
            disabled={disable || !canUpdate}
            required={required}
            error={error}
            testid={testid}
            className={classes.main}
          >
            <div
              className="system-components"
              style={{
                flexDirection: "row",
                background: "",
                borderRadius: "8px",
                padding: "1px 0px 1px 0px",
                minHeight: "40px",
              }}
            >
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                {(title || error) && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      width: "70%",
                    }}
                  >
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
                    <div style={{ display: "flex" }}>
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
                    </div>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <div
                    style={{
                      display: "flex",
                    }}
                  >
                    <IOSSwitch
                      testid={`${name}`}
                      onChange={(event, value) => {
                        handleChange(value);
                      }}
                      checked={value}
                      value={
                        values?.filter((e) => e?.value === value)[0]?.title
                      }
                      style={{
                        margin: "auto",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <DisplayText
                      style={{
                        color: "#5F6368",
                        fontWeight: "400",
                        fontSize: "12px",
                        paddingBottom: "4px",
                      }}
                    >
                      {isDefined(value)
                        ? values
                            ?.filter((e) => e?.id === value)[0]
                            ?.title?.toUpperCase()
                        : values
                            ?.filter((e) => e?.id === false)[0]
                            ?.title?.toUpperCase()}
                    </DisplayText>
                  </div>
                </div>
              </div>
            </div>
          </DisplayFormControl>
        </div>
      )}
    </>
  );
};

SystemToggle.defaultProps = {
  fieldmeta: {
    canUpdate: true,
    visible: false,
    disable: false,
    required: false,
    visibleOnCsv: false,
  },
};

SystemToggle.propTypes = {
  data: PropTypes.string,
  fieldmeta: PropTypes.shape({
    disable: PropTypes.bool,
    info: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    placeHolder: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    values: PropTypes.array,
    visibleOnCsv: PropTypes.bool,
  }),
};

export default GridWrapper(SystemToggle);
