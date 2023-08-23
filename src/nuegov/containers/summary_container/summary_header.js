import React, {
  useEffect,
  useState,
  useContext,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useLocation, useHistory } from "react-router-dom";
import queryString from "query-string";
import {
  DisplayBadge,
  DisplayButton,
  DisplayDialog,
  DisplayIconButton,
  DisplayModal,
  DisplaySearchBar,
  DisplaySelect,
  DisplaySwitch,
  DisplayList,
} from "components/display_components";
import { ToolTipWrapper } from "components/wrapper_components";
import { ListItem, Menu, MenuItem, Popover } from "@material-ui/core";
import {
  Gantt,
  Task,
  EventOption,
  StylingOption,
  ViewMode,
  DisplayOption,
} from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { Export_Csv, BulkActionsNew } from "containers/feature_containers";
import GridServices from "./utils/services";
import { useStateValue } from "utils/store/contexts";
import { GlobalFactory, UserFactory } from "utils/services/factory_services";
import { SystemIcons } from "utils/icons";
import { SummaryGridContext } from ".";
import { ReportGenerator } from "components/helper_components";
import { ScannerModal } from "components/extension_components";
import {
  AdvanceSearch,
  DetailModal,
  FiltersPopover,
} from "components/helper_components";
import { get, isDefined } from "utils/services/helper_services/object_methods";
import { entity } from "utils/services/api_services/entity_service";
import { bulkActions } from "utils/services/api_services/bulk_actions";
import { eventTracker } from "utils/services/api_services/event_services";

const useStyles = makeStyles((theme) => ({
  textField: {
    [`& fieldset`]: {
      borderRadius: "50px",
      height: "40px",
    },
  },
}));

