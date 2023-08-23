import React, { useEffect, useState, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useLocation, useHistory } from "react-router-dom";
import queryString from "query-string";
import { useParams } from "react-router";
import {
  DisplayBadge,
  DisplayButton,
  DisplayDialog,
  DisplayIconButton,
  DisplayModal,
  DisplaySearchBar,
  DisplaySelect,
} from "components/display_components";
import { Export_Csv } from "containers/feature_containers";
import GridServices from "./utils/services";
import { useStateValue } from "utils/store/contexts";
import { GlobalFactory, UserFactory } from "utils/services/factory_services";
import { SystemIcons } from "utils/icons";
import { SummaryGridContext } from ".";
import { Menu, MenuItem, Popover } from "@material-ui/core";
import { ReportGenerator } from "components/helper_components";
import {
  AdvanceSearch,
  DetailModal,
  FiltersPopover,
} from "components/helper_components";
import { get, isDefined } from "utils/services/helper_services/object_methods";
import { BulkActionsNew } from "containers/feature_containers";

const useStyles = makeStyles((theme) => ({
  textField: {
    [`& fieldset`]: {
      borderRadius: "50px",
      height: "40px",
    },
  },
}));

export const GridSearch = ({
  editActionCallBack,
  renderThroughProps,
  writeAction = true,
  appname,
  modulename,
  entityname,
  entityTemplate,
  appliedFilter,
  totalCount,
}) => {
  const history = useHistory();
  const queryParams = queryString.parse(useLocation().search);
  const { globalsearch, ...restParams } = queryParams;
  const { page, sortby, orderby, sys_agencyId, ...filterParams } = restParams;
  const [advSearchVisible, setAdvSearchVisibility] = useState(false);
  const [reportFlag, setReportFlag] = useState(false);
  const [reportSearchValue, setReportSearchValue] = useState("");
  const { getData, getRoute } = GridServices();
  const [gridProps, adminDispatch] = useContext(SummaryGridContext);
  const dispatch = useStateValue()[1];
  const { params, metadata, selectedRows } = gridProps;

  const {
    checkWriteAccess,
    checkDeleteAccess,
    getEntityFeatureAccess,
    checkGlobalFeatureAccess,
    isNJAdmin,
    getRefObj,
    getAgencyRef,
  } = UserFactory();
  const classes = useStyles();
  const [searchValue, setSearchValue] = useState({});
  const [master_filter, setMasterFilter] = useState("");
  const { Add, MoreVertical, ArrowDropDown, Tune } = SystemIcons;
  const [open, setOpen] = useState(false);
  const [bulkEl, setBulkEl] = useState(null);
  const [bulkActionProps, setBulkActionProps] = useState({});
  const [bulkModal, setBulkModal] = useState(false);
  const [clearSelected, setClearSelected] = useState(false);
  const [addClicked, setAddClicked] = useState(null);
  const [autoPopulate, setAutoPopulate] = useState({});
  const [activeFilter, setActiveFilter] = useState({});
  const [e_anchorEl, sete_AnchorEl] = useState(null);
  const [dialog, setDialog] = useState({ dialog: false });
  const reports = metadata?.sys_entityAttributes?.sys_reports || [];
  const { sys_summaryOptions } = get(metadata, "sys_entityAttributes");
  const e_open = Boolean(e_anchorEl);
  const masterFilters = metadata?.sys_entityAttributes?.masterFilters
    ? get(metadata, "sys_entityAttributes.masterFilters")
    : "";

  const bulkPermision = metadata?.sys_entityAttributes?.bulkActionConfig
    ? get(metadata, "sys_entityAttributes.bulkActionConfig")
    : false;
  const { sys_topLevel } = get(metadata, "sys_entityAttributes");
  const BASE_URL = `/app/admin_panel/${entityname}`;
  const REPORT_VISIBILITY =
    getEntityFeatureAccess(appname, modulename, entityname, "Reports") &&
    checkGlobalFeatureAccess("Reports") &&
    !renderThroughProps && //Temporary
    !isNJAdmin() &&
    reports?.length > 0;

  const checkEntityWriteAccess = () => checkWriteAccess(params);

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
        getEntityFeatureAccess(appname, modulename, entityname, "ImportCSV"),
      handler: () => {
        history.push("/app/import?summary=true");
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
      },
    },
    {
      title: "Generate Reports",
      visible: REPORT_VISIBILITY,
      handler: () => {
        setReportFlag(true);
      },
    },
    ...(sys_summaryOptions?.length
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

  const queryToUrl = (params) =>
    Object.keys(params || {})
      .map((key) => key + "=" + params[key])
      .join("&");

  const handleSearch = (value) => {
    adminDispatch({ type: "SET_LOADER", payload: { loader: true } });
    if (isDefined(value)) {
      getData(value, 1);
      let url = `${BASE_URL}?globalsearch=${value}`;
      history.push(url);
    } else {
      getData(value, 1);
      history.push(`${BASE_URL}`);
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
          metadata?.sys_entityAttributes?.sys_templateGroupName?.sys_groupName,
        id: metadata._id,
        sys_gUid: metadata.sys_gUid,
      },
    };
    setAutoPopulate({ sys_entityAttributes: autoData });
  };

  const onAdvanceSearch = (filterObj, filter) => {
    adminDispatch({ type: "SET_LOADER", payload: { loader: true } });
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
      setActiveFilter({});
      setSearchValue({});
      setReportSearchValue({});
      getData(null, 1, {});
      history.push(`${BASE_URL}?${queryToUrl(params)}`);
    }
  };

  const onupdate = (filterObj) => {
    adminDispatch({ type: "SET_LOADER", payload: { loader: true } });
    let params = {
      ...filterObj,
    };
    if (Object.keys(filterObj).length > 0) {
      setSearchValue(params);
      getData(null, 1, filterObj);
      history.push(`${BASE_URL}?${queryToUrl(params)}`);
    } else {
      getData(null, 1);
      setSearchValue();
      history.push(`${BASE_URL}?${queryToUrl(params)}`);
    }
  };

  const renderBulkOps = () => {
    let { bulkUpdate, bulkDelete } = bulkPermision || {};

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

    console.log({ writeAccess, deleteAccess });

    // console.log("bulkPermision -> ", { bulkUpdate, bulkDelete });
    let bulkOperations = [
      {
        title: "Bulk Update",
        value: "update",
      },
      {
        title: "Bulk Delete",
        value: "delete",
      },
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
          >
            {getBulkOp("", bulkOperations)}
          </DisplayButton>
          <Menu
            anchorEl={bulkEl}
            keepMounted
            open={Boolean(bulkEl)}
            onClose={handleBulkOpClose}
          >
            {bulkOperations?.map((bulkop) => {
              // console.log("the bulkop -> ", bulkop);

              return (
                <MenuItem onClick={(e) => handleBulkUpdate(bulkop?.value)}>
                  {`${bulkop?.title}`}
                </MenuItem>
              );
            })}
          </Menu>
        </>
      );
    }
  };
  const handleBulkOpClick = (event) => setBulkEl(event.currentTarget);
  const handleBulkOpClose = () => setBulkEl(null);

  const getBulkOp = (bulkOp, bulkOperations) => {
    let { title } = bulkOperations.find((a) => a.title === bulkOp) || {
      title: "Bulk Actions",
    };
    return title;
  };
  const handleBulkUpdate = (data) => {
    let bulkObj = {
      entityname: entityname,
      modulename: modulename,
      appname: appname,
      metadata,
      templatename: metadata?.sys_entityAttributes?.sys_templateName,
      collectionName: metadata?.sys_entityAttributes?.sys_entityCollection,
      filters: {},
      operationType: data.toUpperCase(),
      setBulkModal: setBulkModal,
      selectedRows: selectedRows,
      setClearSelected: setClearSelected,
      // setBulkActionType: setBulkActionType,
      fields: sys_topLevel,
      bulkPermision: { ...bulkPermision },
    };
    setClearSelected(false);
    setBulkEl(null);
    setBulkActionProps(bulkObj);
    setBulkModal(true);
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
              padding: "10px 5px 10px 5px",
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
                      padding: "5px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                    }}
                    onClick={handler}
                  >
                    <DisplayButton style={{ display: "flex", flex: 1 }}>
                      {title}
                    </DisplayButton>
                  </span>
                </>
              );
            })}
          </div>
        </Popover>
      </div>
    );
  };

  const handleFilterChange = (selectedValue, values) => {
    let name = values.find((i) => i.id == selectedValue).name;
    let selectedFilter = {};
    if (selectedValue === "ALL") {
      setMasterFilter(selectedValue);
      history.push(`${BASE_URL}`);
    } else {
      selectedFilter[name] = selectedValue;
      setMasterFilter(selectedValue);
      history.push(`${BASE_URL}?${queryToUrl(selectedFilter)}`);
    }
  };

  const renderMasterFilter = (data) => {
    // it need to show  all values in one list below chnages are made
    let title =
      data?.find((obj) => obj.hasOwnProperty("title"))?.title || "Filters";
    let values = data
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
          background: "white",
          // marginTop: "0.3rem"
        }}
        label={title}
        labelKey="value"
        showNone={false}
        valueKey="id"
        values={values}
        variant="outlined"
        onChange={(e) => {
          adminDispatch({ type: "SET_LOADER", payload: { loader: true } });
          handleFilterChange(e, values);
        }}
        value={master_filter || "ALL"}
      />
    );
  };
  const refresDataOnSearchClear = () => {
    adminDispatch({ type: "SET_LOADER", payload: { loader: true } });
    setActiveFilter({});
    setSearchValue({});
    setReportSearchValue("");
    getData(null, 1);
    history.push(`${BASE_URL}`);
  };
  const handleClear = () => {
    refresDataOnSearchClear();
  };
  const handleSearchChange = (value) => {
    if (!value) {
      refresDataOnSearchClear();
    }
  };
  useEffect(() => {
    if (clearSelected) {
      adminDispatch({
        type: "SELECTED_DATA",
        payload: {
          selectedRows: [],
        },
      });
      setClearSelected(false);
    }
  }, [clearSelected]);

  const handleNewClick = () =>
    renderThroughProps ? editActionCallBack("", "new", metadata) : getRoute();

  useEffect(() => {
    setActiveFilter(appliedFilter);
  }, [appliedFilter]);

  useEffect(() => {
    globalsearch?.length && setReportSearchValue(globalsearch);
    if (Object.keys(filterParams)?.length) {
      setSearchValue(filterParams);
      setReportSearchValue(filterParams);
      // setMasterFilter(Object?.values(filterParams)[0]||"ALL");
    }
  }, []);

  useEffect(() => {
    setMasterFilter("ALL");
  }, [entityname]);

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
        {typeof searchValue === "object" &&
        Object.keys(searchValue).length > 0 ? (
          <div
            style={{
              display: "flex",
              alignSelf: "center",
            }}
          >
            <FiltersPopover
              filterParams={typeof searchValue == "object" ? searchValue : " "}
              handleClear={handleClear}
              updatedFilter={onupdate}
              styles={{ width: "22.5rem" }}
            />
          </div>
        ) : (
          <DisplaySearchBar
            testid={"GridSearch"}
            placeholder="Search"
            data={globalsearch ? globalsearch : ""}
            onClick={handleSearch}
            onChange={handleSearchChange}
            style={{ width: "250px" }}
          />
        )}
        <DisplayIconButton
          testid="summary-asf"
          onClick={() => setAdvSearchVisibility(true)}
          style={{ display: "flex", alignSelf: "center" }}
        >
          <DisplayBadge
            variant="dot"
            invisible={
              !(
                typeof searchValue === "object" &&
                Object.keys(searchValue).length
              )
            }
          >
            <Tune />
          </DisplayBadge>
        </DisplayIconButton>
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
        {
          <DisplayModal
            open={bulkModal}
            maxWidth={"md"}
            fullWidth={true}
            onClose={(res) => {
              setBulkModal(false);
            }}
          >
            <BulkActionsNew {...bulkActionProps} />
          </DisplayModal>
        }
      </div>

      <div style={{ display: "flex", alignSelf: "center" }}>
        {masterFilters?.length > 0 &&
          // masterFilters.map((eachFiletr) => {
          //   return renderMasterFilter(eachFiletr);
          // })}
          renderMasterFilter(masterFilters)}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          flex: 1,
        }}
      >
        {["true", true].includes(bulkPermision?.bulkOperation) &&
        selectedRows?.length > 0 ? (
          renderBulkOps()
        ) : (
          <div style={{ display: "flex", flex: 1 }}> </div>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        {writeAction && checkEntityWriteAccess() && (
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
            onClick={handleNewClick}
          >
            {`Create`}
          </DisplayButton>
        )}
        {renderFeatureList()}
        {buttonList?.length > 0 && (
          <DisplayIconButton
            systemVariant="primary"
            style={{ display: "flex", alignSelf: "center" }}
            onClick={(e) => sete_AnchorEl(e.currentTarget)}
          >
            <MoreVertical />
          </DisplayIconButton>
        )}
        {open && (
          <Export_Csv
            entityTemplate={entityTemplate}
            open={open}
            onClose={handleExportClose}
            totalCount={totalCount}
            appObject={{ appname, modulename, entityname }}
            filters={restParams}
          />
        )}
        {REPORT_VISIBILITY && (
          <ReportGenerator
            appname={appname}
            modulename={modulename}
            entityname={entityname}
            modalFlag={reportFlag}
            container={{ level: "summary", limit: 100 }}
            filter={restParams}
            searchValues={reportSearchValue}
            metadata={metadata}
            onClose={() => {
              setReportFlag(false);
            }}
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
      </div>
    </div>
  );
};
