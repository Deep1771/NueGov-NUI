import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import AwesomeDebouncePromise from "awesome-debounce-promise";
import { format } from "date-fns";
import PropTypes from "prop-types";
import { getEntityData } from "../permission/permission_services";
import { entity } from "utils/services/api_services/entity_service";
import { entityTemplate } from "utils/services/api_services/template_service";
import { UserFactory, GlobalFactory } from "utils/services/factory_services";
import { textExtractor } from "utils/services/helper_services/system_methods";
import { ContextMenuWrapper } from "components/wrapper_components/context_menu/";
import { ContainerWrapper } from "components/wrapper_components";
import { ContextSummary } from "containers/composite_containers/summary_container/components/context_summary";
import { DetailContainer } from "containers/composite_containers/detail_container/";
import {
  DisplayButton,
  DisplayDialog,
  DisplayFormControl,
  DisplayGrid,
  DisplayIconButton,
  DisplayHelperText,
  DisplayModal,
  DisplayText,
} from "../../display_components";
import { GridWrapper, ToolTipWrapper } from "components/wrapper_components";
import { SystemLabel } from "../index";
import { SystemIcons } from "utils/icons";
import { ScannerModal } from "components/extension_components";
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
    multiSelect,
    name,
    entityName,
    required,
    static_filters,
    title,
    ...rest
  } = { ...fieldmeta };
  const classes = useStyles();
  const { mode, appname, modulename, groupname } = stateParams;
  const { checkReadAccess, checkWriteAccess, isNJAdmin } = UserFactory();
  const [context, setContext] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState();
  const [multipleSelected, setMultipleSelected] = useState();
  const [multipleValue, setMultipleValue] = useState([]);
  const [options, setOptions] = useState([]);
  const [referenceMeta, setReferenceMeta] = useState();
  const [selectedData, setSelectedData] = useState(true);
  const [showDetail, setDetail] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [value, setValue] = useState({});
  const [scanner, setScanner] = useState(false);
  const [scanButton, setScanButton] = useState(false);
  const [openDialog, setOpenDialog] = useState({ dialog: false });
  const { Delete, Visibility } = SystemIcons;
  const { formData } = useDetailData() || {};
  const { setSnackBar } = GlobalFactory();

  let params = {
    appname: appName ? appName : "NueGov",
    modulename: moduleName,
    entityname: entityName,
  };

  let templateParams = {
    appname: appName ? appName : "NueGov",
    modulename: moduleName,
    groupname: entityName,
  };

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

  const handleCancel = (value) => {
    setContext(false);
    if (value.data.length > 0) {
      !multiSelect
        ? setSelectedData(value.data[0])
        : setSelectedData(value.data);
      setReferenceMeta(value.entityTemplate);
    } else {
      setSelectedData({});
      if (multipleValue.length) setMultipleValue([]);
      showError(fieldError);
    }
  };

  const handleChange = async (e, params) => {
    if (params.input === "input") {
      let result = await searchAPIDebounced(params.fieldName, e.target.value);
      if (result.length) {
        result = result.map((item) => {
          let displayKeys = {};
          displayFields.map((item1) => {
            if (
              [
                "DATE",
                "DATETIME",
                "DATERANGE",
                "PAIREDLIST",
                "CHECKBOX",
                "LIST",
                "CURRENCY",
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

          setOptions(result);
        } else setOptions(result);
      } else setOptions([]);
    }
    if (params.input === "clear")
      setValue((prevValue) => {
        delete prevValue[params.fieldName];
        Object.keys(prevValue).map((item) =>
          prevValue[item] === undefined ? delete prevValue[item] : {}
        );
        if (Object.keys(prevValue).length === 2) return {};
        else
          return {
            ...prevValue,
          };
      });
  };

  const handleClear = (e, params) => {
    if (!multiSelect) setValue({});
    else {
      let referenceValues = [...multipleValue];
      if (params.type === "id") {
        let index = multipleValue.findIndex((e) => e.id === params.item.id);
        referenceValues.splice(index, 1);
        setMultipleValue(referenceValues);
      } else setMultipleValue([]);
    }
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

  const handleMultipleView = (id, row) => {
    setDetail(true);
    let doc = multipleValue.find((e) => e.id === id);
    setMultipleSelected(doc);
  };

  const handleOpen = async (type, value) => {
    if (!value) {
      try {
        let dynFilters = handleFilters();
        if (static_filters && static_filters.length) {
          static_filters.map((f) => (params[f.name] = f.value));
        }
        params["skip"] = 0;
        params["limit"] = 20;
        params = { ...params, ...dynFilters };
        let result = await getEntityData(params);
        if (Array.isArray(result) && result.length) {
          result = result.map((item) => {
            let displayKeys = {};
            displayFields.map((item1) => {
              if (
                [
                  "DATE",
                  "DATETIME",
                  "DATERANGE",
                  "PAIREDLIST",
                  "CHECKBOX",
                  "LIST",
                  "CURRENCY",
                  "NUMBER",
                  "DECIMAL",
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
        }

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

          setOptions(result);
        } else setOptions(result);
      } catch (e) {
        setSnackBar({ message: "No data found" });
      }
    }
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
      setSelectedData(response.ops[0]);
      setShowModal(false);
    } catch (e) {
      console.log("Error reported in handle save data reference");
    }
  };

  const handleSelectChange = (value) => {
    setValue((prevValue) => {
      return {
        ...prevValue,
        ...value,
      };
    });
    setOptions([]);
  };

  const isDataExists = () => {
    if (value && Object.keys(value).length) {
      let referenceKeys = Object.keys(value);
      if (referenceKeys.length) return true;
      else return false;
    } else return false;
  };

  const searchAPI = (fieldName, value) => {
    let dynFilters = handleFilters();
    let displayParams;
    displayFields.map((item) => {
      displayParams = displayParams
        ? `${displayParams},${item.name}`
        : `${item.name}`;
    });
    if (static_filters) static_filters.map((f) => (params[f.name] = f.value));
    params["displayFields"] = displayParams;
    params[fieldName] = value;
    params = { ...params, ...dynFilters };

    return getEntityData(params);
  };

  const searchAPIDebounced = AwesomeDebouncePromise(searchAPI, 500);

  const showError = (msg) => {
    if (canUpdate && !disable && msg) {
      callbackError(msg, props);
      setError(true);
      setHelperText(msg);
    }
  };

  const getEntityTemplate = async () => {
    let template = await entityTemplate.get({ ...templateParams });
    return template;
  };

  const scannerButton = async () => {
    let template = await getEntityTemplate();
    let res =
      template?.sys_entityAttributes?.sys_entityProperties?.includes(
        "CodeGenerator"
      );
    setScanButton(res);
  };

  const onScannedData = (scannedData) => {
    let addModal = {
      dialog: true,
      title: `Scanned ${entityName} successfully`,
      msg: "Click to Add",
      confirmLabel: "Add",
      onConfirm: () => {
        onAdd(scannedData);
        setOpenDialog({ dailog: false });
      },
    };
    setOpenDialog(addModal);
  };

  const onAdd = async (scannedData) => {
    let { format, text } = scannedData;
    let formatType = format === 11 ? "QR_CODE" : "BAR_CODE";
    let QueryParams = {
      ...params,
      [formatType]: text,
      limit: 1,
      skip: 0,
    };
    try {
      let template = await getEntityTemplate();
      setReferenceMeta(template);
      let res = await entity.get({ ...QueryParams });
      if (res.length > 0) {
        if (!multiSelect) {
          if (value.id == res[0]._id) {
            setSnackBar({ message: "Scanned data already attached!" });
          } else {
            setSelectedData(res[0]);
            setSnackBar({ message: `${entityName} Data found` });
          }
        } else {
          try {
            let multiArray = await entity.get({
              ...params,
              skip: 0,
              limit: multipleValue.length,
              sys_ids: JSON.stringify(multipleValue.map((item) => item.id)),
            });
            let array = multiArray.some((item) => {
              return item._id === res[0]._id;
            });
            if (array) {
              setSnackBar({ message: "Scanned data already attached!" });
            } else {
              multiArray.push(res[0]);
              setSelectedData(multiArray);
              setSnackBar({ message: `${entityName} Data found` });
            }
          } catch {
            setSelectedData(res);
          }
        }
      } else {
        setSnackBar({ message: `${entityName} data not found` });
      }
    } catch (e) {
      setSnackBar({ message: `${entityName} data not found` });
    }
  };

  useEffect(() => {
    setScanButton(false);
    scannerButton();
  }, [fieldmeta.name]);

  useEffect(() => {
    if (multiSelect)
      callbackValue(multipleValue.length ? multipleValue : null, props);
    else callbackValue(Object.keys(value).length ? value : null, props);
  }, [value, multipleValue]);

  useEffect(() => {
    if (fieldError) showError(fieldError);
  }, [fieldError]);

  useEffect(() => {
    if (multipleValue.length) clearError();
    else showError(required ? "Required" : fieldError);
  }, [multipleValue]);

  useEffect(() => {
    let newData;
    if (data && Array.isArray(data))
      newData = data.filter((value) => Object.keys(value).length !== 0);
    else newData = data;
    if (newData && Object.keys(newData).length) {
      if (multiSelect) {
        if (Array.isArray(data) && Object.keys(data[0]).length)
          setMultipleValue(data);
        else setMultipleValue([]);
      } else {
        if (
          Object.keys(data).filter((e) => e !== "id" && e !== "sys_gUid").length
        ) {
          clearError();
        }

        if (Object.keys(data).length) {
          setValue(data);
        } else setValue({});
      }
    } else {
      setValue({});
      setMultipleValue([]);
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

        setMultipleValue(multiReferences);
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
      if (Object.keys(value).length) clearError();
      else {
        if (required) showError("Required");
      }
    } else {
      if (value.length) clearError();
      else if (required) showError("Required");
    }
  }, [value]);

  if (mode === "READ" && !fieldmeta.skipReadMode) {
    return (
      <DisplayGrid
        container
        style={{ height: "100%", flexDirection: "column", flex: 1 }}
      >
        <DisplayGrid item container>
          <ToolTipWrapper title={fieldmeta.info}>
            <div>
              <DisplayText
                variant="h1"
                style={{ color: "#666666", cursor: "default" }}
              >
                {fieldmeta.multiSelect ? fieldmeta.title : ""}
              </DisplayText>
            </div>
          </ToolTipWrapper>
        </DisplayGrid>
        <DisplayGrid item container>
          {fieldmeta.multiSelect ? (
            <DisplayGrid container direction="column">
              <TableContainer
                component={Paper}
                style={{ margin: "10px 0 0 5px" }}
              >
                <Table aria-label="simple table" padding="default">
                  <TableHead style={{ backgroundColor: "#F0F0F0" }}>
                    <TableRow>
                      {fieldmeta.displayFields.map((item) => {
                        let fieldName,
                          fieldValue = "";
                        if (item.name.split(".").length > 1)
                          fieldName =
                            item.name.split(".")[
                              item.name.split(".").length - 1
                            ];
                        else fieldName = item.name;
                        fieldValue =
                          data && data.length > 0
                            ? data[0][fieldName]
                              ? data[0][fieldName]
                              : "N/A"
                            : "N/A";
                        return (
                          <TableCell>
                            <DisplayText
                              variant="subtitle1"
                              style={{ color: "#616161" }}
                            >
                              {fieldValue ? item.friendlyName : ""}
                            </DisplayText>
                          </TableCell>
                        );
                      })}
                      {multipleValue.length > 0 && checkReadAccess(params) && (
                        <TableCell size="small">
                          <DisplayText
                            variant="subtitle1"
                            style={{ color: "#616161" }}
                          >
                            {"View"}
                          </DisplayText>
                        </TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.isArray(data) && data.length
                      ? data.map((e, idx) => {
                          return (
                            <TableRow key={idx.toString()}>
                              {displayFields.map((f, idx1) => {
                                let fieldName =
                                  f.name.split(".").length > 1
                                    ? f.name.split(".")[
                                        f.name.split(".").length - 1
                                      ]
                                    : f.name;
                                let fieldValue = e
                                  ? e[fieldName]
                                    ? e[fieldName]
                                    : "N/A"
                                  : "N/A";
                                return (
                                  <TableCell key={idx1.toString()}>
                                    <DisplayText
                                      variant="h1"
                                      style={{ color: "#616161" }}
                                    >
                                      {fieldValue}
                                    </DisplayText>
                                  </TableCell>
                                );
                              })}
                              {multipleValue.length > 0 &&
                                checkReadAccess(params) && (
                                  <TableCell style={{ cursor: "pointer" }}>
                                    <DisplayIconButton
                                      systemVariant="primary"
                                      disabled={disable}
                                      size="small"
                                      onClick={() =>
                                        handleMultipleView(e.id, idx)
                                      }
                                    >
                                      <Visibility />
                                    </DisplayIconButton>
                                  </TableCell>
                                )}
                            </TableRow>
                          );
                        })
                      : ""}
                  </TableBody>
                </Table>
              </TableContainer>
              {
                <DisplayModal open={showDetail} fullWidth={true} maxWidth="xl">
                  <div
                    style={{
                      height: "85vh",
                      width: "100%",
                      display: "flex",
                      flex: 1,
                    }}
                  >
                    <ContainerWrapper>
                      <div
                        style={{ height: "98%", width: "98%", padding: "1%" }}
                      >
                        {showDetail && (
                          <DetailContainer
                            appname={appName ? appName : "NueGov"}
                            modulename={moduleName}
                            groupname={entityName}
                            //metadata={referenceMeta}
                            id={multipleSelected.id}
                            mode="read"
                            options={{
                              hideTitlebar: true,
                            }}
                            onClose={(e) => setDetail(false)}
                            detailMode="REFERENCE"
                          />
                        )}
                      </div>
                    </ContainerWrapper>
                  </div>
                </DisplayModal>
              }
            </DisplayGrid>
          ) : (
            <DisplayGrid container>
              <TableContainer
                component={Paper}
                style={{ margin: "10px 0 0 5px" }}
              >
                <Table padding="default" style={{ minWidth: "300px" }}>
                  <TableHead style={{ backgroundColor: "#F0F0F0" }}>
                    <TableRow>
                      {fieldmeta.displayFields.map((item) => {
                        let fieldName,
                          fieldValue = "";
                        if (item.name.split(".").length > 1)
                          fieldName =
                            item.name.split(".")[
                              item.name.split(".").length - 1
                            ];
                        else fieldName = item.name;
                        fieldValue =
                          data && data.length > 0
                            ? data[fieldName]
                              ? data[fieldName]
                              : "N/A"
                            : "N/A";
                        return (
                          <TableCell>
                            <DisplayText
                              variant="subtitle1"
                              style={{ color: "#616161" }}
                            >
                              {fieldValue ? item.friendlyName : ""}
                            </DisplayText>
                          </TableCell>
                        );
                      })}
                      {data &&
                        Object.keys(data).length > 0 &&
                        checkReadAccess(params) &&
                        isDataExists() && (
                          <TableCell size="small">
                            <DisplayText
                              variant="subtitle1"
                              style={{ color: "#616161" }}
                            >
                              View
                            </DisplayText>
                          </TableCell>
                        )}
                    </TableRow>
                  </TableHead>
                  {
                    <>
                      <TableRow>
                        {displayFields.map((f, idx1) => {
                          let fieldName =
                            f.name.split(".").length > 1
                              ? f.name.split(".")[f.name.split(".").length - 1]
                              : f.name;
                          let fieldValue =
                            data && Object.keys(data).length > 0
                              ? data[fieldName]
                              : "N/A";
                          return (
                            <TableCell>
                              <DisplayText
                                variant="h1"
                                style={{ color: "#616161" }}
                              >
                                {fieldValue ? fieldValue : "N/A"}
                              </DisplayText>
                            </TableCell>
                          );
                        })}
                        {data &&
                          Object.keys(data).length > 0 &&
                          checkReadAccess(params) &&
                          isDataExists() && (
                            <TableCell style={{ flex: 2 }}>
                              <DisplayIconButton
                                disabled={
                                  Object.keys(value).length === 0 ? true : false
                                }
                                onClick={(e) => setDetail(true)}
                                systemVariant="primary"
                                size="small"
                              >
                                <Visibility />
                              </DisplayIconButton>
                            </TableCell>
                          )}
                      </TableRow>
                      <DisplayModal
                        open={showDetail}
                        fullWidth={true}
                        maxWidth="xl"
                      >
                        <div
                          style={{
                            height: "85vh",
                            width: "100%",
                            display: "flex",
                            flex: 1,
                          }}
                        >
                          <ContainerWrapper>
                            <div
                              style={{
                                height: "98%",
                                width: "98%",
                                padding: "1%",
                              }}
                            >
                              <DetailContainer
                                appname={appName ? appName : "NueGov"}
                                modulename={moduleName}
                                groupname={entityName}
                                id={value.id}
                                mode="read"
                                options={{
                                  hideTitlebar: true,
                                }}
                                onClose={(e) => setDetail(false)}
                                detailMode="REFERENCE"
                              />
                            </div>
                          </ContainerWrapper>
                        </div>
                      </DisplayModal>
                    </>
                  }
                </Table>
              </TableContainer>
            </DisplayGrid>
          )}
        </DisplayGrid>
      </DisplayGrid>
    );
  }

  if (!multiSelect && (mode !== "READ" || fieldmeta.skipReadMode)) {
    return (
      <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
        <DisplayFormControl testid={testid} required={required} error={error}>
          {/* {title && showLabel && (
            <div className={classes.header}>
              <div className="system-label">
                <SystemLabel
                  toolTipMsg={rest.info}
                  required={required}
                  error={error}
                  filled={Object.keys(value).length}
                >
                  {title}
                </SystemLabel>
              </div>
            </div>
          )}
          <br /> */}
          <div className="system-components">
            <DisplayGrid container className={classes.root}>
              <DisplayGrid container style={{ display: "flex" }}>
                {displayFields.map((f, idx) => {
                  let fieldName =
                    f.name.split(".").length > 1
                      ? f.name.split(".")[f.name.split(".").length - 1]
                      : f.name;
                  return (
                    <div
                      style={{ display: "flex", flex: 1 }}
                      key={idx.toString()}
                    >
                      <Autocomplete
                        testid={fieldmeta.name + "-autofill"}
                        options={options}
                        disabled={disable || !canUpdate ? true : false}
                        value={
                          Object.keys(value).length
                            ? {
                                [fieldName]: value[fieldName]
                                  ? value[fieldName].toString()
                                  : "",
                              }
                            : ""
                        }
                        loading={!options.length ? true : false}
                        getOptionLabel={(option) =>
                          option[fieldName] ? option[fieldName] : ""
                        }
                        onChange={(e, value) => handleSelectChange(value)}
                        onInputChange={(e, v, input) =>
                          handleChange(e, { v, input, fieldName })
                        }
                        getOptionSelected={(option) =>
                          option.id === value["id"]
                        }
                        getOptionDisabled={(option) => option?.id === value?.id}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            label={f.friendlyName}
                            variant="outlined"
                            style={{ display: "flex", flex: 1 }}
                          />
                        )}
                        style={{ display: "flex", flex: 1 }}
                        onOpen={(e, value) => handleOpen(value)}
                      />
                      &nbsp;&nbsp;&nbsp;
                    </div>
                  );
                })}
                {scanButton && (
                  <DisplayIconButton
                    systemVariant="primary"
                    size="small"
                    onClick={() => setScanner(true)}
                    style={{ padding: "0.4rem" }}
                    testid={"scan-reference"}
                  >
                    <span class="material-icons">qr_code_scanner</span>
                  </DisplayIconButton>
                )}
                {scanner && (
                  <ScannerModal
                    onSuccessCallback={onScannedData}
                    onClose={setScanner}
                    scannerTimeout={30000}
                  />
                )}
                {/* // scanner ui */}
                {
                  <DisplayDialog
                    testid={`${fieldmeta.name}-reference-dialog`}
                    open={openDialog.dialog}
                    title={openDialog.title}
                    message={openDialog.msg}
                    confirmLabel={openDialog.confirmLabel}
                    onConfirm={openDialog.onConfirm}
                    onCancel={() => {
                      setOpenDialog({ dialog: false });
                    }}
                  />
                  //   msg dialog
                }
                {
                  <ContextMenuWrapper
                    options={{
                      hideTitlebar: showDetail ? false : true,
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
                        permissionCheck={handlePermission}
                        filters={handleFilters()}
                      />
                    )}
                  </ContextMenuWrapper>
                }
                // context menu
                <DisplayModal open={showModal} fullWidth={true} maxWidth="xl">
                  <div
                    style={{
                      height: "85vh",
                      width: "100%",
                      display: "flex",
                      flex: 1,
                    }}
                  >
                    <ContainerWrapper>
                      <div
                        style={{ height: "98%", width: "98%", padding: "1%" }}
                      >
                        <DetailContainer
                          appname={appName ? appName : "NueGov"}
                          modulename={moduleName}
                          groupname={entityName}
                          mode="new"
                          options={{
                            hideTitleBar: true,
                          }}
                          saveCallback={handleSaveData}
                          onClose={(e) => setShowModal(false)}
                          detailMode="REFERENCE"
                        />
                      </div>
                    </ContainerWrapper>
                  </div>
                </DisplayModal>
                // detail page modal
                <DisplayDialog
                  open={dialog}
                  title={`You don't have permission to access ${entityName} data`}
                  message="Get the access and try again"
                  onCancel={() => setDialog(false)}
                />
                // dialog msg
                <DisplayModal open={showDetail} fullWidth={true} maxWidth="xl">
                  <div
                    style={{
                      height: "85vh",
                      width: "100%",
                      display: "flex",
                      flex: 1,
                    }}
                  >
                    <ContainerWrapper>
                      <div
                        style={{ height: "98%", width: "98%", padding: "1%" }}
                      >
                        <DetailContainer
                          appname={appName ? appName : "NueGov"}
                          modulename={moduleName}
                          groupname={entityName}
                          id={value.id}
                          mode="read"
                          options={{
                            hideTitlebar: true,
                          }}
                          onClose={(e) => setDetail(false)}
                          detailMode="REFERENCE"
                        />
                      </div>
                    </ContainerWrapper>
                  </div>
                </DisplayModal>
              </DisplayGrid>
              {/* // need to check detail modal */}
              {error && (
                <div className="system-helpertext">
                  <DisplayHelperText icon={SystemIcons.Info}>
                    {helperText}
                  </DisplayHelperText>
                </div>
              )}
              {/* // error msg */}
              {showButtons && (
                <DisplayGrid container style={{ padding: "10px 0 0 2px" }}>
                  <DisplayGrid item>
                    <DisplayButton
                      testid={`${fieldmeta.name}-view`}
                      disabled={
                        Object.keys(value).length === 0 || disable
                          ? true
                          : false
                      }
                      onClick={(e) => setDetail(true)}
                    >
                      VIEW
                    </DisplayButton>
                  </DisplayGrid>
                  <DisplayGrid item>
                    <DisplayButton
                      testid={fieldmeta.name + "-search"}
                      onClick={(e) => setContext(true)}
                      disabled={disable || !canUpdate}
                    >
                      ASSIGN
                    </DisplayButton>
                  </DisplayGrid>
                  <DisplayGrid item>
                    <DisplayButton
                      testid={fieldmeta.name + "-create"}
                      onClick={(e) => setShowModal(true)}
                      disabled={
                        disable || !checkWriteAccess(params) || !canUpdate
                      }
                    >
                      Create
                    </DisplayButton>
                  </DisplayGrid>
                  <DisplayGrid item>
                    <DisplayButton
                      testid={fieldmeta.name + "-clear"}
                      disabled={
                        !isDataExists() ||
                        Object.keys(value).length === 0 ||
                        disable ||
                        !canUpdate
                          ? true
                          : false
                      }
                      onClick={handleClear}
                    >
                      UNASSIGN
                    </DisplayButton>
                  </DisplayGrid>
                </DisplayGrid>
              )}
              // show buttons
            </DisplayGrid>
          </div>
        </DisplayFormControl>
      </div>
    );
  } else {
    if (mode !== "READ" || fieldmeta.skipReadMode)
      return (
        <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
          <DisplayFormControl required={required} error={error}>
            {showLabel && (
              <div className={classes.header}>
                <div className="system-label">
                  <SystemLabel
                    toolTipMsg={rest.info}
                    required={required}
                    error={error}
                    filled={Object.keys(value).length}
                  >
                    {title}
                  </SystemLabel>
                  {error && (
                    <div className="system-helpertext">
                      <DisplayHelperText icon={SystemIcons.Info}>
                        {helperText}
                      </DisplayHelperText>
                    </div>
                  )}
                </div>
                {scanButton && (
                  <DisplayIconButton
                    systemVariant="primary"
                    size="small"
                    onClick={() => setScanner(true)}
                    testid={`${fieldmeta.name}-scan-multiReference`}
                  >
                    <span class="material-icons">qr_code_scanner</span>
                  </DisplayIconButton>
                )}
                {scanner && (
                  <ScannerModal
                    onSuccessCallback={onScannedData}
                    onClose={setScanner}
                  />
                )}
                {
                  <DisplayDialog
                    testid={`${fieldmeta.name}-reference-dialog`}
                    open={openDialog.dialog}
                    title={openDialog.title}
                    message={openDialog.msg}
                    confirmLabel={openDialog.confirmLabel}
                    onConfirm={openDialog.onConfirm}
                    onCancel={() => {
                      setOpenDialog({ dialog: false });
                    }}
                  />
                }
              </div>
            )}

            <div className="system-components">
              <DisplayGrid container>
                <DisplayGrid container>
                  <DisplayGrid item>
                    <DisplayButton
                      testid={`${fieldmeta.name}-reference-add`}
                      size="small"
                      disabled={disable || !canUpdate}
                      onClick={(e) => setContext(true)}
                    >
                      ADD
                    </DisplayButton>
                  </DisplayGrid>
                  <DisplayGrid item>
                    <DisplayButton
                      testid={`${fieldmeta.name}-reference-create`}
                      size="small"
                      disabled={
                        disable || !checkWriteAccess(params) || !canUpdate
                      }
                      onClick={(e) => setShowModal(true)}
                    >
                      Create
                    </DisplayButton>
                  </DisplayGrid>
                  <DisplayGrid item>
                    <DisplayButton
                      testid={`${fieldmeta.name}-reference-clear`}
                      size="small"
                      disabled={
                        multipleValue.length === 0 || disable || !canUpdate
                          ? true
                          : false
                      }
                      onClick={(e) => handleClear(e, { type: "all" })}
                    >
                      CLEAR
                    </DisplayButton>
                  </DisplayGrid>
                </DisplayGrid>
                {multipleValue.length ? (
                  <DisplayGrid container>
                    <DisplayGrid item container>
                      {/* <Paper className={classes.paper}> */}
                      <TableContainer
                        component={Paper}
                        style={{ margin: "10px 0 0 5px" }}
                      >
                        <Table aria-label="simple table" padding="default">
                          <TableHead style={{ backgroundColor: "#F0F0F0" }}>
                            <TableRow>
                              {displayFields.map((item, idx) => {
                                return (
                                  <TableCell key={idx.toString()} size="small">
                                    <DisplayText variant="subtitle1">
                                      {item.friendlyName}
                                    </DisplayText>
                                  </TableCell>
                                );
                              })}
                              <TableCell size="small">
                                <DisplayText
                                  testid={`${fieldmeta.name}-reference-view`}
                                  variant="subtitle1"
                                >
                                  View
                                </DisplayText>
                              </TableCell>
                              <TableCell size="small">
                                <DisplayText
                                  testid={"reference-delete"}
                                  variant="subtitle1"
                                >
                                  Delete
                                </DisplayText>
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {multipleValue.map((item, idx) => {
                              return (
                                <TableRow key={idx.toString()}>
                                  {displayFields.map((f, idx1) => {
                                    let fieldName =
                                      f.name.split(".").length > 1
                                        ? f.name.split(".")[
                                            f.name.split(".").length - 1
                                          ]
                                        : f.name;
                                    return (
                                      <TableCell key={idx1.toString()}>
                                        {item[fieldName]
                                          ? item[fieldName]
                                          : "N/A"}
                                      </TableCell>
                                    );
                                  })}
                                  <TableCell style={{ cursor: "pointer" }}>
                                    <DisplayIconButton
                                      systemVariant="primary"
                                      disabled={disable}
                                      size="small"
                                      onClick={(e) =>
                                        handleMultipleView(item.id, idx)
                                      }
                                    >
                                      <Visibility />
                                    </DisplayIconButton>
                                  </TableCell>
                                  <TableCell style={{ cursor: "pointer" }}>
                                    <DisplayIconButton
                                      systemVariant="secondary"
                                      disabled={disable || !canUpdate}
                                      onClick={(e) =>
                                        handleClear(e, {
                                          item: item,
                                          type: "id",
                                        })
                                      }
                                      size="small"
                                    >
                                      <Delete />
                                    </DisplayIconButton>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      {/* </Paper> */}
                    </DisplayGrid>
                  </DisplayGrid>
                ) : (
                  ""
                )}
                {
                  <ContextMenuWrapper
                    options={{
                      hideTitlebar: showDetail ? false : true,
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
                        options={{
                          select: "multiple",
                          selectedIds: multipleValue,
                        }}
                        permissionCheck={handlePermission}
                        filters={handleFilters()}
                      />
                    )}
                  </ContextMenuWrapper>
                }
                {
                  <DisplayModal open={showModal} fullWidth={true} maxWidth="xl">
                    <div
                      style={{
                        height: "85vh",
                        width: "100%",
                        display: "flex",
                        flex: 1,
                      }}
                    >
                      <ContainerWrapper>
                        <div
                          style={{ height: "98%", width: "98%", padding: "1%" }}
                        >
                          <DetailContainer
                            appname={appName ? appName : "NueGov"}
                            modulename={moduleName}
                            groupname={entityName}
                            mode="new"
                            options={{
                              hideTitleBar: true,
                            }}
                            saveCallback={(e) => setShowModal(false)}
                            onClose={(e) => setShowModal(false)}
                            detailMode="REFERENCE"
                          />
                        </div>
                      </ContainerWrapper>
                    </div>
                  </DisplayModal>
                }
                {
                  <DisplayModal
                    open={showDetail}
                    fullWidth={true}
                    maxWidth="xl"
                  >
                    <div
                      style={{
                        height: "85vh",
                        width: "100%",
                        display: "flex",
                        flex: 1,
                      }}
                    >
                      <ContainerWrapper>
                        <div
                          style={{ height: "98%", width: "98%", padding: "1%" }}
                        >
                          {showDetail && (
                            <DetailContainer
                              appname={appName ? appName : "NueGov"}
                              modulename={moduleName}
                              groupname={entityName}
                              //metadata={referenceMeta}
                              id={multipleSelected.id}
                              mode="read"
                              options={{
                                hideTitlebar: true,
                              }}
                              onClose={(e) => setDetail(false)}
                              detailMode="REFERENCE"
                            />
                          )}
                        </div>
                      </ContainerWrapper>
                    </div>
                  </DisplayModal>
                }
                {
                  <DisplayDialog
                    open={dialog}
                    title={`You don't have permission to access ${entityName} data`}
                    message="Get the access and try again"
                    onCancel={() => setDialog(false)}
                  />
                }
              </DisplayGrid>
            </div>
          </DisplayFormControl>
        </div>
      );
  }
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
