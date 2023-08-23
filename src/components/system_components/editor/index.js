import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  DisplayEditor,
  DisplayFormControl,
  DisplayTextEditor,
} from "components/display_components/";
import { GridWrapper } from "components/wrapper_components/grid_wrapper";
import { SystemLabel } from "components/system_components/";

export const SystemEditor = (props) => {
  const {
    callbackValue,
    data,
    stateParams,
    callbackError,
    fieldError,
    testid,
  } = props;
  let fieldmeta = {
    ...SystemEditor.defaultProps.fieldmeta,
    ...props.fieldmeta,
  };
  const {
    canUpdate,
    mode,
    name,
    disable,
    placeHolder,
    required,
    skipReadMode,
    title,
    ...rest
  } = fieldmeta;
  const [editorValue, setEditorValue] = useState();
  const [errors, setErrors] = useState([]);
  const { mode: modeOpt } = stateParams;

  useEffect(() => {
    if (data) {
      if (mode === "json") {
        if (isValidJSON(JSON.stringify(data)))
          setEditorValue(JSON.stringify(data, null, 4));
        else setEditorValue(data);
      } else setEditorValue(data);
    } else {
      required ? setErrors([{ text: "Required" }]) : setErrors([]);
      setEditorValue();
    }
  }, [data, name]);

  useEffect(() => {
    if (fieldError) setErrors([{ text: fieldError }]);
  }, [fieldError]);

  useEffect(() => {
    if (canUpdate && !disable) {
      if (errors.length) callbackError(errors[0].text, props);
      else callbackError(null, props);
    }
  }, [errors]);

  const handleChange = (val) => {
    setEditorValue(val);
    if (!val) callbackValue(null, props);

    if (val) {
      if (mode === "json" && isValidJSON(val)) {
        callbackValue(JSON.parse(val), props);
      } else {
        callbackValue(val, props);
      }
    } else required ? setErrors([{ text: "Required" }]) : setErrors([]);
  };

  const handleChangeTextEditor = (data) => {
    if (!data) {
      callbackValue(null, props);
    }
    setEditorValue(data);
    callbackValue(data, props);
  };

  const isValidJSON = (str) => {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  };

  const checkReadOnly = () => {
    if (modeOpt === "READ" && !skipReadMode) return true;
    else return !canUpdate || disable;
  };
  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        width: "inherit",
      }}
    >
      <DisplayFormControl
        disabled={!canUpdate || disable}
        required={required}
        error={errors.length}
        testid={testid}
      >
        <div className="system-label">
          <SystemLabel
            toolTipMsg={rest.info}
            required={required}
            error={errors.length}
            filled={!errors.length && editorValue}
          >
            {title}
          </SystemLabel>
        </div>
        <br />
        <div className="system-component">
          {mode != "richText" && (
            <DisplayEditor
              {...rest}
              errors={errors}
              disable={checkReadOnly()}
              mode={mode}
              onChange={handleChange}
              onValidate={(errors) => {
                if (editorValue) setErrors(errors);
              }}
              placeholder={placeHolder}
              value={editorValue ? editorValue : ""}
              testid={testid}
            />
          )}
          {mode == "richText" && (
            <DisplayTextEditor
              {...rest}
              disable={checkReadOnly()}
              onChange={(data) => handleChangeTextEditor(data)}
              value={editorValue ? editorValue : ""}
              placeholder={placeHolder}
              testid={testid}
            />
          )}
        </div>
      </DisplayFormControl>
    </div>
  );
};
SystemEditor.propTypes = {
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
SystemEditor.defaultProps = {
  fieldmeta: {
    canUpdate: true,
    disable: false,
    required: false,
    maxLines: 20,
  },
  stateParams: {
    mode: "READ",
  },
};
export default GridWrapper(SystemEditor);
