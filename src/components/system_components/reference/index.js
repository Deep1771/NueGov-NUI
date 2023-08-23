import React, { useState, useEffect, useRef, useMemo } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles, InputAdornment } from "@material-ui/core";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  TextField,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import PropTypes from "prop-types";
import {
  ContainerWrapper,
  ToolTipWrapper,
} from "components/wrapper_components";
import { DetailContainer } from "containers/composite_containers/detail_container/";
import {
  DisplayFormControl,
  DisplayHelperText,
  DisplayGrid,
  DisplayIconButton,
  DisplayModal,
  DisplayText,
  DisplayDialog,
} from "../../display_components";
import { GridWrapper } from "components/wrapper_components";
import { getData } from "../../../containers/composite_containers/summary_container/components/summary_services";
import { GlobalFactory, UserFactory } from "utils/services/factory_services";
import { FormThemeWrapper } from "utils/stylesheets/form_theme_wrapper";
import { SystemIcons } from "utils/icons";
import { globalProps } from "../global-props";
import { useDetailData } from "containers/composite_containers/detail_container/detail_state";
import { MapComponent } from "../map_component";
import { textExtractor } from "utils/services/helper_services/system_methods";
import { makeUpperCase } from "utils/helper_functions/capitalize";
import { getTrimmed } from "utils/helper_functions";
import { useCallback } from "react";
import { useStateValue } from "utils/store/contexts";
import { switchUser } from "containers/user_containers/profile_page/loginas/switchUser";
import { get } from "lodash";
import { isDefined } from "utils/services/helper_services/object_methods";

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
    sectionName,
    callFrom,
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
    skipReadMode,
    cardView,
    defaultAutopopulate = {},
    disablePortal = true,
    loginAs,
    splitDisplayFields = false,
    ...rest
  } = { ...fieldmeta };

  const {
    tooltip = "Login As",
    popupUserFieldName = "username",
    isloginAs = false,
  } = loginAs || {};
  let params = {
    appname: appName ? appName : "NueGov",
    modulename: moduleName,
    entityname: entityName,
  };

  const [{ userState }] = useStateValue();

  let history = useHistory();
  const { userData } = userState;

  const { checkWriteAccess, isNJAdmin, checkReadAccess, getAgencyDetails } =
    UserFactory();
  const { showSampleData = false } =
    getAgencyDetails?.sys_entityAttributes || {};
  const { formData } = useDetailData() || {};
  const { getUserData, handleSidebar } = GlobalFactory();
  const { Visibility, Launch } = SystemIcons;

  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState("");
  const [value, setValue] = useState(fieldmeta.multiSelect ? [] : {});
  const [masterArray, setMasterArray] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isMultiselect, setIsMultiselect] = useState(fieldmeta.multiSelect);
  const [isCardVisible, setIsCardVisible] = useState(cardView?.isCardView);
  const [displayNames, setDisplayNames] = useState([]);
  const [showDetail, setDetail] = useState({ show: false, id: 0 });
  // const [disableRef, setDisableRef] = useState(false);
  const [userDetails, setUserDetails] = useState(getUserData());
  const roleName = userDetails?.sys_entityAttributes?.roleName?.name || "";
  const [loading, setLoading] = useState(false);
  const isReadMode =
    stateParams?.mode?.toLowerCase() == "read" && !skipReadMode;
  let inputRef = useRef();
  const [inputHeight, setInputHeight] = useState(37);
  const [placement, setPlacement] = useState("top");
  const [dialogProps, setDialogProps] = useState({ open: false });
  const isPublicUser = sessionStorage.getItem("public-user");

  let readAccess = checkReadAccess({
    appname: fieldmeta.appName,
    modulename: fieldmeta.moduleName,
    entityname: fieldmeta.entityName,
  });

  const getDimensions = () => {
    const containsDialog = document.getElementById("display-modal");
    if (containsDialog) {
      setPlacement("top");
    } else {
      let elem = document.getElementById("inputHeight" + name);
      let rect = elem?.getBoundingClientRect();
      const middleOfScreen = window.innerHeight / 1.5;
      rect?.y > middleOfScreen ? setPlacement("bottom") : setPlacement("top");
    }
  };
  const useStyles = useCallback(
    makeStyles({
      paper: {
        "& ul": {
          paddingBottom: "0px",
        },
        "& li:last-child": {
          position: "sticky",
          bottom: 0,
          zIndex: 22332,
          backgroundColor: "white",
        },
      },
      inputRoot: {
        "& .MuiAutocomplete-clearIndicator": {
          visibility: "visible",
        },
        "& .MuiAutocomplete-endAdornment": {
          position: "initial",
        },
        "& .MuiAutocomplete-popupIndicator": {
          // position: "absolute"
        },
      },
      popperDisablePortal: {
        [placement]: placement === "bottom" ? 55 : inputHeight,
        position: "absolute",
      },
    }),
    [inputHeight, placement]
  );
  const classes = useStyles();

  const handleInputChange = (val) => {
    inputRef.current = val;
    optimisedVersion();
  };
  const clearError = () => {
    callbackError(null, props);
    setError(false);
    setHelperText("");
  };

  const showError = (msg) => {
    if (canUpdate && !disable) {
      callbackError(msg, props);
      setError(true);
      setHelperText(msg);
    }
  };

  const getDisplayFieldNames = (i, k) => {
    let name = "";
    if (Object.keys(i.sys_entityAttributes[k.name]).length > 0) {
      for (let p in i.sys_entityAttributes[k.name]) {
        name +=
          getTrimmed(i.sys_entityAttributes[k.name][p]?.name.split(".").pop()) +
          " ";
      }
    } else {
      name =
        getTrimmed(i.sys_entityAttributes[k.name].name.split(".").pop()) || "";
    }
    return getTrimmed(name);
  };
  fieldmeta["description"] = fieldmeta?.description
    ? fieldmeta?.description
    : `Search and select ${fieldmeta.title}`;

  fieldmeta["description"] = fieldmeta?.description
    ? fieldmeta?.description
    : `Search and select ${fieldmeta.title}`;

  const cardDetails = useMemo(() => {
    return displayNames.map((field) => {
      if (field?.type == "LATLONG") {
        return {
          ...field,
          title: field["friendlyName"],
          value: value[field.name],
          type: "LATLONG",
        };
      }
      return {
        ...field,
        title: field["friendlyName"],
        value: value[field?.name],
      };
    });
  }, [value]);

  const getListStructure = (tempObj, i) => {
    for (let k of displayFields) {
      if (k.type == "PAIREDLIST") {
        try {
          if (typeof i?.sys_entityAttributes[k.name] == "object") {
            let name = getDisplayFieldNames(i, k);
            tempObj[k.name] = name;
          }
        } catch (e) {}
      } else if (k.type == "LATLONG") {
        try {
          tempObj[k.name] = i.sys_entityAttributes[k.name];
        } catch (e) {}
      } else {
        if (k.name.includes(".")) {
          try {
            const name = k.name.split(".");
            tempObj[name[1]] = i.sys_entityAttributes[name[0]][name[1]];
          } catch (e) {}
        } else {
          try {
            tempObj[k.name] = i.sys_entityAttributes[k.name];
          } catch (e) {}
        }
      }
    }
    return tempObj;
  };

  const getMasters = (data) => {
    const tempArray = data
      .map((item) => {
        const tempObj = {
          id: item._id,
          sys_gUid: item.sys_gUid,
          sys_templateName: item.sys_templateName,
        };
        const listStructure = getListStructure({ ...tempObj }, item);
        const newObj = { ...tempObj, ...listStructure };
        const isMissingField = displayFields.some((field) => {
          if (field.type === "PAIREDLIST") {
            return newObj[field.name];
          } else if (field.name.includes(".")) {
            const name = field.name.split(".").pop();
            return newObj[name];
          } else {
            return newObj[field.name];
          }
        });
        return isMissingField ? newObj : null;
      })
      .filter(Boolean);
    const tempDisplayNames = displayFields.map((field) => {
      const name = field.name.includes(".")
        ? field.name.split(".").pop()
        : field.name;
      return { ...field, name, delimiter: field.delimiter || "" };
    });
    setDisplayNames(tempDisplayNames);
    setMasterArray(tempArray);
  };

  const handleSave = async (e) => {
    let newValueObj = {};
    newValueObj = { ...getListStructure(newValueObj, e.ops[0]) };
    newValueObj["id"] = e?.id;
    newValueObj["sys_gUid"] = e?.sys_gUid;
    let newValue;
    if (isMultiselect) {
      newValue = [...value, newValueObj];
    } else {
      newValue = newValueObj;
    }
    setValue(newValue);
    setShowModal(false);
    handleSidebar("0px");
  };

  const handleFilters = () => {
    let obj = {};
    if (isNJAdmin() || showSampleData) {
      obj.sampleData = true;
    }
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

  const getState = async () => {
    setLoading(true);
    try {
      let entityParams = {
        ...params,
        entityname: entityName,
        limit: 100,
        skip: 0,
        ...handleFilters(),
      };
      if (inputRef.current) {
        entityParams.globalsearch = inputRef.current;
      }
      try {
        let [entityResult, count] = await Promise.all([getData(entityParams)]);
        setLoading(false);
        getMasters(entityResult);
      } catch (e) {}
    } catch (e) {
      setLoading(false);
    }
  };

  const setRefValue = (obj) => {
    let tempObj = {};
    tempObj["sys_gUid"] = userDetails?.sys_gUid;
    tempObj["id"] = userDetails?._id;
    tempObj["sys_templateName"] = userDetails?.sys_templateName;
    const listStruct = getListStructure(tempObj, { sys_entityAttributes: obj });
    tempObj = { ...tempObj, ...listStruct };
    if (isMultiselect) {
      if (Object.keys(obj).length) {
        return [tempObj];
      }
    } else {
      if (Object.keys(obj).length) return { ...tempObj };
    }
  };

  const getDelimiter = (nameArray) => {
    let nameWithDelimiter = "";
    const displayFieldsLen = displayFields?.length - 1;
    displayFields.forEach((val, index) => {
      const lastIndex = index === displayFieldsLen ? true : false;
      if (val?.hideOnHeaderPanel) return "";
      if (val?.delimiter) {
        nameArray[index] = nameArray[index]
          ? nameArray[index] +
            (isDefined(nameArray[index + 1]) ? val?.delimiter || " " : "")
          : "";
        nameWithDelimiter += nameArray[index];
      } else {
        nameWithDelimiter += nameArray[index]
          ? nameArray[index] + (lastIndex ? "" : " ")
          : "";
      }
    });
    return nameWithDelimiter;
  };

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

  const NoTextOption = (
    <span key="nooption">
      {loading ? (
        <>
          <CircularProgress size={10} /> {" Loading..."}{" "}
        </>
      ) : (
        ` No ${title || "options"} `
      )}
    </span>
  );

  const loginAsBtn = (
    <ToolTipWrapper title={tooltip}>
      <div>
        <DisplayIconButton
          id="loginAs"
          systemVariant={"primary"}
          size="small"
          onClick={() => {
            return setDialogProps(() => {
              return {
                testid: "loginAs",
                open: true,
                title: `Login as - ${get(value, popupUserFieldName)} ?`,
                message:
                  "You can switch back later using exit icon in navigation bar",
                cancelLabel: "Cancel",
                confirmLabel: "Yes, Login",
                onCancel: () => {
                  setDialogProps({ open: false });
                },
                onConfirm: () => {
                  setDialogProps({ open: false });
                  switchUser(history, value, userData);
                },
              };
            });
          }}
        >
          <Launch />
        </DisplayIconButton>
      </div>
    </ToolTipWrapper>
  );
  useEffect(() => {
    if (fieldmeta.multiSelect) {
      callbackValue(value?.length ? value : [], props);
      if (value?.length > 0) {
        clearError();
      } else {
        if (required) {
          callbackError("Error", props);
          showError("Required");
        }
      }
    } else {
      // setValue(fieldmeta.multiSelect ? [] : {});
      callbackValue(value && Object.keys(value)?.length ? value : {}, props);
      if (value && Object.values(value).length > 0) {
        if (cardView) setIsCardVisible(true);
        clearError();
      } else {
        if (cardView) setIsCardVisible(false);
        if (required) {
          callbackError("Error", props);
          showError("Required");
        }
      }
    }
  }, [value, sectionName]);

  const checkAndAssignDefaultValue = () => {
    if (
      defaultAutopopulate &&
      roleName &&
      defaultAutopopulate?.valueToAutoPopulate == "PRIVATE" &&
      defaultAutopopulate?.roles.includes(roleName)
    ) {
      return setRefValue(userDetails.sys_entityAttributes);
    } else return {};
  };

  useEffect(() => {
    if (data) {
      setValue(data);
    } else {
      let defaultVal = {};
      if (Object.keys(defaultAutopopulate).length > 0) {
        defaultVal = checkAndAssignDefaultValue();
      }
      setValue(fieldmeta.multiSelect ? [] : defaultVal);
    }
    if (fieldmeta?.multiSelect) setIsMultiselect(fieldmeta?.multiSelect);
    return () => {
      setMasterArray([]);
      setIsMultiselect(false);
      setValue(fieldmeta.multiSelect ? [] : {});
      inputRef.current = "";
    };
  }, [data, sectionName]);

  const MyChip = (props) => {
    const id = props.id;
    return (
      <Chip
        style={{
          width: "80%",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
        }}
        // className={classes.chips}
        onClick={() => setDetail({ show: true, id })}
        {...props}
      />
    );
  };

  const getMultiColRefName = (name, option) => {
    let n = name.split(".").pop();
    try {
      return option[n] ? option[n] : "";
    } catch (e) {}
  };

  const getReadModeFormat = (value) => {
    let displayTag = "";
    displayNames.map((field) => {
      if (field?.hideOnHeaderPanel == true) return;
      if (field.type == "LATLONG") {
        return (displayTag += value[field?.name]?.coordinates || "");
      } else if (field?.name.includes(".")) {
        displayTag += getMultiColRefName(field.name, value);
      } else if (field?.type == "DATETIME" || field?.type == "DATE") {
        displayTag += textExtractor(value[field.name], field);
      } else
        displayTag += value[field.name]
          ? textExtractor(value[field.name], field) ||
            "" + ` ${field.delimiter || " "} `
          : "";
    });
    return displayTag;
  };

  const renderReadMode = () => {
    if (isMultiselect) {
      return value.map((option, index) => {
        let displayTag = getReadModeFormat(option) || "";

        return <MyChip label={displayTag} id={option?.id} />;
      });
    } else {
      let displayTag = getReadModeFormat(value) || "";

      return (
        <span
          style={{ cursor: "pointer", display: "flex" }}
          onClick={() => !isPublicUser && setDetail({ show: true })}
        >
          {displayTag}
          {displayTag && !isPublicUser && readAccess && (
            <Visibility style={{ paddingLeft: "5px" }} size={10} />
          )}
        </span>
      );
    }
  };

  const debounce = (func) => {
    let timer;
    return function (...args) {
      const context = this;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        func.apply(context, args);
      }, 500);
    };
  };

  const handleKeySearch = () => {
    getState();
  };

  const getDisplayField = (field, index) => {
    let {
      name: fieldName,
      friendlyName: fieldTitle,
      visible = true,
      description = "",
    } = field;
    if (!visible) return "";
    return (
      <>
        <div
          style={{
            display: "flex",
            width: "33%",
            flexDirection: "column",
            padding: "0px 8px",
          }}
        >
          <DisplayText
            style={{
              color: "#5F6368",
              fontWeight: "400",
              fontSize: "12px",
              paddingBottom: "4px",
            }}
          >
            {fieldTitle}
          </DisplayText>
          {error && (
            <DisplayHelperText icon={SystemIcons.Error}>
              ({helperText})
            </DisplayHelperText>
          )}
          <Autocomplete
            disablePortal={false}
            id={testid}
            key={name}
            multiple={false}
            onOpen={getDimensions}
            options={masterArray}
            getOptionSelected={() => {}}
            getOptionDisabled={(option) => option?.key == "nooption"}
            disabled={disable || !canUpdate || stateParams.mode == "READ"}
            style={{ width: "100%", fontSize: "14px" }}
            value={value}
            disableClearable={!Object.values(value).length > 0}
            ListboxProps={{
              style: {
                maxHeight: "250px",
              },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                onClick={getState}
                variant="filled"
                inputProps={{
                  ...params.inputProps,
                  style: {
                    maxWidth: "60%",
                    minWidth: "50%",
                  },
                }}
                InputProps={{
                  ...params.InputProps,
                  ...globalProps.InputProps,
                  endAdornment: (
                    <InputAdornment
                      position="end"
                      style={{ position: "absolute", right: "2%" }}
                    >
                      {params.InputProps.endAdornment}
                      {!multiSelect &&
                        !isPublicUser &&
                        Object.values(value).length > 0 &&
                        readAccess && (
                          <DisplayIconButton
                            style={{ height: "30px", width: "30px" }}
                          >
                            <Visibility
                              onClick={() => setDetail({ show: true })}
                              size={10}
                              style={{
                                cursor: "pointer",
                                color: "black",
                              }}
                            />
                          </DisplayIconButton>
                        )}
                      {isloginAs &&
                        !multiSelect &&
                        Object.values(value).length > 0 &&
                        loginAsBtn}
                    </InputAdornment>
                  ),
                  style: {
                    ...globalProps.InputProps.style,
                    minHeight: globalProps.InputProps.style.height,
                    padding: "1px 10px",
                    height: "",
                  },
                }}
                required={required}
              />
            )}
            renderTags={(tagValue, getTagProps) => {
              return tagValue.map((option, index) => {
                let displayTag = "";
                displayNames.map((field) => {
                  if (field?.hideOnDetail !== true) {
                    if (field?.name.includes(".")) {
                      displayTag += getMultiColRefName(field.name, option);
                    } else if (field.type == "LATLONG") {
                      return option[field.name]?.coordinates;
                    } else
                      displayTag += option[field.name]
                        ? option[field.name] + ` ${field.delimiter || " "} `
                        : "";
                  }
                });
                return (
                  <MyChip
                    {...getTagProps({ index })}
                    label={displayTag}
                    id={option?.id}
                  />
                );
              });
            }}
            getOptionLabel={(option) => {
              let names = [];

              if (Object.keys(option).length == 0) return "";
              if (option?.key == "create") {
                return "";
              } else if (option?.key == "nooption") {
                return "";
              } else {
                names = [field]
                  .map((fields) => {
                    if (fields?.hideOnHeaderPanel === true) return "";
                    else if (fields?.name.includes(".")) {
                      return getMultiColRefName(fields.name, option);
                    } else if (fields.type == "LATLONG") {
                      return option[fields.name]?.coordinates
                        .toString()
                        .replace(",", " ");
                    } else
                      return option[fieldName]
                        ? textExtractor(option[fields.name], fields)
                        : "";
                  })
                  .filter((v) => v != "" || null);
                let copyName = names.toString();
                let nameArray = copyName.split(",");
                let nameWithDelimiter = getDelimiter(nameArray) || "";
                return names.length > 0 ? nameWithDelimiter : "";
              }
            }}
            filterOptions={(options, state) => {
              if (isMultiselect && value?.length > 0 && options?.length) {
                value.map((val) => {
                  let index = options.findIndex(
                    (res) => res.sys_gUid == val.sys_gUid
                  );
                  if (index > -1) options.splice(index, 1);
                });
              }
              if (options?.length == 0) {
                return [NoTextOption, buttonOption];
              }
              return [...options, buttonOption];
            }}
            renderOption={(option) => {
              let names = [];
              displayFields.map((fields) => {
                return names.push(fields.name);
              });
              if (Object.keys(option).length == 0) return "";
              if (option?.key == "create") {
                return buttonOption;
              } else if (option?.key == "nooption") {
                return NoTextOption;
              } else {
                names = displayFields
                  .map((fields) => {
                    if (fields?.hideOnHeaderPanel === true) return "";
                    else if (fields?.name.includes(".")) {
                      return getMultiColRefName(fields.name, option);
                    } else if (fields.type == "LATLONG") {
                      return (
                        option[fields.name]?.coordinates
                          .toString()
                          .replace(",", " ") || ""
                      );
                    } else
                      return option[fields.name] ? option[fields.name] : "";
                  })
                  .filter((v) => v != "" || null);
                let copyName = names.toString();
                let nameArray = copyName.split(",");
                let nameWithDelimiter = getDelimiter(nameArray) || "";
                if (entityName == "User") {
                  const n = copyName.trim().split(/\s+/);
                  return names.filter(function (entry) {
                    return entry.trim() != "";
                  }).length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", flexDirection: "row" }}>
                        <span>{option?.firstName}</span>
                        <span style={{ paddingLeft: "5px" }}>
                          {option?.lastName}
                        </span>
                      </div>
                      {displayNames.map((obj) => {
                        return (
                          <span style={{ fontSize: "12px" }}>
                            {obj.name != "lastName" &&
                              obj.name != "firstName" &&
                              option[obj.name]}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    ""
                  );
                } else {
                  return names.length > 0 ? (
                    <span>{nameWithDelimiter}</span>
                  ) : (
                    ""
                  );
                }
              }
            }}
            noOptionsText={
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Button
                  variant="outlined"
                  size="small"
                  color="primary"
                  onClick={() => setShowModal(true)}
                >
                  Create
                </Button>
              </Box>
            }
            onChange={(event, newValue) => {
              if (multiSelect) {
                if (newValue?.length > 0) {
                  let l = newValue?.length - 1;
                  if (newValue[l].hasOwnProperty("sys_gUid"))
                    setValue(newValue ? newValue : []);
                  else delete newValue[l];
                  if (cardView) setIsCardVisible(!isCardVisible);
                } else {
                  if (cardView) setIsCardVisible(false);
                  setValue([]);
                }
              } else if (!multiSelect) {
                if (newValue?.hasOwnProperty("sys_gUid")) {
                  setValue(newValue ? newValue : {});
                  if (cardView) setIsCardVisible(!isCardVisible);
                } else if (newValue == null) {
                  setValue(multiSelect ? [] : {});
                  if (cardView) setIsCardVisible(false);
                }
              }
            }}
            onInputChange={(event, value) => {
              if (event) return handleInputChange(value);
            }}
            classes={classes}
          />
          <ToolTipWrapper
            title={description?.length > 57 ? description : ""}
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
                {description}
              </DisplayText>
            </div>
          </ToolTipWrapper>
        </div>
      </>
    );
  };

  const optimisedVersion = debounce(handleKeySearch);

  useEffect(() => {
    if (value) {
      isMultiselect ? getMasters(value) : getMasters([{ value }]);
    }
  }, [sectionName]);

  useEffect(() => {
    if (multiSelect)
      setInputHeight(
        document.getElementById("inputHeight" + name)?.offsetHeight
      );
  }, [value]);

  const renderField = () => {
    let type = { mode: "" };
    if (isReadMode) type.mode = "readMode";
    else if (splitDisplayFields) type.mode = "multipleFields";
    switch (type.mode) {
      case "readMode":
        return (
          <>
            <DisplayGrid
              container
              style={{ flex: 1, height: "auto", flexDirection: "column" }}
            >
              <DisplayGrid item container>
                <ToolTipWrapper title={fieldmeta.info}>
                  <div>
                    <DisplayText
                      variant="h1"
                      style={{ color: "#666666", cursor: "default" }}
                    >
                      {title}
                    </DisplayText>
                  </div>
                </ToolTipWrapper>
              </DisplayGrid>
              <DisplayGrid
                item
                container
                style={{
                  paddingLeft: "15px",
                  flex: 1,
                  position: "relative",
                  color: " rgb(97, 97, 97)",
                }}
              >
                {renderReadMode()}
              </DisplayGrid>
            </DisplayGrid>
          </>
        );
      case "multipleFields": {
        return (
          <>
            {displayFields.map((field, index) => getDisplayField(field, index))}
          </>
        );
      }

      default: {
        return (
          <>
            <div style={{ display: "flex", width: "100%" }}>
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
            {!isCardVisible ? (
              <DisplayFormControl
                disabled={disable || !checkWriteAccess(params) || !canUpdate}
                required={required}
                error={error}
                testid={testid}
                style={{ width: "100%" }}
              >
                <div id={"inputHeight" + name}>
                  <Autocomplete
                    id={testid}
                    key={name}
                    multiple={isMultiselect}
                    onOpen={getDimensions}
                    options={masterArray}
                    getOptionSelected={() => {}}
                    disablePortal={
                      callFrom === "top_level" && disablePortal ? true : false
                    }
                    getOptionDisabled={(option) => option?.key == "nooption"}
                    disabled={
                      disable || !canUpdate || stateParams.mode == "READ"
                    }
                    style={{ width: "100%", fontSize: "14px" }}
                    value={value}
                    disableClearable={!Object.values(value).length > 0}
                    ListboxProps={{
                      style: {
                        maxHeight: "250px",
                      },
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        onClick={getState}
                        variant="outlined"
                        inputProps={{
                          ...params.inputProps,
                          style: {
                            maxWidth: "60%",
                            minWidth: "50%",
                          },
                        }}
                        InputProps={{
                          ...params.InputProps,
                          ...globalProps.InputProps,
                          endAdornment: (
                            <InputAdornment
                              position="end"
                              style={{ position: "absolute", right: "2%" }}
                            >
                              {params.InputProps.endAdornment}
                              {!multiSelect &&
                                !isPublicUser &&
                                Object.values(value).length > 0 &&
                                readAccess && (
                                  <DisplayIconButton
                                    style={{ height: "30px", width: "30px" }}
                                  >
                                    <Visibility
                                      onClick={() => setDetail({ show: true })}
                                      size={10}
                                      style={{
                                        cursor: "pointer",
                                        color: "black",
                                      }}
                                    />
                                  </DisplayIconButton>
                                )}
                              {isloginAs &&
                                !multiSelect &&
                                Object.values(value).length > 0 &&
                                loginAsBtn}
                            </InputAdornment>
                          ),
                          style: {
                            ...globalProps.InputProps.style,
                            minHeight: globalProps.InputProps.style.height,
                            padding: "1px 10px",
                            height: "",
                          },
                        }}
                        required={required}
                        {...rest}
                      />
                    )}
                    renderTags={(tagValue, getTagProps) => {
                      return tagValue.map((option, index) => {
                        let displayTag = "";
                        displayNames.map((field) => {
                          if (field?.hideOnDetail !== true) {
                            if (field?.name.includes(".")) {
                              displayTag += getMultiColRefName(
                                field.name,
                                option
                              );
                            } else if (field.type == "LATLONG") {
                              return option[field.name]?.coordinates;
                            } else
                              displayTag += option[field.name]
                                ? textExtractor(option[field.name], field) +
                                  ` ${field.delimiter || " "} `
                                : "";
                          }
                        });
                        return (
                          <MyChip
                            {...getTagProps({ index })}
                            label={displayTag}
                            id={option?.id}
                          />
                        );
                      });
                    }}
                    getOptionLabel={(option) => {
                      let names = [];
                      displayFields.map((fields) => {
                        return names.push(fields.name);
                      });
                      if (Object.keys(option).length == 0) return "";
                      if (option?.key == "create") {
                        return "";
                      } else if (option?.key == "nooption") {
                        return "";
                      } else {
                        names = displayFields
                          .map((fields) => {
                            if (fields?.hideOnHeaderPanel === true) return "";
                            else if (fields?.name.includes(".")) {
                              return getMultiColRefName(fields.name, option);
                            } else if (fields.type == "LATLONG") {
                              return option[fields.name]?.coordinates
                                .toString()
                                .replace(",", " ");
                            } else
                              return option[fields.name]
                                ? textExtractor(option[fields.name], fields)
                                : "";
                          })
                          .filter((v) => v != "" || null);
                        let copyName = names.toString();
                        let nameArray = copyName.split(",");
                        let nameWithDelimiter = getDelimiter(nameArray) || "";
                        return names.length > 0 ? nameWithDelimiter : "";
                      }
                    }}
                    filterOptions={(options, state) => {
                      if (
                        isMultiselect &&
                        value?.length > 0 &&
                        options?.length
                      ) {
                        value.map((val) => {
                          let index = options.findIndex(
                            (res) => res.sys_gUid == val.sys_gUid
                          );
                          if (index > -1) options.splice(index, 1);
                        });
                      }
                      if (options?.length == 0) {
                        return [NoTextOption, buttonOption];
                      }
                      return [...options, buttonOption];
                    }}
                    renderOption={(option) => {
                      let names = [];
                      displayFields.map((fields) => {
                        return names.push(fields.name);
                      });
                      if (Object.keys(option).length == 0) return "";
                      if (option?.key == "create") {
                        return buttonOption;
                      } else if (option?.key == "nooption") {
                        return NoTextOption;
                      } else {
                        names = displayFields
                          .map((fields) => {
                            if (fields?.hideOnHeaderPanel === true) return "";
                            else if (fields?.name.includes(".")) {
                              return getMultiColRefName(fields.name, option);
                            } else if (fields.type == "LATLONG") {
                              return (
                                option[fields.name]?.coordinates
                                  .toString()
                                  .replace(",", " ") || ""
                              );
                            } else
                              return (
                                textExtractor(option[fields.name], fields) || ""
                              );
                          })
                          .filter((v) => v != "" || null);
                        let copyName = names.toString();
                        let nameArray = copyName.split(",");
                        let nameWithDelimiter = getDelimiter(nameArray) || "";
                        if (entityName == "User") {
                          const n = copyName.trim().split(/\s+/);
                          return names.filter(function (entry) {
                            return entry.trim() != "";
                          }).length > 0 ? (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "row",
                                }}
                              >
                                <span>{option?.firstName}</span>
                                <span style={{ paddingLeft: "5px" }}>
                                  {option?.lastName}
                                </span>
                              </div>
                              {displayNames.map((obj) => {
                                return (
                                  <span style={{ fontSize: "12px" }}>
                                    {obj.name != "lastName" &&
                                      obj.name != "firstName" &&
                                      option[obj.name]}
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            ""
                          );
                        } else {
                          return names.length > 0 ? (
                            <span>{nameWithDelimiter}</span>
                          ) : (
                            ""
                          );
                        }
                      }
                    }}
                    noOptionsText={
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Button
                          variant="outlined"
                          size="small"
                          color="primary"
                          onClick={() => setShowModal(true)}
                        >
                          Create
                        </Button>
                      </Box>
                    }
                    onChange={(event, newValue) => {
                      if (multiSelect) {
                        if (newValue?.length > 0) {
                          let l = newValue?.length - 1;
                          if (newValue[l].hasOwnProperty("sys_gUid"))
                            setValue(newValue ? newValue : []);
                          else delete newValue[l];
                          if (cardView) setIsCardVisible(!isCardVisible);
                        } else {
                          if (cardView) setIsCardVisible(false);
                          setValue([]);
                        }
                      } else if (!multiSelect) {
                        if (newValue?.hasOwnProperty("sys_gUid")) {
                          setValue(newValue ? newValue : {});
                          if (cardView) setIsCardVisible(!isCardVisible);
                        } else if (newValue == null) {
                          setValue(multiSelect ? [] : {});
                          if (cardView) setIsCardVisible(false);
                        }
                      }
                    }}
                    onInputChange={(event, value) => {
                      if (event) return handleInputChange(value);
                    }}
                    classes={classes}
                  />
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
                      {fieldmeta?.description}
                    </DisplayText>
                  </div>
                </ToolTipWrapper>
              </DisplayFormControl>
            ) : (
              isCardVisible &&
              !multiSelect &&
              Object.keys(value).length > 0 && (
                <div
                  style={{
                    border: " 1px solid #bfbaba",
                    borderRadius: "5px",
                    boxShadow:
                      "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "row",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        padding: "5px",
                        display: "flex",
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: 1,
                      }}
                    >
                      {cardDetails?.map((obj) => {
                        if (obj?.hideOnHeaderPanel == true) return;
                        if (obj.type == "LATLONG") {
                          return (
                            <>
                              <div
                                style={{
                                  height: "100px",
                                  width: "33%",
                                  flexGrow: 1,
                                }}
                              >
                                <MemoMapCall obj={obj?.value?.coordinates} />
                              </div>
                              <div style={{ width: "33%", flexGrow: 1 }}>
                                {Object.entries(obj?.value).map((fields) => {
                                  if (obj?.visibleFields?.includes(fields[0])) {
                                    return (
                                      <span
                                        style={{
                                          fontSize: "12px",
                                          padding: "5px",
                                          wordBreak: "break-word",
                                        }}
                                      >
                                        <span style={{ fontWeight: "700" }}>
                                          {makeUpperCase(fields[0])} :
                                        </span>
                                        <span>{fields[1]} </span>
                                      </span>
                                    );
                                  }
                                })}
                              </div>
                            </>
                          );
                        }
                        return (
                          <span
                            style={{
                              fontSize: "12px",
                              padding: "5px",
                              width: cardView?.colspan == 1 ? "75%" : "29%",
                              minWidth: "140px",
                              flexGrow: 1,
                              wordBreak: "break-word",
                            }}
                          >
                            <span style={{ fontWeight: "700" }}>
                              {obj.title}:
                            </span>
                            {textExtractor(obj.value, obj) || "N/A"}
                          </span>
                        );
                      })}
                    </div>
                    {readAccess && (
                      <Visibility
                        onClick={() => setDetail({ show: true })}
                        size={10}
                        style={{
                          cursor: "pointer",
                          color: "black",
                          margin: "10px",
                        }}
                      />
                    )}
                  </div>
                  {readAccess && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "end",
                        width: "100%",
                      }}
                    >
                      <a
                        onClick={() => {
                          if (
                            disable ||
                            !canUpdate ||
                            stateParams.mode == "READ"
                          )
                            return;
                          return setIsCardVisible(!isCardVisible);
                        }}
                        style={{
                          textDecoration: "underline",
                          color: "blue",
                          padding: "0px 5px",
                          cursor: "pointer",
                          fontSize: "14px",
                          opacity:
                            disable || !canUpdate || stateParams.mode == "READ"
                              ? 0.5
                              : "",
                        }}
                      >
                        {cardView?.switchTitle
                          ? cardView?.switchTitle
                          : "Change"}
                      </a>
                    </div>
                  )}
                </div>
              )
            )}
          </>
        );
      }
    }
  };

  return (
    <>
      {renderField()}
      <DisplayDialog {...dialogProps} />

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
      <DisplayModal open={showDetail?.show} fullWidth={true} maxWidth="xl">
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
              {showDetail?.show && (
                <DetailContainer
                  appname={appName ? appName : "NueGov"}
                  modulename={moduleName}
                  groupname={entityName}
                  //metadata={referenceMeta}
                  id={fieldmeta.multiSelect ? showDetail?.id : value.id}
                  mode="read"
                  options={{
                    hideTitlebar: true,
                  }}
                  onClose={(e) => setDetail({ show: false })}
                  detailMode="REFERENCE"
                />
              )}
            </div>
          </ContainerWrapper>
        </div>
      </DisplayModal>
    </>
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

export default GridWrapper(FormThemeWrapper(SystemReference));

const useStyles1 = makeStyles({
  paper: {
    "& ul": {
      paddingBottom: "0px",
    },
    "& li:last-child": {
      position: "sticky",
      bottom: 0,
      zIndex: 22332,
      backgroundColor: "white",
    },
  },
  // chips: {
  //   display: "flex",
  //   justifyContent: "center",
  //   flexWrap: "wrap",
  // },
  inputRoot: {
    "& .MuiAutocomplete-clearIndicator": {
      visibility: "visible",
    },
    "& .MuiAutocomplete-endAdornment": {
      position: "initial",
    },
    "& .MuiAutocomplete-popupIndicator": {
      // position: "absolute"
    },
  },
});

const MemoMapCall = ({ obj }) => {
  //this functional component is used to avoid unwanted rerendering on fields value change
  const map = useMemo(() => {
    return (
      <MapComponent
        marker={[
          {
            position: obj?.length
              ? {
                  lat: obj[1],
                  lng: obj[0],
                }
              : {
                  lat: 0,
                  lng: 0,
                },
            title: "",
            color: "red",
          },
        ]}
      />
    );
  }, [obj]);
  return <div style={{ height: "100%" }}> {map}</div>;
};