export const GridSearch = forwardRef(
  (
    {
      editActionCallBack,
      renderThroughProps,
      writeAction = true,
      entityTemplate,
      appliedFilter,
      totalCount,
      screenType,
      relatedEntityInfo,
      appname,
      modulename,
      entityname,
      detailPageData = {},
      summaryScreenProps,
    },
    ref
  ) => {
    const history = useHistory();
    const queryParams = queryString.parse(useLocation().search);
    const { globalsearch, ...restParams } = queryParams;
    const { page, sortby, orderby, sys_agencyId, ...filterParams } = restParams;

    const [{ configState }, dispatch] = useStateValue();
    const { fullScreenSize, fullScreenClickStatus } = configState;

    const {
      closeBackDrop,
      setBackDrop,
      setSnackBar,
      toggleDrawer,
      getUserData,
      getContextualHelperData,
      handleSidebar,
    } = GlobalFactory();

    const [advSearchVisible, setAdvSearchVisibility] = useState(false);
    const [reportFlag, setReportFlag] = useState(false);
    const [reportSearchValue, setReportSearchValue] = useState("");
    const [bulkActionProps, setBulkActionProps] = useState({});
    const [bulkActionType, setBulkActionType] = useState("");
    const [mounted, setMounted] = useState(false);
    const { getData, getRoute } = GridServices();
    const [gridProps, summaryPropDispatch] = useContext(SummaryGridContext);
    const { summaryData, type, isGeoFenceApplied, mapParams } =
      summaryScreenProps || {};
    const {
      data,
      params,
      metadata,
      selectedRows,
      filter,
      archiveMode,
      pageNumber,
      globalsearch: globalSearchState = "",
    } = gridProps;

    const {
      checkWriteAccess,
      checkCreateAccess,
      checkDeleteAccess,
      getEntityFeatureAccess,
      checkGlobalFeatureAccess,
      getRefObj,
      getAgencyRef,
      isNJAdmin,
      getUserInfo,
    } = UserFactory();
    const { username, firstName, sys_gUid: userGuid } = getUserInfo();
    const classes = useStyles();
    const [searchValue, setSearchValue] = useState({});
    const [master_filter, setMasterFilter] = useState("");
    const { Add, ArrowDropDown, MoreVertical, Tune, Settings } = SystemIcons;
    const [open, setOpen] = useState(false);
    const [addClicked, setAddClicked] = useState(null);
    const [autoPopulate, setAutoPopulate] = useState({});
    const [isTimeline, setTimeline] = useState(false);

    const [activeFilter, setActiveFilter] = useState({});
    const [e_anchorEl, sete_AnchorEl] = useState(null);
    const [entityGlobalSearch, setEntityGlobalSearch] = useState(
      globalsearch || ""
    );
    const [clearSearch, setClearSearch] = useState(false);
    const [clearSelected, setClearSelected] = useState(false);
    const [dialog, setDialog] = useState({ dialog: false });
    const [scanner, setScanner] = useState(false);
    const reports = metadata?.sys_entityAttributes?.sys_reports || [];
    const {
      sys_summaryOptions,
      sys_entityProperties,
      bulkOperation,
      sys_topLevel,
      time_lineOption,
    } = get(metadata, "sys_entityAttributes");
    const [bulkModal, setBulkModal] = useState(false);
    const [bulkEl, setBulkEl] = useState(null);
    const [dialogProps, setDialogProps] = useState({ open: false });
    const helperData = getContextualHelperData("SUMMARY_SCREEN");
    const isPublicUser = sessionStorage.getItem("public-user");

    const e_open = Boolean(e_anchorEl);
    const masterFilters = metadata?.sys_entityAttributes?.masterFilters
      ? get(metadata, "sys_entityAttributes.masterFilters")
      : "";

    const bulkPermision = metadata?.sys_entityAttributes?.bulkActionConfig
      ? get(metadata, "sys_entityAttributes.bulkActionConfig")
      : false;

    const bulkArchive = metadata?.sys_entityAttributes?.archiveConfig
      ? get(metadata, "sys_entityAttributes.archiveConfig")
      : false;

    const layer = metadata?.sys_entityAttributes?.sys_topLevel.find((field) =>
      ["DESIGNER", "LATLONG"].includes(field.type)
    );

    const sys_entityRelationships =
      relatedEntityInfo?.parentMeta?.sys_entityAttributes
        ?.sys_entityRelationships;

    const childEntityConfig =
      sys_entityRelationships?.filter((e) => e?.entityName === entityname)
        .length > 0 &&
      sys_entityRelationships?.filter((e) => e?.entityName === entityname)[0];

    const childEntityCreateButtonTitle = childEntityConfig?.createButton?.title;

    let entitiesToAttach = sys_entityRelationships?.filter((e) =>
      e?.hasOwnProperty("createButton")
    );

    entitiesToAttach =
      isDefined(entitiesToAttach) && isDefined(entitiesToAttach[0])
        ? [entitiesToAttach[0]]
        : [];

    const { sys_roleData = {} } = getUserData() || {};

    const checkAttachedStatus = (detailPageData) => {
      return (
        entitiesToAttach[0]?.createButton?.hideOn?.values?.includes(
          detailPageData?.sys_entityAttributes[
            entitiesToAttach[0]?.createButton?.hideOn?.path
          ]
        ) && entityname === entitiesToAttach[0]?.entityName
      );
    };

    const checkButtonAccess = () => {
      let createButtonConfig =
        metadata?.sys_entityAttributes?.createButtonConfig;
      let hideCreateButtonForRoles =
        createButtonConfig?.hideCreateButtonForRoles;

      if (
        hideCreateButtonForRoles?.includes(
          sys_roleData?.sys_entityAttributes?.name
        ) ||
        childEntityConfig?.hideCreateButton
      ) {
        return false;
      } else {
        return true;
      }
    };

    const isCodeGenerator = sys_entityProperties?.includes("CodeGenerator");

    const REPORT_VISIBILITY =
      getEntityFeatureAccess(appname, modulename, entityname, "Reports") &&
      checkGlobalFeatureAccess("Reports") &&
      !renderThroughProps && //Temporary
      !isNJAdmin() &&
      reports?.length > 0;

    const BULKACTIONS_VSIBILITY = getEntityFeatureAccess(
      appname,
      modulename,
      entityname,
      "BulkOperations"
    );

    const isRelation = () => {
      return (
        screenType === "RELATION" &&
        relatedEntityInfo &&
        Object.keys(relatedEntityInfo).length
      );
    };

    const checkEntityWriteAccess = () => {
      if (isRelation()) {
        let { childEntityParams } = relatedEntityInfo;
        let access = checkWriteAccess({
          appname: childEntityParams.appname,
          modulename: childEntityParams.modulename,
          entityname: childEntityParams.entityname,
        });
        return access;
      } else {
        return checkWriteAccess(params);
      }
    };

    const buttonList = [
      {
        title: "Export",
        visible: getEntityFeatureAccess(
          appname,
          modulename,
          entityname,
          "ExportCSV"
        ),
        handler: () => {
          setOpen(true);
        },
      },
      {
        title: "Import",
        visible:
          checkGlobalFeatureAccess("Imports") &&
          getEntityFeatureAccess(
            appname,
            modulename,
            entityname,
            "ImportCSV"
          ) &&
          checkEntityWriteAccess(),
        handler: () => {
          history.push("/app/import?summary=true");
          {
            if (!isNJAdmin()) {
              dispatch({
                type: "SET_IMPORT_ENTITY",
                payload: {
                  appName: appname,
                  moduleName: modulename,
                  entityName: entityname,
                  selectedEntityTemplate: get(
                    entityTemplate,
                    "sys_entityAttributes.sys_templateName"
                  ),
                  unique_key: `${appname}-${modulename}-${entityname}`,
                  friendlyName: get(
                    entityTemplate,
                    "sys_entityAttributes.sys_friendlyName"
                  ),
                },
              });
              dispatch({
                type: "SET_IMPORT_MODE",
                payload: "insert",
              });
            }
          }
        },
      },
      {
        title: "Generate Reports",
        visible: REPORT_VISIBILITY,
        handler: () => {
          setReportFlag(true);
        },
      },
      ...(sys_summaryOptions?.length && !isPublicUser
        ? sys_summaryOptions.reduce((acc, curr) => {
            acc.push({
              title: curr.title,
              visible: true,
              handler: () => {
                sete_AnchorEl(null);
                handleAddClick(curr);
              },
            });
            return acc;
          }, [])
        : []),
    ].filter((e) => e.visible === true);

    const BASE_URL = `/app/summary/${appname}/${modulename}/${entityname}`;

    const getDefaultSort = () => {
      let { sortFilters } = metadata.sys_entityAttributes || {};
      if (sortFilters?.name && sortFilters?.sortOrder)
        return {
          defaultSortBy: sortFilters?.name,
          defaultOrderBy:
            sortFilters?.sortOrder.toLowerCase() === "ascending" ? 1 : -1,
        };
      else return {};
    };

    useImperativeHandle(ref, () => ({
      callClearFromParent() {
        handleClear();
      },
    }));

    const queryToUrl = (params) =>
      Object.keys(params || {})
        .map((key) => key + "=" + params[key])
        .join("&");

    const handleSearch = (value) => {
      setEntityGlobalSearch(value);
      summaryPropDispatch({ type: "SET_LOADER", payload: { loader: true } });
      summaryPropDispatch({
        type: "ADD_GLOBAL_SEARCH",
        payload: value ? value : null,
      });
      let searchParams = value;
      let { defaultSortBy, defaultOrderBy } = getDefaultSort();
      let selectedFilter = {};
      if (sortby || Object.keys(getDefaultSort()).length) {
        selectedFilter = {
          ...selectedFilter,
          ...filter,
          archiveMode,
          ...{
            sortby: sortby ? sortby : defaultSortBy && defaultSortBy,
            orderby: orderby ? orderby : defaultOrderBy && defaultOrderBy,
          },
        };
      }
      if (
        screenType === "RELATION" &&
        relatedEntityInfo &&
        Object.keys(relatedEntityInfo).length
      ) {
        getData(searchParams, 1, selectedFilter, screenType, relatedEntityInfo);
      } else {
        if (isDefined(value)) {
          getData(searchParams, 1, selectedFilter);
          history.push(
            `${BASE_URL}?${queryToUrl({
              ...selectedFilter,
              globalsearch: value,
            })}`
          );
        } else {
          getData({ archiveMode }, 1, {});
          history.push(`${BASE_URL}?${queryToUrl({})}`);
        }
      }
      setReportSearchValue(value);
    };

    const handleAddClick = (obj) => {
      setAddClicked(obj);
      let autoData = {
        agency: getAgencyRef(),
        userInfo: getRefObj(),
        entityTemplate: {
          sys_templateName: metadata?.sys_entityAttributes?.sys_templateName,
          sys_groupName:
            metadata?.sys_entityAttributes?.sys_templateGroupName
              ?.sys_groupName,
          id: metadata._id,
          sys_gUid: metadata.sys_gUid,
        },
      };
      setAutoPopulate({ sys_entityAttributes: autoData });
    };

    const onAdvanceSearch = (filterObj, filter) => {
      summaryPropDispatch({ type: "SET_LOADER", payload: { loader: true } });
      let params = {
        ...filterObj.filters,
      };
      if (filterObj.sys_agencyId) {
        params.sys_agencyId = filterObj.sys_agencyId;
      }
      if (filterObj.sortby) {
        Object.keys(filterObj.sortby).map((key) => {
          params.sortby = key;
          params.orderby = filterObj.sortby[key];
        });
      }
      if (Object.keys(params).length > 0) {
        setActiveFilter(filter);
        setSearchValue(params);
        setReportSearchValue(params);
        getData(null, 1, params);
        history.push(`${BASE_URL}?${queryToUrl(params)}`);
      } else {
        setMasterFilter("ALL");
        setActiveFilter({});
        setSearchValue({});
        setReportSearchValue({});
        getData(null, 1, {});
        history.push(`${BASE_URL}?${queryToUrl(params)}`);
      }
    };

    const onRedirect = (res) => {
      setDialog({ dialog: false });
      setBackDrop("Redirecting");
      history.push(
        `/app/summary/${params.appname}/${params.modulename}/${
          params.entityname
        }/read/${res[0]._id}?${queryToUrl(queryParams)}`
      );
      closeBackDrop();
    };

    const onScannedData = async (scannedData) => {
      try {
        if (scannedData) {
          let { format, text } = scannedData;
          let formatType = format === 11 ? "QR_CODE" : "BAR_CODE";
          let res = await entity.get({
            ...params,
            [formatType]: text,
            limit: 1,
            skip: 0,
          });
          if (res.length > 0) {
            let redirectModal = {
              dialog: true,
              title: `Scanned ${params.entityname} successfully`,
              msg: "Do you want to Redirect?",
              confirmLabel: "Redirect",
              onConfirm: () => {
                onRedirect(res);
              },
            };
            setDialog(redirectModal);
          } else {
            let failModal = {
              dialog: true,
              title: `Could not find any ${params.entityname}, please try again. `,
              confirmLabel: "Scan again",
              onConfirm: () => {
                setScanner(true);
                setDialog({ dialog: false });
              },
            };
            setDialog(failModal);
          }
        }
      } catch (e) {
        let failModal = {
          dialog: true,
          title: `Could not find any ${params.entityname}, please try again`,
        };
        setDialog(failModal);
      }
    };

    const onupdate = (filterObj) => {
      summaryPropDispatch({ type: "SET_LOADER", payload: { loader: true } });
      let params = {
        ...filterObj,
      };
      if (Object.keys(filterObj).length > 0) {
        setSearchValue(params);

        if (!mounted) {
          getData(null, 1, { ...params, ...queryParams });
          history.push(
            `${BASE_URL}?${queryToUrl({ ...params, ...queryParams })}`
          );
        } else {
          getData(null, 1, params);
          // history.push(`${BASE_URL}?${queryToUrl(filterObj)}`);
        }
      } else {
        getData(null, 1);
        setMasterFilter("ALL");
        setSearchValue();
        history.push(`${BASE_URL}?${queryToUrl(filterObj)}`);
      }
    };

    const handleExportClose = () => {
      setOpen(false);
    };

    const renderFeatureList = () => {
      return (
        <div>
          <Popover
            // id={e_id}`
            open={e_open}
            anchorEl={e_anchorEl}
            onClose={() => sete_AnchorEl(null)}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                maxHeight: "200px",
                minWidth: "156px",
              }}
            >
              {buttonList.map(({ title, handler }, i) => {
                return (
                  <>
                    <span
                      testid={`feature-select-${title}`}
                      id={`feature-select-${title}`}
                      className="feature-list-item"
                      key={i}
                      style={{
                        cursor: "pointer",
                        display: "flex",
                      }}
                      onClick={handler}
                    >
                      <ListItem>{title}</ListItem>
                    </span>
                  </>
                );
              })}
            </div>
          </Popover>
        </div>
      );
    };

    const handleBulkOpClick = (event) => setBulkEl(event.currentTarget);

    const handleBulkOpClose = () => setBulkEl(null);

    const getBulkOp = (bulkOp, bulkOperations) => {
      let { title } = bulkOperations.find((a) => a.title === bulkOp) || {
        title: "Bulk Actions",
      };
      return title;
    };

    const renderBulkOps = () => {
      let actionButtons = get(
        metadata,
        "sys_entityAttributes.bulkActionConfig.actionButtons"
      );
      let { bulkDelete } = bulkPermision || {};

      let writeAccess = checkWriteAccess({
        appname: appname,
        modulename: modulename,
        entityname: entityname,
      });

      let deleteAccess = checkDeleteAccess({
        appname: appname,
        modulename: modulename,
        entityname: entityname,
      });

      let bulkOperations = [
        ...(actionButtons?.length
          ? actionButtons.map((e) => ({ ...e, value: "update" }))
          : []),
        ...(bulkDelete
          ? [
              {
                actionTitle: "Bulk Delete",
                value: "delete",
              },
            ]
          : []),
      ];

      if (writeAccess && deleteAccess) {
        bulkOperations = bulkOperations;
      } else if (writeAccess) {
        bulkOperations = bulkOperations.filter((fl) => fl.value === "update");
      } else if (deleteAccess) {
        bulkOperations = bulkOperations.filter((fl) => fl.value === "delete");
      } else {
        bulkOperations = [];
      }

      if (bulkArchive?.archive && !isRelation()) {
        if (archiveMode?.toUpperCase() === "ARCHIVE") {
          bulkOperations.push({
            actionTitle: "Bulk UnArchive",
            value: "archive",
          });
        } else if (archiveMode?.toUpperCase() === "UNARCHIVE") {
          bulkOperations.push({
            actionTitle: "Bulk Archive",
            value: "archive",
          });
        }
      }
      if (bulkOperations?.length > 0) {
        return (
          <>
            <DisplayButton
              onClick={handleBulkOpClick}
              size="small"
              testid="summary-bulk-new"
              variant="outlined"
              systemVariant="primary"
              style={{
                display: "flex",
                alignSelf: "center",
                justifyContent: "center",
                fontSize: "auto",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              endIcon={<ArrowDropDown testid={"summary-bulk-dropdown"} />}
              startIcon={<Settings size="small" />}
            >
              {getBulkOp("", bulkOperations)}
            </DisplayButton>
            <Menu
              anchorEl={bulkEl}
              keepMounted
              open={Boolean(bulkEl)}
              onClose={handleBulkOpClose}
              getContentAnchorEl={null}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
            >
              {bulkOperations?.map((bulkop) => {
                return (
                  <MenuItem
                    onClick={(e) =>
                      handleBulkUpdate({
                        data: bulkop?.value,
                        fields: bulkop?.fields,
                        modalTitle: bulkop?.modalTitle,
                        actionDescription: bulkop?.actionDescription,
                      })
                    }
                  >
                    {`${bulkop?.actionTitle}`}
                  </MenuItem>
                );
              })}
            </Menu>
          </>
        );
      }
    };

    const handleEventLogs = async (subEventName) => {
      await eventTracker
        .captureEvent("", {
          eventName: "SummaryVisit",
          subEventName: subEventName,
          eventType: "",
          username: username,
          appname: appname,
          modulename: modulename,
          entityname: entityname,
        })
        .then((result) => {
          // console.log("reuslt is -> ", result);
          console.log(`${subEventName} event data saved to db`);
        })
        .catch((err) => {
          // console.log("error is -> ", err);
          console.log(`${subEventName} event error while saving to db`);
        });
    };

    const handleFilterChange = (selectedValue, values) => {
      let name = values.find((i) => i.id == selectedValue).name;
      let { defaultSortBy, defaultOrderBy } = getDefaultSort();
      let selectedFilter = {};
      if (sortby || Object.keys(getDefaultSort()).length) {
        selectedFilter = {
          ...selectedFilter,
          // ...filter,
          ...{
            sortby: sortby ? sortby : defaultSortBy && defaultSortBy,
            orderby: orderby ? orderby : defaultOrderBy && defaultOrderBy,
          },
        };
      }
      if (selectedValue === "ALL") {
        setMasterFilter(selectedValue);
        if (sortby || defaultSortBy) {
          selectedFilter = {
            ...{
              sortby: sortby ? sortby : defaultSortBy,
              orderby: orderby ? orderby : defaultOrderBy,
            },
          };
        }
        if (isRelation()) {
          getData(null, 1, selectedFilter, screenType, relatedEntityInfo);
          setReportSearchValue({});
        } else {
          getData({ archiveMode }, 1, selectedFilter);
          setReportSearchValue({});
          history.push(`${BASE_URL}?${queryToUrl(selectedFilter)}`);
        }
      } else if (selectedValue === "PRIVATE_USER") {
        if (isRelation()) {
          selectedFilter[name] = userGuid;
          setMasterFilter(selectedValue);
          getData(null, 1, selectedFilter, screenType, relatedEntityInfo);
        } else {
          selectedFilter[name] = userGuid;
          setMasterFilter(selectedValue);
          getData({ archiveMode }, 1, selectedFilter);
          history.push(`${BASE_URL}?${queryToUrl(selectedFilter)}`);
        }
      } else {
        if (isRelation()) {
          selectedFilter[name] = selectedValue;
          setMasterFilter(selectedValue);
          setReportSearchValue(selectedFilter);
          getData(null, 1, selectedFilter, screenType, relatedEntityInfo);
        } else {
          selectedFilter[name] = selectedValue;
          setMasterFilter(selectedValue);
          getData({ archiveMode }, 1, selectedFilter);
          setReportSearchValue(selectedFilter);
          history.push(`${BASE_URL}?${queryToUrl(selectedFilter)}`);
        }
      }

      //handled the master filter event log
      handleEventLogs("MasterFilters");
    };

    const renderMasterFilter = (data) => {
      // it need to show  all values in one list below chnages are made
      let title =
        (data && data?.find((obj) => obj.hasOwnProperty("title"))?.title) ||
        "Filters";
      let values =
        data &&
        data
          ?.map((i) => {
            i.values.forEach((ii) => {
              ii.name = i.name;
              return i;
            });
            return i?.values;
          })
          .flat();

      return (
        <DisplaySelect
          classes={{
            root: classes.textField,
          }}
          style={{
            // width: "125px",
            background: "none",
            // marginTop: "0.3rem"
          }}
          label={title}
          labelKey="value"
          showNone={false}
          valueKey="id"
          values={values}
          variant="outlined"
          onChange={(e) => {
            summaryPropDispatch({
              type: "SET_LOADER",
              payload: { loader: true },
            });
            handleFilterChange(e, values);
          }}
          value={master_filter || "ALL"}
        />
      );
    };

    const checkEntityCreateAccess = () => {
      if (isRelation()) {
        let { childEntityParams } = relatedEntityInfo;
        let access = checkCreateAccess({
          appname: childEntityParams.appname,
          modulename: childEntityParams.modulename,
          entityname: childEntityParams.entityname,
        });
        return access;
      } else {
        return checkCreateAccess(params);
      }
    };

    const constructFilters = () => {
      if (!isRelation()) {
        if (Array.isArray(selectedRows) && selectedRows.length) {
          restParams["selectedRowIds"] = selectedRows;
        }
        if (globalsearch) {
          restParams["globalsearch"] = globalsearch;
        }
        return restParams;
      } else {
        let { childEntityParams, filterPath } = relatedEntityInfo || null;
        restParams[filterPath] = childEntityParams ? childEntityParams.id : "";
        return restParams;
      }
    };
    const handleClear = () => {
      refresDataOnSearchClear();
    };

    const handleNewClick = () => {
      if (screenType !== "RELATION") handleSidebar("0px");
      renderThroughProps ? editActionCallBack("", "new", metadata) : getRoute();
    };

    const detectArray = (field) => {
      if (field && Array.isArray(field)) return true;
      else return false;
    };

    const checkAssign = () => {
      if (relatedEntityInfo?.parentMeta?.sys_entityAttributes) {
        if (
          detectArray(
            relatedEntityInfo?.parentMeta?.sys_entityAttributes
              .sys_entityRelationships
          )
        ) {
          let entity_def =
            relatedEntityInfo?.parentMeta?.sys_entityAttributes.sys_entityRelationships.find(
              (e) =>
                e.entityName ===
                relatedEntityInfo?.childEntityParams?.entityname
            );
          if (entity_def) {
            let { relationButtons } = entity_def;
            if (detectArray(relationButtons)) {
              let assign = relationButtons.find(
                (e) => e.buttonType === "Assign"
              );
              if (assign) return true;
              else return false;
            }
          }
        }
      }
    };
    const refresDataOnSearchClear = () => {
      summaryPropDispatch({ type: "SET_LOADER", payload: { loader: true } });
      setMasterFilter("ALL");
      setActiveFilter({});
      setSearchValue({});
      setReportSearchValue("");
      setClearSearch((prev) => true);
      let qParams = {};
      qParams = sortby ? { ...qParams, sortby } : qParams;
      qParams = orderby ? { ...qParams, orderby } : qParams;
      if (!isRelation()) {
        if (isGeoFenceApplied)
          getData({ archiveMode }, 1, {
            ...qParams,
            geoFenceSearch: mapParams.geoFenceSearch,
          });
        else getData({ archiveMode }, 1, qParams);
        let url = Object.keys(qParams)?.length
          ? `${BASE_URL}?${queryToUrl(qParams)}`
          : BASE_URL;
        summaryPropDispatch({ type: "CLEAR_GLOBAL_SEARCH" });
        history.push(url);
      } else if (isRelation()) {
        summaryPropDispatch({ type: "CLEAR_FILTER" });
        summaryPropDispatch({ type: "CLEAR_GLOBAL_SEARCH" });
        summaryPropDispatch({ type: "SORT_INFO", payload: {} });
        getData(null, 1, qParams, screenType, relatedEntityInfo);
        setTimeout(() => {
          setClearSearch((prev) => false);
        }, 2000);
      } else {
        getData(null, 1, {}, screenType, relatedEntityInfo);
      }
    };
    const handleSearchChange = (value) => {
      if (!value) {
        refresDataOnSearchClear();
      }
    };
    const getTasksForTimeline = () => {
      let tasksForTimeline = [];
      try {
        data.map((eachData) => {
          if (
            eachData["sys_entityAttributes"][time_lineOption.startDate] &&
            eachData["sys_entityAttributes"][time_lineOption.endDate]
          )
            tasksForTimeline.push({
              start: new Date(
                eachData["sys_entityAttributes"][time_lineOption.startDate]
              ),
              end: new Date(
                eachData["sys_entityAttributes"][time_lineOption.endDate]
              ),
              name: eachData["sys_entityAttributes"][time_lineOption.title],
              styles: {
                progressColor: "#ffbb54",
                progressSelectedColor: "#ff9e0d",
                arrowIndent: "20px",
                arrowColor: "red",
              },
              type: "task",
            });
        });
      } catch (e) {
        return tasksForTimeline;
      }
      return tasksForTimeline;
    };
    const handleAssign = () => editActionCallBack("", "Assign", metadata);

    const handleBulkUpdate = async (bulkParams) => {
      let { data, fields = [], modalTitle, actionDescription } = bulkParams;
      if (data.toUpperCase() === "ARCHIVE") {
        let payload = {
          selectedIds: selectedRows.map((el) => el.sys_gUid),
          collectionName: metadata?.sys_entityAttributes?.sys_entityCollection,
          filters: {},
          operationType: "UPDATE",
          appname: appname,
          modulename: modulename,
          entityname: entityname,
          templatename: metadata?.sys_entityAttributes?.sys_templateName,
          username: username,
          updatingFields: [
            {
              fieldName: bulkArchive.fieldName,
              fieldValue:
                archiveMode === "Archive"
                  ? bulkArchive.unarchiveValue
                  : bulkArchive.archiveValue,
            },
          ],
        };

        setDialogProps({
          open: true,
          title:
            archiveMode === "Archive"
              ? bulkArchive?.unarchiveTitle
              : bulkArchive?.archiveTitle || "",
          message:
            `Are you sure you want to ${
              archiveMode === "Archive" ? "unarchive" : "archive"
            } ${selectedRows.length} records? ${
              archiveMode === "Archive"
                ? bulkArchive?.unarchiveMessage
                : bulkArchive?.archiveMessage
            }` || "",
          confirmLabel: archiveMode === "Archive" ? "Unarchive" : "Archive",
          cancelLabel: "Cancel",
          onConfirm: async () => {
            await bulkActions
              .updateMany("", payload)
              .then((result) => {
                setDialogProps({ open: false });
                setBulkEl(null);
                setSnackBar({
                  message:
                    archiveMode === "Archive"
                      ? bulkArchive?.unarchiveSuccess
                      : bulkArchive?.archiveSuccess,
                  severity: "success",
                });
                summaryPropDispatch({
                  type: "SET_LOADER",
                  payload: { loader: true, pageNumber: 1 },
                });
                getData(
                  { globalsearch, archiveMode: archiveMode },
                  1,
                  filter,
                  isRelation() ? "RELATION" : "SUMMARY"
                );
                history.push(
                  `${BASE_URL}?${queryToUrl({ ...filter, page: 1 })}`
                );
              })
              .catch((err) => {
                console.log("error while updating Bulk Archive");
              });
          },
          onCancel: () => {
            setDialogProps({ open: false });
            setClearSelected(false);
            setBulkEl(null);
          },
        });
      } else {
        let bulkObj = {
          entityname: entityname,
          modulename: modulename,
          appname: appname,
          templatename: metadata?.sys_entityAttributes?.sys_templateName,
          collectionName: metadata?.sys_entityAttributes?.sys_entityCollection,
          filters: {},
          operationType: data.toUpperCase(),
          setBulkModal: setBulkModal,
          setBulkActionType: setBulkActionType,
          setClearSelected: setClearSelected,
          sys_topLevel,
          bulkPermision: { ...bulkPermision },
          selectedRows: selectedRows,
          fields,
          metadata,
          entityGlobalSearch,
          modalTitle:
            modalTitle || bulkPermision["modalName"][data.toUpperCase()],
          refreshTable: getData,
          isRelation,
          ...(relatedEntityInfo && Object.keys(relatedEntityInfo).length
            ? { relatedEntityInfo: relatedEntityInfo }
            : {}),
          screenType,
          actionDescription,
        };
        setClearSelected(false);
        setBulkEl(null);
        setBulkActionProps(bulkObj);
        setBulkModal(true);
      }
    };

    const handleClearFilter = () => {
      handleClear();
    };
    const isEntityTimelineEnabled = () => {
      if (
        time_lineOption &&
        Object.keys(time_lineOption).length &&
        time_lineOption.enableTimeLine
      )
        return true;
      else return false;
    };
    const showClearFilter = () => {
      const { sortby, orderby, page, ...rest } = filter;
      return Object.keys(rest).length > 0 || globalSearchState?.length > 0
        ? true
        : false;
    };

    const { inlineInstruction = {} } = helperData || {};

    const { moreOptions = "" } = inlineInstruction;

    useEffect(() => {
      if (clearSelected) {
        summaryPropDispatch({
          type: "SELECTED_DATA",
          payload: {
            selectedRows: [],
            loader: true,
          },
        });
      }
    }, [clearSelected]);

    useEffect(() => {
      setActiveFilter(appliedFilter);
    }, [appliedFilter]);

    useEffect(() => {
      if (!isRelation()) {
        setEntityGlobalSearch(globalsearch);
      }
      summaryPropDispatch({
        type: "ADD_GLOBAL_SEARCH",
        payload: isRelation() ? "" : globalsearch,
      });
    }, [globalsearch, entityname]);

    useEffect(() => {
      setMasterFilter("ALL");
      setReportSearchValue("");
      if (isRelation()) {
        setClearSearch(true);
        setTimeout(() => {
          setClearSearch(false);
        }, 1000);
      }
    }, [entityname]);

    useEffect(() => {
      if (screenType === "RELATION") setEntityGlobalSearch("");
      entityGlobalSearch?.length && setReportSearchValue(entityGlobalSearch);
      if (Object.keys(filterParams)?.length) {
        setSearchValue(filterParams);
        setReportSearchValue(filterParams);
        setMasterFilter(Object?.values(filterParams)[0] || "ALL");
      }
    }, []);

    useEffect(() => {
      setMounted(true);
    }, []);

    return (
      <div
        style={{
          display: "flex",
          flex: 1,
          gap: 10,
          justifyContent: "space-between",
          // outline: "solid blue"
          marginTop: ".4rem",
        }}
      >
        <div style={{ display: "flex", marginLeft: "30px" }}>
          {/* {(screenType != "RELATION") & (Object.keys(filterParams).length > 0) ? (
          <div
            style={{
              display: "flex",
              alignSelf: "center",
            }}
          >
            <FiltersPopover
              filterParams={
                Object.keys(filterParams).length ? filterParams : " "
              }
              handleClear={handleClear}
              updatedFilter={onupdate}
              styles={{ width: "22.5rem" }}
            />
          </div>
        ) : ( */}
          <DisplaySearchBar
            testid={"GridSearch"}
            placeholder="Search"
            data={entityGlobalSearch ? entityGlobalSearch : ""}
            onClick={handleSearch}
            onChange={handleSearchChange}
            style={{ width: "250px" }}
            clearSearch={clearSearch}
          />
          {/* )} */}

          {/* {screenType !== "RELATION" && (
          <DisplayIconButton
            testid="summary-asf"
            onClick={() => setAdvSearchVisibility(true)}
            style={{
              display: "flex",
              alignSelf: "center",
              // transform: "rotate(90deg)",
            }}
          >
            <DisplayBadge
              variant="dot"
              invisible={!Object.keys(filterParams).length}
            >
              <Tune />
            </DisplayBadge>
          </DisplayIconButton>
        )} */}
          {advSearchVisible && (
            <AdvanceSearch
              template={metadata}
              closeRenderAdvanceSearch={() => setAdvSearchVisibility(false)}
              onAdSearchOpen={onAdvanceSearch}
              propdata={{
                ...(filterParams || {}),
                sys_agencyId,
                sortby,
                orderby,
              }}
              activeFilter={activeFilter}
              resetActiveFilter={() => setActiveFilter({})}
              showModal={advSearchVisible}
              hideSaveFeature={false}
              entityName={params.entityname}
            />
          )}
          {showClearFilter() && (
            <DisplayButton
              size="small"
              testid="clear-filter-new"
              style={{
                display: "flex",
                alignSelf: "center",
                justifyContent: "center",
                fontSize: "12px",
                margin: "0px 16px",
                padding: "4px",
              }}
              variant="outlined"
              onClick={handleClear}
            >
              {`Clear Filters`}
            </DisplayButton>
          )}
        </div>

        <div
          style={{ display: "flex", alignSelf: "center", marginTop: ".3rem" }}
        >
          {masterFilters &&
            masterFilters?.length &&
            renderMasterFilter(masterFilters)}
        </div>
        {/* <div
        className="bulkActions"
        style={{ display: "flex", alignSelf: "center" }}
      > */}
        {/* {selectedRows?.length > 0 && (
          <DisplaySelect
            classes={{
              root: classes.textField,
            }}
            style={{
              width: "100px",
              background: "white",
              display: "flex",
              alignSelf: "center",
              justifyContent: "center",
            }}
            label={"Bulk Ops"}
            labelKey="value"
            showNone={false}
            valueKey="id"
            values={[
              {
                id: "update",
                value: "UPDATE",
              },
              {
                id: "delete",
                value: "DELETE",
              },
            ]}
            variant="outlined"
            onChange={(e) => {
              handleBulkUpdate(e);
            }}
            value={bulkActionType}
          />
        )} */}
        {/* </div> */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            flex: 1,
          }}
        >
          {" "}
          {["true", true].includes(bulkPermision?.bulkOperation) &&
          BULKACTIONS_VSIBILITY &&
          selectedRows?.length > 0 ? (
            renderBulkOps()
          ) : (
            <div style={{ display: "flex", flex: 1 }}> </div>
          )}
        </div>

        {isEntityTimelineEnabled() && (
          <DisplayModal
            maxWidth={"lg"}
            fullWidth={true}
            open={isTimeline}
            onClose={() => setTimeline(false)}
          >
            <Gantt tasks={getTasksForTimeline()} />
          </DisplayModal>
        )}

        <div style={{ display: "flex", justifyContent: "center" }}>
          {addClicked && (
            <DisplayModal open={addClicked} maxWidth={"lg"} fullWidth={true}>
              <DetailModal
                onClose={(e) => setAddClicked(null)}
                queryParams={{
                  appname: addClicked.appName,
                  modulename: addClicked.moduleName,
                  entityname: addClicked.entityName,
                }}
                filterParams={
                  addClicked.filterByTemplate !== false
                    ? {
                        entityTemplate: {
                          sys_templateName:
                            metadata?.sys_entityAttributes?.sys_templateName ||
                            "",
                        },
                      }
                    : {}
                }
                formdata={autoPopulate}
              />
            </DisplayModal>
          )}
          {checkAssign() && (
            <DisplayButton
              size="small"
              testid="summary-new"
              variant="contained"
              systemVariant="primary"
              style={{
                display: "flex",
                alignSelf: "center",
                justifyContent: "center",
                fontSize: "14px",
              }}
              onClick={handleAssign}
            >
              {`Assign`}
            </DisplayButton>
          )}
          {
            <DisplayModal
              open={bulkModal}
              maxWidth={"md"}
              fullWidth={true}
              onClose={() => setBulkModal(false)}
            >
              <BulkActionsNew {...bulkActionProps} />
            </DisplayModal>
          }
          {isEntityTimelineEnabled() && (
            <DisplayButton
              variant="contained"
              size="small"
              style={{
                display: "flex",
                alignSelf: "center",
                justifyContent: "center",
                fontSize: "14px",
              }}
              onClick={() => setTimeline(true)}
            >
              Timeline
            </DisplayButton>
          )}
          {writeAction &&
            checkEntityWriteAccess() &&
            checkButtonAccess() &&
            checkEntityCreateAccess() && (
              <DisplayButton
                size="small"
                testid="summary-new"
                variant="contained"
                systemVariant="primary"
                disabled={checkAttachedStatus(detailPageData)}
                style={{
                  display: "flex",
                  alignSelf: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                }}
                onClick={handleNewClick}
              >
                {childEntityCreateButtonTitle &&
                typeof childEntityCreateButtonTitle !== "object"
                  ? childEntityCreateButtonTitle
                  : "Create"}
              </DisplayButton>
            )}
          {isCodeGenerator && (
            <DisplayIconButton
              testid="scanner"
              size="small"
              style={{
                margin: "0px 10px 0px 10px",
                display: "flex",
                alignSelf: "center",
              }}
              onClick={() => setScanner(true)}
              systemVariant="primary"
            >
              <span class="material-icons">qr_code_scanner</span>
            </DisplayIconButton>
          )}
          {layer && (
            <ToolTipWrapper
              title={fullScreenSize ? "Show map" : "Hide map"}
              placement="bottom-start"
            >
              <div
                style={{
                  display: "flex",
                  margin: "0px 0.5rem 0px 0.5rem",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <DisplaySwitch
                  type="map"
                  size="small"
                  checked={!fullScreenSize}
                  testid="summary-showMap"
                  onChange={(e) => {
                    dispatch({
                      type: "SET_SUMMARY_FULLSCREEN",
                      payload: !fullScreenSize,
                    });
                    dispatch({
                      type: "SET_FULLSCREEN_CLICK_STATUS",
                      payload: e.target.checked,
                    });
                    fullScreenSize && handleEventLogs("Map");
                  }}
                />
              </div>
            </ToolTipWrapper>
          )}
          {scanner && (
            <ScannerModal
              onSuccessCallback={onScannedData}
              onClose={setScanner}
              scannerTimeout={30000}
            />
          )}
          {renderFeatureList()}
          {buttonList?.length > 0 && (
            <ToolTipWrapper title={moreOptions} placement="bottom-start">
              <div style={{ display: "flex" }}>
                <DisplayIconButton
                  systemVariant="primary"
                  testid="summary-more"
                  style={{ display: "flex", alignSelf: "center" }}
                  onClick={(e) => sete_AnchorEl(e.currentTarget)}
                >
                  <MoreVertical />
                </DisplayIconButton>
              </div>
            </ToolTipWrapper>
          )}
          {open && (
            <Export_Csv
              entityTemplate={entityTemplate}
              open={open}
              onClose={handleExportClose}
              totalCount={totalCount}
              appObject={
                !isRelation()
                  ? { appname, modulename, entityname }
                  : {
                      appname: relatedEntityInfo.childEntityParams.appname,
                      modulename:
                        relatedEntityInfo.childEntityParams.modulename,
                      entityname:
                        relatedEntityInfo.childEntityParams.entityname,
                    }
              }
              filters={constructFilters()}
              archiveMode={archiveMode}
            />
          )}
          {REPORT_VISIBILITY && (
            <ReportGenerator
              appname={
                !isRelation()
                  ? appname
                  : relatedEntityInfo.childEntityParams.appname
              }
              modulename={
                !isRelation()
                  ? modulename
                  : relatedEntityInfo.childEntityParams.modulename
              }
              entityname={
                !isRelation()
                  ? entityname
                  : relatedEntityInfo.childEntityParams.entityname
              }
              modalFlag={reportFlag}
              container={{ level: "summary", limit: 100 }}
              filter={restParams}
              searchValues={reportSearchValue}
              metadata={metadata}
              onClose={() => {
                setReportFlag(false);
              }}
              archiveMode={archiveMode}
              selectedRows={selectedRows}
            />
          )}
          <DisplayDialog
            testid={"detail"}
            open={dialog.dialog}
            title={dialog.title}
            message={dialog.msg}
            confirmLabel={dialog.confirmLabel}
            onConfirm={dialog.onConfirm}
            onCancel={() => {
              setDialog({ dialog: false });
            }}
          />
          <DisplayDialog {...dialogProps} />
        </div>
      </div>
    );
  }
);
