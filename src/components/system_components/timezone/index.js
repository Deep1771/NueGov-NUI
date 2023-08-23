import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import { SystemTimeout } from "utils/services/helper_services/timeout";
import {
  DisplayInput,
  DisplayHelperText,
  DisplayFormControl,
  DisplayText,
} from "components/display_components/";
import { GridWrapper } from "components/wrapper_components/grid_wrapper";
import { SystemIcons } from "utils/icons";
import { globalProps } from "../global-props";
import "../../../App.css";
import { ToolTipWrapper } from "components/wrapper_components";
import TimezoneSelect, { allTimezones } from "react-timezone-select";

const useStyles = makeStyles({
  root: {
    "& .Mui-disabled": {
      color: "rgba(0, 0, 0, 0.6)", // (default alpha is 0.38)
    },
  },
});

export const SystemTimezone = (props) => {
  const {
    callbackValue,
    compIndex,
    data,
    callbackError,
    fieldError,
    formData,
    testid,
  } = props;
  const fieldmeta = {
    ...SystemTimezone.defaultProps.fieldmeta,
    ...props.fieldmeta,
  };
  const {
    canUpdate,
    defaultValue,
    disable,
    minValue,
    maxValue,
    name,
    placeHolder,
    required,
    validationRegEx,
    hideIncrement = false,
    title,
    type,
    ...others
  } = fieldmeta;

  const { displayOnCsv, info, length, visible, visibleOnCsv, ...rest } = others;
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState();
  const [mounted, setMounted] = useState(false);
  const [value, setValue] = useState("");
  const { AddOutline, RemoveOutline } = SystemIcons;

  const classes = useStyles();

  useEffect(() => {
    mounted && dataInit(data);
  }, [data, name]);

  useEffect(() => {
    if (fieldError) showError(fieldError);
    dataInit(data);
    setMounted(true);
  }, []);

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

  const dataInit = (data) => {
    setValue(data);
    callbackValue(data ? data : null, props);
    validateData(data);
  };

  const validateData = (value) => {
    if (value) {
      clearError();
    } else {
      required ? showError("Required") : clearError();
    }
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

  const clearError = () => {
    callbackError(null, props);
    setError(false);
    setHelperText();
  };

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        width: "100%",
      }}
    >
      <DisplayFormControl required={required} error={error} testid={testid}>
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
          <TimezoneSelect
            value={value ? value : ""}
            className={classes.root}
            disabled={!canUpdate || disable}
            onChange={onChange}
            labelStyle="altName"
            placeholder={placeHolder}
            // timezones={{
            //   ...allTimezones,
            //   "America/Lima": "Pittsburgh",
            //   "Europe/Berlin": "Frankfurt",
            // }}
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

SystemTimezone.propTypes = {
  data: PropTypes.number,
  fieldmeta: PropTypes.shape({
    canUpdate: PropTypes.bool,
    defaultValue: PropTypes.number,
    disable: PropTypes.bool,
    info: PropTypes.string.isRequired,
    minValue: PropTypes.number,
    maxValue: PropTypes.number,
    name: PropTypes.string.isRequired,
    placeHolder: PropTypes.string.isRequired,
    required: PropTypes.bool,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    visible: PropTypes.bool,
    visibleOnCsv: PropTypes.bool,
  }),
};

SystemTimezone.defaultProps = {
  fieldmeta: {
    canUpdate: true,
    disable: false,
    displayOnCsv: true,
    visibleOnCsv: false,
    required: false,
  },
};

export default GridWrapper(SystemTimezone);
