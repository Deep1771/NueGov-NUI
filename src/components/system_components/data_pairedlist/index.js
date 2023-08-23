import React, { useState, useEffect, useLayoutEffect } from "react";
import PropTypes from "prop-types";
import {
  DisplayAutocomplete,
  DisplayFormControl,
  DisplayGrid,
  DisplayHelperText,
  DisplayModal,
  DisplayText,
} from "../../display_components";
import { SystemLabel } from "../index";
import { GridWrapper } from "components/wrapper_components/grid_wrapper";
import { SystemIcons } from "utils/icons";
import { entity } from "utils/services/api_services/entity_service";
import { UserFactory, GlobalFactory } from "utils/services/factory_services";
import { globalProps } from "../global-props";
import {
  ContainerWrapper,
  ToolTipWrapper,
} from "components/wrapper_components";
import { useDetailData } from "containers/composite_containers/detail_container/detail_state";
import { Button } from "@material-ui/core";
import { DetailContainer } from "containers";

export const SystemDataPairedList = (props) => {
  let { data, callbackValue, callbackError, fieldError, callFrom } = props;
  let fieldmeta = {
    ...SystemDataPairedList.defaultProps.fieldmeta,
    ...props.fieldmeta,
  };
  let {
    name,
    appName,
    moduleName,
    entityName,
    canUpdate,
    disable,
    info,
    required,
    labels,
    title,
    displayTitle,
    static_filters,
    canCreate = true,
    ...others
  } = fieldmeta;
  let { visible, visibleOnCsv, displayOnCsv, ...rest } = others;
  let params = {
    appname: appName ? appName : "NueGov",
    modulename: moduleName,
    entityname: entityName,
  };
  const [error, setError] = useState(false);
  const [fieldLabels, setFieldLabels] = useState([]);
  const [arrayValues, setArrayValues] = useState([]);
  const [arrayPath, setArrayPath] = useState([]);
  const [selected, setSelected] = useState();
  const [helperText, setHelperText] = useState("Required");
  const [readAccess, setReadAccess] = useState(false);
  const { checkReadAccess, checkWriteAccess, isNJAdmin } = UserFactory();
  const { handleSidebar } = GlobalFactory();
  const { formData } = useDetailData() || {};
  const [showModal, setShowModal] = useState(false);

  const clearError = () => {
    callbackError(null, props);
    setError(false);
    setHelperText();
  };

  const constructLabelArray = (label) => {
    if (Object.keys(label).find((key) => key === "child")) {
      let tempObj = { ...label };
      if (tempObj.child) delete tempObj.child;
      fieldLabels.push(tempObj);
      constructLabelArray(label.child);
    } else fieldLabels.push(label);
  };

  const constructPathArray = (value) => {
    setArrayPath([]);
    value &&
      Object.keys(value).find((key) => {
        fieldLabels.map((i) => i.name).includes(key) &&
          setArrayPath((arrayPath) => [...arrayPath, value[key]]);
      });
  };

  const handleFilters = () => {
    let obj = {};
    if (static_filters?.length) {
      static_filters.map(
        (f) =>
          (obj[f.name] = Array.isArray(f.value) ? f.value.join(",") : f.value)
      );
    }
    if (
      typeof fieldmeta.dynamicFilters !== "undefined" &&
      fieldmeta.dynamicFilters.length > 0
    ) {
      let { dynamicFilters } = fieldmeta;
      let { filterKey, filterPath, njFilterKey, njFilterPath, isArray } =
        dynamicFilters[0];
      let key = isNJAdmin() ? njFilterKey : filterKey;
      let value = isNJAdmin() ? njFilterPath : filterPath;
      if (key && value) {
        let pathValue = value.split(".").reduce((obj, path) => {
          return (obj || {})[path];
        }, formData);
        if (isArray) obj[key] = JSON.stringify([pathValue]);
        else obj[key] = pathValue;
        if (obj[key] === undefined) {
          obj[key] = [];
          return obj;
        } else {
          return obj;
        }
      }
    }
    return obj;
  };

  const constructValueArray = async () => {
    setArrayValues([]);
    let getData = await entity.get({
      appname: appName,
      modulename: moduleName,
      entityname: entityName,
      ...handleFilters(),
      limit: 0,
      skip: 0,
    });
    arrayPath.map((item, index) => {
      data &&
        Object.values(data)
          .map((i) => i.name)
          .includes(item.name) &&
        index < fieldLabels.length &&
        init(index, getData);
    });
  };

  const constructData = (array) => {
    array.map((item, i) => {
      let temp = { ...item };
      delete temp.name;
      let obj = removeData(i);
      setSelected((prevState) => {
        return { ...prevState, [fieldLabels[i].name]: temp };
      });
    });
  };

  const removeData = (index) => {
    let tempArray = fieldLabels.slice(index + 1).map((a) => a.name);
    let obj = { ...selected };
    tempArray.map((a) => delete obj[a]);
    return obj;
  };

  const init = async (index, value) => {
    let readAccess = checkReadAccess({
      appname: appName,
      modulename: moduleName,
      entityname: entityName,
    });
    if (readAccess) {
      index === 0 && setArrayValues([]);
      let getData;
      if (value === undefined) {
        getData = await entity.get({
          appname: appName,
          modulename: moduleName,
          entityname: entityName,
          ...handleFilters(),
          limit: 0,
          skip: 0,
        });
      } else getData = value;
      let target = [];
      getData.map((i) => {
        index > 0
          ? i.sys_entityAttributes[fieldLabels[index - 1].name] ===
              arrayPath[index - 1].text &&
            target.push({
              name: i.sys_entityAttributes[fieldLabels[index].name],
              id: i._id,
              sys_gUid: i.sys_gUid,
              sys_url: {
                filename: i["sys_entityAttributes"][fieldmeta.picture]
                  ? i["sys_entityAttributes"][fieldmeta.picture]["filename"]
                  : "",
                picturename: i["sys_entityAttributes"][fieldmeta.picture]
                  ? i["sys_entityAttributes"][fieldmeta.picture]["picturename"]
                  : "",
                url: i["sys_entityAttributes"][fieldmeta.picture]
                  ? i["sys_entityAttributes"][fieldmeta.picture]["url"]
                  : "",
              },
            })
          : target.push({
              name: i.sys_entityAttributes[fieldLabels[index].name],
              id: i._id,
              sys_gUid: i.sys_gUid,
              sys_url: {
                filename: i["sys_entityAttributes"][fieldmeta.picture]
                  ? i["sys_entityAttributes"][fieldmeta.picture]["filename"]
                  : "",
                picturename: i["sys_entityAttributes"][fieldmeta.picture]
                  ? i["sys_entityAttributes"][fieldmeta.picture]["picturename"]
                  : "",
                url: i["sys_entityAttributes"][fieldmeta.picture]
                  ? i["sys_entityAttributes"][fieldmeta.picture]["url"]
                  : "",
              },
            });
      });
      let align = [];
      align = target.reduce((m, o) => {
        let found = m.find((p) => p.name === o.name);
        if (!found) {
          m.push(o);
        }
        return m;
      }, []);
      setArrayValues((arrayValues) => [...arrayValues, align]);
    } else {
      setReadAccess(true);
    }
  };

  const showError = (msg) => {
    callbackError(msg, props);
    setError(true);
    setHelperText(msg);
  };

  const onChange = (event, value, props) => {
    let index = props.labelIndex;
    if (value !== null) {
      if (!arrayValues.map((i) => i.name).includes(value.name)) {
        arrayPath.splice(index, arrayPath.length, {
          text: value.name,
          ...value,
        });
        arrayValues.splice(index + 1);
        constructData(arrayPath);
        index + 1 < fieldLabels.length && init(index + 1);
      }
    } else {
      arrayValues.splice(index + 1);
      arrayPath.splice(index, arrayPath.length);
      setSelected(removeData(index - 1));
    }
  };

  const validateData = (data) => {
    if (data) {
      if (Object.values(data).length) {
        if (required) {
          arrayValues.length !== arrayPath.length
            ? showError("Required")
            : clearError();
        } else {
          fieldLabels.length === Object.keys(data).length ||
          Object.keys(data).length == 0
            ? clearError()
            : showError("Select the data");
        }
      } else {
        required ? showError("Required") : clearError();
      }
    } else {
      required ? showError("Required") : clearError();
    }
  };

  const handleSave = (e) => {
    const fieldNames = fieldLabels.map((field) => {
      return { name: field.name };
    });
    let tempArr = [];
    fieldNames.forEach((field) => {
      let tempObj = {};
      tempObj["name"] = e.ops[0].sys_entityAttributes[field.name];
      tempObj["text"] = e.ops[0].sys_entityAttributes[field.name];
      tempObj["id"] = e.ops[0]._id;
      tempObj["sys_gUid"] = e.ops[0].sys_gUid;
      tempArr.push(tempObj);
    });
    arrayValues[0].push(tempArr[0]);
    onChange({}, tempArr[0], { labelIndex: 0 });
    onChange({}, tempArr[1], { labelIndex: 1 });
    setShowModal(false);
    handleSidebar("0px");
  };

  useEffect(() => {
    if (fieldError) showError(fieldError);
    constructLabelArray(labels);
  }, []);

  useEffect(() => {
    if (fieldError) showError(fieldError);
    setSelected(data);
    callbackValue(data && Object.keys(data).length ? data : null, props);
  }, [data]);

  useEffect(() => {
    validateData(selected);
    callbackValue(
      selected && Object.values(selected).length ? selected : null,
      props
    );
    data &&
      arrayPath.length > 0 &&
      arrayPath.length !== fieldLabels.length &&
      arrayPath.length === arrayValues.length &&
      init(arrayPath.length);
  }, [selected, arrayValues, arrayPath]);

  useEffect(() => {
    constructPathArray(data);
    !data && init(0);
  }, [fieldLabels, name]);

  useLayoutEffect(() => {
    constructValueArray();
  }, [arrayPath]);

  const buttonOption = (
    <Button
      key="create"
      onClick={(e) => {
        setShowModal(true);
        e.stopPropagation();
      }}
      disabled={disable || !checkWriteAccess(params) || !canUpdate}
      size="small"
      color="primary"
      variant="outlined"
    >
      Create
    </Button>
  );

  return (
    <div
      style={{
        display: "flex",
        flex: "1",
        flexDirection: "column",
        width: "100%",
      }}
    >
      <DisplayFormControl required={required} disabled={!canUpdate || disable}>
        {title && displayTitle && (
          <div className="system-label">
            <SystemLabel
              toolTipMsg={info}
              required={required}
              error={error}
              filled={!error && selected && Object.keys(selected).length}
            >
              {title}
            </SystemLabel>
          </div>
        )}
        <div
          className="system-components"
          style={{ flexDirection: "row", columnGap: "1%" }}
        >
          {fieldLabels.map((item, i) => {
            let items = arrayValues[i];
            let dflag = items ? !items.length : true;
            return (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "50%",
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
                    {item.title}
                  </DisplayText>
                  &nbsp;&nbsp;
                  {error && (
                    <DisplayHelperText icon={SystemIcons.Error}>
                      ({helperText})
                    </DisplayHelperText>
                  )}
                </div>
                <DisplayAutocomplete
                  key={i}
                  hiddenLabel={true}
                  labelIndex={i}
                  name={i}
                  options={items ? items : []}
                  value={{ name: arrayPath[i] && arrayPath[i].text }}
                  // label={item.title}
                  placeholder={item.placeHolder}
                  labelKey={"name"}
                  canCreate={canCreate}
                  selectedKey={null}
                  callFrom={callFrom}
                  renderOption={(option) => {
                    if (option?.key == "create") {
                      return buttonOption;
                    } else
                      return (
                        <div style={{ display: "flex" }}>
                          <span style={{ flex: 9 }}>{option.name} </span>
                          {option?.sys_url?.url && (
                            <img
                              src={option.sys_url.url}
                              alt={"No Image"}
                              width="40%"
                              height="20%"
                              style={{
                                flex: 2,
                                objectFit: "contain",
                                border: "solid 1px",
                              }}
                            />
                          )}
                        </div>
                      );
                  }}
                  disabled={!canUpdate || disable || readAccess}
                  required={required && !dflag}
                  onChange={(event, value, props) => {
                    onChange(event, value, props);
                  }}
                  InputProps={{ ...globalProps.InputProps }}
                  variant="outlined"
                  {...rest}
                />
              </div>
            );
          })}
        </div>
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
      </DisplayFormControl>

      <DisplayModal open={showModal} fullWidth={true} maxWidth="xl">
        <div
          style={{
            height: "85vh",
            width: "100%",
            display: "flex",
            flex: 1,
          }}
          id="display-modal"
        >
          <ContainerWrapper>
            <div style={{ height: "98%", width: "98%", padding: "1%" }}>
              <DetailContainer
                appname={appName ? appName : "NueGov"}
                modulename={moduleName}
                groupname={entityName}
                mode="new"
                options={{
                  hideTitleBar: true,
                }}
                saveCallback={(e) => handleSave(e)}
                onClose={(e) => setShowModal(false)}
                detailMode="REFERENCE"
              />
            </div>
          </ContainerWrapper>
        </div>
      </DisplayModal>
    </div>
  );
};

SystemDataPairedList.defaultProps = {
  fieldmeta: {
    canUpdate: true,
    visible: false,
    disable: false,
    required: false,
    visibleOnCsv: false,
    displayOnCsv: true,
  },
};

SystemDataPairedList.propTypes = {
  data: PropTypes.object,
  fieldmeta: PropTypes.shape({
    name: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    info: PropTypes.string.isRequired,
    labels: PropTypes.object.isRequired,
    values: PropTypes.array.isRequired,
    visible: PropTypes.bool,
    canUpdate: PropTypes.bool,
    disable: PropTypes.bool,
    required: PropTypes.bool,
    visibleOnCsv: PropTypes.bool,
  }),
};

export default GridWrapper(SystemDataPairedList);
