import React, { useEffect, useMemo, useState } from "react";
//Custom Hooks
import { imMutate, usePermissionState } from "../permission_reducer";
//Services
import { get } from "utils/services/helper_services/object_methods";
import { getEntityInfo, isAllEntitiesSelected } from "../permission_services";
import { GlobalFactory } from "utils/services/factory_services";
//Icons
import { SystemIcons } from "utils/icons";
//Custom Components
import {
  DisplayCard,
  DisplayGrid,
  DisplayText,
  DisplayTabs,
  DisplayIconButton,
  DisplaySearchBar,
  DisplaySwitch,
} from "../../../display_components";
import { DetailPanel } from "../detail_panel/";
import { ContextMenuWrapper } from "components/wrapper_components";
import { ErrorFallback } from "components/helper_components";
import { ContextSummary } from "containers/composite_containers/summary_container/components/context_summary";
import { TemplateSelector } from "./template_selector";
import { removeModificationAccess } from "../helper";

const EntityPanel = (props) => {
  const {
    appsArray,
    formData,
    currentApp,
    allowSelection,
    panelDisabled,
    subAgencyAccess,
    stateParams,
    allowDefault,
    publicEntityCount = 4,
  } = props;
  //Custom Hooks
  const [{ permissionTree }, dispatch] = usePermissionState();

  //Services
  const { setSnackBar } = GlobalFactory() || {};

  //Icons
  const { Add, Clear, Search, StarIcon, StarBorder } = SystemIcons;
  //Local State
  const [showSummaryContext, setShowSummaryContext] = useState(false);
  const [showDetailContext, setShowDetailContext] = useState(false);
  const [showRBELContext, setShowRBELContext] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState({});
  const [moduleTree, setModuleTree] = useState([]);
  const currentEntity = stateParams.groupname.toUpperCase();
  const [selectedModule, setSelectedModule] = useState();
  const [searchValue, setSearchValue] = useState(null);
  const [defaultEntityInfo, setDefaultEntityInfo] = useState({});
  const { isPublicRole = "" } = formData?.sys_entityAttributes || {};
  const publicRole = isPublicRole === "Yes" ? true : false;
  const mode = stateParams?.mode?.toLowerCase() || "";
  const [previousApps, setPreviousApps] = useState([]);
  const [entityCount, setEntityCount] = useState(
    publicRole ? publicEntityCount : 0
  );
  const entitySelectionDescription =
    isPublicRole?.length > 0 ? (
      <>
        For public roles you can select up to {publicEntityCount} entities. Rest
        of the roles can have more than {publicEntityCount} entities.
      </>
    ) : (
      <></>
    );

  //CUstom methods
  const constructEntityData = (defaultEntity) => {
    let entityData = {};
    let appConfig = permissionTree.apps.find(
      (app) => app.name === defaultEntity.appName
    );

    if (appConfig) {
      entityData = {
        appInfo: {
          name: appConfig.name,
          friendlyName: appConfig.friendlyName,
        },
      };
      let moduleConfig = appConfig.modules.find(
        (mod) => mod.name === defaultEntity.moduleName
      );
      if (moduleConfig) {
        entityData = {
          ...entityData,
          ...{
            moduleInfo: {
              name: moduleConfig.name,
              friendlyName: moduleConfig.friendlyName,
            },
          },
        };
        let entityConfig = moduleConfig.entities.find(
          (entity) => entity.name === defaultEntity.entityName
        );
        if (entityConfig) {
          entityData = {
            ...entityData,
            ...{
              entityInfo: {
                name: entityConfig.name,
                ...entityConfig,
              },
            },
          };
        }
      }
    }
    return entityData;
  };
  const handleChange = (module) => {
    let moduleInfo = moduleTree.find((m) => m.name === module);
    setSelectedModule(moduleInfo);
  };

  const handleDefaultSelection = (event, entityData) => {
    let entityDataClone = { ...entityData };
    let selectedEntityInfo = {
      appName: entityDataClone.appInfo.name,
      entityName: entityDataClone.entityInfo.name,
      moduleName: entityDataClone.moduleInfo.name,
    };

    if (
      JSON.stringify(defaultEntityInfo) == JSON.stringify(selectedEntityInfo)
    ) {
      entityDataClone.entityInfo.default = false;
      dispatch({
        type: "ENTITY_SELECT",
        payload: imMutate(entityDataClone),
      });
      setDefaultEntityInfo({});
    } else {
      let currentDefaultEntity = constructEntityData(defaultEntityInfo);
      if (Object.keys(currentDefaultEntity).length) {
        currentDefaultEntity.entityInfo.default = false;
        dispatch({
          type: "ENTITY_SELECT",
          payload: imMutate(currentDefaultEntity),
        });
      }
      entityDataClone.entityInfo.default = true;
      dispatch({
        type: "ENTITY_SELECT",
        payload: imMutate(entityDataClone),
      });
      setDefaultEntityInfo({
        appName: entityDataClone.appInfo.name,
        entityName: entityDataClone.entityInfo.name,
        moduleName: entityDataClone.moduleInfo.name,
      });
    }
    event.stopPropagation();
  };

  const handleEntitySelect = (entityData) => {
    let tree;
    let { appInfo, moduleInfo, entityInfo } = entityData;
    let selectedApp = appsArray.find((a) => a.name == appInfo.name);
    if (allowSelection && !get(entityInfo, "access.roleBasedLayout"))
      tree = getEntityInfo(
        { apps: [selectedApp] },
        appInfo.name,
        moduleInfo.name,
        entityInfo.groupName
      );
    else tree = entityInfo.name;

    if (tree) {
      setSelectedEntity({ ...entityData, tree: imMutate(tree) });
      setShowDetailContext(true);
    }
  };

  const onMetadataSelect = ({ data }) => {
    setShowSummaryContext(false);
    setShowRBELContext(false);

    if (data.length) {
      let metadata = data[0];
      const entitydata = {
        ...selectedEntity,
        entityInfo: {
          ...selectedEntity.entityInfo,
          name: metadata.sys_entityAttributes.sys_templateName,
          friendlyName: metadata.sys_entityAttributes.sys_friendlyName,
        },
      };

      if (allowSelection) {
        //RBEL
        delete entitydata.entityInfo.topSectionArray;
        delete entitydata.entityInfo.componentArray;
        delete entitydata.entityInfo.access.write;
        delete entitydata.entityInfo.access.delete;
      }

      dispatch({
        type: "ENTITY_SELECT",
        payload: imMutate(entitydata),
      });
    }
  };

  const saveHandler = (entityInfo, entityTree) => {
    setShowDetailContext(false);
    dispatch({
      type: "ENTITY_DETAIL_SAVE",
      payload: {
        appName: entityInfo.appInfo.name,
        moduleName: entityInfo.moduleInfo.name,
        entityTree: { ...entityTree },
      },
    });
  };

  const selectTemplate = (entityData) => {
    if (allowSelection && get(entityData, "entityInfo.access.roleBasedLayout"))
      setShowRBELContext(true);
    else setShowSummaryContext(true);
    setSelectedEntity({ ...entityData });
  };

  const setEntity = (entityData) => {
    let { appInfo, moduleInfo, entityInfo } = entityData;
    let entity_Info = entityInfo;
    setSelectedEntity({ ...entityData });
    if (!entityInfo.name) setShowSummaryContext(true);
    if (publicRole) {
      setEntityCount((prev) => prev - 1);
      let { topSectionArray, access, featureAccess } = removeModificationAccess(
        { entity: entityInfo, mode, previousApps }
      );
      entity_Info = {
        ...entity_Info,
        access,
        featureAccess,
        topSectionArray,
      };
    }
    dispatch({
      type: "ENTITY_SELECT",
      payload: {
        appInfo,
        moduleInfo,
        entityInfo: entity_Info,
      },
    });
  };

  const getEntityCount = () => {
    let { apps = [] } = permissionTree || {};
    let entitiesCount = 0;
    apps.forEach(({ name = "", modules = [] }) => {
      if (name === "NueGov")
        modules.forEach(
          ({ entities = [] }) =>
            (entitiesCount = entitiesCount + (entities?.length || 0))
        );
    });
    setEntityCount((prev) => prev - entitiesCount);
  };

  const getModuleTree = () => {
    if (appsArray && appsArray.length) {
      let flatenedArray = appsArray.reduce((accumulator, currentValue) => {
        currentValue.modules = currentValue.modules.filter(
          (em) =>
            em.isNotAccessible !== true && em.entities && em.entities.length
        );
        currentValue.modules.map((em) => {
          accumulator.push({
            ...em,
            appInfo: {
              friendlyName: currentValue.friendlyName,
              name: currentValue.name,
            },
          });
        });
        return accumulator;
      }, []);
      let sortedArray = flatenedArray.sort((x, y) => {
        let a = x.name.toUpperCase(),
          b = y.name.toUpperCase();
        return a == b ? 0 : a > b ? 1 : -1;
      });
      return sortedArray;
    }
  };
  const getDefaultEntityInfo = () => {
    let defaultEntity = [];
    if (permissionTree) {
      permissionTree.apps.map((app) => {
        if (app.name !== "Features") {
          if (app.modules && app.modules.length) {
            let defaultExists = false;
            app.modules.map((mod) => {
              if (!defaultExists) {
                defaultEntity = mod.entities.filter((entity) => entity.default);
                if (defaultEntity.length) {
                  defaultEntity[0] = {
                    appName: app.name,
                    entityName: defaultEntity[0].name,
                    moduleName: mod.name,
                  };
                  defaultExists = true;
                }
              }
            });
          }
        }
      });
      return defaultEntity;
    }
  };
  const initModuleTree = () => {
    if (appsArray && appsArray.length) {
      let flatenedArray = getModuleTree();
      let defaultEntity = getDefaultEntityInfo();
      setModuleTree(flatenedArray);
      setSelectedModule(flatenedArray[0]);
      if (defaultEntity && defaultEntity.length)
        setDefaultEntityInfo(defaultEntity[0]);
    }
  };
  //Effects
  useEffect(() => {
    initModuleTree();
    if (publicRole) {
      getEntityCount();
    }
  }, []);

  useEffect(() => {
    if (searchValue) {
      let searchArr = getModuleTree().filter((i) => {
        if (!searchValue) return null;
        else {
          let regex = new RegExp(searchValue.toLowerCase());
          let { entities } = i;
          let filteredEntities = entities.filter((e) =>
            regex.test(e.friendlyName?.toLowerCase())
          );
          if (regex.test(i.name.toLowerCase())) return i;
          if (filteredEntities.length) {
            i.entities = filteredEntities;
            return i;
          }
        }
      });
      setModuleTree(searchArr);
      if (searchArr.length) setSelectedModule(searchArr[0]);
      else setSelectedModule({ entities: [] });
    } else initModuleTree();
  }, [searchValue]);

  useEffect(() => {
    if (selectedEntity.appInfo) {
      let { appInfo, moduleInfo, entityInfo } = selectedEntity;
      let entity = getEntityInfo(
        permissionTree,
        appInfo.name,
        moduleInfo.name,
        entityInfo.groupName
      );
      entity &&
        entity.shared &&
        (entity.shared =
          subAgencyAccess || currentEntity == "ROLE" ? entity.shared : {});
      if (entity) {
        if (publicRole) {
          dispatch({
            type: "SET_ENTITY_ACCESS",
            payload: {
              ...entity.access,
              disableCreateOption: true,
            },
          });
          let { topSectionArray, access, featureAccess } =
            removeModificationAccess({ entity, mode, previousApps });
          entity = {
            ...entity,
            access,
            featureAccess,
            topSectionArray,
          };
        }
        entity = imMutate(entity);
        dispatch({
          type: "SET_ENTITY_TREE",
          payload: {
            ...entity,
            topSectionArray: entity.topSectionArray
              ? [...entity.topSectionArray]
              : [],
            componentArray: entity.componentArray
              ? [...entity.componentArray]
              : [],
          },
        });
      }
    } else {
      if (mode !== "new" && isPublicRole) {
        let apps = JSON.parse(JSON.stringify(permissionTree?.apps)) || [];
        setPreviousApps(apps);
      }
    }
  }, [selectedEntity]);

  return (
    <>
      {useMemo(() => {
        return (
          <>
            <ContextMenuWrapper
              onClose={() => {
                setShowDetailContext(false);
              }}
              title="Field Configuration"
              visible={showDetailContext}
              width={"60%"}
            >
              <DetailPanel
                entityDetails={{
                  ...selectedEntity,
                }}
                selectedEntity={selectedEntity}
                saveHandler={saveHandler}
                templateTree={selectedEntity.tree}
                panelDisabled={panelDisabled}
                allowSelection={allowSelection}
                subAgencyAccess={subAgencyAccess}
                stateParams={stateParams}
                formData={formData}
              />
            </ContextMenuWrapper>
            <ContextMenuWrapper
              title="Select Template"
              visible={showSummaryContext}
              width={"30%"}
              options={{
                hideTitlebar: true,
              }}
            >
              <ContextSummary
                appName="NJAdmin"
                moduleName="NJ-System"
                entityName="EntityTemplate"
                summaryMode="context_summary"
                handleCancel={onMetadataSelect}
                filters={{
                  "sys_templateGroupName.sys_groupName": get(
                    selectedEntity,
                    "entityInfo.groupName"
                  ),
                }}
              />
            </ContextMenuWrapper>
            <ContextMenuWrapper
              title="Select Template"
              visible={showRBELContext}
              width={"30%"}
              onClose={() => {
                setShowRBELContext(false);
              }}
            >
              <TemplateSelector
                entityName={get(selectedEntity, "entityInfo.groupName")}
                onSelect={onMetadataSelect}
                onClose={() => {
                  setShowRBELContext(false);
                }}
              />
            </ContextMenuWrapper>
          </>
        );
      }, [showDetailContext, showSummaryContext, showRBELContext])}
      <DisplayGrid container direction="row">
        <DisplayGrid item xs={7}>
          <DisplayText variant="h6">{" Privileges and Modules"}</DisplayText>
        </DisplayGrid>
        {allowSelection && !publicRole && (
          <DisplayGrid
            container
            xs={5}
            spacing={2}
            alignItems="center"
            justify="flex-end"
          >
            <DisplaySwitch
              testid={`select-all-apps`}
              onChange={(e, checked) => {
                dispatch({
                  type: checked ? "APP_SELECT" : "APP_DESELECT",
                  payload: appsArray,
                });
              }}
              checked={appsArray.every((ea) =>
                isAllEntitiesSelected(permissionTree, ea.name, ea.modules)
              )}
              disabled={panelDisabled}
              hideLabel={true}
            ></DisplaySwitch>
          </DisplayGrid>
        )}
      </DisplayGrid>
      {/* {publicRole && ( */}
      <DisplayGrid container direction="row">
        <DisplayGrid item xs={7}>
          <DisplayText variant="caption" style={{ fontSize: "12px" }}>
            {entitySelectionDescription}
          </DisplayText>
        </DisplayGrid>
      </DisplayGrid>
      {/* )} */}

      <DisplayGrid
        container
        style={{ marginTop: "15px", minHeight: "500px" }}
        spacing={2}
      >
        <DisplayGrid item xs={2} spacing={1} container direction="column">
          <DisplayGrid item>
            <DisplaySearchBar
              testid={`module-entity-search`}
              placeholder="Enter module or entiy name"
              onChange={(value) => {
                setSearchValue(value);
              }}
              onClick={(value) => {
                setSearchValue(value);
              }}
              onClear={() => {
                setSearchValue("");
              }}
            />
          </DisplayGrid>
          <DisplayGrid
            item
            class="hide_scroll"
            style={{ overflowY: "auto", height: "500px" }}
          >
            {moduleTree.length > 0 && selectedModule ? (
              <DisplayTabs
                testid={`module-tree`}
                tabs={moduleTree}
                defaultSelect={selectedModule.name}
                titleKey="friendlyName"
                valueKey="name"
                onChange={handleChange}
                orientation="vertical"
              />
            ) : (
              <ErrorFallback slug="no_result" />
            )}
          </DisplayGrid>
        </DisplayGrid>
        <DisplayGrid
          item
          xs={10}
          container
          spacing={1}
          style={{
            display: "flex",
            alignContent: "flex-start",
            boxShadow: "0 0 0 1px rgb(233 226 226)",
          }}
          testid={`entity-tab-panel`}
        >
          {selectedModule && selectedModule.entities.length > 0 ? (
            selectedModule.entities
              .sort((x, y) => {
                let a = x.friendlyName.toUpperCase(),
                  b = y.friendlyName.toUpperCase();
                return a == b ? 0 : a > b ? 1 : -1;
              })
              .map((ee) => {
                let { appInfo } = selectedModule;

                let entityInfo = getEntityInfo(
                  permissionTree,
                  appInfo.name,
                  selectedModule.name,
                  ee.groupName
                );
                let roleBasedLayout =
                  allowSelection && ee.access && ee.access.roleBasedLayout;

                let entityData = {
                  appInfo: {
                    name: appInfo.name,
                    friendlyName: appInfo.friendlyName,
                  },
                  moduleInfo: {
                    name: selectedModule.name,
                    friendlyName: selectedModule.friendlyName,
                  },
                  entityInfo:
                    entityInfo && entityInfo.name
                      ? { ...ee, name: entityInfo.name }
                      : ee,
                };

                return (
                  <DisplayGrid
                    key={ee.groupName}
                    item
                    container
                    fluid
                    style={{ width: "300px" }}
                  >
                    <DisplayCard
                      elevation={2}
                      testid={`entity-card-${ee.groupName}`}
                      style={{
                        cursor: entityInfo ? "pointer" : "text",
                        height: "100px",
                        width: "100%",
                      }}
                      onClick={() => {
                        if (entityInfo) handleEntitySelect(entityData);
                      }}
                      systemVariant={entityInfo ? "primary" : "default"}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flex: 1,
                            flexDirection: "row",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flex: 8,
                              alignItems: "center",
                            }}
                          >
                            <div style={{ marginLeft: "15px" }}>
                              <DisplayText>{ee.friendlyName}</DisplayText>
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flex: 4,
                              flexDirection: "row-reverse",
                            }}
                          >
                            {entityInfo && !panelDisabled && (
                              <DisplayIconButton
                                testid={`${ee.groupName}-entity-cleart`}
                                onClick={(event) => {
                                  publicRole &&
                                    setEntityCount((prev) => prev + 1);
                                  dispatch({
                                    type: "ENTITY_DESELECT",
                                    payload: entityData,
                                  });
                                  event.stopPropagation();
                                }}
                                systemVariant="default"
                              >
                                <Clear />
                              </DisplayIconButton>
                            )}
                            {!entityInfo && !panelDisabled && (
                              <DisplayIconButton
                                testid={`entity-modify`}
                                onClick={() => {
                                  if (publicRole) {
                                    if (entityCount > 0) {
                                      allowSelection && !roleBasedLayout
                                        ? setEntity(entityData)
                                        : selectTemplate(entityData);
                                    } else {
                                      setSnackBar({
                                        open: true,
                                        message: `You already reached the maximum number of selected entities (${publicEntityCount})`,
                                        severity: "error",
                                      });
                                    }
                                  } else {
                                    allowSelection && !roleBasedLayout
                                      ? setEntity(entityData)
                                      : selectTemplate(entityData);
                                  }
                                }}
                                systemVariant={
                                  !entityInfo ? "primary" : "default"
                                }
                              >
                                {allowSelection && !roleBasedLayout ? (
                                  <Add />
                                ) : (
                                  <Search />
                                )}
                              </DisplayIconButton>
                            )}
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              alignItems: "center",
                              display: "flex",
                              flex: 12,
                              height: "100%",
                            }}
                          >
                            <div style={{ marginLeft: "15px" }}>
                              <DisplayText>
                                {(entityInfo && !allowSelection) ||
                                (entityInfo && roleBasedLayout)
                                  ? entityInfo.name
                                  : ""}
                              </DisplayText>
                            </div>
                          </div>
                        </div>
                        <div style={{ marginLeft: "5px" }}>
                          {allowDefault && entityInfo && !panelDisabled && (
                            <DisplayIconButton
                              testid={`${ee.groupName}-entity-cleart`}
                              onClick={(e) =>
                                handleDefaultSelection(e, entityData)
                              }
                            >
                              {JSON.stringify(defaultEntityInfo) ===
                              JSON.stringify({
                                appName: entityData.appInfo.name,
                                entityName: entityData.entityInfo.name,
                                moduleName: entityData.moduleInfo.name,
                              }) ? (
                                <StarIcon />
                              ) : (
                                <StarBorder />
                              )}
                            </DisplayIconButton>
                          )}
                        </div>
                      </div>
                    </DisplayCard>
                  </DisplayGrid>
                );
              })
          ) : (
            <ErrorFallback slug="no_result" />
          )}
        </DisplayGrid>
      </DisplayGrid>
    </>
  );
};

export default EntityPanel;
