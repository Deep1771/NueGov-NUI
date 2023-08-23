import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import {
  DisplayFormControl,
  DisplayGrid,
  DisplayIconButton,
  DisplayIcon,
  DisplayHelperText,
  DisplayRadioGroup,
  DisplayRadiobox,
  DisplayText,
} from "../../display_components";
import { GridWrapper, ToolTipWrapper } from "components/wrapper_components";
import { SystemLabel } from "../index";
import { SystemIcons } from "utils/icons";
import { isDefined } from "utils/services/helper_services/object_methods";
import { makeStyles } from "@material-ui/core/styles";
import { RadioHelper } from "./helper";

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
export const SystemRadio = (props) => {
  const {
    callbackError,
    callbackValue,
    data,
    fieldError,
    testid,
    stateParams,
    formData,
  } = props;
  const classes = useStyles();
  const fieldmeta = {
    ...SystemRadio.defaultProps.fieldmeta,
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

  const {
    checkAccessMode,
    checkPublicRoleCreation,
    getPublicRolesCount,
    NJAdmin,
  } = RadioHelper();
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState();
  const [mounted, setMounted] = useState(false);
  const [value, setValue] = useState(null);
  const mode = stateParams?.mode?.toLowerCase();
  const publicErrorMsg = useRef("");
  const isEditable = ["edit", "clone", "new"]?.includes(mode)
    ? checkAccessMode(formData, mode, publicErrorMsg)
    : true;
  const isReadMode =
    stateParams?.mode?.toLowerCase() == "read" && !skipReadMode;
  const allowRoleCreation = useRef(true);
  const [count, setCount] = useState(0);
  const isPublicRole = name === "isPublicRole" ? true : false;

  let { sys_templateName = "" } = formData || {};

  const dataInit = (data) => {
    if (sys_templateName === "Role") {
      if (data === "No") {
        if (["edit"]?.includes(mode)) {
          delete formData?.sys_entityAttributes?.publicUniqueId;
          delete formData?.sys_entityAttributes?.publicFacingRoleUrl;
        }
        if (mode === "clone") {
          delete formData?.sys_entityAttributes?.publicRole;
        }
      } else {
        if (data === "Yes" && !allowRoleCreation.current) {
          showError("Limit reached");
          setValue(data);
          return;
        }
      }
    }
    setValue(data);
    callbackValue(isDefined(data) ? data : null, props);
    validateData(data);
  };
  const resetBooleanValues = (val) => {
    if (val == "true") {
      return true;
    } else if (val == "false") {
      return false;
    }
    return val;
  };

  const handleChange = (selected) => {
    let data = resetBooleanValues(selected);
    dataInit(data);
  };

  const handleClear = () => {
    dataInit(null);
  };

  const showIcon = () => {
    return values?.find((i) => i.value == value)?.icon;
  };

  const validateData = (value) => {
    if (!isDefined(value)) required ? showError("Required") : clearError();
    else clearError();
  };

  const showError = (msg) => {
    if (canUpdate && !disable && isEditable) {
      callbackError(msg, props);
      setError(true);
      setHelperText(msg);
    }
    if (!allowRoleCreation.current) {
      callbackError(msg, props);
      setError(true);
      setHelperText(msg);
    }
  };

  const [hovered, setHovered] = useState(false);
  const containerstyle = {
    flexDirection: "row",
    background: "#fdfdfd",
    borderRadius: "4px",
    padding: "0px 0px 0px 16px",
    height: "40px",
    border: hovered ? "1px solid #1976d2" : "1px solid #c3c3c3",
    boxShadow: hovered ? "0px 0px 1px 2px rgba(227,242,253,1)" : "none",
    transition: "border 0.2s", // Adding a transition effect
  };

  const clearError = () => {
    callbackError(null, props);
    setError(false);
    setHelperText();
  };
  let readModeValue = values.find((item) => item?.value == data)?.title;

  useEffect(() => {
    mounted && dataInit(isDefined(data) ? data : defaultValue);
  }, [data, name]);

  useEffect(() => {
    isPublicRole &&
      checkPublicRoleCreation(
        allowRoleCreation,
        setCount,
        mode,
        data,
        showError
      );
    if (fieldError) showError(fieldError);
    dataInit(isDefined(data) ? data : defaultValue);
    setMounted(true);
  }, []);

  useEffect(() => {}, [JSON.stringify(count)]);

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
                  {readModeValue}
                </DisplayText>

                {showIcon() && (
                  <div
                    style={{
                      margin: "1px 4px 1px 1px",
                      borderRadius: "50%",
                      position: "absolute",
                      top: "-20px",
                      right: "0px",
                    }}
                  >
                    <img height="48" maxWidth="64" src={showIcon()} />
                  </div>
                )}
              </>
            ) : (
              ""
            )}
          </DisplayGrid>
        </DisplayGrid>
      ) : (
        <div style={{ display: "flex", flex: 1, width: "100%" }}>
          <DisplayFormControl
            disabled={disable || !canUpdate || !isEditable}
            required={required}
            error={error}
            testid={testid}
            className={classes.main}
          >
            {(title || error) && (
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
            <div
              className="system-components"
              style={containerstyle}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              <div style={{ flex: 1 }}>
                <DisplayRadioGroup
                  value={value}
                  onChange={(val) => handleChange(val.target.value)}
                  row
                >
                  {values.map((val, i) => (
                    <DisplayRadiobox
                      key={i}
                      error={error}
                      testid={fieldmeta.name + "-" + val.value}
                      label={val.title}
                      value={val.value}
                      disabled={disable || !canUpdate || !isEditable}
                    />
                  ))}
                  {!disable && canUpdate && isEditable && isDefined(value) && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "4px",
                      }}
                    >
                      <DisplayIconButton
                        onClick={handleClear}
                        size="small"
                        testid="clear"
                      >
                        <DisplayIcon name={SystemIcons.Cancel}></DisplayIcon>
                      </DisplayIconButton>
                    </div>
                  )}
                </DisplayRadioGroup>
              </div>

              <div
                style={{ flexShrink: 1, padding: "1px", alignSelf: "center" }}
              >
                {" "}
                {showIcon() && (
                  <div
                    style={{
                      margin: "1px 4px 1px 1px",
                      height: "32px",
                      width: "32px",
                      borderRadius: "50%",
                      overflow: "hidden",
                    }}
                  >
                    <img maxHeight="40" maxWidth="40" src={showIcon()} />
                  </div>
                )}
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
                  {NJAdmin && isPublicRole
                    ? `You can create upto ${getPublicRolesCount} public roles for an Agency`
                    : isPublicRole
                    ? value === "Yes"
                      ? `Number of public role remaining - ${count}`
                      : publicErrorMsg.current
                      ? publicErrorMsg.current
                      : fieldmeta?.description
                    : fieldmeta?.description}
                </DisplayText>
              </div>
            </ToolTipWrapper>
          </DisplayFormControl>
        </div>
      )}
    </>
  );
};

SystemRadio.defaultProps = {
  fieldmeta: {
    canUpdate: true,
    visible: false,
    disable: false,
    required: false,
    visibleOnCsv: false,
  },
};

SystemRadio.propTypes = {
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

export default GridWrapper(SystemRadio);
