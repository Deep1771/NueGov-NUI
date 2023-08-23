import React, { useEffect, useState, useMemo } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useLocation, useHistory } from "react-router-dom";
//Services
import {
  deleteEntity,
  entity,
  entityCount,
} from "utils/services/api_services/entity_service";
import { entityTemplate } from "utils/services/api_services/template_service";
//Custom Components
import { PaginationSkeleton } from "components/skeleton_components/control_panel/";
import { ImportsSkeleton } from "components/skeleton_components/imports/skeleton";
import {
  DisplayButton,
  DisplayGrid,
  DisplayIconButton,
  DisplayModal,
  DisplayPagination,
  DisplaySearchBar,
  DisplaySnackbar,
} from "components/display_components";
import queryString from "query-string";
import { ToolTipWrapper } from "components/wrapper_components";
import { ThemeFactory } from "utils/services/factory_services";
import { ErrorFallback } from "components/helper_components";
import { CardComponent } from "./components/card";
import { DetailTrigger } from "containers/extension_containers";
import { UserFactory, GlobalFactory } from "utils/services/factory_services";
import { SystemIcons } from "utils/icons";
import { TRIGGER_QUERY } from "utils/constants/query";
import { useStateValue } from "utils/store/contexts";
import { VideoPlayer } from "components/helper_components/video_player";
import { isDefined } from "utils/services/helper_services/object_methods";

const useStyles = makeStyles({
  t_container: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    margin: 16,
  },
  t_header: {
    display: "flex",
    flexShrink: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  t_list: { display: "flex", flex: 9, flexDirection: "column", marginTop: 16 },
  t_modal: { display: "flex", height: "100vh", width: "100vw" },
});

