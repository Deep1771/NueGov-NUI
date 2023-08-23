import React, { useState, useEffect } from "react";
import {
  DisplaySelect,
  DisplayHelperText,
  DisplayFormControl,
} from "components/display_components";
import PropTypes from "prop-types";
import { GridWrapper } from "components/wrapper_components/grid_wrapper";
import { SystemIcons } from "utils/icons";
import { SystemLabel } from "components/system_components/";
import { useStateValue } from "utils/store/contexts";

export const SystemEventPicker = (props) => {
  const [{ userState }] = useStateValue();
  const { callbackValue, data, fieldmeta, callbackError, fieldError } = props;
  const {
    canUpdate,
    disable,
    defaultValue,
    info,
    multiSelect,
    name,
    placeHolder,
    required,
    title,
  } = fieldmeta;
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState();
  const [mounted, setMounted] = useState(false);
  const [values, setValues] = useState([]);
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(data?.groupName);
  }, [data]);

  let getEventTypeEntities = () => {
    try {
      let { appStructure } = userState.userData;
      let entityList = appStructure
        .map((app, index) => {
          let app_entity = app.modules
            .map((module, mIndex) => {
              let entity = module.entities
                .map((entity, eIndex) => {
                  if (entity.access.isCalendar && entity.access.write) {
                    let finalEntity = {
                      ...entity,
                      app: app.name,
                      module: module.name,
                    };
                    return finalEntity;
                  } else return;
                })
                .filter((item) => item != undefined);
              if (entity.length) return entity;
              else return;
            })
            .filter((item) => item != undefined);
          if (app_entity.length) return app_entity;
          else return;
        })
        .filter((item) => item != undefined);
      setValues(entityList.flat(Infinity));
    } catch (e) {
      return [];
    }
  };

  const getEventTypeObject = (name) => {
    let eIndex = values
      .map((event) => {
        return event.groupName;
      })
      .indexOf(name);
    if (eIndex != -1) return values[eIndex];
    else return {};
  };

  const dataInit = (data) => {
    setValue(data ? data : "");
    callbackValue(data ? getEventTypeObject(data) : null, props);
    data ? clearError() : showError("Required");
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

  const clearError = () => {
    callbackError(null, props);
    setError(false);
    setHelperText();
  };

  useEffect(() => {
    if (fieldError) showError(fieldError);
    getEventTypeEntities();
    setMounted(true);
  }, []);

  return (
    <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
      <DisplayFormControl required={required} error={error}>
        <div className="system-component">
          <DisplaySelect
            label={title}
            disabled={!canUpdate || disable}
            labelKey="friendlyName"
            placeHolder={placeHolder}
            required={required}
            error={error}
            filled={!error && value}
            valueKey="groupName"
            values={values}
            onChange={onChange}
            value={value}
            variant="outlined"
          />
        </div>
        <div className="system-helpertext">
          {error && (
            <DisplayHelperText icon={SystemIcons.Error}>
              {helperText}
            </DisplayHelperText>
          )}
        </div>
      </DisplayFormControl>
    </div>
  );
};

SystemEventPicker.propTypes = {
  value: PropTypes.string,
  fieldmeta: PropTypes.shape({
    disable: PropTypes.bool,
    info: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    multiSelect: PropTypes.bool,
    placeHolder: PropTypes.string.isRequired,
    required: PropTypes.bool,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    visible: PropTypes.bool,
    visibleOnCsv: PropTypes.bool,
  }),
};
SystemEventPicker.defaultProps = {
  fieldmeta: {
    canUpdate: true,
    disable: false,
    displayOnCsv: true,
    visibleOnCsv: false,
    required: false,
  },
};

export default GridWrapper(SystemEventPicker);
