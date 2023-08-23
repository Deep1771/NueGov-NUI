import React, { useEffect, useContext, useState, useRef, useMemo } from "react";
import SUMMARY_TABLE from "nuegov/summary_table";
import {
  DisplayIconButton,
  DisplayText,
  DisplayDialog,
  DisplayFormLabel,
  DisplayAvatar,
  DisplayModal,
  DisplayCheckbox,
  DisplayButton,
  DisplayChips,
  DisplayProgress,
  DisplayBadge,
  DisplayCard,
} from "components/display_components";
import { withStyles } from "@material-ui/core/styles";
import { HotButton, Banner, MoreOptions } from "components/helper_components/";
import { textExtractor } from "utils/services/helper_services/system_methods";
// import { DEFAULT_COLUMN_PROPERTIES } from "./components/grid/constant";
import { SummaryGridContext } from ".";
import { get, sortBy, unionBy } from "lodash";
import { SystemIcons } from "utils/icons";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import PictureAsPdfOutlinedIcon from "@material-ui/icons/PictureAsPdfOutlined";
// import CellBuilder from "./components/grid/grid_cell_builder";
import { CellEdit } from "./cell_edit";
import {
  UserFactory,
  GlobalFactory,
  ThemeFactory,
} from "utils/services/factory_services";
import { useStateValue } from "utils/store/contexts";
import GridServices from "./utils/services";
import "./utils/style.css";
import {
  childEntity,
  entity,
} from "utils/services/api_services/entity_service";
import { entityTemplate } from "utils/services/api_services/template_service";
import {
  ContextMenuWrapper,
  ContainerWrapper,
  ToolTipWrapper,
} from "components/wrapper_components";
import { ContextSummary } from "containers/composite_containers/summary_container/components/context_summary";
import { useHistory, useLocation } from "react-router-dom";
import queryString from "query-string";
import { DetailContainer } from "containers/composite_containers/detail_container/";
import Tooltip from "@material-ui/core/Tooltip";
import {
  CircularProgress,
  Menu,
  MenuItem,
  ListItem,
  LinearProgress,
  LinearProgressProps,
  Typography,
  Box,
} from "@material-ui/core";
import { ReportGenerator } from "components/helper_components";
import {
  TextSearch,
  DateSearch,
  ListSearch,
  NumberSearch,
  RadioSearch,
} from "./components/column";
import { switchUser } from "../../../containers/user_containers/profile_page/loginas/switchUser";
import ResetPwd from "containers/user_containers/profile_page/reset_pwd/index";
import { isDefined } from "utils/services/helper_services/object_methods";
import { setSummaryScrollPosition } from "utils/helper_functions";

