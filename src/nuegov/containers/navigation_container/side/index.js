import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useParams } from "react-router";
import { makeStyles } from "@material-ui/core/styles";
import Collapse from "@material-ui/core/Collapse";
import _ from "lodash";
import { List, ListItem, ListItemIcon, Slide, Fade } from "@material-ui/core";
import ArrowLeftOutlinedIcon from "@material-ui/icons/ArrowLeftOutlined";
import { SystemIcons } from "utils/icons";
import { ToolTipWrapper } from "components/wrapper_components";
import {
  DisplayAvatar,
  DisplayDivider,
  DisplayDrawer,
  DisplayIcon,
  DisplayIconButton,
  DisplaySearchBar,
  DisplayText,
} from "components/display_components";
import {
  AuthFactory,
  FiltersFactory,
  GlobalFactory,
  ModuleFactory,
  ThemeFactory,
  UserFactory,
} from "utils/services/factory_services";
import { useStateValue } from "utils/store/contexts";
import {
  getAvatarText,
  getEntityIcon,
} from "utils/services/helper_services/system_methods";
import { entity } from "utils/services/api_services/entity_service";
import { USER_DEFAULT_QUERY } from "containers/user_containers/personalization/service";
import { moduleMetadata } from "utils/services/api_services/template_service";
import { isDefined } from "utils/services/helper_services/object_methods";
import { SideNavSkeleton } from "components/skeleton_components/index";
import { ChevronLeft, ChevronRight } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 240,
    backgroundColor: theme.palette.background.paper,
  },
  nested: {
    paddingLeft: theme.spacing(5.5),
  },
}));

const BASE_URL = `/app/summary/`;

