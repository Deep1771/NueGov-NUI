import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { TextField } from "@material-ui/core";
import debounce from "lodash/debounce";
import { format } from "date-fns";
import PropTypes from "prop-types";
import { entity } from "utils/services/api_services/entity_service";
import { entityTemplate } from "utils/services/api_services/template_service";
import { UserFactory, GlobalFactory } from "utils/services/factory_services";
import { textExtractor } from "utils/services/helper_services/system_methods";
import { isDefined, get } from "utils/services/helper_services/object_methods";
import { ContextMenuWrapper } from "components/wrapper_components/context_menu/";
import { ContainerWrapper } from "components/wrapper_components";
import { ContextSummary } from "containers/composite_containers/summary_container/components/context_summary";
import { DetailContainer } from "containers/composite_containers/detail_container/";
import {
  DisplayDialog,
  DisplayFormControl,
  DisplayIconButton,
  DisplayHelperText,
  DisplayModal,
  DisplayAutocomplete,
} from "../../display_components/";
import { GridWrapper } from "components/wrapper_components";
import { SystemIcons } from "utils/icons";

import { useDetailData } from "../../../containers/composite_containers/detail_container/detail_state";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  control: {
    padding: theme.spacing(2),
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
}));

export const SystemReference = (props) => {
  const {
    callbackError,
    callbackValue,
    fieldError,
    fieldmeta,
    data,
    stateParams,
    showLabel,
    testid,
    showButtons,
  } = props;
  const {
    appName,
    canUpdate,
    disable,
    displayFields,
    moduleName,
    multiSelect = false,
    name,
    entityName,
    required,
    static_filters = {},
    filters = {},
    title,
    ...rest
  } = { ...fieldmeta };
  const classes = useStyles();
  const { mode, appname, modulename, groupname } = stateParams;
  const [predictions, setPredictions] = useState([]);
  const [modal, setModal] = useState(false);
  const [modeType, setModeType] = useState(stateParams.mode);
  const [readId, setReadId] = useState("");
  const [open, setOpen] = useState(false);
  const { Add, Visibility, Search } = SystemIcons;
  const { checkWriteAccess, isNJAdmin } = UserFactory();
  const [context, setContext] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState();
  const [contextOptions, setContextOptions] = useState({});
  const [multipleValue, setMultipleValue] = useState([]);
  const [referenceMeta, setReferenceMeta] = useState();
  const [selectedData, setSelectedData] = useState(true);
  const [showDetail, setDetail] = useState(false);
  const [value, setValue] = useState();
  const { formData } = useDetailData() || {};

  const queryParams = {
    appname: appName ? appName : "NueGov",
    modulename: moduleName,
    entityname: entityName,
    ...filters,
  };

  const entityPermision = checkWriteAccess({ ...queryParams });

  const clearError = () => {
    callbackError(null, props);
    setError(false);
    setHelperText();
  };

  const extractValue = (selectedData, fieldDefinition, fieldName) => {
    switch (fieldDefinition.type) {
      case "AUTOFILL": {
        return selectedData.sys_entityAttributes["geoJSONLatLong"]
          ? selectedData.sys_entityAttributes["geoJSONLatLong"][fieldName]
          : "";
      }
      case "DATE": {
        let dateReference =
          selectedData.sys_entityAttributes[fieldDefinition.name];
        return dateReference
          ? format(new Date(dateReference), fieldDefinition.format)
          : "--/--/----";
      }
      case "DATETIME": {
        let dateReference =
          selectedData.sys_entityAttributes[fieldDefinition.name];
        return dateReference
          ? format(new Date(dateReference), fieldDefinition.format)
          : "--/--/----";
      }
      case "DATERANGE": {
        let dateReference =
          selectedData.sys_entityAttributes[fieldDefinition.name];
        let dateFormat = fieldDefinition.format
          ? fieldDefinition.format
          : fieldDefinition.setTime
          ? "MM/dd/yyyy HH:mm"
          : "MM/dd/yyyy";
        let startDate =
          dateReference && dateReference.startDate
            ? format(new Date(dateReference.startDate), dateFormat)
            : fieldDefinition.setTime
            ? "--/--/---- --:--"
            : "--/--/----";
        let endDate =
          dateReference && dateReference.endDate
            ? format(new Date(dateReference.endDate), dateFormat)
            : fieldDefinition.setTime
            ? "--/--/---- --:--"
            : "--/--/----";
        return dateReference ? startDate + " to " + endDate : "--/--/----";
      }
      case "DECIMAL":
      case "NUMBER": {
        if (selectedData.sys_entityAttributes[fieldDefinition.name])
          return selectedData.sys_entityAttributes[
            fieldDefinition.name
          ].toString();
        else return "";
      }
      case "PAIREDLIST": {
        let pairedReference;
        if (
          selectedData.sys_entityAttributes[fieldDefinition.name] &&
          Object.keys(selectedData.sys_entityAttributes[fieldDefinition.name])
            .length
        )
          Object.values(
            selectedData.sys_entityAttributes[fieldDefinition.name]
          ).map((item) => {
            pairedReference = pairedReference
              ? `${pairedReference} / ${item.id}`
              : item.id;
          });
        return pairedReference;
      }
      case "REFERENCE": {
        if (selectedData.sys_entityAttributes[fieldDefinition.name])
          return selectedData.sys_entityAttributes[fieldDefinition.name][
            fieldName
          ];
        else return;
      }
      default: {
        if (
          [
            "DATE",
            "DATETIME",
            "DATERANGE",
            "PAIREDLIST",
            "CHECKBOX",
            "LIST",
            "CURRENCY",
          ].includes(fieldDefinition.type)
        )
          return textExtractor(
            selectedData.sys_entityAttributes[fieldDefinition.name],
            fieldDefinition
          );
        else return selectedData.sys_entityAttributes[fieldName];
      }
    }
  };

  const getReferencePredictions = async (val) => {
    let reqObj = {
      ...queryParams,
      skip: 0,
      limit: 20,
    };

    //adding static filters
    if (static_filters && static_filters.length) {
      static_filters.map(
        (f) =>
          (reqObj[f.name] = Array.isArray(f.value)
            ? f.value.join(",")
            : f.value)
      );
    }

    if (val && val.hasOwnProperty("globalsearch")) {
      reqObj = { ...reqObj, ...val };
    }

    await entity
      .get(reqObj)
      .then((result) => {
        let fields = displayFields.map((f, idx) => {
          let fieldName =
            f.name.split(".").length > 1
              ? f.name.split(".")[f.name.split(".").length - 1]
              : f.name;
          return fieldName;
        });

        if (result.length) {
          result = result.map((item) => {
            let displayKeys = {};
            let fields = displayFields?.map((item1) => {
              if (
                [
                  "DATE",
                  "DATETIME",
                  "DATERANGE",
                  // "PAIREDLIST",
                  "CHECKBOX",
                  "LIST",
                  "CURRENCY",
                  "PHONENUMBER",
                ].includes(item1.type)
              )
                displayKeys[item1.name] = textExtractor(
                  item["sys_entityAttributes"][item1.name],
                  item1
                );
              else if (item1.type === "AUTOFILL") {
                let displayName =
                  item1.name.split(".")[item1.name.split(".").length - 1];
                displayKeys[displayName] = item["sys_entityAttributes"][
                  "geoJSONLatLong"
                ]
                  ? item["sys_entityAttributes"]["geoJSONLatLong"][displayName]
                  : "";
              } else {
                if (item1.name.split(".").length > 1) {
                  let fieldName = item1.name.split(".")[0];
                  let displayName =
                    item1.name.split(".")[item1.name.split(".").length - 1];
                  displayKeys[displayName] = item["sys_entityAttributes"][
                    fieldName
                  ]
                    ? item["sys_entityAttributes"][fieldName][displayName]
                    : "";
                } else
                  displayKeys[item1.name] =
                    item["sys_entityAttributes"][item1.name];
              }
            });

            return {
              id: item._id,
              sys_gUid: item.sys_gUid,
              ...displayKeys,
            };
          });

          if (displayFields.length === 1) {
            let refField;
            if (displayFields[0].name.includes("."))
              refField =
                displayFields[0].name.split(".")[
                  displayFields[0].name.split(".").length - 1
                ];
            else refField = displayFields[0].name;
            result = result.filter(
              (value) =>
                value[refField] !== "" &&
                value[refField] !== null &&
                value[refField] !== undefined
            );
            setPredictions(result);
          } else {
            setPredictions(result);
          }
        }
      })
      .catch((err) => {
        console.log(err);
        setPredictions([]);
      });
  };

  const getRefValue = () => {
    if (Array.isArray(value)) {
      return value;
    } else if (isDefined(value) && typeof value === "object") {
      if (Object.keys(value)?.length) {
        return value;
      } else return null;
    } else {
      return multiSelect ? [] : null;
    }
  };

  const handleCancel = (value) => {
    setContext(false);
    if (value.data.length > 0) {
      !multiSelect
        ? setSelectedData(value.data[0])
        : setSelectedData(value.data);
      setReferenceMeta(value.entityTemplate);
    } else {
      setSelectedData({});
      showError(fieldError);
    }
  };

  const handleChipClick = (data) => {
    setModeType("read");
    setReadId(data.id);
    setModal(true);
  };

  const handleFilters = () => {
    let obj = {};
    if (static_filters && static_filters.length) {
      static_filters.map((f) => (obj[f.name] = f.value));
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

  const handlePermission = () => {
    setContext(false);
    setDialog(true);
  };
  const handleSaveData = async (response) => {
    try {
      let template = await entityTemplate.get({
        appname: appName ? appName : "NueGov",
        modulename: moduleName,
        groupname: entityName,
      });
      setReferenceMeta(template);
      setSelectedData(!multiSelect ? response.ops[0] : [response.ops[0]]);
      setModal(false);
    } catch (e) {
      console.log("Error reported in handle save data reference");
    }
  };

  let handleSelectChange = (val) => {
    if (multiSelect)
      if (val && val.length) setValue(val);
      else setValue();
    else {
      if (val && Object.keys(val).length) setValue(val);
      else setValue();
    }
  };

  const onChangeHandle = (val) => {
    searchAPIDebounced({ globalsearch: val });
  };

  const openDetailPageView = (val) => {
    let { mode, id } = val || {};
    setModeType(mode);
    setReadId(id);
    setModal(true);
  };

  const openContextMenu = (options) => {
    setContext(true);
    setContextOptions(options);
  };

  const showError = (msg) => {
    if (canUpdate && !disable && msg) {
      callbackError(msg, props);
      setError(true);
      setHelperText(msg);
    }
  };

  //this should be after the getReferencePredictions function
  const searchAPIDebounced = debounce(getReferencePredictions, 500);

  useEffect(() => {
    callbackValue(value ? value : null, props);
  }, [value]);

  useEffect(() => {
    if (fieldError) showError(fieldError);
  }, [fieldError]);

  useEffect(() => {
    let newData;
    if (data && Array.isArray(data))
      newData = data.filter((value) => Object.keys(value).length !== 0);
    else
      newData =
        data && Object.values(data).filter((e) => e).length ? data : null;
    if (newData) {
      if (multiSelect) {
        if (Array.isArray(newData)) setValue(newData);
        else setValue([]);
      } else {
        if (
          Object.keys(newData).filter((e) => e !== "id" && e !== "sys_gUid")
            .length
        )
          clearError();
        if (Object.keys(newData).length) {
          setValue(newData);
        } else setValue({});
      }
    }
  }, [data, name]);

  useEffect(() => {
    if (Object.keys(selectedData).length > 0) {
      if (multiSelect) {
        let multiReferences = [];
        let definition = { ...fieldmeta };
        selectedData &&
          selectedData.map((item) => {
            let referenceValue = {
              id: item._id,
              sys_gUid: item.sys_gUid,
            };
            definition.displayFields.map((item1) => {
              if (item1?.name.split(".").length > 1) {
                let name = item1.name.split(".")[0];
                let fieldName =
                  item1.name.split(".")[item1.name.split(".").length - 1];
                referenceValue[fieldName] =
                  item["sys_entityAttributes"][name][fieldName];
              } else
                referenceValue[item1.name] =
                  item["sys_entityAttributes"][item1.name];
            });
            multiReferences.push(referenceValue);
          });
        let uniqueField = Object.assign(
          {},
          definition.displayFields.find((e) => e.unique)
        );
        if (Object.keys(uniqueField).length) {
          uniqueField["name"] =
            uniqueField?.name.split(".")[
              uniqueField.name.split(".").length - 1
            ];
          multiReferences = multiReferences.filter((item, index, array) => {
            return (
              index ===
              array.findIndex(
                (e) => e[uniqueField.name] === item[uniqueField.name]
              )
            );
          });
        }

        setValue((prevValue) => {
          if (Array.isArray(prevValue)) prevValue = prevValue;
          else prevValue = [];
          let ids = new Set(prevValue.map((d) => d.id));
          var finalMultiArray = [
            ...prevValue,
            ...multiReferences.filter((d) => !ids.has(d.id)),
          ];
          return finalMultiArray;
        });
        clearError();
      } else {
        let finalReference = {};
        finalReference["id"] = selectedData["_id"];
        finalReference["sys_gUid"] = selectedData["sys_gUid"];
        displayFields.map((item) => {
          let fieldDefinition;
          if (item?.type === "AUTOFILL") fieldDefinition = item;
          else
            fieldDefinition =
              referenceMeta?.sys_entityAttributes?.sys_topLevel.find(
                (f) => f.name === item.name.split(".")[0]
              );
          let fieldName = item.name.split(".")[item.name.split(".").length - 1];
          let extracetdValue = fieldDefinition
            ? extractValue(selectedData, fieldDefinition, fieldName)
            : "";
          finalReference[fieldName] = extracetdValue;
        });
        setValue((prevValue, props) => {
          return {
            ...prevValue,
            ...finalReference,
          };
        });
        clearError();
      }
    }
  }, [selectedData]);

  useEffect(() => {
    if (!multiSelect) {
      if (value && Object.keys(value).length) clearError();
      else {
        if (required) showError("Required");
      }
    } else {
      if (value?.length) clearError();
      else {
        if (required) showError("Required");
      }
    }
  }, [value]);

  return (
    <div style={{ display: "flex", width: "100%", flexDirection: "column" }}>
      <DisplayFormControl
        disabled={!canUpdate || disable}
        required={required}
        error={error}
        testid={testid}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
          }}
        >
          <DisplayAutocomplete
            style={{
              display: "flex",
              flex: "1 0 230px",
            }}
            disabled={stateParams.mode === "read" || disable || !canUpdate}
            multiple={multiSelect}
            limitTags={3}
            id="combo-box-demo"
            options={predictions}
            selectedKey={null}
            renderInput={(params) => (
              <TextField
                {...params}
                label={title}
                variant="outlined"
                onClick={getReferencePredictions}
                onChange={(ev) => {
                  if (ev.target.value !== "" || ev.target.value !== null) {
                    onChangeHandle(ev.target.value);
                  }
                }}
                error={error}
              />
            )}
            ChipProps={{
              clickable: true,
              onClick: (chipData) => handleChipClick(chipData),
            }}
            labelKey={displayFields?.map((ef) => ef.name)}
            getOptionLabel={(predictions) => {
              let fields = displayFields
                .map((f, idx) => {
                  if (f.type === "PAIREDLIST") {
                    return f.fields.map((e) => `${f.name}.${e}.id`);
                  }
                  let fieldName =
                    f.name.split(".").length > 1
                      ? f.name.split(".")[f.name.split(".").length - 1]
                      : f.name;
                  return fieldName;
                })
                .flat();
              if (Object.keys(predictions).length) {
                return fields
                  .map((el) => get(predictions, el))
                  .filter((e) => e)
                  .join(" | ");
              } else {
                return "";
              }
            }}
            getOptionDisabled={(predictions) => {
              if (multiSelect) {
                return value?.some(
                  (fl) => fl.sys_gUid === predictions?.sys_gUid
                );
              } else {
                return value?.sys_gUid === predictions?.sys_gUid;
              }
            }}
            value={getRefValue()}
            onChange={(e, value) => handleSelectChange(value)}
            defaultValue={multiSelect ? [] : null}
            onOpen={() => {
              setOpen(true);
            }}
            onClose={() => {
              setOpen(false);
            }}
            open={open}
          />
          {mode != "READ" && (
            <DisplayIconButton
              systemVariant="primary"
              size="small"
              disabled={false}
              onClick={() =>
                multiSelect
                  ? openContextMenu({
                      select: "multiple",
                      selectedIds: multipleValue,
                    })
                  : openContextMenu({})
              }
            >
              <Search />
            </DisplayIconButton>
          )}
          {entityPermision && mode !== "READ" && (
            <DisplayIconButton
              systemVariant="primary"
              size="small"
              disabled={false}
              onClick={() => openDetailPageView({ mode: "new" })}
            >
              <Add />
            </DisplayIconButton>
          )}
          {!multiSelect && entityPermision && (
            <DisplayIconButton
              systemVariant="primary"
              size="small"
              disabled={
                isDefined(value) &&
                typeof value === "object" &&
                Object.keys(value)?.length
                  ? false
                  : true
              }
              onClick={() =>
                openDetailPageView({
                  mode: "read",
                  id:
                    isDefined(value) &&
                    typeof value === "object" &&
                    Object.keys(value)?.length
                      ? value.id
                      : "",
                })
              }
            >
              <Visibility />
            </DisplayIconButton>
          )}
          {
            <ContextMenuWrapper
              options={{
                hideTitlebar: true,
              }}
              onClose={() => {
                setDetail(false);
              }}
              title={
                <div style={{ margin: "1%", color: "#3f51b5" }}>
                  {`${entityName} detail`}{" "}
                </div>
              }
              visible={context ? context : false}
              width="30%"
            >
              {context && (
                <ContextSummary
                  appName={appName ? appName : "NueGov"}
                  moduleName={moduleName}
                  entityName={entityName}
                  summaryMode="context_summary"
                  handleCancel={handleCancel}
                  options={contextOptions}
                  permissionCheck={handlePermission}
                  filters={handleFilters()}
                />
              )}
            </ContextMenuWrapper>
          }
          {
            <DisplayModal open={modal} fullWidth={true} maxWidth="xl">
              <div
                style={{
                  height: "85vh",
                  width: "100%",
                  display: "flex",
                  flex: 1,
                }}
              >
                <ContainerWrapper>
                  <div style={{ height: "98%", width: "98%", padding: "1%" }}>
                    <DetailContainer
                      appname={appName ? appName : "NueGov"}
                      modulename={moduleName}
                      groupname={entityName}
                      mode={modeType}
                      options={{
                        hideTitleBar: true,
                      }}
                      id={readId}
                      saveCallback={handleSaveData}
                      onClose={(e) => setModal(false)}
                      detailMode="REFERENCE"
                    />
                  </div>
                </ContainerWrapper>
              </div>
            </DisplayModal>
          }
        </div>
        {error && (
          <div className="system-helpertext">
            <DisplayHelperText icon={SystemIcons.Info}>
              {helperText}
            </DisplayHelperText>
          </div>
        )}
        <DisplayDialog
          open={dialog}
          title={`You don't have permission to access ${entityName} data`}
          message="Get the access and try again"
          onCancel={() => setDialog(false)}
        />
      </DisplayFormControl>
    </div>
  );
};

SystemReference.defaultProps = {
  showLabel: true,
  showButtons: true,
};

SystemReference.propTypes = {
  data: PropTypes.any,
  fieldmeta: PropTypes.shape({
    disable: PropTypes.bool,
    info: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    placeHolder: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    moduleName: PropTypes.string.isRequired,
    entityName: PropTypes.string.isRequired,
    displayFields: PropTypes.array.isRequired,
    type: PropTypes.string.isRequired,
    visibleOnCsv: PropTypes.bool,
  }),
};

export default GridWrapper(SystemReference);