export const Grid = ({
  editActionCallBack,
  renderThroughProps,
  writeAction = true,
  height = "80vh",
  smHeight = "40vh",
  relationInfo,
  screenType,
  relatedEntityInfo,
  appname,
  modulename,
  entityname,
  handleIdsFor360 = () => {},
  fromPage,
  relatedItemRefresh,
  changeRelatedItemRefresh = () => {},
  // archiveMode,
}) => {
  const [{ configState, userState }] = useStateValue();
  const { fullScreenSize } = configState;
  const { userData } = userState;
  const [modal, setModal] = useState(false);
  const [detailprops, setDetailpageProps] = useState({});
  const { setSnackBar, toggleDrawer, getContextualHelperData, handleSidebar } =
    GlobalFactory();
  const [openContext, setOpenContext] = useState(false);
  const [contextOptions, setContextOptions] = useState({});
  // const [selectedIds, setSelectedIds] = useState([]);
  const [b_anchorEl, setb_AnchorEl] = useState(null);
  const [resetPwd, setResetPwd] = useState(false);
  const [id, setId] = useState(null);
  const [autoPopulate, setPopulateData] = useState({});
  const [courseMadal, setCourseModal] = useState(false);
  const [couseDetails, setCouseDetails] = useState([]);
  const {
    Visibility,
    Lock,
    LockOpen,
    Edit,
    Delete,
    LocationOn,
    AddOutline,
    RemoveOutline,
    ArrowUpward,
    ArrowDownward,
    ArrowDropDown,
    PictureAsPdf,
    ArchiveOutlined,
    UnarchiveOutlined,
    PlaylistAdd,
    FileCopy,
    Copy,
    Launch,
    Close,
    CloseOutlined,
    Cached,
    Info,
  } = SystemIcons;

  const [gridProps, dispatch] = useContext(SummaryGridContext);
  let {
    metadata,
    data,
    columns,
    rows,
    params,
    selectedRows,
    globalsearch: globalSearchState,
    pageNumber,
    filter,
    archiveMode,
    sortInfo,
  } = gridProps;
  const currentData = useRef(data);
  const attachRef = useRef("");
  const [dialogProps, setDialogProps] = useState({ open: false });
  const fullScreen = useRef(fullScreenSize);
  const [openCellEdit, setCellEdit] = useState({
    open: false,
    fieldMeta: {},
  });
  const {
    gridActionButton = null,
    sys_hotButtons = false,
    sys_reports = [],
    actionColumns,
  } = metadata?.sys_entityAttributes;
  let { visible_summary = true } =
    metadata?.sys_entityAttributes?.sys_hotButtons || true;
  const {
    checkDeleteAccess,
    checkReadAccess,
    checkWriteAccess,
    checkDataAccess,
    checkSubAgencyLevel,
    getAgencyLogo,
    getAgencyName,
    checkFieldWriteAccess,
    checkGlobalFeatureAccess,
    getEntityFeatureAccess,
    isNJAdmin,
    isSuperAdmin,
    checkModuleAccess,
    isRootUser,
    getEntityFriendlyName,
  } = UserFactory();
  const { getData, getRoute, onDelete, getClickedDataInfo, getSortByObj } =
    GridServices();
  const { parentEntityParams, childEntityParams } = relatedEntityInfo || {};
  let createRef = useRef();
  const [clicked, setClicked] = useState([]);
  const [reportData, setReportData] = useState({
    reportFlag: false,
    data: undefined,
    metadata: metadata,
  });
  const defaultSort = metadata.sys_entityAttributes?.sortFilters;
  let location = useLocation();
  const history = useHistory();
  const BASE_URL = history.location.pathname;
  const [loading, setLoading] = useState(true);
  const { getVariantForComponent, getVariantObj } = ThemeFactory();
  const { dark, light } = getVariantObj("primary");
  const color = dark?.bgColor;
  let qParams = queryString.parse(location?.search);
  let { globalsearch } = qParams;
  let { archiveConfig, sys_autoSaveReports = false } =
    metadata?.sys_entityAttributes || {};
  const REPORT_VISIBILITY =
    checkGlobalFeatureAccess("Reports") &&
    getEntityFeatureAccess(appname, modulename, entityname, "Reports") &&
    !isNJAdmin() &&
    sys_reports?.length
      ? true
      : false;
  const helperData = getContextualHelperData("SUMMARY_SCREEN");

  const { showOptions } = actionColumns || {};
  let { isCloneEnabled = false } =
    metadata?.sys_entityAttributes?.cloneConfig || false;
  const relatedEntities =
    metadata?.sys_entityAttributes?.sys_entityRelationships;
  let entitiesToAttach = relatedEntities?.filter((e) =>
    e?.hasOwnProperty("createButton")
  );

  entitiesToAttach =
    isDefined(entitiesToAttach) && isDefined(entitiesToAttach[0])
      ? [entitiesToAttach[0]]
      : [];
  let { showModal = true } = entitiesToAttach[0] || {};

  const getAttachMessage = (rd) => {
    if (checkAttachedStatus(rd)) {
      return entitiesToAttach[0]?.createButton?.hideOn?.message
        ? entitiesToAttach[0]?.createButton?.hideOn?.message
        : "Disabled";
    } else if (entitiesToAttach?.length === 1) {
      return entitiesToAttach[0]?.createButton?.title
        ? entitiesToAttach[0]?.createButton?.title
        : "Attach";
    } else {
      return "Attach";
    }
  };

  const HtmlTooltip = withStyles((theme) => ({
    tooltip: {
      backgroundColor: "#f5f5f9",
      color: "rgba(0, 0, 0, 0.87)",
      maxWidth: 220,
      fontSize: theme.typography.pxToRem(12),
      border: "1px solid #dadde9",
    },
  }))(Tooltip);
  const showZoomToAsset =
    metadata.sys_entityAttributes.sys_topLevel.findIndex((field) =>
      ["DESIGNER", "LATLONG"].includes(field.type)
    ) > -1;

  function getPathFromUrl(url) {
    return url.split("?")[1];
  }

  const queryToUrl = (params) =>
    Object.keys(params || {})
      .map((key) => key + "=" + params[key])
      .join("&");
  const handleSortUnclick = () => {
    setClicked([]);
    let qParams = queryString.parse(location?.search);
    let { globalsearch = null, sortby, orderby, ...rest } = qParams;
    if (isRelation()) {
      const deletingKeys = ["sortBy", "globalsearch", "orderby"];
      for (let i of deletingKeys) delete filter[i];
      rest = filter;
    }
    let restParams = Object.keys(rest)?.length ? rest : {};
    let searchValue = globalsearch ? { globalsearch } : {};
    let relatedEntityData = isRelation() ? relatedEntityInfo : {};
    dispatch({ type: "SORT_INFO", payload: {} });
    if (!isRelation())
      history.push(
        `${BASE_URL}?${queryToUrl({ ...searchValue, ...restParams })}`
      );
    dispatch({
      type: "SET_LOADER",
      payload: {
        isLoading: true,
      },
    });
    getData(
      isRelation() ? globalSearchState : globalsearch,
      pageNumber,
      rest,
      isRelation() ? "RELATION" : "SUMMARY",
      relatedEntityData
    );
  };

  const handleSortClick = (status, e, index) => {
    let qParams = queryString.parse(location?.search);
    qParams = {
      ...qParams,
      ...filter,
      sortby:
        e.type === "REFERENCE"
          ? `${e.name}.${e.displayFields[index].name}`
          : e.name,
      orderby: status === "ascending" ? 1 : -1,
    };
    let { globalsearch = null, ...rest } = qParams;
    e?.type === "REFERENCE"
      ? setClicked([`${e.name}.${e.displayFields[index].name}`, status])
      : setClicked([e.name, status]);
    let relatedEntityData = isRelation() ? relatedEntityInfo : {};
    dispatch({
      type: "SET_LOADER",
      payload: {
        isLoading: true,
      },
    });
    const { sortby, orderby } = qParams;
    dispatch({ type: "SORT_INFO", payload: { sortby, orderby } });
    getData(
      isRelation() ? globalSearchState : globalsearch,
      pageNumber,
      rest,
      isRelation() ? "RELATION" : "SUMMARY",
      relatedEntityData
    );
    if (!isRelation()) history.push(`${BASE_URL}?${queryToUrl(qParams)}`);
  };

  const handleSort = (status, e, name, index) => {
    JSON.stringify([name, status]) === JSON.stringify(clicked)
      ? handleSortUnclick()
      : handleSortClick(status, e, index);
  };

  const filterFields = (metadata) => {
    let columns = get(
      metadata,
      "sys_entityAttributes.sys_topLevel",
      []
    )?.filter((fm) => fm.type !== "SECTION" && fm.visible);
    columns = columns.reduce((acc, curr) => {
      if (!acc.length) acc.push(curr);
      else {
        if (curr.type === "LIST") {
          let checkForDuplicate = acc.findIndex((e) => e.name === curr.name);
          if (checkForDuplicate != -1)
            acc[checkForDuplicate] = {
              ...acc[checkForDuplicate],
              values: [...acc[checkForDuplicate].values, ...curr.values],
            };
        }
        let checkForDuplicate = acc.find((e) => e.name === curr.name);
        if (!checkForDuplicate) acc.push(curr);
      }
      return acc;
    }, []);
    return {
      columns: sortBy(columns, "order"),
      length: columns.length,
    };
  };
  const updateCellEdit = async (fieldMeta, modifiedFormData) => {
    let allowUpdate;
    if (fieldMeta.required && modifiedFormData) {
      allowUpdate = true;
    }
    if (!fieldMeta.required && modifiedFormData) {
      allowUpdate = true;
    }
    if (allowUpdate) {
      await entity
        .update(
          { appname, modulename, entityname, id: modifiedFormData._id },
          modifiedFormData
        )
        .then((res) => {
          setCellEdit({
            open: false,
            fieldMeta: {},
            eachRowData: {},
          });
          dispatch({
            type: "ADD_ROW_COLUMNS",
            payload: {
              columns: getGridHeaders(metadata),
              rows: getGridRows(data, metadata),
            },
          });
        })
        .catch((e) => {
          console.log("Failed ot update the data", e);
        });
    }
  };
  const handleZoomToAsset = (e, data) => {
    let mapControl = createRef.current.map;
    if (mapControl !== null) {
      let geoField = metadata.sys_entityAttributes.sys_topLevel.find((field) =>
        ["DESIGNER", "LATLONG"].includes(field.type)
      );
      let bounds = new window.google.maps.LatLngBounds();
      switch (geoField.type) {
        case "LATLONG":
          try {
            let location = data.sys_entityAttributes[geoField.name];
            bounds.extend(
              new window.google.maps.LatLng({
                lat: location.coordinates[1],
                lng: location.coordinates[0],
              })
            );
            createRef.current.map.fitBounds(bounds);
            break;
          } catch (e) {
            //ignore if no data point
            setSnackBar({
              message: `No Location data Present in selected asset.`,
              severity: "info",
            });
          }
          break;
        case "DESIGNER":
          try {
            if (data.sys_entityAttributes[geoField.name].length === 0)
              throw { error: "no data" };

            data.sys_entityAttributes[geoField.name].map((shape) => {
              switch (shape.type) {
                case "Polygon":
                  shape.coordinates[0].map((point) => {
                    let p = new window.google.maps.LatLng(point[1], point[0]);
                    bounds.extend(p);
                  });
                  break;
                case "LineString":
                  shape.coordinates.map((point) => {
                    let p = new window.google.maps.LatLng(point[1], point[0]);
                    bounds.extend(p);
                  });
                  break;
                case "Point":
                  let p = new window.google.maps.LatLng(
                    shape.coordinates[1],
                    shape.coordinates[0]
                  );
                  bounds.extend(p);
              }
            });
            mapControl.fitBounds(bounds);
          } catch (e) {
            //ignore if no data
            setSnackBar({
              message: `No Location data Present in selected asset.`,
              severity: "info",
            });
          }
          break;
      }
    }
  };
  const handleAddFieldValue = (fieldValue, fieldMeta, formdata) => {
    let { multiSelect, static_filters, dynamicFilters } = fieldMeta;
    if (multiSelect) {
      setContextOptions({
        ...fieldMeta,
        selectedIds: fieldValue,
        select: "multiple",
        formdata: formdata,
        filters: handleFilters(fieldMeta, static_filters),
      });
      setOpenContext(true);
    } else {
      setContextOptions({
        ...fieldMeta,
        formdata: formdata,
        filters: handleFilters(fieldMeta, static_filters),
      });
      setOpenContext(true);
    }
  };

  const lockData = async (formData) => {
    if (formData.sys_entityAttributes.locked)
      formData.sys_entityAttributes.locked = false;
    else formData.sys_entityAttributes.locked = true;
    await entity
      .update(
        {
          appname,
          modulename,
          entityname,
          id: formData._id,
        },
        formData
      )
      .then((res) => {
        dispatch({
          type: "ADD_ROWS_COLUMNS",
          payload: {
            columns: getGridHeaders(metadata),
            rows: getGridRows(data, metadata),
          },
        });
      })
      .catch((e) => {
        console.log("Failed to lock the data", e);
      });
  };
  const handleRemoveFieldValue = async (
    fieldValue,
    fieldMeta,
    formdata,
    index
  ) => {
    let { name, multiSelect } = fieldMeta;
    let { _id, sys_gUid } = formdata;
    if (multiSelect) {
      if (Array.isArray(fieldValue)) fieldValue.splice(index, 1);
      formdata["sys_entityAttributes"][name] = fieldValue;
    } else {
      delete formdata["sys_entityAttributes"][name];
    }
    //updating the document
    await entity
      .update({ appname, modulename, entityname, id: _id }, formdata)
      .then((res) => {
        dispatch({
          type: "ADD_ROWS_COLUMNS",
          payload: {
            columns: getGridHeaders(metadata),
            rows: getGridRows(currentData?.current, metadata),
          },
        });
      })
      .catch((err) => {
        console.log("the error accuerd while updating in summary grid", err);
      });
    //changeRelatedItemRefresh(true);
  };

  const handleDetailPageModal = (fieldMetadata, fieldValue) => {
    let { appName, moduleName, entityName } = fieldMetadata;
    let obj = {
      appname: appName,
      modulename: moduleName,
      groupname: entityName,
      mode: "read",
      options: {
        hideTitleBar: true,
      },
      id: fieldValue.id,
    };
    setDetailpageProps(obj);
    setModal(true);
  };

  const getReferenceSimplified = (
    displayFields,
    result = [],
    previousData = []
  ) => {
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
              "PAIREDLIST",
              "CHECKBOX",
              "LIST",
              "CURRENCY",
            ].includes(item1.type)
          )
            displayKeys[item1.name] = item["sys_entityAttributes"][item1.name];
          else if (item1.type === "PHONENUMBER") {
            if (
              item.sys_entityAttributes[item1.name] &&
              Object.keys(item.sys_entityAttributes[item1.name]).length
            ) {
              if (item.sys_entityAttributes[item1.name]["uiDisplay"]) {
                displayKeys[item1.name] =
                  item.sys_entityAttributes[item1.name]["uiDisplay"];
              } else {
                //loop the phone numer object and concat the values
              }
            }
          } else if (item1.type === "AUTOFILL") {
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
              displayKeys[displayName] = item["sys_entityAttributes"][fieldName]
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

      if (previousData?.length) {
        previousData = previousData?.filter((e) => !e?._id);
        result = unionBy(previousData, result, "sys_gUid");
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
        return result;
      } else {
        return result;
      }
    }
  };
  const handleContextCancel = async (selectedVal) => {
    setOpenContext(false);
    let { entityTemplate } = selectedVal;
    let { formdata, name, multiSelect, displayFields } = contextOptions;
    let { _id } = formdata;
    let simplifiedData = getReferenceSimplified(
      displayFields,
      selectedVal?.data,
      selectedVal?.selectedData
    );
    if (simplifiedData?.length) {
      if (multiSelect) {
        formdata["sys_entityAttributes"][name] = simplifiedData;
      } else {
        formdata["sys_entityAttributes"][name] = simplifiedData[0];
      }
      //updating the document
      await entity
        .update({ appname, modulename, entityname, id: _id }, formdata)
        .then((res) => {
          dispatch({
            type: "ADD_ROWS_COLUMNS",
            payload: {
              columns: getGridHeaders(metadata),
              rows: getGridRows(data, metadata),
            },
          });
          setOpenContext(false);
        })
        .catch((err) => {
          console.log("the error accuerd while updating in summary grid", err);
          setOpenContext(false);
        });
    } else {
      setOpenContext(false);
    }
  };
  const isRelation = () =>
    screenType === "RELATION" &&
    relatedEntityInfo &&
    Object.keys(relatedEntityInfo).length;

  const checkEachRowDataAccess = (rowdata, metadata, permissionType) => {
    if (isRelation()) {
      let access = checkDataAccess({
        appname: childEntityParams.appname,
        modulename: childEntity.modulename,
        entityname: childEntity.entityname,
        permissionType: permissionType,
        data: rowdata,
        metadata: metadata,
      });
      return true;
    } else {
      return checkDataAccess({
        appname,
        modulename,
        entityname,
        permissionType: permissionType,
        data: rowdata,
        metadata: metadata,
      });
    }
  };

  const handleColumnSearch = (filter) => {
    let relatedEntityData = isRelation() ? relatedEntityInfo : {};
    if (isRelation()) {
      filter = { ...filter, ...sortInfo };
    }
    getData(
      isRelation() ? globalSearchState : globalsearch,
      1,
      { ...filter, archiveMode },
      isRelation() ? "RELATION" : "SUMMARY",
      relatedEntityData
    );
    if (!isRelation()) {
      history.push(`${BASE_URL}?${queryToUrl({ ...filter, page: 1 })}`);
    }
  };

  const archiveData = async (archData, archMeta) => {
    if (archiveMode?.toUpperCase() === "ARCHIVE") {
      archData["sys_entityAttributes"][archMeta.fieldName] =
        archMeta?.unarchiveValue;
    } else if (archiveMode?.toUpperCase() === "UNARCHIVE") {
      archData["sys_entityAttributes"][archMeta.fieldName] =
        archMeta?.archiveValue;
    }

    if (archMeta.archive) {
      await entity
        .update(
          {
            appname,
            modulename,
            entityname,
            id: archData._id,
          },
          archData
        )
        .then((res) => {
          dispatch({
            type: "ADD_ROWS_COLUMNS",
            payload: {
              columns: getGridHeaders(metadata),
              rows: getGridRows(data, metadata),
            },
          });
          dispatch({
            type: "SET_LOADER",
            payload: {
              loader: true,
            },
          });
          getData(
            globalsearch,
            getGridRows(data, metadata).length - 1 === 0 ? 1 : pageNumber,
            { ...filter, archiveMode },
            isRelation() ? "RELATION" : "SUMMARY"
          );
          history.push(
            `${BASE_URL}?${queryToUrl({
              ...filter,
              page:
                getGridRows(data, metadata).length - 1 === 0 ? 1 : pageNumber,
            })}`
          );
        })
        .catch((e) => {
          console.log("Failed to archiveData the data", e);
        });
    }
  };
  const handleArchive = (rowData, metadata) => {
    let { archiveConfig } = metadata.sys_entityAttributes || {};

    setDialogProps({
      open: true,
      title:
        archiveMode?.toUpperCase() === "ARCHIVE"
          ? archiveConfig?.unarchiveTitle
          : archiveConfig?.archiveTitle || "",
      message:
        archiveMode?.toUpperCase() === "ARCHIVE"
          ? archiveConfig?.unarchiveMessage
          : archiveConfig?.archiveMessage || "",
      confirmLabel:
        archiveMode?.toUpperCase() === "ARCHIVE" ? "Unarchive" : "Archive",
      cancelLabel: "Cancel",
      onCancel: () => {
        setDialogProps({ open: false });
      },
      onConfirm: () => {
        setDialogProps({ open: false });
        archiveData(rowData, archiveConfig);
        setSnackBar({
          message:
            archiveMode?.toUpperCase() === "ARCHIVE"
              ? archiveConfig?.unarchiveSuccess
              : archiveConfig?.archiveSuccess,
          severity: "success",
        });
      },
    });
  };

  const renderArchIcon = (rowdata) => {
    if (archiveMode?.toUpperCase() === "ARCHIVE") {
      return (
        <UnarchiveOutlined
          style={{
            color: color,
            cursor: "pointer",
            height: "18px",
            paddingRight: "4px",
          }}
          onClick={async () => {
            handleArchive(rowdata, metadata);
          }}
        />
      );
    } else {
      return (
        <ArchiveOutlined
          style={{
            color: color,
            cursor: "pointer",
            height: "18px",
            paddingRight: "4px",
          }}
          onClick={async () => {
            handleArchive(rowdata, metadata);
          }}
        />
      );
    }
  };

  const handleOnclickItem = async (itemData, rdata) => {
    let childMeta = await entityTemplate
      .get({
        appname: itemData.appName,
        modulename: itemData.moduleName,
        groupname: itemData.entityName,
      })
      .then((res) => {
        console.log("res ->", res);
        return res;
      })
      .catch((er) => {
        console.log("err -> ", er);
      });

    let parentFieldName = itemData.path.split(".")[1];
    let autoData = {
      [parentFieldName]: {},
    };
    let { sys_entityAttributes } = rdata;

    let definition = childMeta.sys_entityAttributes.sys_topLevel.find(
      (e) => e.name === parentFieldName
    );
    definition &&
      definition.displayFields.map((item) => {
        if (item.name.split(".").length > 1) {
          let name = item.name.split(".")[0];
          let childFieldName =
            item.name.split(".")[item.name.split(".").length - 1];
          if (
            sys_entityAttributes[name] &&
            Object.keys(sys_entityAttributes[name]).length
          )
            autoData[parentFieldName][childFieldName] =
              sys_entityAttributes[name][childFieldName];
        } else
          autoData[parentFieldName][item.name] =
            sys_entityAttributes[item.name];
      });
    autoData[parentFieldName]["id"] = rdata._id;
    autoData[parentFieldName]["sys_gUid"] = rdata.sys_gUid;
    let businessInfo = {
      businessTypeInfo: get(
        rdata,
        "sys_entityAttributes.businessTypeInfo",
        false
      ),
    };
    businessInfo?.businessTypeInfo &&
      (autoData = { ...autoData, ...businessInfo });
    setPopulateData({ sys_entityAttributes: autoData });

    setDialogProps({ open: false });
    setDetailpageProps({
      appname: itemData.appName,
      modulename: itemData.moduleName,
      groupname: itemData.entityName,
      mode: "new",
      options: {
        hideTitleBar: true,
      },
      autodata: { sys_entityAttributes: autoData },
    });
    setModal(true);
    dispatch({
      type: "ADD_ROWS_COLUMNS",
      payload: {
        columns: getGridHeaders(metadata),
        rows: getGridRows(data, metadata),
        selectedRows: selectedRows,
      },
    });
  };

  const rendarItemdata = (itemData, rdata) => {
    return (
      <ListItem
        onClick={() => handleOnclickItem(itemData, rdata)}
        style={{ cursor: "pointer" }}
      >
        {itemData?.createButton?.title}
      </ListItem>
    );
  };

  const checkAttachedStatus = (rd) => {
    let VALUES = entitiesToAttach[0]?.createButton?.hideOn?.values;
    return VALUES?.includes(
      rd?.sys_entityAttributes?.[
        entitiesToAttach[0]?.createButton?.hideOn?.path
      ]
    );
  };

  const handleAttachClick = async (rdata) => {
    if (entitiesToAttach?.length === 1) {
      handleOnclickItem(entitiesToAttach[0], rdata);
    } else {
      setDialogProps({
        open: true,
        title: `Select any of the below to attach with existing entity`,
        showActionButtons: false,
        content: (
          <div>
            {entitiesToAttach?.map((eri, r) => {
              return rendarItemdata(eri, rdata);
            })}
          </div>
        ),
        onCancel: () => {
          setDialogProps({ open: false });
        },
        onConfirm: () => {
          setDialogProps({ open: false });
        },
      });
    }
  };

  const handleAttachClose = (rd) => {
    setb_AnchorEl(null);
    attachRef.current = "";
    sessionStorage.removeItem("rowId");
  };

  const showOnActionColumn = (option) => {
    let filtered = showOptions?.filter((e) => e?.title == option);
    return filtered ? filtered[0]?.visible : false;
  };

  const handleLoginAs = (rowdata) => {
    setDialogProps({
      testid: "loginAs",
      open: true,
      title: `Login as - ${get(rowdata, "sys_entityAttributes.username")} ?`,
      message: "You can switch back later using exit icon in navigation bar",
      cancelLabel: "Cancel",
      confirmLabel: "Yes, Login",
      onCancel: () => {
        setDialogProps({ open: false });
      },
      onConfirm: () => {
        setDialogProps({ open: false });
        switchUser(history, rowdata, userData);
      },
    });
  };

  const handleResetPassword = async (formdata) => {
    let { _id } = formdata;
    let data = JSON.parse(JSON.stringify(formdata));
    data.sys_entityAttributes.forceReset = true;
    await entity
      .update({ appname, modulename, entityname, id: _id }, data)
      .then((res) => {
        setSnackBar({
          message: `Email has been sent to the user to reset password`,
          severity: "success",
        });
      })
      .catch((err) => {
        console.log("the error accuerd while resetting password", err);
      });
  };

  const handleResetDialog = (rowdata) => {
    if (!isNJAdmin())
      setDialogProps({
        testid: "forceReset",
        open: true,
        title: `Reset Password`,
        message: `Email will be sent to ${
          rowdata.sys_entityAttributes.email
            ? rowdata.sys_entityAttributes.email
            : "User"
        } to reset password`,
        cancelLabel: "Cancel",
        confirmLabel: "Yes, Reset",
        onCancel: () => {
          setDialogProps({ open: false });
        },
        onConfirm: () => {
          setDialogProps({ open: false });
          handleResetPassword(rowdata);
        },
      });
    else {
      setId(rowdata._id);
      setResetPwd(true);
    }
  };

  const getGridHeaders = (metadata) => {
    let write, read, deleteR;
    let actionColumn = {};

    if (isRelation()) {
      let childParams = {
        appname: childEntityParams.appname,
        modulename: childEntityParams.modulename,
        entityname: childEntityParams.entityname,
      };
      write = checkWriteAccess(childParams);
      read = checkReadAccess(childParams);
      deleteR = checkDeleteAccess(childParams);
    } else {
      write = checkWriteAccess(params);
      read = checkReadAccess(params);
      deleteR = checkDeleteAccess(params);
    }

    let computeWidth = () => {
      let isSubAgencyActiveDataExists = currentData?.current?.some(
        (eachData) => {
          return (
            entityname == "Agency" &&
            get(
              eachData,
              "sys_entityAttributes.agencyPermission.preset.subAgencyActive"
            )
          );
        }
      );

      let isSampleDataExists = currentData?.current?.some((eachData) => {
        return get(eachData, "sys_entityAttributes.sampleData", false);
      });
      let isDeleteEnabled = deleteR && showOnActionColumn("Delete");
      let isArchiveEnabled =
        archiveConfig?.archive &&
        !isRelation() &&
        showOnActionColumn("Archive");
      let isAttachEnabled =
        entitiesToAttach?.length == 1 && showOnActionColumn("Attach");
      let isClone =
        !isRelation() &&
        showOnActionColumn("Clone") &&
        (isCloneEnabled || isNJAdmin()) &&
        write;
      let hotButtons =
        Object.values(sys_hotButtons)?.length && visible_summary ? 4 : 0;
      let sampleChip =
        isSubAgencyActiveDataExists || isSampleDataExists ? 2 : 0;
      let showMap = !fullScreen.current && showZoomToAsset ? 1 : 0;
      let isReportVisible = REPORT_VISIBILITY && showOnActionColumn("Reports");
      let visibleOptions = showOptions?.filter((opt) => opt.visible);

      let deleteMenuItem = visibleOptions?.find(
        (item) => item.title === "Delete"
      );
      if (deleteMenuItem) {
        deleteMenuItem.calcWidth = isDeleteEnabled;
      }

      let cloneMenuItem = visibleOptions?.find(
        (item) => item.title === "Clone"
      );
      if (cloneMenuItem) {
        cloneMenuItem.calcWidth = isClone;
      }
      let zoomMenuItem = visibleOptions?.find(
        (item) => item.title === "Zoom To Asset"
      );
      if (zoomMenuItem) {
        zoomMenuItem.calcWidth = showMap;
      }
      let hotButtonMenuItem = visibleOptions?.find(
        (item) => item.title === "Hot Buttons"
      );
      if (hotButtonMenuItem) {
        hotButtonMenuItem.calcWidth = hotButtons;
      }
      let reportMenuItem = visibleOptions?.find(
        (item) => item.title === "Reports"
      );
      if (reportMenuItem) {
        reportMenuItem.calcWidth = isReportVisible;
      }
      let archiveMenuItem = visibleOptions?.find(
        (item) => item.title === "Archive"
      );
      if (archiveMenuItem) {
        archiveMenuItem.calcWidth = isArchiveEnabled;
      }
      let attachMenuItem = visibleOptions?.find(
        (item) => item.title === "Attach"
      );
      if (attachMenuItem) {
        attachMenuItem.calcWidth = isAttachEnabled;
      }
      visibleOptions = visibleOptions?.filter((option) => {
        if (!option.hasOwnProperty("calcWidth")) return true;
        else if (option.calcWidth) {
          return true;
        } else return false;
      });

      if (visibleOptions?.length && hotButtons) {
        return (
          (visibleOptions.length + hotButtons + showMap + 1 + sampleChip) * 30
        );
      } else if (hotButtons) {
        return (hotButtons + 3 + showMap + sampleChip) * 30;
      } else if (visibleOptions?.length) {
        return (visibleOptions.length + 2 + showMap + sampleChip) * 30;
      } else {
        return (3 + showMap + sampleChip) * 30;
      }
    };

    // let computeWidth = () => {
    //   let hotButtons =
    //     Object.values(sys_hotButtons)?.length && visible_summary ? 2 : 1;
    //   if (read && deleteR && sys_hotButtons && visible_summary)
    //     if (!fullScreen.current && showZoomToAsset)
    //       return (
    //         (Number(read) +
    //           Number(deleteR) +
    //           Number(!fullScreen.current && showZoomToAsset) +
    //           Number(hotButtons) +
    //           Number(REPORT_VISIBILITY)) *
    //         60
    //       );
    //     else
    //       return (
    //         (Number(read) +
    //           Number(deleteR) +
    //           Number(hotButtons) +
    //           Number(REPORT_VISIBILITY)) *
    //         65
    //       );
    //   else if ((read || deleteR) && sys_hotButtons && visible_summary)
    //     if (!fullScreen.current && showZoomToAsset)
    //       return (
    //         (Number(read || deleteR) +
    //           Number(!fullScreen.current && showZoomToAsset) +
    //           Number(hotButtons) +
    //           Number(REPORT_VISIBILITY)) *
    //         65
    //       );
    //     else
    //       return (
    //         (Number(read || deleteR) +
    //           Number(hotButtons) +
    //           Number(REPORT_VISIBILITY)) *
    //         80
    //       );
    //   else if (read && deleteR)
    //     if (!fullScreen.current && showZoomToAsset)
    //       return (
    //         (Number(read) +
    //           Number(deleteR) +
    //           Number(!fullScreen.current && showZoomToAsset) +
    //           Number(REPORT_VISIBILITY)) *
    //         40
    //       );
    //     else
    //       return (
    //         (Number(read) + Number(deleteR) + Number(REPORT_VISIBILITY)) * 50
    //       );
    //   else if (!fullScreen.current && showZoomToAsset)
    //     return (
    //       (Number(read || deleteR) +
    //         Number(!fullScreen.current && showZoomToAsset) +
    //         Number(REPORT_VISIBILITY)) *
    //       40
    //     );
    //   else if ((read || deleteR) && REPORT_VISIBILITY)
    //     return (Number(read || deleteR) + Number(REPORT_VISIBILITY)) * 60;
    //   else return Number(read || deleteR) * 80;
    // };

    let renderLock = (rowData) => {
      return (
        <DisplayFormLabel
          style={{
            fontWeight: 700,
            fontSize: "18px",
            color: "#212121",
          }}
        >
          {/* <DisplayIconButton
            systemVariant="primary"
            size="small"
            onClick={() => {
              setDialogProps({
                open: true,
                title: "Are you sure you want to lock this data",
                message:
                  "Once locked only you and root user can unlock this data",
                cancelLabel: "Cancel",
                canfirmLabel: "Yes Lock this document",
                onCancel: () => {
                  setDialogProps({ open: false });
                },
                onConfirm: () => {
                  setDialogProps({ open: false });
                  lockData(rowData);
                  setSnackBar({
                    message: "Data has been locked successfully",
                    severity: "success",
                  });
                },
              });
            }}
          > */}
          <Lock
            style={{
              color: color,
              cursor: "pointer",
              height: "18px",
              paddingRight: "4px",
            }}
            onClick={() => {
              setDialogProps({
                open: true,
                title: "Are you sure you want to lock this data",
                message:
                  "Once locked only you and root user can unlock this data",
                cancelLabel: "Cancel",
                canfirmLabel: "Yes Lock this document",
                onCancel: () => {
                  setDialogProps({ open: false });
                },
                onConfirm: () => {
                  setDialogProps({ open: false });
                  lockData(rowData);
                  setSnackBar({
                    message: "Data has been locked successfully",
                    severity: "success",
                  });
                },
              });
            }}
          />
          {/* </DisplayIconButton> */}
        </DisplayFormLabel>
      );
    };
    let renderUnlock = (rowData) => {
      return (
        <DisplayFormLabel
          style={{
            fontWeight: 700,
            fontSize: "18px",
            color: "#212121",
          }}
        >
          {/* <DisplayIconButton
            systemVariant="primary"
            size="small"
            onClick={() => {
              setDialogProps({
                open: true,
                title: "Are you sure you want to Unlock this data",
                message: "Once unlocked any NJ-ADMIN can edit this data",
                cancelLabel: "Cancel",
                canfirmLabel: "Yes Lock this document",
                onCancel: () => {
                  setDialogProps({ open: false });
                },
                onConfirm: () => {
                  setDialogProps({ open: false });
                  lockData(rowData);
                  setSnackBar({
                    message: "Data has been unlocked successfully",
                    severity: "success",
                  });
                },
              });
            }}
          > */}
          <LockOpen
            style={{
              color: color,
              cursor: "pointer",
              height: "18px",
              paddingRight: "4px",
            }}
            onClick={() => {
              setDialogProps({
                open: true,
                title: "Are you sure you want to Unlock this data",
                message: "Once unlocked any NJ-ADMIN can edit this data",
                cancelLabel: "Cancel",
                canfirmLabel: "Yes Lock this document",
                onCancel: () => {
                  setDialogProps({ open: false });
                },
                onConfirm: () => {
                  setDialogProps({ open: false });
                  lockData(rowData);
                  setSnackBar({
                    message: "Data has been unlocked successfully",
                    severity: "success",
                  });
                },
              });
            }}
          />
          {/* </DisplayIconButton> */}
        </DisplayFormLabel>
      );
    };

    let renderChip = ({ label, systemVariant, style }) => (
      <DisplayChips
        variant="outlined"
        size="small"
        label={label}
        systemVariant={systemVariant}
        style={style}
      />
    );

    if (writeAction)
      actionColumn = {
        headerName: "Action", //Changing Action keyword should be reflected in summary table index file.
        pinned: true,
        width: computeWidth(),
        // suppressSizeToFit: true,
        cellRenderer: (params) => {
          let { data, rowIndex } = params || {};
          let value = data;
          let rowdata = currentData.current?.find((i) => i._id === value?._id);
          let isDataLocked = rowdata?.sys_entityAttributes?.locked;
          let trainingDetails =
            rowdata?.sys_entityAttributes?.trainingDetails?.length > 0;
          let arcMode = archiveMode === "Archive" ? "UnArchive" : "Archive";
          let subAgencyInfo;
          let subAgencyActive =
            entityname == "Agency" &&
            get(
              rowdata,
              "sys_entityAttributes.agencyPermission.preset.subAgencyActive"
            );
          if (subAgencyActive) {
            subAgencyInfo = (() => {
              //IIFE
              if (isNJAdmin) {
                let isChild =
                  rowdata.sys_entityAttributes.parentAgency &&
                  Object.keys(rowdata.sys_entityAttributes.parentAgency).length
                    ? true
                    : false;
                let chipInfo = {
                  title: isChild ? "Child Agency" : "Parent Agency",
                  color: isChild ? "primary" : "success",
                };
                return chipInfo;
              } else {
                let subProp = checkSubAgencyLevel(rowdata.sys_agencyId);
                let chipInfo = {
                  title: subProp ? subProp.title : "Parent Agency",
                  color: subProp ? subProp.color : "primary",
                };
                return chipInfo;
              }
            })();
          }

          let isSampleData = get(
            rowdata,
            "sys_entityAttributes.sampleData",
            false
          );

          let { showModal = true } = entitiesToAttach[0] || {};
          const moreOptions = [
            {
              title: "Clone",
              visible:
                !isRelation() &&
                !showOnActionColumn("Clone") &&
                (isCloneEnabled || isNJAdmin()),
              handler: () => {
                // toggleDrawer(false);
                handleSidebar("0px");
                renderThroughProps
                  ? editActionCallBack(rowdata, "clone")
                  : getRoute(modulename, entityname, rowdata, appname, "clone");
              },
              icon: <Copy />,
            },
            // {
            //   title: "Zoom To Asset",
            //   visible:
            //     !fullScreen.current &&
            //     showZoomToAsset &&
            //     !showOnActionColumn("Zoom To Asset"),
            //   handler: (event, rowdata) => {
            //     handleZoomToAsset(event, rowdata);
            //   },
            //   icon: <LocationOn />,
            // },
            {
              title: "Delete",
              visible:
                deleteR &&
                checkEachRowDataAccess(rowdata, metadata, "delete") &&
                !showOnActionColumn("Delete"),
              handler: () => {
                setDialogProps({
                  testid: "summaryDelete",
                  open: true,
                  title: "Are you sure you want to delete?",
                  message: "You cannot undo this action",
                  cancelLabel: "Cancel",
                  confirmLabel: "Yes, Delete",
                  onCancel: () => {
                    setDialogProps({ open: false });
                  },
                  onConfirm: () => {
                    let page = isRelation() ? "RELATION" : "SUMMARY";
                    dispatch({
                      type: "INIT_CONTAINER",
                      payload: {
                        loader: true,
                      },
                    });
                    onDelete(value, page, relatedEntityInfo);
                    setDialogProps({ open: false });
                    setSnackBar({
                      message: "Data has been deleted successfully",
                      severity: "success",
                    });
                  },
                });
              },
              icon: <Delete />,
            },
            {
              title: "Reports",
              visible: REPORT_VISIBILITY && !showOnActionColumn("Reports"),
              handler: async () => {
                let { clickedMetadata } = await getClickedDataInfo({
                  formData: rowdata,
                  type: "metadata",
                  metadata,
                });
                setReportData({
                  reportFlag: true,
                  data: value?.wholeData || {},
                  metadata: clickedMetadata,
                });
              },
              icon: <PictureAsPdf />,
            },
            {
              title: getAttachMessage(rowdata),
              visible:
                entitiesToAttach?.length == 1 &&
                !showOnActionColumn("Attach") &&
                showModal,
              handler: () => {
                handleAttachClick(rowdata);
              },
              icon: (
                <PlaylistAdd
                  style={{
                    color: color,
                    cursor: "pointer",
                    height: "18px",
                    paddingRight: "4px",
                  }}
                  disabled={checkAttachedStatus(rowdata)}
                  onClick={() => {
                    handleAttachClick(rowdata);
                  }}
                />
              ),
            },
            {
              title: arcMode,
              visible:
                write &&
                archiveConfig?.archive &&
                !isRelation() &&
                archiveMode?.toUpperCase() === "ARCHIVE" &&
                !showOnActionColumn("Archive"),
              handler: async () => {
                handleArchive(rowdata, metadata);
              },
              icon: (
                <UnarchiveOutlined
                  style={{
                    color: color,
                    cursor: "pointer",
                    height: "18px",
                    paddingRight: "4px",
                  }}
                  onClick={async () => {
                    handleArchive(rowdata, metadata);
                  }}
                />
              ),
            },
            {
              title: arcMode,
              visible:
                write &&
                archiveConfig?.archive &&
                !isRelation() &&
                archiveMode?.toUpperCase() !== "ARCHIVE" &&
                !showOnActionColumn("Archive"),
              handler: async () => {
                handleArchive(rowdata, metadata);
              },
              icon: (
                <ArchiveOutlined
                  style={{
                    color: color,
                    cursor: "pointer",
                    height: "18px",
                    paddingRight: "4px",
                  }}
                  onClick={async () => {
                    handleArchive(rowdata, metadata);
                  }}
                />
              ),
            },
            {
              title: `Reset Password`,
              visible:
                ["User"].includes(entityname) && (isNJAdmin() || isSuperAdmin),
              handler: () => {
                handleResetDialog(rowdata);
              },
              icon: <Cached />,
            },
            {
              title: `Login As`,
              visible: ["User"].includes(entityname) && isNJAdmin(),
              handler: () => {
                handleLoginAs(rowdata);
              },
              icon: <Launch />,
            },
          ].filter((e) => e.visible === true);

          return (
            <div
              style={{
                display: "flex",
                flex: 1,
                alignItems: "center",
                // justifyContent: "space-around",
              }}
            >
              {isRootUser() &&
                (!isDataLocked ? renderLock(rowdata) : renderUnlock(rowdata))}
              {fromPage !== "360View" ? (
                write && checkEachRowDataAccess(rowdata, metadata, "write") ? (
                  <>
                    <DisplayFormLabel
                      style={{
                        fontWeight: 700,
                        fontSize: "18px",
                        color: "#212121",
                      }}
                      toolTipMsg={"Edit"}
                    >
                      {/* <DisplayIconButton
                      onClick={() => {
                        toggleDrawer(false);
                        renderThroughProps
                          ? editActionCallBack(rowdata, "edit")
                          : getRoute(modulename, entityname, rowdata);
                      }}
                      systemVariant="primary"
                      size="small"
                    > */}
                      <EditOutlinedIcon
                        style={{
                          color: color,
                          cursor: "pointer",
                          height: "18px",
                          paddingRight: "4px",
                        }}
                        onClick={() => {
                          setSummaryScrollPosition();
                          if (screenType !== "RELATION") handleSidebar("0px");
                          renderThroughProps
                            ? editActionCallBack(rowdata, "edit")
                            : getRoute(
                                modulename,
                                entityname,
                                rowdata,
                                appname,
                                "edit"
                              );
                        }}
                      />
                      {/* </DisplayIconButton> */}
                    </DisplayFormLabel>
                    {!isRelation() &&
                      showOnActionColumn("Clone") &&
                      isCloneEnabled && (
                        <DisplayFormLabel
                          style={{
                            fontWeight: 700,
                            fontSize: "18px",
                            color: "#212121",
                          }}
                          toolTipMsg={"Clone"}
                        >
                          <Copy
                            style={{
                              color: color,
                              cursor: "pointer",
                              height: "18px",
                              paddingRight: "4px",
                            }}
                            onClick={() => {
                              if (screenType !== "RELATION")
                                handleSidebar("0px");
                              renderThroughProps
                                ? editActionCallBack(rowdata, "clone")
                                : getRoute(
                                    modulename,
                                    entityname,
                                    rowdata,
                                    appname,
                                    "clone"
                                  );
                            }}
                          />
                        </DisplayFormLabel>
                      )}
                  </>
                ) : (
                  <DisplayFormLabel
                    style={{
                      fontWeight: 700,
                      fontSize: "18px",
                      color: "#212121",
                    }}
                    toolTipMsg={"View"}
                  >
                    {/* <DisplayIconButton
                      onClick={() => {
                        toggleDrawer(false);
                        renderThroughProps
                          ? editActionCallBack(rowdata, "read")
                          : getRoute(modulename, entityname, rowdata);
                      }}
                      systemVariant="primary"
                      size="small"
                    > */}
                    {read && (
                      <Visibility
                        style={{
                          color: color,
                          cursor: "pointer",
                          height: "18px",
                          paddingRight: "4px",
                        }}
                        onClick={() => {
                          let table =
                            document.querySelector(".ag-body-viewport");
                          let horizontalBar = document.querySelector(
                            ".ag-body-horizontal-scroll-viewport"
                          );

                          sessionStorage.setItem(
                            "summaryGridScrollPosition",
                            JSON.stringify({
                              top: table?.scrollTop,
                              left: horizontalBar.scrollLeft,
                            })
                          );
                          if (screenType !== "RELATION") handleSidebar("0px");
                          renderThroughProps
                            ? editActionCallBack(rowdata, "read")
                            : getRoute(modulename, entityname, rowdata);
                        }}
                      />
                    )}
                    {/* </DisplayIconButton> */}
                  </DisplayFormLabel>
                )
              ) : (
                <DisplayFormLabel
                  style={{
                    fontWeight: 700,
                    fontSize: "18px",
                    color: "#212121",
                  }}
                  toolTipMsg={"View"}
                >
                  {/* <DisplayIconButton
                    onClick={() => {
                      toggleDrawer(false);
                      renderThroughProps
                        ? editActionCallBack(rowdata, "read")
                        : getRoute(modulename, entityname, rowdata);
                    }}
                    systemVariant="primary"
                    size="small"
                  > */}
                  {read && (
                    <Visibility
                      style={{
                        color: color,
                        cursor: "pointer",
                        height: "18px",
                        paddingRight: "4px",
                      }}
                      onClick={() => {
                        let table = document.querySelector(".ag-body-viewport");
                        let horizontalBar = document.querySelector(
                          ".ag-body-horizontal-scroll-viewport"
                        );
                        sessionStorage.setItem(
                          "summaryGridScrollPosition",
                          JSON.stringify({
                            top: table?.scrollTop,
                            left: horizontalBar.scrollLeft,
                          })
                        );
                        if (screenType !== "RELATION") handleSidebar("0px");
                        renderThroughProps
                          ? editActionCallBack(rowdata, "read")
                          : getRoute(modulename, entityname, rowdata);
                      }}
                    />
                  )}
                  {/* </DisplayIconButton> */}
                </DisplayFormLabel>
              )}
              {/* &nbsp; */}
              {!fullScreen.current && showZoomToAsset && (
                // showOnActionColumn("Zoom To Asset") &&
                <DisplayFormLabel
                  style={{
                    fontWeight: 700,
                    fontSize: "18px",
                    color: "#212121",
                  }}
                  toolTipMsg={"Zoom To Asset"}
                >
                  {/* <DisplayIconButton
                    systemVariant="primary"
                    size="small"
                    onClick={(event) => {
                      handleZoomToAsset(event, rowdata);
                    }}
                  > */}
                  <LocationOn
                    style={{
                      color: color,
                      cursor: "pointer",
                      height: "18px",
                      paddingRight: "4px",
                    }}
                    onClick={(event) => {
                      handleZoomToAsset(event, rowdata);
                    }}
                  />
                  {/* </DisplayIconButton> */}
                </DisplayFormLabel>
              )}
              {deleteR &&
                checkEachRowDataAccess(rowdata, metadata, "delete") &&
                showOnActionColumn("Delete") && (
                  <DisplayFormLabel
                    style={{
                      fontWeight: 700,
                      fontSize: "18px",
                      color: "#212121",
                    }}
                    toolTipMsg={"Delete"}
                  >
                    {/* //   <DisplayIconButton
                    onClick={() => {
                      setDialogProps({
                        testid: "summaryDelete",
                        open: true,
                        title: "Are you sure you want to delete?",
                        message: "You cannot undo this action",
                        cancelLabel: "Cancel",
                        confirmLabel: "Yes, Delete",
                        onCancel: () => {
                          setDialogProps({ open: false });
                        },
                        onConfirm: () => {
                          let page = isRelation() ? "RELATION" : "SUMMARY";
                          dispatch({
                            type: "INIT_CONTAINER",
                            payload: {
                              loader: true,
                            },
                          });
                          onDelete(value, page, relatedEntityInfo);
                          setDialogProps({ open: false });
                          setSnackBar({
                            message: "Data has been deleted successfully",
                            severity: "success",
                          });
                        },
                      });
                    }}
                    systemVariant="primary"
                    size="small"
                  > */}
                    <Delete
                      style={{
                        color: color,
                        cursor: "pointer",
                        height: "18px",
                        paddingRight: "4px",
                      }}
                      onClick={() => {
                        setDialogProps({
                          testid: "summaryDelete",
                          open: true,
                          title: "Are you sure you want to delete?",
                          message: "You cannot undo this action",
                          cancelLabel: "Cancel",
                          confirmLabel: "Yes, Delete",
                          onCancel: () => {
                            setDialogProps({ open: false });
                          },
                          onConfirm: () => {
                            let page = isRelation() ? "RELATION" : "SUMMARY";
                            dispatch({
                              type: "INIT_CONTAINER",
                              payload: {
                                loader: true,
                              },
                            });
                            onDelete(value, page, relatedEntityInfo);
                            setDialogProps({ open: false });
                            setSnackBar({
                              message: "Data has been deleted successfully",
                              severity: "success",
                            });
                          },
                        });
                      }}
                    />
                    {/* // </DisplayIconButton> */}
                  </DisplayFormLabel>
                )}
              {sys_hotButtons && visible_summary && (
                <HotButton
                  entityDoc={rowdata}
                  entityTemplate={metadata}
                  handleLoading={(v, f) => {
                    return null;
                  }}
                  displayTitle={false}
                  appname={appname}
                  modulename={modulename}
                  entityname={entityname}
                  buttonStyle={{ minWidth: "120px", maxWidth: "120px" }}
                  textVariant="caption"
                />
              )}

              {REPORT_VISIBILITY && showOnActionColumn("Reports") && (
                // <DisplayIconButton
                //   size="small"
                //   variant="outlined"
                //   systemVariant="primary"
                //   onClick={async () => {
                //     let { clickedMetadata } = await getClickedDataInfo({
                //       formData: rowdata,
                //       type: "metadata",
                //       metadata,
                //     });
                //     setReportData({
                //       reportFlag: true,
                //       data: { _id: value },
                //       metadata: clickedMetadata,
                //     });
                //   }}
                // >
                <DisplayFormLabel
                  style={{
                    fontWeight: 700,
                    fontSize: "18px",
                    color: "#212121",
                  }}
                  toolTipMsg={summaryReportDescription}
                >
                  <PictureAsPdfOutlinedIcon
                    fontSize="small"
                    style={{
                      color: color,
                      cursor: "pointer",
                      height: "18px",
                      paddingRight: "4px",
                    }}
                    onClick={async () => {
                      let { clickedMetadata } = await getClickedDataInfo({
                        formData: rowdata,
                        type: "metadata",
                        metadata,
                      });
                      setReportData({
                        reportFlag: true,
                        data: value?.wholeData || {},
                        metadata: clickedMetadata,
                      });
                    }}
                  />
                </DisplayFormLabel>
                // </DisplayIconButton>
              )}
              {write &&
                archiveConfig?.archive &&
                !isRelation() &&
                showOnActionColumn("Archive") && (
                  // <DisplayIconButton
                  //   size="small"
                  //   variant="outlined"
                  //   systemVariant="primary"
                  //   onClick={async () => {
                  //     handleArchive(rowdata, metadata);
                  //   }}
                  // >
                  <ToolTipWrapper
                    title={
                      <DisplayText variant="caption">{arcMode}</DisplayText>
                    }
                  >
                    {renderArchIcon(rowdata)}
                  </ToolTipWrapper>
                  // </DisplayIconButton>
                )}
              {entitiesToAttach?.length == 1 && showOnActionColumn("Attach") && (
                <ToolTipWrapper
                  title={
                    <DisplayText variant="caption">
                      {getAttachMessage(rowdata)}
                    </DisplayText>
                  }
                >
                  {/* <div> */}
                  {/* <DisplayIconButton
                      id={rowdata?._id}
                      size="small"
                      variant="outlined"
                      systemVariant="primary"
                      disabled={checkAttachedStatus(rowdata)}
                      onClick={() => {
                        handleAttachClick(rowdata);
                      }}
                    > */}
                  <PlaylistAdd
                    style={{
                      color: color,
                      cursor: "pointer",
                      height: "18px",
                    }}
                    disabled={checkAttachedStatus(rowdata)}
                    onClick={() => {
                      handleAttachClick(rowdata);
                    }}
                  />
                  {/* </DisplayIconButton> */}
                  {/* </div> */}
                </ToolTipWrapper>
              )}
              {moreOptions.length > 0 && (
                <DisplayFormLabel
                  style={{
                    fontWeight: 700,
                    fontSize: "18px",
                    color: "#212121",
                  }}
                  toolTipMsg={"More Options"}
                >
                  <MoreOptions moreOptions={moreOptions} />
                </DisplayFormLabel>
              )}
              {/* {rowdata?.sys_entityAttributes?.sampleData && (
                <DisplayChips
                  label="Sample"
                  // systemVariant="primary"
                  size="small"
                  style={{ backgroundColor: light.bgColor }}
                />
              )} */}
              {(subAgencyActive || isSampleData) &&
                renderChip({
                  label: isSampleData ? "Sample" : subAgencyInfo.title,
                  systemVariant: isSampleData ? "primary" : subAgencyInfo.color,
                  style: isSampleData
                    ? {
                        backgroundColor: "rgb(126, 195, 128)",
                        color: "black",
                        opacity: "0.9",
                      }
                    : {},
                })}
            </div>
          );
        },
      };

    let { columns, length } = filterFields(metadata);
    columns = metadata?.sys_entityAttributes?.displayAgencyLogoOnSummary
      ? [
          {
            title: "Agency Logo",
            name: "agencyLogo",
            type: "AGENCYLOGO",
            searchable: false,
          },
          ...columns,
        ]
      : [...columns];

    let actualColumns = columns;

    let traingDetails = {
      title: "Training Details",
      name: "trainingDetails",
      type: "",
      searchable: false,
    };

    return actualColumns.length
      ? read || deleteR || sys_hotButtons
        ? Object.keys(actionColumn).length
          ? data?.length > 0 && write
            ? [actionColumn, ...actualColumns]
            : [actionColumn, ...actualColumns]
          : [...actualColumns]
        : [...actualColumns]
      : [];
  };
  const handleCellEdit = (fieldMeta, eachRowData) => {
    let modifiedFieldMeta = { ...fieldMeta };
    modifiedFieldMeta.defaultValue = false;
    setCellEdit({
      open: !openCellEdit.open,
      fieldMeta: modifiedFieldMeta,
      eachRowData: eachRowData,
    });
  };
  const handleCellEditClose = () => {
    let cellState = { ...openCellEdit };
    cellState.open = false;
    setCellEdit(cellState);
  };

  const handleFilters = (fieldmeta, static_filters) => {
    let obj = {};
    if (static_filters && static_filters.length) {
      static_filters.map((f) => (obj[f.name] = f.value));
    }
    return obj;
  };

  const getGridRows = (data, meta) => {
    if (data && meta) {
      let filterFieldData = filterFields(meta);
      let { displayAgencyLogoOnSummary = false } =
        meta?.sys_entityAttributes || {};
      return data?.reduce((accumulator, eachData) => {
        let writeAccess =
          checkEachRowDataAccess(eachData, meta, "write") || false;
        let {
          _id,
          sys_entityAttributes: fData,
          sys_agencyId = "No Agency",
          sys_gUid,
        } = eachData;

        let obj = {
          _id,
          sys_gUid,
          sys_agencyId,
          writeAccess: writeAccess,
          wholeData: eachData,
        };
        if (displayAgencyLogoOnSummary) {
          let agencyLogo = getAgencyLogo(sys_agencyId);
          let agencyName = getAgencyName(sys_agencyId);
          obj["agencyLogo"] = {
            agencyLogo: agencyLogo,
            agencyName: agencyName,
          };
        }

        filterFieldData.columns.forEach((element, index) => {
          obj[element.name] = get(fData, element?.name, null);
        });
        accumulator.push(obj);
        return accumulator;
      }, []);
    } else return [];
  };

  const getFilteredData = () => {
    const urlParams = new URLSearchParams(getPathFromUrl(window.location.href));
    let queryObj = {};
    for (const [key, value] of urlParams) {
      queryObj = { ...queryObj, [key]: value };
    }
    // setFilter({ ...queryObj });
    if (!isRelation())
      dispatch({
        type: "ADD_FILTER",
        payload: {
          filter: queryObj,
        },
      });
  };

  const { inlineInstruction = {} } = helperData || {};

  const { summaryReportDescription = "" } = inlineInstruction;

  const getPending = (eachdata) => {
    if (
      !["", null, undefined].includes(eachdata.totalCompleted) &&
      !["", null, undefined].includes(eachdata.mandatoryHour)
    ) {
      if (eachdata.totalCompleted >= eachdata.mandatoryHour) {
        return 0;
      } else {
        return eachdata.mandatoryHour - eachdata.totalCompleted;
      }
    }
  };

  const LinearProgressWithLabel = (props) => {
    return (
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box sx={{ width: "100%", mr: 1 }}>
          <LinearProgress variant="determinate" {...props} />
        </Box>
      </Box>
    );
  };

  const rendarEachdata = (eachdata) => {
    let { name, mandatoryHour, totalCompleted } = eachdata || {};
    let pending = getPending(eachdata);
    if (pending === 0) {
      pending = "0";
    }
    let progressPercentage = (totalCompleted / mandatoryHour) * 100;

    return (
      <div style={{ display: "flex", margin: ".2rem", flex: 1 }}>
        <DisplayCard style={{ display: "flex", padding: "10px", flex: 1 }}>
          <div
            style={{
              display: "flex",
              flex: 1,
              height: "70px",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                flex: 1,
                justifyContent: "space-between",
              }}
            >
              <DisplayText style={{ fontSize: "16" }}>{name}</DisplayText>
              <DisplayText
                style={{ fontSize: "16" }}
              >{`Total ${mandatoryHour} Hours`}</DisplayText>
            </div>
            <div style={{ display: "flex", flex: 2, alignSelf: "center" }}>
              <LinearProgressWithLabel
                style={{ border: "1px", width: "300px" }}
                value={progressPercentage > 100 ? 100 : progressPercentage}
                color={progressPercentage >= 100 ? "primary" : "secondary"}
              />
            </div>
            <div
              style={{
                display: "flex",
                flex: 1,
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex" }}>
                <DisplayText
                  style={{ fontSize: "16" }}
                >{`Completed ${totalCompleted} Hours `}</DisplayText>
                {progressPercentage < 100 && (
                  <DisplayText style={{ fontSize: "16" }}>{`(${Math.round(
                    progressPercentage
                  )}%)`}</DisplayText>
                )}
              </div>
              <DisplayText style={{ fontSize: "16" }}>{`Pending ${
                pending ? pending : "---"
              } Hours`}</DisplayText>
            </div>
          </div>
        </DisplayCard>
      </div>
    );
  };

  const rendarUserCouseDetails = () => {
    let couseData =
      couseDetails &&
      couseDetails?.filter(
        (fl) =>
          !["", null, undefined].includes(fl.totalCompleted) &&
          !["", null, undefined].includes(fl.mandatoryHour) &&
          !["", null, undefined].includes(fl.name)
      );

    return (
      <div style={{ display: "flex", flexDirection: "column", width: "500px" }}>
        <div
          className="modal_header"
          style={{
            display: "flex",
            margin: ".5rem",
            justifyContent: "space-between",
            alignItems: "end",
          }}
        >
          <DisplayText style={{ fontSize: "24", fontWeight: "bold" }}>
            Training Hours Details
          </DisplayText>
          <DisplayIconButton onClick={() => setCourseModal(false)}>
            <CloseOutlined
              style={{
                fontSize: "20px",
                color: "#146CAF",
              }}
            />
          </DisplayIconButton>
        </div>
        <div className="modal_body">
          {couseData?.length > 0 ? (
            couseData.map((eachData) => {
              return rendarEachdata(eachData);
            })
          ) : (
            <div style={{ height: "90px" }}>
              <Banner
                src=""
                iconSize="30px"
                msg={
                  <>
                    <DisplayText style={{ fontWeight: "bold" }}>
                      No Trainings To Show Yet
                    </DisplayText>
                  </>
                }
                fontSize="16"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const getTraingDetailsColor = (trainData) => {
    let { sys_entityAttributes } = trainData || {};
    let { trainingDetails } = sys_entityAttributes || [];
    trainingDetails = trainingDetails?.filter(
      (fl) =>
        !["", null, undefined].includes(fl.totalCompleted) &&
        !["", null, undefined].includes(fl.mandatoryHour) &&
        !["", null, undefined].includes(fl.name)
    );
    let hourCompleted = trainingDetails?.some(
      (el) => el.totalCompleted < el.mandatoryHour
    );
    if (trainingDetails?.length > 0) {
      return hourCompleted ? "red" : "green";
    } else {
      return "red";
    }
  };

  const showCheckbox = () => {
    let validate = checkWriteAccess({
      appname: appname,
      modulename: modulename,
      entityname: entityname,
    });

    if (fromPage === "360View" && !validate) {
      return false;
    } else {
      return true;
    }
  };

  useEffect(() => {
    fullScreen.current = fullScreenSize;
    dispatch({
      type: "ADD_ROWS_COLUMNS",
      payload: {
        columns: getGridHeaders(metadata),
        selectedRows: selectedRows,
      },
    });
  }, [fullScreenSize, b_anchorEl]);

  useEffect(() => {
    getFilteredData();
  }, [JSON.stringify(data)]);

  useEffect(() => {
    if (
      location.search === "" ||
      !location.search.includes("sortby", "orderby")
    ) {
      setClicked([]);
    }
  }, [location.search]);

  useEffect(() => {
    currentData.current = data;
    dispatch({
      type: "ADD_ROWS_COLUMNS",
      payload: {
        columns: getGridHeaders(metadata),
        rows: getGridRows(data, metadata),
        selectedRows: selectedRows,
      },
    });
  }, [JSON.stringify(data), filter]);

  useEffect(() => {
    let qParams = queryString.parse(location?.search);
    let { globalsearch = null, sortby, orderby, ...rest } = qParams;
    if (isRelation()) {
      const { sortby: sortBy, orderby: orderBy } = getSortByObj(
        metadata,
        gridProps
      );
      sortby = sortBy;
      orderby = orderBy;
      filter = { ...filter, sortBy, orderBy };
      dispatch({
        type: "SORT_INFO",
        payload: { sortby: sortBy, orderby: orderBy },
      });
    }
    dispatch({
      type: "SELECTED_DATA",
      payload: {
        selectedRows: [],
      },
    });
    if (sortby && orderby) {
      setClicked([sortby, orderby > 0 ? "ascending" : "descending"]);
    } else if (defaultSort && defaultSort?.name && defaultSort?.sortOrder) {
      let name = defaultSort.name,
        status = defaultSort.sortOrder.toLowerCase();
      setClicked([name, status]);
    } else setClicked([]);
  }, [entityname, JSON.stringify(metadata.sys_entityAttributes.sortFilters)]);

  useEffect(() => {
    dispatch({
      type: "ADD_ROWS_COLUMNS",
      payload: {
        columns: getGridHeaders(metadata),
        rows: getGridRows(data, metadata),
        selectedRows: selectedRows,
      },
    });
  }, [JSON.stringify(clicked)]);

  useEffect(() => {
    if (configState.map !== null) {
      createRef.current = configState;
    }
  }, [configState]);

  useEffect(() => {
    if (relatedItemRefresh) {
      getData(null, pageNumber, {}, "RELATION", relatedEntityInfo);
      handleSidebar("0px");
      changeRelatedItemRefresh(false);
    }
  }, [relatedItemRefresh]);

  useEffect(() => {
    if (columns) {
      setLoading(false);
    }
  }, [JSON.stringify(columns)]);

  const handleTraingModal = (fMeta, fValue) => {
    setCouseDetails(fValue);
    setCourseModal(true);
  };

  let stateParams = {
    metadata,
  };

  //filtering training column for module access only
  if (entityname.toUpperCase() === "USER") {
    let traingModuleAcess =
      checkModuleAccess("NueGov", "TrainingModule") ||
      checkModuleAccess("NueGov", "StandardTrainingManagement") ||
      checkModuleAccess("NueGov", "DemoTrainingModule");

    if (!traingModuleAcess) {
      columns = columns?.filter((fl) => fl.type !== "TRAINING");
    } else {
      columns = columns;
    }
  }

  return !loading ? (
    <div style={{ width: "100%" }}>
      {columns?.length > 0 ? (
        relationInfo?.type == "RELATION" && rows?.length <= 0 ? (
          <Banner
            src={relationInfo?.icon}
            iconSize="100px"
            msg={
              <>
                <DisplayText variant="subtitle1" style={{ fontWeight: "bold" }}>
                  No Data To Show Yet
                </DisplayText>
                <br />
                <DisplayText>
                  {relationInfo?.message && relationInfo?.message}
                </DisplayText>
              </>
            }
            fontSize="16"
          />
        ) : (
          <>
            <SUMMARY_TABLE
              height={height}
              data={currentData.current}
              metaData={metadata}
              rows={rows}
              columns={columns}
              clicked={clicked}
              cellEditCallBack={handleCellEdit}
              handleTraingModal={handleTraingModal}
              setCourseModal={setCourseModal}
              handleSort={handleSort}
              handleDetailPageModal={handleDetailPageModal}
              handleAddFieldValue={handleAddFieldValue}
              handleRemoveFieldValue={handleRemoveFieldValue}
              // checkEachRowDataAccess={checkEachRowDataAccess}
              handleColumnSearch={handleColumnSearch}
              setDialogProps={setDialogProps}
              setSnackBar={setSnackBar}
              isRelation={isRelation() ? true : false}
              themeObj={dark}
              handleIdsFor360={handleIdsFor360}
              showCheckboxSelection={showCheckbox()}
            />

            {/* </div> */}
            {REPORT_VISIBILITY &&
              (sys_autoSaveReports ? reportData?.reportFlag : true) && (
                <ReportGenerator
                  appname={appname}
                  modulename={modulename}
                  entityname={entityname}
                  modalFlag={reportData?.reportFlag}
                  container={{ level: "detail" }}
                  metadata={reportData?.metadata}
                  data={reportData?.data}
                  onClose={() => {
                    setReportData({
                      ...reportData,
                      reportFlag: false,
                      metadata: metadata,
                    });
                  }}
                />
              )}
            {
              <CellEdit
                open={openCellEdit.open}
                fieldMeta={openCellEdit.fieldMeta}
                cellEditCallback={updateCellEdit}
                eachRowData={openCellEdit.eachRowData}
                closeCallback={handleCellEditClose}
                stateParams={stateParams}
              />
            }
            <DisplayDialog {...dialogProps} />
            {
              <ContextMenuWrapper
                options={{
                  hideTitlebar: true,
                }}
                title={
                  <div style={{ margin: "1%", color: "#3f51b5" }}>
                    {`vks detail`}{" "}
                  </div>
                }
                visible={openContext ? openContext : false}
                width="30%"
              >
                {openContext && (
                  <ContextSummary
                    appName={contextOptions?.appName}
                    moduleName={contextOptions?.moduleName}
                    entityName={contextOptions?.entityName}
                    summaryMode="context_summary"
                    handleCancel={handleContextCancel}
                    options={contextOptions}
                    filters={contextOptions?.filters}
                    // permissionCheck={handlePermission}
                    // filters={handleFilters()}
                  />
                )}
              </ContextMenuWrapper>
            }
          </>
        )
      ) : (
        <Banner
          src={relationInfo?.icon}
          iconSize="100px"
          msg={
            <>
              <DisplayText variant="subtitle1" style={{ fontWeight: "bold" }}>
                No Data To Show
              </DisplayText>
              <br />
              <DisplayText>
                {relationInfo?.message && relationInfo?.message}
              </DisplayText>
            </>
          }
          fontSize="16"
        />
      )}
      {/* //detailpage model */}
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
                  {...detailprops}
                  onClose={(e) => setModal(false)}
                  detailMode="REFERENCE"
                />
              </div>
            </ContainerWrapper>
          </div>
        </DisplayModal>
      }
      {
        <DisplayModal
          BackdropProps={{ invisible: true }}
          open={courseMadal}
          maxWidth="xs"
          onClose={() => {
            setCourseModal(false);
            setCouseDetails({});
          }}
        >
          <div style={{ display: "flex", flex: 1 }}>
            {courseMadal && rendarUserCouseDetails()}
          </div>
        </DisplayModal>
      }
      {resetPwd && (
        <ResetPwd
          resetPassword={resetPwd}
          onClose={() => setResetPwd(!resetPwd)}
          screen="admin_panel"
          id={id}
        />
      )}
    </div>
  ) : (
    <CircularProgress
      style={{
        color: `${getVariantForComponent("", "primary").colors.dark.bgColor}`,
        display: "flex",
        justifyContent: "center",
        alignSelf: "center",
        flex: 1,
      }}
      size={50}
    />
  );
};
const EmptyToolBar = (props) => {
  useEffect(() => {
    props.onToggleFilter();
  }, []);
  return null;
};