export const SideNav = () => {
  const history = useHistory();
  const { appname, modulename, entityname, mode, id, ...rest } = useParams();
  const [{ configState, moduleState, userState }] = useStateValue();
  const { getDnsConfigs } = AuthFactory();
  const { getDefault, getFilterParams } = FiltersFactory();
  const { toggleDrawer, getUserDefaults, toggleSidebarStatus, handleSidebar } =
    GlobalFactory();
  const { setActiveModule, setAllModules, setActiveEntity } = ModuleFactory();
  const { getVariantForComponent } = ThemeFactory();
  const { getModuleStructure } = UserFactory();
  const { activeModule, allModules, activeModuleEntities } = moduleState;
  const { isDrawerOpen } = configState;
  const [drawer, setDrawer] = useState(true);

  const [footer, setFooter] = useState("");
  const [collapse, setCollapse] = useState(false);
  const [moduleTemplates, setModuleTemplates] = useState([]);
  const [userDefault, setUserDefault] = useState({});
  const [selectedModule, setSelectedModule] = useState({});
  const [selectedEntity, setSelectedEntity] = useState({});
  const [selectedSubModule, setSelectedSubModule] = useState({});
  const [searchableModules, setSearchableModules] = useState([]);
  const classes = useStyles();

  const {
    ExpandMore,
    ExpandLess,
    Search,
    StarBorder,
    StarIcon,
    ArrowBackIos,
    ArrowForwardIos,
  } = SystemIcons;

  const addSubModulesToSearchableModules = (
    modulesMetadata,
    moduleStructure
  ) => {
    if (
      moduleStructure.length &&
      modulesMetadata &&
      Object.keys(modulesMetadata).length
    ) {
      Object.keys(modulesMetadata).map((eachModule) => {
        let index = moduleStructure.findIndex((e) => e.name === eachModule);
        if (index > -1) {
          moduleStructure[index]["subModules"] =
            modulesMetadata[eachModule]["sys_subModules"];
        }
      });
    }
  };

  const fetchModuleTemplates = async (modules) => {
    let meta = await Promise.allSettled(
      modules.map(async (e) => {
        return moduleMetadata.get({ mod: e.name });
      })
    );
    let metaObj = meta.reduce((a, c) => {
      if (c.value && Object.keys(c.value).length) {
        let {
          sys_entityAttributes: { sys_moduleName },
        } = c.value;

        a = { ...a, [sys_moduleName]: c.value.sys_entityAttributes };
        return a;
      } else return a;
    }, {});

    setModuleTemplates(metaObj);
  };

  const getFilters = (entityName) => {
    let defaultObj = getDefault(entityName);
    if (defaultObj) {
      return getFilterParams(defaultObj);
    } else {
      return {};
    }
  };

  const queryToUrl = (params) =>
    Object.keys(params || {})
      .map((key) => key + "=" + params[key])
      .join("&");

  const handleEntitySwitch = (entity) => {
    if (activeModule.name !== selectedModule.name) {
      let moduleName = allModules.find((e) => e.name === selectedModule.name);
      setActiveModule(moduleName);
    }
    setSelectedEntity(entity);
    setActiveEntity(entity);
    let params = getFilters(entity.groupName);
    history.push(
      `${BASE_URL}${entity.appName}/${entity.moduleName}/${
        entity.groupName
      }?${queryToUrl(params)}`
    );
  };

  const debouncedHandleEntitySwitch = _.debounce(handleEntitySwitch, 500);

  const handleModuleSelection = (value, e) => {
    let moduleName = allModules.find((e) => e.name === value.name);
    if (moduleName.name === selectedModule.name) {
      //setSelectedModule(moduleName);
      if (!drawer) {
        // toggleDrawer(true);
        setDrawer(true);
        setCollapse(true);
      } else setCollapse(!collapse);
    } else {
      // if (!drawer) toggleDrawer(true);
      if (!drawer) setDrawer(true);
      setSelectedModule(moduleName);
      setCollapse(true);
    }
  };

  const handleClear = () => {
    setSearchableModules(allModules);
  };

  const handleDefaultClick = (entityobj) => {
    try {
      let moduleName = allModules.find((e) => e.name === selectedModule.name);
      let userData = { ...userDefault };
      userData.sys_entityAttributes.defaultEntity = entityobj;
      userData.sys_entityAttributes.defaultModule = moduleName;
      USER_DEFAULT_QUERY["id"] = userDefault?._id;
      entity.update(USER_DEFAULT_QUERY, userDefault);
      setUserDefault(userData);
    } catch (e) {
      console.error("error while updating userdefault", e);
    }
  };

  const handleSearch = (val) => {
    let tempModules = JSON.parse(JSON.stringify(allModules));
    //let matchedSubModuleEntities = []

    if (isDefined(val)) {
      let filteredModules =
        tempModules.reduce((modules, eachModule) => {
          let matchedEntities = eachModule?.entities?.reduce(
            (entities, eachEntity) => {
              let entityFriendlyName = eachEntity?.friendlyName?.toLowerCase();
              if (entityFriendlyName.includes(val?.toLowerCase()))
                entities.push(eachEntity);
              return entities;
            },
            []
          );
          // if (eachModule?.subModules?.entityList) {
          //   matchedSubModuleEntities = eachModule?.subModules?.entityList.reduce(
          //     (entities, eachEntity) => {
          //       let entityFriendlyName = eachEntity?.friendlyName?.toLowerCase();
          //       if (entityFriendlyName.includes(val?.toLowerCase()))
          //         entities.push(eachEntity);
          //       return entities;
          //     }
          //   )
          // }

          if (matchedEntities?.length) {
            let updatedModule = {
              ...eachModule,
              entities: matchedEntities,
            };
            modules.push(updatedModule);
          }
          return modules;
        }, []) || [];

      setSearchableModules(filteredModules);
    } else setSearchableModules(allModules);
  };

  const findSelectedSubModules = (modulename) => {
    if (modulename?.subModules) {
      for (let i of modulename?.subModules) {
        for (let k of i?.entityList) {
          if (k.groupName == entityname) {
            setSelectedSubModule({ name: k?.subModuleName });
          }
        }
      }
    }
  };

  const setActives = (entityname, modulename) => {
    setActiveModule(modulename);
    setActiveEntity(entityname);
    setSelectedModule(modulename);
    findSelectedSubModules(modulename);
    setSelectedEntity(entityname);
    setCollapse(true);
  };

  const handleSubmoduleSelection = (value) => {
    if (JSON.stringify(value) === JSON.stringify(selectedSubModule))
      setSelectedSubModule({});
    else setSelectedSubModule(value);
  };
  const renderSubModules = (item) => {
    let { name, friendlyName, icon } = item;
    //let icon = false;
    return (
      <Fade in={true} timeout={700}>
        <ListItem
          disableGutters={true}
          key={name}
          testid={`sidebar-submodule-${name}`}
          onClick={() => handleSubmoduleSelection(item)}
          // selected={name == selectedSubModule?.name}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            // marginLeft: "25px",
            height: "48px",
            width: "auto",
            margin: "0.2rem 0.5rem",
            borderRadius: "0.5rem",
            paddingLeft: "1.5rem",
            cursor: "pointer",
            backgroundColor:
              selectedSubModule?.name === item?.name ? "#EEEEEE" : "",
            height: "48px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <ListItemIcon
              style={{
                minWidth: drawer ? "38px" : "",
                marginLeft: "5px",
              }}
            >
              {icon && (
                <img
                  style={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                  }}
                  width="32"
                  height="32"
                  src={icon}
                />
              )}
              {!icon && (
                <DisplayAvatar
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    margin: "0px 5px 0px 0px",
                  }}
                >
                  <DisplayText>{getAvatarText(friendlyName)}</DisplayText>
                </DisplayAvatar>
              )}
            </ListItemIcon>
            <DisplayText
              style={{
                fontWeight: selectedSubModule?.name === item?.name ? 500 : 400,
                color:
                  selectedSubModule?.name === item?.name
                    ? "#212121"
                    : "#666666",
                fontSize: selectedSubModule?.name === item?.name ? 12 : 12,
              }}
            >
              {friendlyName}
            </DisplayText>
          </div>
          {collapse && name == selectedSubModule.name ? (
            <ExpandLess
              style={{ marginRight: "6px", transform: "rotate(180deg)" }}
            />
          ) : (
            <ExpandMore
              style={{
                marginRight: "6px",
                transform: "rotate(270deg)",
              }}
            />
          )}
        </ListItem>
      </Fade>
    );
  };
  const renderSubModulesAndEntityList = (item) => {
    if (drawer && item?.name === selectedModule?.name && collapse) {
      let { entities = [], subModules = [] } = item || {};
      let allEntitiesInSumodules = [];
      let entitiesWithoutSubModules = [];
      subModules = subModules
        ?.map((item) => {
          let filteredEntityList = item?.entityList?.filter((eachEntity) => {
            let entityInfo = entities?.find(
              (eEntity) =>
                eEntity?.appName === eachEntity?.appName &&
                eEntity?.moduleName === eachEntity?.moduleName &&
                eEntity?.groupName === eachEntity?.groupName
            );
            if (entityInfo) return true;
            else return false;
          });
          if (filteredEntityList?.length) {
            allEntitiesInSumodules.push(...filteredEntityList);
            return {
              ...item,
              entityList: filteredEntityList,
            };
          }
        })
        ?.filter((e) => e);
      if (subModules?.length) {
        entitiesWithoutSubModules = entities?.filter((entity) => {
          return !allEntitiesInSumodules.some((subModuleEntity) => {
            return (
              subModuleEntity?.groupName?.toLowerCase() ===
              entity?.groupName?.toLowerCase()
            );
          });
        });
      }

      let isSubModulesExists = subModules?.length;
      if (isSubModulesExists) {
        return (
          <>
            {subModules.map((item) => {
              return [
                renderSubModules(item),
                item.entityList
                  .filter((e) => !e.hideInSidebar)
                  .map((subItem) => (
                    <Collapse
                      style={{ marginBottom: "0.2rem" }}
                      in={
                        subItem.subModuleName === selectedSubModule.name
                          ? true
                          : false
                      }
                      timeout="auto"
                      unmountOnExit
                      key={subItem?.name}
                    >
                      {renderEntities(subItem, true)}
                    </Collapse>
                  )),
              ];
            })}
            {entitiesWithoutSubModules?.map((enitity) => {
              return renderEntities(enitity);
            })}
          </>
        );
      } else {
        return item.entities?.map((subItem) => (
          <Collapse
            style={{ marginBottom: "0.2rem" }}
            in={collapse}
            timeout="auto"
            unmountOnExit
            key={subItem?.name}
          >
            {renderEntities(subItem, true)}
          </Collapse>
        ));
      }
    }
  };
  const init = () => {
    if (appname && modulename && entityname) {
      let currentEntity;
      let currentModule = allModules.find((e) => e.name === modulename);
      if (currentModule?.subModules?.length) {
        let entityList = currentModule.subModules
          .map((e) => e.entityList)
          .flat();
        currentEntity = entityList.find((e) => e.groupName === entityname);
        if (!currentEntity)
          currentEntity = currentModule?.entities?.find(
            (e) => e.groupName === entityname
          );
      } else {
        currentEntity = currentModule?.entities?.find(
          (e) => e.groupName === entityname
        );
      }
      setActives(currentEntity, currentModule);
    } else {
      let {
        sys_entityAttributes: {
          defaultEntity = null,
          defaultModule = null,
        } = {},
      } = userDefault || {};
      if (defaultEntity && defaultModule) {
        //to get updated module
        let currentModule = allModules.find(
          (e) => e.name == defaultModule.name
        );
        //check if entity exists in same module ?? else select 1st entity of module as default
        let currentEntity = currentModule.entities.find(
          (e) => e.name == defaultEntity.name
        );
        if (!currentEntity) currentEntity = currentModule.entities[0];
        setActives(currentEntity, currentModule);
      } else if (
        allModules
          .map((e) => e.entities)
          .flat()
          .some((e) => e?.default == true)
      ) {
        let defaultEntity = allModules
          .map((e) => {
            if (e.subModules?.length) {
              return e.subModules
                .map((f) => [...e.entities, ...f.entityList])
                .flat();
            } else return e.entities;
          })
          .flat()
          .find((e) => e?.default == true);
        let defaultModule = allModules.find(
          (e) => e?.name == defaultEntity?.moduleName
        );
        setActives(defaultEntity, defaultModule);
      } else {
        let module = allModules[0];
        if (module.subModules?.length) {
          let submoduleEntities = allModules[0].subModules.reduce(
            (entityList, submodule) => {
              entityList = [
                ...entityList,
                ...submodule.entityList.map((e) => e.groupName),
              ];
              return entityList;
            },
            []
          );
          let permEntities = allModules[0].entities.map((e) => e.groupName);
          let filteredEntites = submoduleEntities.filter((e) =>
            permEntities.includes(e)
          );
          let activeEntity = allModules[0].entities.find(
            (e) => e.groupName == filteredEntites[0]
          );
          setActives(activeEntity, allModules[0]);
        } else setActives(allModules[0].entities[0], allModules[0]);
      }
    }
  };

  const compareObjects = (obj1, obj2) => {
    return (
      obj1?.appName === obj2?.appName &&
      obj1?.moduleName === obj2?.moduleName &&
      obj1?.groupName === obj2?.groupName
    );
  };

  const renderEntities = (item) => {
    // console.log(472, item)
    let { name, friendlyName, groupName } = item;
    let icon = getEntityIcon(groupName);
    let { sys_entityAttributes: { defaultEntity = {} } = {} } =
      userDefault || {};
    return (
      <>
        <ListItem
          disableGutters={true}
          key={name}
          button
          testid={`sidebar-entity-${name}`}
          className={classes.nested}
          // selected={compareObjects(selectedEntity,item)}
          onClick={() => debouncedHandleEntitySwitch(item)}
          style={{
            width: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderRadius: "0.5rem",
            // border:"1px solid #ebebeb",
            paddingRight: "0.25rem",
            margin: "0rem 0.5rem",
            minHeight: "40px",
            maxHeight: "fit-content",
            wordBreak: "break-word",
            // backgroundColor:
            // selectedEntity?.name === item?.name ? "#64B5F6" : "",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <ListItemIcon style={{ minWidth: "40px" }}>
              {icon && (
                <img
                  style={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                  }}
                  width="28"
                  height="28"
                  src={icon}
                />
              )}
              {!icon && (
                <DisplayAvatar
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    margin: "0px 5px 0px 0px",
                  }}
                >
                  <DisplayText>{getAvatarText(friendlyName)}</DisplayText>
                </DisplayAvatar>
              )}
            </ListItemIcon>
            <DisplayText
              style={{
                fontWeight: compareObjects(selectedEntity, item) ? 600 : 300,
                color: compareObjects(selectedEntity, item) ? "#1565C0" : "",
                fontSize: 12,
              }}
            >
              {friendlyName}
            </DisplayText>
            &emsp;
          </div>
          <div>
            <DisplayIconButton
              onClick={(e) => handleDefaultClick(item)}
              systemVariant="primary"
            >
              <ToolTipWrapper title="Set as default">
                {item.name == defaultEntity?.name ? (
                  <StarIcon fontSize="small" />
                ) : (
                  <StarBorder fontSize="small" />
                )}
              </ToolTipWrapper>
            </DisplayIconButton>
          </div>
        </ListItem>
      </>
    );
  };

  const renderFooter = () => {
    return <DisplayText variant="caption"> &copy;{footer} </DisplayText>;
  };

  const returnModules = (item) => {
    let { name, friendlyName } = item;
    let icon = moduleTemplates[name]?.moduleIcon;
    return (
      <Fade in={true} timeout={700}>
        <ListItem
          disableGutters={true}
          key={name}
          button
          testid={`sidebar-module-${name}`}
          onClick={(e) => handleModuleSelection(item, e)}
          // selected={name == activeModule?.name}
          style={{
            display: "flex",
            width: "auto",
            justifyContent: "space-between",
            alignItems: "center",
            margin: drawer ? "0.2rem 0.5rem" : !mode ? "0.2rem 0rem" : "0px",
            borderRadius: "0.5rem",
            // border:"1px solid #ebebeb",
            paddingLeft: "0.5rem",
            // borderLeft:
            //   activeModule?.name === item?.name
            //     ? `5px solid ${
            //         getVariantForComponent("", "primary").colors.dark.bgColor
            //       }`
            //     : "",
            backgroundColor: activeModule?.name === item?.name ? "#BBDEFB" : "",
            height: "48px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <ListItemIcon style={{ minWidth: drawer ? "38px" : "" }}>
              {icon && (
                <img
                  style={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                  }}
                  width="32"
                  height="32"
                  src={icon}
                />
              )}
              {!icon && (
                <DisplayAvatar
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    margin: "0px 5px 0px 0px",
                  }}
                >
                  <DisplayText>{getAvatarText(friendlyName)}</DisplayText>
                </DisplayAvatar>
              )}
            </ListItemIcon>
            <DisplayText
              style={{
                fontWeight: activeModule?.name === item?.name ? 600 : 400,
                color: activeModule?.name === item?.name ? "#212121" : "",
                fontSize: activeModule?.name === item?.name ? 13 : 13,
              }}
            >
              {friendlyName}
            </DisplayText>
          </div>
          {collapse && name == selectedModule.name ? (
            <ExpandLess
              style={{
                marginRight: "8px",
                transform: "rotate(180deg)",
              }}
            />
          ) : (
            <ExpandMore
              style={{
                marginRight: "8px",
                transform: "rotate(270deg)",
              }}
            />
          )}
        </ListItem>
      </Fade>
    );
  };

  const renderModules = (item) => {
    let { friendlyName } = item;
    return !drawer ? (
      <>
        <ToolTipWrapper title={friendlyName}>
          {returnModules(item)}
        </ToolTipWrapper>
      </>
    ) : (
      <>{returnModules(item)}</>
    );
  };

  useEffect(() => {
    getUserDefaults().then((result) => {
      setUserDefault(result);
    });
    (async () => {
      let response = await getDnsConfigs();
      const date = new Date();
      response =
        response?.appFooter ||
        `${date.getFullYear()} Navjoy all rights reserved`;
      setFooter(response);
    })();
  }, []);

  useEffect(() => {
    let allModules = getModuleStructure();
    // .filter((e) => e.name != "Admin");
    setSearchableModules(allModules);
    setAllModules(allModules);
    fetchModuleTemplates(allModules);
  }, [userState.userData.appStructure]);

  useEffect(() => {
    if (moduleTemplates) {
      addSubModulesToSearchableModules(moduleTemplates, searchableModules);
    }
  }, [moduleTemplates]);
  useEffect(() => {
    if (allModules?.length && userDefault?._id) {
      init();
    }
  }, [userDefault?._id, allModules]);

  useEffect(() => {
    if (allModules) {
      setSearchableModules(allModules);
    }
  }, [allModules, drawer]);

  const sidebarParentElement = document.getElementById("sidebarParent");
  if (sidebarParentElement)
    sidebarParentElement.style.width =
      drawer && !mode ? "240px" : !mode ? "60px" : "0px";

  return (
    <div
      style={{
        display: "flex",
        flexShrink: 1,
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: drawer && !mode ? "240px" : !mode ? "60px" : "0px",
        }}
        id="sidebar"
      >
        <DisplayDrawer
          variant="permanent"
          anchor={"left"}
          open={drawer}
          PaperProps={{ style: { overflow: "hidden" }, elevation: 4 }}
          style={{
            // width: drawer ? "240px" : !mode ? "60px" : "0px",
            marginTop: "0px",
            position: "relative",
            height: "inherit",
            // overflowY: "hidden",
          }}
        >
          {!activeModuleEntities?.length ? (
            <>
              <SideNavSkeleton />
            </>
          ) : (
            <>
              {drawer && allModules ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    paddingRight: "0.5rem",
                  }}
                >
                  <DisplaySearchBar
                    testid={"sidenav-searchbar"}
                    placeholder="Search"
                    onChange={handleSearch}
                    onClick={handleSearch}
                    onClear={handleClear}
                    style={{ width: "170px" }}
                  />
                  <DisplayIconButton
                    systemVariant="primary"
                    style={{ margin: "auto" }}
                    onClick={(e) => {
                      // toggleDrawer(false);
                      setDrawer(false);
                      // toggleSidebarStatus(false);
                      const globalComponent =
                        document.getElementById("globalComponent");
                      globalComponent.style.width = "80%";
                      handleSidebar("60px");
                    }}
                  >
                    <ChevronLeft />
                  </DisplayIconButton>
                </div>
              ) : (
                <div style={{ display: "flex", height: "53.625px" }}>
                  <DisplayIconButton
                    systemVariant="primary"
                    style={{ margin: "auto" }}
                    onClick={() => {
                      // toggleDrawer(true);
                      setDrawer(true);
                      // toggleSidebarStatus(true);
                      const globalComponent =
                        document.getElementById("globalComponent");
                      globalComponent.style.width = "100%";
                      handleSidebar("240px");
                    }}
                  >
                    <ChevronRight />
                  </DisplayIconButton>
                </div>
              )}
              {drawer && <DisplayDivider style={{ marginBottom: "0.25rem" }} />}

              <div
                style={{
                  display: "flex",
                  flex: 1,
                  height: "100%",
                  overflowY: "scroll",
                  overflowX: "hidden",
                  flexDirection: "column",
                  // backgroundColor: "rgb(1, 87, 155)",
                }}
                className="hideScroll"
              >
                <div style={{ display: "flex", flex: 1 }}>
                  <List
                    component="div"
                    className={classes.root}
                    style={{ paddingTop: "0px" }}
                  >
                    {searchableModules?.length > 0 &&
                      searchableModules.map((item) => (
                        <React.Fragment key={item?.name}>
                          {renderModules(item)}
                          {renderSubModulesAndEntityList(item)}
                        </React.Fragment>
                      ))}
                  </List>
                </div>
              </div>
              {drawer && footer && (
                <div
                  style={{
                    height: "36px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    borderTop: "1px solid #ebebeb",
                  }}
                >
                  {renderFooter()}
                </div>
              )}
            </>
          )}
        </DisplayDrawer>
      </div>
    </div>
  );
};
