import React, { useEffect, useState, useContext } from "react";
import queryString from "query-string";
//Library Hook
import { useParams } from "react-router";
import { useHistory, useLocation } from "react-router-dom";
//Custom hook
import { useStateValue } from "utils/store/contexts";
//Factoy
import {
  UserFactory,
  FiltersFactory,
  ModuleFactory,
  GlobalFactory,
} from "utils/services/factory_services";
import { DisplayGrid } from "components/display_components";
import { ErrorFallback } from "components/helper_components/error_handling/error_fallback";
import { StatefulSummaryWrapper } from "containers/composite_containers/map_container/stateful_summary_wrapper";
import { DetailContainer } from "containers/composite_containers";
import SummaryContainer from "nuegov/containers/summary_container";
import { SummaryMapSkeleton } from "components/skeleton_components/summary_page/";
import { get } from "utils/services/helper_services/object_methods";
//Constants
const BASE_URL = `/app/summary/`;

export const NueGovSummaryScreen = () => {
  //Library hooks
  const history = useHistory();
  const queryParams = queryString.parse(useLocation().search);
  const { appname, modulename, entityname, mode, id, ...rest } = useParams();
  //Custom hook
  const [{ moduleState, configState, mapState }, dispatch] = useStateValue();
  //Factory hook
  const { getDefault, getFilterParams } = FiltersFactory();
  const { toggleDrawer, handleSidebar } = GlobalFactory();
  const { setActiveModuleEntities } = ModuleFactory();
  const { checkReadAccess, checkGlobalFeatureAccess } = UserFactory();
  //Local variable
  const { fullScreenSize, isDrawerOpen, sidebarClickStatus, previousEntity } =
    configState;
  const {
    activeModule,
    activeEntity,
    activeModuleEntities,
    activeModuleMapLayers,
  } = moduleState;
  const { page, sortby, orderby, ...restParams } = queryParams;
  //Component State
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(false);
  const [activeFilter, setActiveFilter] = useState({});
  const isPublicUser = sessionStorage.getItem("public-user");

  //Declarative methods
  const queryToUrl = (params) =>
    Object.keys(params)
      .map((key) => key + "=" + params[key])
      .join("&");

  const getModeUrl = (mode) =>
    `${BASE_URL}${appname}/${modulename}/${entityname}/${mode}/${id}?${queryToUrl(
      queryParams
    )}`;

  const onClose = () => {
    // if (sidebarClickStatus) toggleDrawer(true);
    if (sidebarClickStatus && !isPublicUser) {
      const sidebarElement = document.getElementById("sidebar");
      const sidebarParentElement = document.getElementById("sidebarParent");
      const globalComponentElement = document.getElementById("globalComponent");
      sidebarElement.style.width = "240px";
      sidebarParentElement.style.width = "240px";
      globalComponentElement.style.width = "80%";
    }
    if (queryParams?.isCalendar) history.push("/app/calendar");
    else
      history.push(
        `${BASE_URL}${appname}/${modulename}/${entityname}/?${queryToUrl(
          queryParams
        )}`
      );
  };

  const onModeChange = (mode) => history.push(getModeUrl(mode.toLowerCase()));

  const getFilters = (entityName) => {
    let defaultObj = getDefault(entityName);
    if (defaultObj) {
      setActiveFilter(defaultObj);
      return getFilterParams(defaultObj);
    } else {
      setActiveFilter({});
    }
  };

  const initRoute = () => {
    setError(false);
    try {
      dispatch({
        type: "RESET_MAP_CONTAINER",
        payload: {},
      });
      let entityTemplate = activeModuleMapLayers.find(
        (e) => e.groupName === entityname
      );
      if (appname && modulename && entityname) {
        let { appName, moduleName, groupName } = activeEntity;
        if (
          isPublicUser &&
          !(
            appname === appName &&
            modulename === moduleName &&
            entityname === groupName
          )
        ) {
          history.replace(`${BASE_URL}${appName}/${moduleName}/${groupName}/`);
        } else {
          let params = { ...getFilters(entityname), ...queryParams };
          if (mode && id)
            history.replace(
              `${BASE_URL}${appname}/${modulename}/${entityname}/${mode}/${id}?${queryToUrl(
                params
              )}`
            );
          else if (mode?.toLowerCase() == "new" && !id) {
            history.replace(
              `${BASE_URL}${appname}/${modulename}/${entityname}/${mode}?${queryToUrl(
                params
              )}`
            );
          } else
            history.replace(
              `${BASE_URL}${appname}/${modulename}/${entityname}?${queryToUrl(
                params
              )}`
            );
        }
      } else {
        let appName = activeEntity.appName,
          moduleName = activeEntity.moduleName,
          entityName = activeEntity.groupName;
        let params = { ...getFilters(entityname) };
        history.replace(
          `${BASE_URL}${appName}/${moduleName}/${entityName}?${queryToUrl(
            params
          )}`
        );
      }
      if (entityTemplate && Object.keys(entityTemplate).length) {
        let { templates } = entityTemplate;
        let baseTemplate = templates.filter((e) => e.baseTemplate);
        if (baseTemplate && Object.keys(baseTemplate).length) {
          let isShowSummaryMap = get(
            baseTemplate[0].template,
            "sys_entityAttributes.sys_summaryGeoMap",
            undefined
          );

          if (!previousEntity)
            dispatch({
              type: "SET_PREVIOUS_ENTITY",
              payload: entityname,
            });
          else if (previousEntity !== entityname) {
            dispatch({
              type: "SET_SUMMARY_MAP_POSITION",
              payload: null,
            });
            dispatch({
              type: "SET_PREVIOUS_ENTITY",
              payload: entityname,
            });
          } else {
          }

          if (previousEntity === entityname) {
          } else if (isShowSummaryMap)
            dispatch({
              type: "SET_SUMMARY_FULLSCREEN",
              payload: false,
            });
          else
            dispatch({
              type: "SET_SUMMARY_FULLSCREEN",
              payload: true,
            });
        }
      }
    } catch (e) {
      setError(true);
    }
  };

  const onEdit = (mode) => {
    history.push(`/app/summary/${appname}/${modulename}/${entityname}/new`);
  };

  const redirectToDashboard = () => {
    const path = checkGlobalFeatureAccess("Insights")
      ? "/app/dashboard"
      : "/app/profile_page";
    history.push(path);
  };

  const saveCallback = (response, quickFlow = false, mode) => {
    try {
      setReload(true);
      if (!quickFlow) {
        if (queryParams?.isCalendar) history.push("/app/calendar");
        else
          history.push(
            `${BASE_URL}${appname}/${modulename}/${entityname}?${queryToUrl(
              queryParams
            )}`
          );
      } else if (["NEW", "CLONE"]?.includes(mode)) {
        if (queryParams?.isCalendar) history.push("/app/calendar");
        else
          history.push(
            `${BASE_URL}${appname}/${modulename}/${entityname}/edit/${
              response?.id
            }?${queryToUrl(queryParams)}`
          );
      }
      setReload(false);
    } catch (e) {
      setError(true);
    }
  };

  //Effects
  useEffect(() => {
    if (
      activeEntity &&
      Object.keys(activeEntity).length &&
      activeModuleMapLayers?.length
    )
      initRoute();
  }, [
    activeEntity,
    appname,
    modulename,
    entityname,
    isDrawerOpen,
    activeModuleMapLayers,
  ]);

  useEffect(() => {
    if (activeModule && Object.keys(activeModule).length) {
      setActiveModuleEntities(activeModule, activeEntity);
      setLoading(false);
    }
  }, [activeModule]);
  if (error) {
    if (checkReadAccess({ appname, modulename, entityname }))
      return (
        <>
          <div
            style={{
              display: "flex",
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              height: "85vh",
            }}
          >
            <ErrorFallback slug={"no_data_found"} />
          </div>
          {redirectToDashboard()}
        </>
      );
    else {
      history.push("/error/permission_denied");
      return null;
    }
  } else
    return (
      <>
        {!mode ? (
          <DisplayGrid
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              height: "100%",
              width: "100%",
            }}
          >
            {!fullScreenSize && (
              <div
                style={{
                  display: "flex",
                  flex: 1,
                }}
              >
                {loading ? (
                  <SummaryMapSkeleton />
                ) : (
                  <>
                    {activeModuleEntities?.length &&
                    activeModuleMapLayers?.length ? (
                      <StatefulSummaryWrapper
                        presetTemplates={activeModuleMapLayers}
                        filters={{ ...restParams }}
                      />
                    ) : (
                      <SummaryMapSkeleton />
                    )}
                  </>
                )}
              </div>
            )}
            <div
              style={{
                display: "flex",
                flex: 1,
              }}
            >
              <SummaryContainer
                editActionCallBack={onEdit}
                appname={appname}
                modulename={modulename}
                entityname={entityname}
                height={!fullScreenSize ? "30vh" : "calc(100vh - 198px)"}
                // summaryMap={true}
                appliedFilter={activeFilter}
                screenType="SUMMARY"
              />
            </div>
          </DisplayGrid>
        ) : (
          <div
            style={{
              display: "flex",
              // padding: "1%",
              flex: 9,
              width: "100%",
              height: "100%",
            }}
          >
            <DetailContainer
              appname={appname}
              modulename={modulename}
              groupname={entityname}
              id={id}
              mode={mode}
              saveCallback={saveCallback}
              onClose={onClose}
              onModeChange={onModeChange}
              summaryMode={true}
              setReload={(val) => setReload(val)}
            />
          </div>
        )}
      </>
    );
};
