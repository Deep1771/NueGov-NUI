import React, { useState, useEffect, useContext, useRef, useMemo } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { CircularProgress } from "@material-ui/core";
import { useStateValue } from "utils/store/contexts";
import { SummaryGridContext } from ".";
import { GridSearch } from "./summary_header";
import { GridPagination } from "./summary_footer";
import { Grid } from "./summary_body.js";
import GridServices from "./utils/services";
import { ThemeFactory } from "utils/services/factory_services";
import {
  DisplayText,
  DisplayButton,
  DisplayCheckbox,
  DisplayProgress,
  DisplayIconButton,
  DisplayModal,
  DisplayChips,
} from "components/display_components";
import { SystemIcons } from "utils/icons/";
import { Typography } from "@material-ui/core";
import { VideoPlayer } from "components/helper_components/video_player";
import { ToolTipWrapper } from "components/wrapper_components";
import { Menu, MenuItem, Popover } from "@material-ui/core";
import { UserFactory, GlobalFactory } from "utils/services/factory_services";
import queryString from "query-string";
import { isDefined } from "utils/services/helper_services/object_methods";
import { eventTracker } from "utils/services/api_services/event_services";
import { SummaryContext } from "nuegov/screens/summary_screen";
import HelpOutlineOutlinedIcon from "@material-ui/icons/HelpOutlineOutlined";
import { Chip } from "@material-ui/core";

const IconButtonHandler = ({ Icon, ...rest }) => (
  <DisplayIconButton systemVariant="primary" {...rest}>
    <Icon />
  </DisplayIconButton>
);