const { appname, modulename, entityname } = TRIGGER_QUERY;
const TriggerSummary = (props) => {
  const { groupname: ENTITY, sys_gUid } = props;
  const queryParams = queryString.parse(useLocation().search);
  const { drawer } = queryParams;
  const { getContextualHelperData } = GlobalFactory();
  //Local State
  const [entityInfo, setEntityInfo] = useState();
  const [message, setMessage] = useState("");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedCard, setSelectedCard] = useState();
  const [triggerModalNew, setTriggerModalNew] = useState(false);
  const [triggerModal, setTriggerModal] = useState(false);
  const [triggerProps, setTriggerProps] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [searchKey, setSearchKey] = useState();
  const { checkReadAccess, checkWriteAccess, getAgencyDetails, isNJAdmin } =
    UserFactory();
  const { showHelper = false } = getAgencyDetails?.sys_entityAttributes || {};
  const { getVariantObj } = ThemeFactory();
  const { dark } = getVariantObj("primary");
  const [openHelp, setHelp] = useState(false);

  const detailMode = useLocation()?.pathname?.split("/")[2] === "summary";
  const { goBack } = useHistory();
  const { Add, ArrowBackIos, Help } = SystemIcons;
  const classes = useStyles();

  //Constants
  const ITEMS_PER_PAGE = 60;
  const helperData = getContextualHelperData("NOTIFICATION_SCREEN");

  //Custom Functions
  const onPageChange = (e, page) => setPage(page);

  const init = async () => {
    setLoading(true);
    if (appname && modulename && entityname) {
      let metadata = await entityTemplate.get({
        appname,
        modulename,
        groupname: entityname,
      });
      const { app_cardContent } = metadata.sys_entityAttributes;
      // const { projectFields } = app_cardContent ? app_cardContent : {};
      let params = { ...TRIGGER_QUERY };
      if (detailMode)
        params = {
          ...params,
          doc_gUid: sys_gUid,
        };

      if (searchKey) params = { ...params, title: searchKey };

      // if (projectFields) params.displayFields = projectFields.join(",");
      let [data, { data: totalCount }] = await Promise.all([
        entity.get({
          ...params,
          skip: page ? (page - 1) * ITEMS_PER_PAGE : 0,
          limit: ITEMS_PER_PAGE,
        }),
        entityCount.get(params),
      ]);
      if (data && !data.error) setEntityInfo({ data, metadata, totalCount });
    }
    setRefresh(false);
    setLoading(false);
  };

  const clearMessage = () => setMessage(null);

  const handleClose = () => {};

  const handleCardClick = (selectedData) => {
    setTriggerProps({
      properties: props,
      mode: "EDIT",
      detailMode: detailMode,
      data: selectedData,
    });
    setTriggerModal(true);
  };

  const onDelete = async (id) => {
    setLoading(true);
    await deleteEntity.remove({
      appname,
      modulename,
      entityname,
      id,
      templateName: entityInfo.metadata.sys_entityAttributes.sys_templateName,
    });
    init();
  };

  const onClone = async (data) => {
    // console.log(data);
  };

  const handleSearch = (str) => setSearchKey(str);

  const handleClear = () => setSearchKey();

  //Effects
  useEffect(() => {
    if (checkReadAccess(TRIGGER_QUERY)) init();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (refresh) init();
  }, [refresh]);

  useEffect(() => {
    mounted && init();
  }, [page, searchKey]);

  const renderTriggerModalNew = () => {
    return (
      <DisplayModal style={{ zIndex: 999 }} fullScreen open={triggerModalNew}>
        <div className={classes.t_modal}>
          <DetailTrigger
            onClose={(val) => {
              setTriggerModalNew(false);
              setRefresh(true);
            }}
            detailMode={detailMode}
            properties={props}
            mode="NEW"
          />
        </div>
      </DisplayModal>
    );
  };

  const renderTriggerModal = () => {
    return (
      <DisplayModal style={{ zIndex: 999 }} fullScreen open={triggerModal}>
        <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
          <DetailTrigger
            onClose={(val) => {
              setTriggerModal(false);
              if (val) init();
            }}
            {...triggerProps}
          />
        </div>
      </DisplayModal>
    );
  };

  const checkForVideoLinks = () => {
    let videoLinks = helperData.videoLinks.filter((e) =>
      isDefined(e.link)
    ).length;
    return videoLinks > 0;
  };

  if (selectedCard) {
    return <React.Fragment id={selectedCard} handleClose={handleClose} />;
  } else if (checkReadAccess(TRIGGER_QUERY))
    return (
      <>
        <div className={classes.t_container}>
          <div className={classes.t_header}>
            <div style={{ display: "flex", flexShrink: 1 }}>
              {!detailMode && (
                <DisplayButton
                  startIcon={<ArrowBackIos />}
                  onClick={() => goBack()}
                >
                  BACK
                </DisplayButton>
              )}
            </div>
            <div
              style={{ display: "flex", flexShrink: 1, alignItems: "center" }}
            >
              <DisplaySearchBar
                testid="summary-trigger"
                data={searchKey || ""}
                onClick={handleSearch}
                style={{ width: 200 }}
                placeholder="Search by trigger name"
                onClear={handleClear}
              />
              <DisplayButton
                startIcon={<Add />}
                disabled={!checkWriteAccess(TRIGGER_QUERY)}
                onClick={() => setTriggerModalNew(true)}
              >
                CREATE TRIGGER
              </DisplayButton>
              {isNJAdmin() ||
                (helperData && checkForVideoLinks() && showHelper && (
                  <DisplayIconButton onClick={() => setHelp(true)}>
                    <ToolTipWrapper title="Help" placement="bottom-start">
                      <Help style={{ color: dark.bgColor, fontSize: "20px" }} />
                    </ToolTipWrapper>
                  </DisplayIconButton>
                ))}
            </div>
          </div>
          <div className={classes.t_list}>
            <div
              style={{
                display: "flex",
                flexGrow: 1,
                flexDirection: "column",
                height: "100%",
                width: "100%",
              }}
            >
              <div
                style={{
                  flex: 10,
                  contain: "strict",
                  overflow: "hidden",
                  overflowY: "auto",
                  marginBottom: "20px",
                }}
                className="hide_scroll"
              >
                {loading || !entityInfo ? (
                  <ImportsSkeleton />
                ) : entityInfo.data.length > 0 ? (
                  <DisplayGrid container spacing={3}>
                    {entityInfo.data.map((ed, i) => {
                      return (
                        <DisplayGrid
                          key={ed._id}
                          item
                          xs={12}
                          sm={6}
                          md={drawer === "true" ? 6 : 4}
                          lg={drawer === "true" ? 4 : 3}
                          xl={drawer === "true" ? 4 : 3}
                          style={{ minHeight: "100px", display: "flex" }}
                        >
                          <CardComponent
                            data={ed}
                            template={entityInfo.metadata}
                            onCardClick={handleCardClick}
                            onClone={onClone}
                            onDelete={onDelete}
                          />
                        </DisplayGrid>
                      );
                    })}
                  </DisplayGrid>
                ) : (
                  <ErrorFallback slug="no_result" />
                )}
              </div>

              <div
                style={{
                  flexShrink: 1,
                  paddingLeft: "10px",
                  width: "400px",
                }}
              >
                <DisplayGrid item container>
                  <DisplayGrid item container xl={12}>
                    {entityInfo ? (
                      <DisplayPagination
                        totalCount={entityInfo.totalCount}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onChange={onPageChange}
                        currentPage={page ? Number(page) : 1}
                      />
                    ) : (
                      <PaginationSkeleton />
                    )}
                  </DisplayGrid>
                </DisplayGrid>
              </div>
              <DisplaySnackbar
                open={!!message}
                message={message}
                onClose={clearMessage}
              />
              {renderTriggerModalNew()}
            </div>
          </div>
          {renderTriggerModal()}
        </div>
        {openHelp && (
          <VideoPlayer
            handleModalClose={() => setHelp(false)}
            screenName={"NOTIFICATION_SCREEN"}
            helperData={helperData}
          />
        )}
      </>
    );
  else return <ErrorFallback slug="permission_denied" />;
};

export default TriggerSummary;
