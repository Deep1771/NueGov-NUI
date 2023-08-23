import React, { useState, useEffect } from "react";
import { UserFactory } from "utils/services/factory_services";
import {
  DisplayFormControl,
  DisplayText,
  DisplayHelperText,
} from "components/display_components";
import { SystemLabel } from "../index";
import { SignModal } from "components/helper_components";
import { GridWrapper } from "components/wrapper_components/grid_wrapper";
import { SystemIcons } from "utils/icons";
import { format } from "date-fns";

export const SystemSignature = (props) => {
  const {
    callbackValue,
    data,
    fieldmeta,
    fieldError,
    callbackError,
    stateParams,
  } = props;
  const {
    canUpdate,
    info,
    disable,
    required,
    title,
    skipReadMode,
    values,
    ...others
  } = fieldmeta;
  const isReadMode = stateParams.mode.toLowerCase() == "read" && !skipReadMode;
  const { url, name, date } = data ? data : {};
  const { Info } = SystemIcons;
  const { getUserInfo } = UserFactory();
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState("Required");
  const [value, setValue] = useState({
    url: url ? url : "",
    date: date ? date : "",
    name: name ? name : "",
  });

  const onSignedValues = (url) => {
    if (url) {
      let { firstName, lastName } = getUserInfo();
      let updatedname = `${firstName ? firstName : ""} ${
        lastName ? lastName : ""
      }`;
      let value = {
        url,
        date: new Date().toISOString(),
        name: updatedname,
      };
      setValue(value);
      callbackValue(value ? value : null, props);
      clearError();
    } else {
      callbackValue(null, props);
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

  const clearError = () => {
    callbackError(null, props);
    setError(false);
    setHelperText();
  };

  useEffect(() => {
    if (value.url) clearError();
    else fieldError && showError(fieldError);
  }, [value.url]);

  return (
    <div style={{ display: "flex", width: "100%" }}>
      <DisplayFormControl required={required} disabled={!canUpdate || disable}>
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
        <SignModal
          readOnly={!canUpdate || disable || isReadMode}
          url={url}
          onChange={(url) => {
            onSignedValues(url);
          }}
          onClear={(v) => {
            v && setValue({});
            onSignedValues(null);
          }}
          testid={fieldmeta.name}
          {...others}
        />
        {value.url && (
          <div style={{ display: "flex" }}>
            <DisplayText> Name: {value.name}</DisplayText>
            {value.date && (
              <DisplayText>
                &nbsp;&nbsp; Date:{" "}
                {format(new Date(value.date), "MM/dd/yyyy HH:mm")}
              </DisplayText>
            )}
          </div>
        )}

        {error && (
          <div className="system-helpertext">
            <DisplayHelperText icon={Info}>{helperText}</DisplayHelperText>
          </div>
        )}
      </DisplayFormControl>
    </div>
  );
};

SystemSignature.defaultProps = {
  fieldmeta: {
    canUpdate: true,
    visible: false,
    disable: false,
    required: false,
    visibleOnCsv: false,
  },
};

export default GridWrapper(SystemSignature);
