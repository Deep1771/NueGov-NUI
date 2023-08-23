import React, { createContext, useEffect, useState } from "react";
//Custom Library
import { Fade } from "@material-ui/core";
import queryString from "query-string";
//Library Hooks
import { useParams } from "react-router";
import { useHistory, useLocation } from "react-router-dom";
import { useStateValue } from "utils/store/contexts";
//Factory
import {
  UserFactory,
  FiltersFactory,
  GlobalFactory,
} from "utils/services/factory_services";
import { SystemIcons } from "utils/icons";
//Custom Components
import { ContainerWrapper } from "components/wrapper_components/container";
import { DisplayButton, DisplayGrid } from "components/display_components";
import { DetailContainer } from "containers/composite_containers/detail_container";
import SummaryContainer from "./admin_table";

export const ControlPaneContext = createContext();

//Global Constants
const APP_NAME = "NueGov";
const BASE_URL = `/app/admin_panel`;
const MODULE_NAME = "Admin";

const ControlPanel = () => {
  //Library Hooks
  const { entityname, id, mode } = useParams();
  const queryParams = queryString.parse(useLocation().search);
  const history = useHistory();
  // const [{}, dispatch] = useStateValue();
  //Factory
  const {
    getAgencyId,
    getAppStructure,
    getPermissions,
    getEntityFriendlyName,
    isNJAdmin,
    isSuperAdmin,
    checkWriteAccess,
    checkDataAccess,
  } = UserFactory();

  const { getBusinessType } = GlobalFactory();
  const { getDefault, getFilterParams } = FiltersFactory();
  //Local Variables
  const appObject = { appname: APP_NAME, modulename: MODULE_NAME, entityname };
  const canWrite = checkWriteAccess(appObject);
  const apps = isNJAdmin() ? getAppStructure : getPermissions.apps;
  const { modules } = apps.find((ea) => ea.name == APP_NAME);
  const { entities } = modules.find((em) => em.name == MODULE_NAME);
  const { page, globalsearch, ...restParams } = queryParams;
  const { sortby, orderby, sys_agencyId, ...filterParam } = restParams;
  //Local State
  const BUSINESSTYPE = getBusinessType();
  const [activeFilter, setActiveFilter] = useState({});
  const [currentEntity, setEntity] = useState({});
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(true);
  const [template, setTemplate] = useState(null);
  const [canWriteFlag, setCanWriteFlag] = useState(true);

  //Declarative methods
  const handleClose = () =>
    history.push(
      `${BASE_URL}/${currentEntity.groupName}?${queryToUrl(queryParams)}`
    );
  const handleModeChange = (mode) =>
    history.push(
      `${BASE_URL}/${currentEntity.groupName}/${mode.toLowerCase()}/${id}`
    );
  const onCardClick = (data, mode) =>
    history.push(
      `${BASE_URL}/${currentEntity.groupName}/${mode}/${data._id}?${queryToUrl(
        queryParams
      )}`
    );
  const queryToUrl = (params) =>
    Object.keys(params ? params : {})
      .map((key) => `${key}=${params[key]}`)
      .join("&");

  //Custom Functions
  const init = () => {
    if (!entityname) {
      let entity = entities[0];
      let params = getFilters(entity.groupName);
      history.replace(`${BASE_URL}/${entity.groupName}?${queryToUrl(params)}`);
    }
  };

  const handleEntitySelect = (entityInfo) => {
    if (entityInfo.groupName != currentEntity.groupName) {
      setTemplate(null);
      setEntity(entityInfo);
      let params = getFilters(entityInfo.groupName);
      history.push(`${BASE_URL}/${entityInfo.groupName}?${queryToUrl(params)}`);
      // dispatch({ type : 'RESET_ENTITY_FILTERS' })
    }
  };

  const getFilters = (entityName) => {
    let defaultObj = getDefault(entityName);
    if (defaultObj) {
      setActiveFilter(defaultObj);
      return getFilterParams(defaultObj);
    } else {
      setActiveFilter({});
      return {};
    }
  };

  const handleSave = () => {
    let path = `${BASE_URL}/${currentEntity.groupName}?${queryToUrl(
      queryParams
    )}`;
    history.push(path);
    currentEntity.groupName == "Agency" && !isNJAdmin() && history.go();
  };

  const onPageChange = (e, page) => {
    const params = { ...queryParams };
    params.page = page;
    if (page)
      history.push(
        `${BASE_URL}/${currentEntity.groupName}?${queryToUrl(params)}`
      );
  };

  //Effects
  useEffect(() => {
    init();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isSuperAdmin && entityname === "Role" && BUSINESSTYPE === "NUEASSIST")
      setCanWriteFlag(false);
    else setCanWriteFlag(true);
    if (mounted && entityname) {
      let entityInfo = entities.find((ee) => ee.groupName == entityname);
      if (entityInfo) setEntity(entityInfo);
      setLoading(false);
    } else init();
  }, [entityname]);

  return (
    <ContainerWrapper>
      <Fade in={true} timeout={1500}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignSelf: "center",
            height: "100%",
            backgroundColor: "#fbfbfb",
            width: "98%",
            padding: "0% 1% 0% 1%",
          }}
        >
          <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
            {!mode && (
              <div
                style={{ flexShrink: 1, display: "flex", padding: "5px 0px" }}
              >
                <DisplayGrid container alignItems="center">
                  <DisplayGrid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <div
                      style={{ whiteSpace: "nowrap", overflowX: "auto" }}
                      className="hide_scroll"
                    >
                      {entities.map((ee) => (
                        <div
                          style={{ display: "inline-block" }}
                          key={ee.groupName}
                        >
                          <DisplayButton
                            style={{ fontFamily: "inherit", fontSize: "1rem" }}
                            variant={
                              entityname == ee.groupName ? "contained" : "text"
                            }
                            onClick={() => handleEntitySelect(ee)}
                            id={`cp-nav-${ee.groupName}`}
                            testid={`cp-nav-${ee.groupName}`}
                          >
                            {getEntityFriendlyName({
                              appname: APP_NAME,
                              modulename: MODULE_NAME,
                              entityname: ee.groupName,
                            })}
                          </DisplayButton>
                        </div>
                      ))}
                    </div>
                  </DisplayGrid>
                </DisplayGrid>
              </div>
            )}
            <div
              style={{
                display: "flex",
                flex: 11,
                padding: "5px 0px",
                width: "100%",
                height: "100%",
              }}
            >
              {!loading && (
                <>
                  <ControlPaneContext.Provider
                    value={{
                      avatar: ["Agency", "User"].includes(
                        currentEntity.groupName
                      ),
                      loginButton:
                        ["User"].includes(currentEntity.groupName) &&
                        isNJAdmin(),
                      isNJAdmin: isNJAdmin(),
                      checkDataAccess,
                      getAgencyId,
                      onCardClick,
                      onPageChange,
                      canWrite,
                    }}
                  >
                    {!mode ? (
                      <SummaryContainer
                        editActionCallBack={null}
                        appname={APP_NAME}
                        modulename={MODULE_NAME}
                        entityname={currentEntity.groupName}
                        height={"65vh"}
                        appliedFilter={activeFilter}
                      />
                    ) : (
                      <DetailContainer
                        appname={APP_NAME}
                        modulename={MODULE_NAME}
                        groupname={currentEntity.groupName}
                        id={id}
                        mode={mode}
                        saveCallback={handleSave}
                        onClose={handleClose}
                        onModeChange={handleModeChange}
                      />
                    )}
                  </ControlPaneContext.Provider>
                </>
              )}
            </div>
          </div>
        </div>
      </Fade>
    </ContainerWrapper>
  );
};

export default ControlPanel;
