import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import ReactPlayer from "react-player";
import { GridWrapper } from "components/wrapper_components/grid_wrapper";
import {
  DisplayButton,
  DisplayFormControl,
  DisplayHelperText,
  DisplayInput,
  DisplayModal,
  DisplayReadMode,
} from "../../display_components";
import { SystemLabel } from "../index";
import { SystemIcons } from "../../../utils/icons";

export const SystemVideoStream = (props) => {
  let { data, callbackValue, callbackError, fieldError, stateParams } = props;
  let fieldmeta = {
    ...SystemVideoStream.defaultProps.fieldmeta,
    ...props.fieldmeta,
  };
  let {
    canUpdate,
    defaultValue,
    disable,
    name,
    required,
    title,
    values,
    type,
    skipReadMode,
    ...others
  } = fieldmeta;

  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState();
  const [mounted, setMounted] = useState(false);
  const [value, setValue] = useState();
  const [open, setOpen] = useState(false);
  const { Close } = SystemIcons;

  const regexp = new RegExp(
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/
  );

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

  const onChange = (value) => {
    dataInit(value);
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
  }, []);

  useEffect(() => {
    mounted && dataInit(data);
  }, [data, name]);

  return (
    <>
      {stateParams.mode.toLowerCase() === "read" && !skipReadMode ? (
        <div style={{ flex: "1", display: "flex", flexDirection: "column" }}>
          <DisplayReadMode data={value ? value : "N/A"} fieldmeta={fieldmeta} />
          <div>
            <DisplayButton
              disabled={error || !value}
              onClick={() => setOpen(true)}
              style={{ float: "right" }}
            >
              {" "}
              stream video{" "}
            </DisplayButton>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flex: 1 }}>
          <DisplayFormControl
            disabled={!canUpdate || disable}
            required={required}
            error={error}
          >
            <div className="system-label">
              <SystemLabel
                required={required}
                error={error}
                filled={!error && value}
              >
                {title}
              </SystemLabel>
            </div>
            <div className="system-components">
              <div>
                <DisplayInput
                  disabled={!canUpdate || disable}
                  onChange={onChange}
                  style={{ width: "100%" }}
                  value={value ? value : ""}
                  variant="outlined"
                  placeholder="Enter the URL"
                />
                <DisplayButton
                  disabled={error || !value}
                  onClick={() => setOpen(true)}
                  style={{ float: "right" }}
                >
                  {" "}
                  stream video{" "}
                </DisplayButton>
              </div>
            </div>
            {error && (
              <div className="system-helpertext">
                <DisplayHelperText icon={SystemIcons.Info}>
                  {helperText}
                </DisplayHelperText>
              </div>
            )}
          </DisplayFormControl>
        </div>
      )}
      <DisplayModal open={open} fullwidth={true} maxwidth="sm">
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              margin: "2%",
            }}
          >
            <SystemLabel>{title}</SystemLabel>
            <span onClick={() => setOpen(false)}>
              <Close />
            </span>
          </div>
          <div>
            <ReactPlayer url={value} playing controls />
          </div>
        </div>
      </DisplayModal>
    </>
  );
};
SystemVideoStream.defaultProps = {
  fieldmeta: {
    canUpdate: true,
    required: false,
    disable: false,
  },
};
SystemVideoStream.propTypes = {
  data: PropTypes.array,
  fieldmeta: PropTypes.shape({
    name: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    canUpdate: PropTypes.bool,
    disable: PropTypes.bool,
    required: PropTypes.bool,
  }),
};

export default GridWrapper(SystemVideoStream);