export const SummaryGridContainer = ({
  appname,
  modulename,
  entityname,
  editActionCallBack,
  renderThroughProps = false,
  writeAction,
  readRouteQuery,
  height,
  relationInfo,
  appliedFilter,
  screenType,
  relatedEntityInfo,
  fromPage,
  handleIdsFor360,
  relatedItemRefresh,
  changeRelatedItemRefresh,
  detailPageData,
}) => {
  let { pathname, search } = useLocation();
  const queryParams = queryString.parse(useLocation().search);
  const { globalsearch, ...restParams } = queryParams;
  const [{ moduleState, mapState }] = useStateValue();
  const { activeModule, activeEntity } = moduleState;
  const { summaryData, type } = mapState || {};
  const [gridProps, dispatch] = useContext(SummaryGridContext);
  const { getVariantForComponent, getVariantObj } = ThemeFactory();
  const { dark } = getVariantObj("primary");
  const {
    data,
    metadata,
    selectedRows,
    loader,
    ITEM_PER_PAGE,
    archiveMode,
    filter,
  } = gridProps;
  const { setSnackBar, toggleDrawer, getContextualHelperData } =
    GlobalFactory();
  const headerRef = useRef(null);
  const { getMetadata, getData } = GridServices();
  const { ArrowForwardIos, Close, Help, Refresh, ArrowDropDown } = SystemIcons;
  const [loading, setLoading] = useState();
  const [refresh, setrefresh] = useState(false);
  const [archiveEl, setArchiveEl] = useState(null);
  const [openHelp, setHelp] = useState(false);
  const helperData = getContextualHelperData("SUMMARY_SCREEN");
  const { archiveConfig, sys_entityDescription } =
    metadata?.sys_entityAttributes || {};
  const { archiveMessage, unarchiveMessage } = archiveConfig || {};
  const initGrid = () => {
    if (appname && modulename && entityname)
      getMetadata(
        appname,
        modulename,
        entityname,
        readRouteQuery,
        screenType,
        relatedEntityInfo
      );
  };
  let ARCHIVE = sessionStorage.getItem("archiveMode");
  const [archiveState, setArchiveState] = useState({
    Archive: ARCHIVE?.toUpperCase() == "ARCHIVE" ? true : false,
  });
  const message = archiveState.Archive ? unarchiveMessage : archiveMessage;
  const { getUserDocument, getAgencyDetails, isNJAdmin } = UserFactory();
  let { inAppNotification, username } = getUserDocument;
  const { showHelper = false } = getAgencyDetails?.sys_entityAttributes || {};
  const ArchiveValues = [{ id: "Archive", value: "Archived" }];
  const isPublicUser = sessionStorage.getItem("public-user");

  const reloadGrid = async () => {
    if (!isRelation()) {
      getData(null, 1, {}, "SUMMARY");
    } else {
      getData(null, 1, {}, "RELATION", relatedEntityInfo);
    }
  };

  const BASE_URL = `/app/summary/${appname}/${modulename}/${entityname}`;
  const history = useHistory();
  const queryToUrl = (params) =>
    Object.keys(params || {})
      .map((key) => key + "=" + params[key])
      .join("&");

  const handleArchiveClick = (event) => setArchiveEl(event.currentTarget);
  const handleArchiveClose = () => setArchiveEl(null);

  const isRelation = () =>
    screenType === "RELATION" &&
    relatedEntityInfo &&
    Object.keys(relatedEntityInfo).length;

  useEffect(() => {
    if (Object.keys(metadata ? metadata : {}).length) setLoading(false);
    else setLoading(true);
  }, [JSON.stringify(metadata)]);

  useEffect(() => {
    sessionStorage.setItem("archiveMode", "Unarchive");
    sessionStorage.setItem("entityname", entityname);
    dispatch({ type: "SET_LOADER", payload: { loader: true } });
    if (!screenType === "RELATION") {
      if (pathname.includes("summary")) {
        let summaryTabLink = `${pathname}${search}`;
        sessionStorage.setItem("summaryTabLink", summaryTabLink);
      }
    }
    setTimeout(() => {
      sessionStorage.removeItem("entityname"); //1.5minutes
    }, 90000);
    initGrid();
    if (entityname !== sessionStorage.getItem("entityName")) {
      setArchiveState({ Archive: false });
      sessionStorage.removeItem("archiveMode");
    }
    dispatch({ type: "SORT_INFO", payload: {} });
    dispatch({ type: "CLEAR_FILTER" });
  }, [appname, modulename, entityname, JSON.stringify(relatedEntityInfo)]);

  const checkForVideoLinks = () => {
    let videoLinks = helperData.videoLinks.filter((e) =>
      isDefined(e.link)
    ).length;
    return videoLinks > 0;
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

  useEffect(() => {
    sessionStorage.setItem("archiveMode", "Unarchive");
  }, []);

  useEffect(() => {
    if (type === "geoFence") {
      let data = Array.isArray(summaryData) ? summaryData : [];
      dispatch({
        type: "SELECTED_DATA",
        payload: { data: data, dataCount: data?.length },
      });
    }
    if (type === "reset") {
      getData(null, 1, filter, "SUMMARY");
    }
  }, [summaryData, type]);

  let handleModalClose = () => {
    setHelp(false);
  };

  if (!loading)
    return (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding: "0rem 1rem 0rem 1rem",
          backgroundColor: "#ffffff",
        }}
      >
        {data && (
          <div
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              width: "100%",
              // gap: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                flex: 1,
                minHeight: screenType === "RELATION" ? "" : "82px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flex: 4.5,
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                {!isRelation() && activeModule && activeEntity && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Typography
                        variant="caption"
                        style={{ opacity: 0.6, fontFamily: "Poppins" }}
                      >
                        {activeModule.friendlyName}
                      </Typography>
                      <ArrowForwardIos
                        style={{
                          fontSize: "12px",
                          verticalAlign: "middle",
                        }}
                      />
                      <Typography
                        variant="h6"
                        style={{ fontFamily: "Poppins" }}
                      >
                        {activeEntity.friendlyName}
                      </Typography>
                      &nbsp;
                      {(isNJAdmin() ||
                        (helperData && checkForVideoLinks() && showHelper)) && (
                        <div
                          style={{
                            display: "flex",
                            height: "24px",
                            width: "auto",
                            border: "1px solid #81D4FA",
                            borderRadius: "50px",
                            gap: "4px",
                            padding: "0px 4px",
                            justifyContent: "space-between",
                            alignItems: "center",
                            backgroundColor: "#E1F5FE",
                            cursor: "pointer",
                          }}
                          onClick={() => setHelp(true)}
                        >
                          <HelpOutlineOutlinedIcon
                            style={{ color: dark.bgColor, fontSize: "1rem" }}
                          />
                          <span style={{ fontSize: "12px", color: "#0277BD" }}>
                            Help
                          </span>
                        </div>
                      )}
                      {/* <ToolTipWrapper title="Refresh" placement="bottom-start">
                      <div>
                        <IconButtonHandler
                          Icon={Refresh}
                          onClick={reloadGrid}
                        />
                      </div>
                    </ToolTipWrapper> */}
                    </div>
                    {sys_entityDescription && (
                      <ToolTipWrapper
                        title={
                          sys_entityDescription &&
                          sys_entityDescription?.length > 59
                            ? sys_entityDescription
                            : ""
                        }
                        placement="bottom-start"
                      >
                        <div
                          style={{
                            display: "inline-block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            width: "350px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <Typography
                            variant="caption"
                            style={{ opacity: 0.6 }}
                          >
                            {sys_entityDescription}
                          </Typography>
                        </div>
                      </ToolTipWrapper>
                    )}
                  </div>
                )}
                {!isRelation() && archiveConfig?.archive && !isPublicUser && (
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                    }}
                  >
                    {ArchiveValues.map((item, index) => (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        {console.log(
                          "archiveState[item.id]",
                          archiveState[item.id]
                        )}
                        <div
                          style={{
                            display: "flex",
                            marginBottom: "-5px",
                          }}
                        >
                          <DisplayCheckbox
                            key={index}
                            id={index}
                            style={{ padding: "0px 5px 0px 5px" }}
                            onChange={(e) => {
                              setArchiveState({
                                ...archiveState,
                                [item.id]: e,
                              });
                              let mode = e ? "Archive" : "Unarchive";
                              sessionStorage.setItem("archiveMode", mode);
                              sessionStorage.setItem("entityName", entityname);
                              setSnackBar({
                                message: `Switching to ${mode}d Summary`,
                                severity: "info",
                                anchorOrigin: {
                                  vertical: "top",
                                  horizontal: "center",
                                },
                              });

                              //to capture the switching event - dont remove it
                              handleEventLogs(mode);

                              setArchiveEl(null);
                              dispatch({
                                type: "ARCHIVE_MODE",
                                payload: {
                                  archiveMode: mode,
                                  loader: true,
                                  selectedRows: [],
                                },
                              });
                              !isRelation()
                                ? getData(
                                    { globalsearch, archiveMode: mode },
                                    1,
                                    filter ? filter : {},
                                    "SUMMARY"
                                  )
                                : getData(
                                    { globalsearch, archiveMode: mode },
                                    1,
                                    filter ? filter : {},
                                    "RELATION",
                                    relatedEntityInfo
                                  );
                              if (!isRelation()) {
                                history.push(
                                  `${BASE_URL}?${queryToUrl({
                                    ...queryParams,
                                    page: 1,
                                  })}`
                                );
                              }
                            }}
                            label={item.value}
                            labelPlacement="End"
                            checked={archiveState[item.id]}
                          />
                        </div>
                        <ToolTipWrapper
                          title={message && message?.length > 59 ? message : ""}
                          placement="bottom-start"
                        >
                          <div
                            style={{
                              display: "inline-block",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              width: "350px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <Typography
                              variant="caption"
                              style={{ opacity: 0.6 }}
                            >
                              {message}
                            </Typography>
                          </div>
                        </ToolTipWrapper>
                      </div>
                    ))}
                    {/* <DisplayButton
                      onClick={handleArchiveClick}
                      size="small"
                      variant="contained"
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
                      endIcon={<ArrowDropDown testid={"summary-archive"} />}
                    >
                      {archiveMode}
                    </DisplayButton>
                    <Menu
                      anchorEl={archiveEl}
                      keepMounted
                      open={Boolean(archiveEl)}
                      onClose={handleArchiveClose}
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      {[
                        archiveConfig?.archiveValue,
                        archiveConfig.unarchiveValue,
                      ]?.map((el) => {
                        return (
                          <MenuItem
                            style={{ display: "flex", alignItems: "center" }}
                            onClick={(e) => handleArchiveMode(el)}
                          >
                            {el}
                          </MenuItem>
                        );
                      })}
                    </Menu> */}
                  </div>
                )}
                {/* {isRelation() && fromPage !== "360View" && (
                  <>
                    <ToolTipWrapper title="Refresh" placement="bottom-start">
                      <div>
                        <IconButtonHandler
                          Icon={Refresh}
                          onClick={reloadGrid}
                        />
                      </div>
                    </ToolTipWrapper>
                  </>
                )} */}
              </div>
              {fromPage !== "360View" && (
                <div style={{ display: "flex", flex: 9 }}>
                  <GridSearch
                    appname={appname}
                    modulename={modulename}
                    entityname={entityname}
                    editActionCallBack={editActionCallBack}
                    renderThroughProps={
                      isRelation() ? true : renderThroughProps
                    }
                    writeAction={writeAction}
                    entityTemplate={metadata}
                    totalCount={data.length}
                    appliedFilter={appliedFilter}
                    screenType={screenType}
                    relatedEntityInfo={relatedEntityInfo}
                    refresh={refresh}
                    setrefresh={setrefresh}
                    archiveMode={archiveMode}
                    ref={headerRef}
                    detailPageData={detailPageData}
                    summaryScreenProps={mapState}
                  />
                </div>
              )}
            </div>
            <div style={{ display: "flex", flex: 10, width: "100%" }}>
              {!loader ? (
                <Grid
                  appname={appname}
                  modulename={modulename}
                  entityname={entityname}
                  editActionCallBack={editActionCallBack}
                  renderThroughProps={isRelation() ? true : renderThroughProps}
                  writeAction={writeAction}
                  height={height}
                  relationInfo={relationInfo}
                  screenType={screenType}
                  relatedEntityInfo={relatedEntityInfo}
                  handleIdsFor360={handleIdsFor360}
                  fromPage={fromPage}
                  refresh={refresh}
                  relatedItemRefresh={relatedItemRefresh}
                  changeRelatedItemRefresh={changeRelatedItemRefresh}
                  archiveMode={archiveMode}
                />
              ) : (
                <CircularProgress
                  style={{
                    color: `${
                      getVariantForComponent("", "primary").colors.dark.bgColor
                    }`,
                    display: "flex",
                    justifyContent: "center",
                    alignSelf: "center",
                    flex: 1,
                  }}
                  size={50}
                />
              )}
            </div>
            <div style={{ display: "flex", flex: 1 }}>
              <GridPagination
                appname={appname}
                modulename={modulename}
                entityname={entityname}
                screenType={screenType}
                relatedEntityInfo={relatedEntityInfo}
                ITEM_PER_PAGE={ITEM_PER_PAGE}
                handleRowLimit={(value) => {
                  dispatch({
                    type: "ADD_ROWS_COLUMNS",
                    payload: { ITEM_PER_PAGE: value ? value : 100 },
                    selectedRows: selectedRows,
                  });
                }}
                archiveMode={archiveMode}
              />
            </div>
          </div>
        )}
        {openHelp && (
          <VideoPlayer
            handleModalClose={handleModalClose}
            helperData={helperData}
          />
        )}
      </div>
    );
  else
    return (
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <DisplayProgress />
        <br />
        <DisplayText style={{ color: "#666666" }}>Loading...</DisplayText>
      </div>
    );
};
export default SummaryGridContainer;
