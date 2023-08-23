import React, { useEffect, useState } from "react";
import { entityTemplate } from "utils/services/api_services/template_service";
import { UserFactory } from "utils/services/factory_services";
import {
  DisplayFormControl,
  DisplayHelperText,
  DisplaySelect,
} from "components/display_components";
import { SystemLabel } from "components/system_components/";
import { GridWrapper } from "components/wrapper_components/grid_wrapper";
import { SystemIcons } from "utils/icons";

export const SystemDirectivePicker = (props) => {
  const {
    callbackError,
    callbackValue,
    data,
    fieldError,
    fieldmeta,
    formData,
  } = props;
  const {
    canUpdate,
    directiveType,
    disable,
    info,
    placeHolder,
    required,
    title,
  } = fieldmeta;
  const sys_templateName =
    formData.sys_entityAttributes?.entityTemplate?.sys_templateName;

  const { getAppModuleFromTemplate, isNJAdmin } = UserFactory();

  const [error, setError] = useState(false);
  const [fields, setFields] = useState([]);
  const [helperText, setHelperText] = useState();
  const [value, setValue] = useState("");

  let selectedId = value ? `${value.componentName || ""}-${value.name}` : "";

  const dataInit = (data) => {
    setValue(data ? data : "");
    callbackValue(data ? data : null, props);
    required && !data ? showError("Required") : clearError();
  };

  const fetchFields = async (sys_templateName) => {
    let params;
    if (isNJAdmin()) {
      params = {
        appname: "NJAdmin",
        modulename: "NJ-System",
      };
    } else {
      let { appObj, moduleObj } =
        getAppModuleFromTemplate(sys_templateName) || {};
      params = {
        appname: appObj.name,
        modulename: moduleObj.name,
      };
    }

    let metadata = await entityTemplate.get({
      ...params,
      templatename: sys_templateName,
    });

    let sys_components =
      metadata?.sys_entityAttributes?.sys_components || undefined;
    let sys_topLevel =
      metadata?.sys_entityAttributes?.sys_topLevel || undefined;

    let topLevelFields =
      sys_topLevel?.reduce((arr, item) => {
        if (directiveType.includes(item.type)) {
          arr.push({
            id: `-${item.name}`,
            name: item.name,
            title: item.title,
            level: "TOPLEVEL",
            type: item.type,
          });
        }
        return arr;
      }, []) || [];

    let componentLevelFields =
      sys_components?.[0]?.componentList?.reduce((arr, item) => {
        item.sys_entityAttributes.map((esa) => {
          if (directiveType.includes(esa.type)) {
            arr.push({
              id: `${item.name}-${esa.name}`,
              name: esa.name,
              title: esa.title,
              level: "COMPONENTLEVEL",
              componentName: item.name,
              type: esa.type,
            });
          }
        });
        return arr;
      }, []) || [];

    let allFields = [...topLevelFields, ...componentLevelFields];
    setFields(allFields);
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

  const onChange = (val) => {
    let valueObj = fields?.find((obj) => obj.id === val);
    let { id, ...dataObj } = valueObj || {};
    dataInit(Object.keys(dataObj).length ? dataObj : undefined);
  };

  useEffect(() => {
    if (fieldError) showError(fieldError);
    dataInit(data ? data : undefined);
    fetchFields(sys_templateName);
  }, []);

  return (
    <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
      <DisplayFormControl required={required} error={error}>
        <div className="system-component">
          <DisplaySelect
            label={title}
            disabled={!canUpdate || disable}
            labelKey="title"
            placeHolder={placeHolder}
            required={required}
            error={error}
            filled={!error && value}
            valueKey="id"
            values={fields}
            onChange={onChange}
            value={selectedId}
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

export default GridWrapper(SystemDirectivePicker);
