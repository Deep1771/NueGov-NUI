import React, { useEffect, useState } from "react";
import { Grow } from "@material-ui/core";
import { useDrop } from "react-dnd";
import { useHistory } from "react-router-dom";
import { entity } from "utils/services/api_services/entity_service";
import { GlobalFactory, UserFactory } from "utils/services/factory_services";
import { get } from "utils/services/helper_services/object_methods";
import { basicEntityData } from "utils/services/helper_services/system_methods";
import {
  getConstructedPresetObj,
  getPresetRefObj,
  PRESET_QUERY,
  USER_DEFAULT_QUERY,
} from "../service";
import { DraggableEntityCard, EntityCard, PreSaveModal } from "./components";
import {
  DisplayButton,
  DisplayGrid,
  DisplayIcon,
  DisplayModal,
  DisplaySearchBar,
  DisplayTabs,
  DisplayText,
} from "components/display_components";
import { ErrorFallback } from "components/helper_components";
import { PaperWrapper, ToolTipWrapper } from "components/wrapper_components";
import { SystemIcons } from "utils/icons";

export const AppPanel = (props) => {
  const {
    mode,
    data,
    limit,
    isActive,
    isDefault,
    confirmCallback,
    closeCallBack,
  } = props;
  const history = useHistory();
  const {
    closeBackDrop,
    getUserDefaults,
    setActivePreset,
    setDefaultPreset,
    setDefaultActivePreset,
    setSnackBar,
    setBackDrop,
  } = GlobalFactory();
  const { getModuleStructure, getRefObj, checkReadAccess } = UserFactory();
  const shellObject = basicEntityData();
  const { DragIndicator, Cart } = SystemIcons;

  const [allModules, setAllModules] = useState(getModuleStructure());
  const [appName, setAppName] = useState(null);
  const [emptyEntities, setEmptyEntities] = useState(false);
  const [emptyModules, setEmptyModules] = useState(false);
  const [moduleEntities, setModuleEntities] = useState([]);
  const [moduleName, setModuleName] = useState(allModules?.[0]?.name || null);
  const [openSaveModal, setSaveModalFlag] = useState(false);
  const [selectedEntities, setSelectedEntities] = useState([]);
  const [refresh, setRefresh] = useState(true);

  //JSON
  const buttonList = [
    {
      title: "Close",
      handler: () => {
        closeCallBack();
      },
      id: "appPanel-close",
    },
    {
      title: "Save",
      handler: () => {
        setSaveModalFlag(true);
      },
      disableCondition: !selectedEntities.length,
      id: "appPanel-save",
    },
  ];

  const tabList = [
    {
      type: "MODULE",
      tabs: allModules,
      handler: (val, prop) => handleModuleChange(val, prop),
      defaultSelect: moduleName,
      id: "preset-modules",
    },
  ];

  //Declarative Methods
  // const isEntityExists = (app,mod,entity) => (selectedEntities.find(a => (a.appName === app && a.moduleName === mod && a.groupName === entity)));
  const isEntityExists = (appName, mod, entity) =>
    selectedEntities.find(
      (a) => a.moduleName === mod && a.groupName === entity
    );

  //Setters
  const setConfirmFlags = (refreshFlag) => {
    confirmCallback();
    closeBackDrop();
    setSnackBar({
      message: `Preset ${mode === "edit" ? "updated" : "saved"} successfully.`,
    });
    if (refreshFlag) history.go();
  };

  //Custom Functions
  const createNewDefault = (responseObj) => {
    let defaultObj = { ...shellObject };
    defaultObj["sys_entityAttributes"] = {
      preset: responseObj,
      userName: getRefObj(),
    };
    entity.create(USER_DEFAULT_QUERY, defaultObj).then((res) => {
      setConfirmFlags(true);
    });
  };

  const createNewPreset = (presetVal, makeDefault, makeActive) => {
    let presetObj = { ...shellObject };
    presetObj["sys_entityAttributes"] = {
      presetName: presetVal,
      selectedEntities: selectedEntities,
      userName: getRefObj(),
    };
    entity.create(PRESET_QUERY, presetObj).then(async (res) => {
      presetObj["_id"] = res.id;
      presetObj["sys_gUid"] = res.sys_gUid;
      getUserDefaults()
        .then((ud) => {
          let defaultPreset = get(ud, "sys_entityAttributes.preset");
          if (!ud) {
            setDefaultActivePreset(presetObj);
            createNewDefault(getPresetRefObj(presetVal, res));
          } else if (
            !defaultPreset ||
            !Object.keys(defaultPreset).length ||
            makeActive ||
            makeDefault
          )
            saveOperations(presetObj, presetVal, res, makeDefault, makeActive);
          else setConfirmFlags(false);
        })
        .catch((e) => {
          setConfirmFlags(false);
        });
    });
  };

  const handleClear = () => {
    let modules = getModuleStructure();
    setAllModules(modules);
    setAppName(modules?.[0]?.appName);
    setModuleName(modules?.[0]?.name);
    emptyModules && setEmptyModules(false);
    emptyEntities && setEmptyEntities(false);
    setModuleEntities(modules?.[0]?.entities);
  };
  const handleModuleChange = (val, moduleObj) => {
    setModuleEntities([]);
    setModuleName(val);
    setAppName(moduleObj.appName);
    if (moduleObj.entities && moduleObj.entities.length) {
      let entities = moduleObj.entities.filter(
        (e, i) => !isEntityExists(appName, val, e.groupName)
      );
      setModuleEntities(entities);
    }
  };

  const handleRemoveEntities = (entityObj) => {
    let temp = [...selectedEntities];
    temp.splice(
      selectedEntities.findIndex((e) => e.groupName === entityObj.groupName),
      1
    );
    setSelectedEntities(temp);
  };

  const handleSave = (presetVal, makeDefault, makeActive) => {
    setBackDrop(`${mode === "edit" ? "Updating" : "Saving"} presets`);
    if (mode === "new") createNewPreset(presetVal, makeDefault, makeActive);
    else if (mode === "edit")
      updatePreset(presetVal, data, makeDefault, makeActive);
  };

  const handleSearch = (val) => {
    setRefresh(false);
    setEmptyModules(false);
    setEmptyEntities(false);
    let tempModules = JSON.parse(JSON.stringify(getModuleStructure()));
    let filteredModules = tempModules.reduce((mod, eachModule) => {
      let moduleName = eachModule.friendlyName.toLowerCase();
      if (!val || moduleName.includes(val.toLowerCase())) mod.push(eachModule);
      return mod;
    }, []);

    if (filteredModules && filteredModules.length) {
      setAllModules(filteredModules);
      setAppName(filteredModules[0].appName);
      setModuleName(filteredModules[0].name);
      setModuleEntities(filteredModules?.[0]?.entities);
    } else {
      setAllModules([]);
      let filteredModules =
        tempModules.reduce((modules, eachModule) => {
          let matchedEntities = eachModule.entities.reduce(
            (entities, eachEntity) => {
              let entityFriendlyName = eachEntity.friendlyName.toLowerCase();
              if (entityFriendlyName.includes(val.toLowerCase()))
                entities.push(eachEntity);
              return entities;
            },
            []
          );

          if (matchedEntities && matchedEntities.length) {
            let updatedModule = {
              ...eachModule,
              entities: matchedEntities,
            };
            modules.push(updatedModule);
          }
          return modules;
        }, []) || [];

      if (filteredModules?.length) {
        setAppName(filteredModules?.[0]?.appName);
        setModuleName(filteredModules?.[0]?.name);
        setAllModules(filteredModules);
        setModuleEntities(filteredModules?.[0]?.entities);
      } else {
        setEmptyModules(true);
        setEmptyEntities(true);
      }
    }
    setRefresh(true);
  };

  const updateDefault = (refObj) => {
    setBackDrop("Updating preset as your default");
    getUserDefaults().then((res) => {
      let obj = { ...res };
      obj["sys_entityAttributes"]["preset"] = refObj;
      USER_DEFAULT_QUERY["id"] = res._id;
      entity.update(USER_DEFAULT_QUERY, obj).then((res) => {
        setConfirmFlags(true);
      });
    });
  };

  const saveOperations = (
    presetObj,
    presetVal,
    res,
    makeDefault,
    makeActive
  ) => {
    if (isActive && mode === "edit") {
      if (makeDefault) {
        setDefaultActivePreset(presetObj);
        updateDefault(getPresetRefObj(presetVal, res));
      } else {
        setActivePreset(presetObj);
        setConfirmFlags(true);
      }
    } else if (!isActive && !makeActive && !makeDefault) {
      setConfirmFlags(false);
    } else {
      if (makeActive && makeDefault) {
        if (presetObj)
          sessionStorage.setItem("preset-id", get(presetObj, "_id"));
        setDefaultActivePreset(presetObj);
        updateDefault(getPresetRefObj(presetVal, res));
      } else if (!makeActive && makeDefault) {
        setDefaultPreset(presetObj);
        updateDefault(getPresetRefObj(presetVal, res));
      } else if (makeActive && !makeDefault) {
        if (presetObj)
          sessionStorage.setItem("preset-id", get(presetObj, "_id"));
        setActivePreset(presetObj);
        setConfirmFlags(true);
      }
    }
  };
  const updatePreset = (presetVal, data, makeDefault, makeActive) => {
    let presetObj = { ...data };
    presetObj["sys_entityAttributes"]["presetName"] = presetVal;
    presetObj["sys_entityAttributes"]["selectedEntities"] = selectedEntities;
    PRESET_QUERY["id"] = data._id;
    entity.update(PRESET_QUERY, presetObj).then((res) => {
      saveOperations(presetObj, presetVal, res, makeDefault, makeActive);
    });
  };

  //Custom Hook
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "DRAGGABLE_ENTITY_CARD",
    drop: (droppedResult, monitor) => {
      try {
        let { props } = droppedResult;
        let { appName, moduleName, groupName } = props;
        if (selectedEntities.length < limit) {
          if (!isEntityExists(appName, moduleName, groupName))
            setSelectedEntities(selectedEntities.concat(props));
        } else setSnackBar({ message: "Maximum limit reached" });
      } catch (e) {
        console.log(e);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  //useEffects
  useEffect(() => {
    setAppName(allModules?.[0]?.appName);
    setModuleName(allModules?.[0]?.name);
    if (mode === "edit") {
      let existingEntities = get(data, "sys_entityAttributes.selectedEntities");
      let filteredEntities = existingEntities
        ? existingEntities.filter(({ appName, moduleName, groupName }) =>
            checkReadAccess({
              appname: appName,
              modulename: moduleName,
              entityname: groupName,
            })
          )
        : [];
      setSelectedEntities(filteredEntities);
    }
  }, []);

  useEffect(() => {
    if (moduleName) {
      let module = allModules.find((a) => a.name === moduleName);
      if (module && module.length) {
        setAppName(module?.appName);
        setModuleName(module?.name);
        let entities = module?.entities?.filter(
          (e, i) => !isEntityExists(appName, module.name, e.groupName)
        );
        setModuleEntities(entities);
      }
    }
  }, [moduleName]);

  useEffect(() => {
    if (moduleName) {
      let entities = allModules?.find((a) => a.name === moduleName).entities;
      let moduleEntities = entities?.filter(
        (e, i) => !isEntityExists(appName, moduleName, e.groupName)
      );
      setModuleEntities(moduleEntities);
    }
  }, [selectedEntities]);

  //render Methods
  const renderEntityList = () => (
    <div
      style={{
        flexGrow: 1,
        contain: "strict",
        overflow: "hidden",
        overflowY: "auto",
        backgroundColor: "inherit",
        padding: "10px",
        height: "100%",
      }}
      class="hide_scroll"
      testid={"app-panel-moduleentities-container"}
    >
      {emptyEntities ? (
        <ErrorFallback slug="no_result" />
      ) : (
        <DisplayGrid container spacing={2}>
          {moduleEntities.map((ed, i) => {
            if (
              !selectedEntities?.some((ese) => ese?.groupName === ed?.groupName)
            )
              return (
                <DisplayGrid
                  item
                  key={i}
                  xs={6}
                  sm={4}
                  md={4}
                  lg={3}
                  xl={2}
                  style={{ minHeight: "75px", display: "flex" }}
                >
                  <DraggableEntityCard
                    {...getConstructedPresetObj(
                      appName,
                      moduleName,
                      ed.groupName
                    )}
                    testid={`app-panel-draggable-card-${ed.groupName}`}
                  />
                </DisplayGrid>
              );
          })}
        </DisplayGrid>
      )}
    </div>
  );

  const renderHeader = () => (
    <div
      style={{
        display: "flex",
        flex: 1,
        marginTop: "2px",
        backgroundColor: "#fafafa",
        padding: "5px 10px 0px 10px",
        alignItems: "flex-start",
      }}
    >
      <div style={{ display: "flex", flex: 4, flexDirection: "column" }}>
        <div>
          <DisplayText variant="h6">Entity Selection </DisplayText>{" "}
        </div>
        <div>
          <DisplayText variant="h2">
            {" "}
            Select your preferred entity from top panel to the bottom panel to
            add it to the preset
          </DisplayText>
        </div>
      </div>
      {mode == "edit" && (
        <div
          style={{
            display: "flex",
            flex: 2,
            alignSelf: "flex-start",
            justifyContent: "flex-end",
            padding: "5px 0px 15px 15px",
          }}
        >
          <DisplayText variant="h1" style={{ opacity: 0.5 }}>
            Preset Name : &nbsp;
          </DisplayText>
          <DisplayText
            variant="h2"
            testid={"app-panel-presetname"}
            style={{ opacity: 0.5 }}
          >
            {get(data, "sys_entityAttributes.presetName")}
          </DisplayText>
        </div>
      )}
    </div>
  );

  const renderModules = () => (
    <div
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div style={{ flexShrink: 1 }}>
        <DisplaySearchBar
          testid="apppanel-searchbar"
          data={""}
          onChange={handleSearch}
          onClick={handleSearch}
          onClear={handleClear}
        />
      </div>
      {emptyModules ? (
        <ErrorFallback slug="no_result" />
      ) : (
        <div
          style={{
            display: "flex",
            flex: 11,
            flexDirection: "column",
            overflowY: "auto",
            msOverflowStyle: "none",
            scrollbarWidth: "none",
            contain: "strict",
            height: "100%",
          }}
          className="hide_scroll"
        >
          {renderTabs(
            tabList.find((a) => a.type === "MODULE"),
            moduleName
          )}
        </div>
      )}
    </div>
  );

  const renderTabs = ({ handler, id, type, ...rest }, condition) => (
    <div
      style={{
        display: "flex",
        visibility: condition ? "visible" : "hidden",
        flexShrink: 1,
        marginTop: "2px",
        backgroundColor: "#fafafa",
        padding: "5px 10px 0px 10px",
        height: "100%",
      }}
    >
      {condition && (
        <DisplayTabs
          testid={id}
          titleKey="friendlyName"
          valueKey="name"
          scrollButtons="off"
          variant="scrollable"
          onChange={handler}
          orientation={"vertical"}
          style={{ display: "flex", justifyContent: "flex-start" }}
          {...rest}
        />
      )}
    </div>
  );

  return (
    <PaperWrapper
      testid="preset-appPanelModel"
      style={{ flexDirection: "column-reverse" }}
    >
      <Grow in={true} timeout={2000}>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          {renderHeader()}
          {
            <div
              style={{
                display: "flex",
                flex: 11,
                backgroundColor: "#f5f5f5",
                flexDirection: "row",
                padding: "10px",
                height: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flex: 2,
                  flexDirection: "column",
                  contain: "strict",
                  height: "100%",
                }}
              >
                <DisplayText
                  style={{ font: "inherit", fontSize: 18, fontWeight: 500 }}
                >
                  Modules
                </DisplayText>
                {renderModules()}
              </div>
              <div
                style={{
                  display: "flex",
                  flex: 10,
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <DisplayText
                  style={{ font: "inherit", fontSize: 18, fontWeight: 500 }}
                >
                  Entities
                </DisplayText>
                <PaperWrapper
                  style={{
                    flex: 4.5,
                    display: "flex",
                    marginTop: "5px",
                    backgroundColor: "#f5f5f5",
                    height: "100%",
                  }}
                  variant="outlined"
                >
                  {refresh && renderEntityList()}
                  <ToolTipWrapper
                    title="This indicates that items in this bucket are draggable"
                    placement="top-start"
                  >
                    <div
                      style={{
                        position: "absolute",
                        alignSelf: "flex-end",
                        margin: "5px 20px 0px 0px",
                      }}
                    >
                      <DisplayIcon
                        name={DragIndicator}
                        systemVariant="primary"
                      />
                    </div>
                  </ToolTipWrapper>
                </PaperWrapper>
                <PaperWrapper
                  style={{
                    flex: 4.5,
                    display: "flex",
                    marginTop: "15px",
                    backgroundColor: "#E0F7FA",
                    flexDirection: "column",
                  }}
                  variant="outlined"
                >
                  {!selectedEntities.length && (
                    <DisplayText
                      variant="h4"
                      align="center"
                      style={{
                        fontFamily: "inherit",
                        position: "absolute",
                        alignSelf: "center",
                        opacity: 0.3,
                        zIndex: 1600,
                        marginTop: "90px",
                      }}
                    >
                      Select entities from above panel and drop here <br />
                      <DisplayIcon name={Cart} style={{ fontSize: "40px" }} />
                    </DisplayText>
                  )}
                  <div
                    ref={drop}
                    testid="preset-dropContainer"
                    style={{
                      flexGrow: 1,
                      flexDirection: "column",
                      contain: "strict",
                      alignItems: "center",
                      overflow: "hidden",
                      overflowY: "auto",
                      padding: "10px",
                      backgroundColor: isOver ? "lightblue" : "inherit",
                    }}
                    class="hide_scroll"
                  >
                    <DisplayGrid container spacing={2}>
                      {selectedEntities.map((ed, i) => (
                        <Grow in={true} key={i} timeout={1000}>
                          <DisplayGrid
                            item
                            xs={6}
                            sm={4}
                            md={4}
                            lg={3}
                            xl={2}
                            style={{ minHeight: "75px", display: "flex" }}
                          >
                            <EntityCard
                              {...ed}
                              removable={true}
                              onRemoveCallback={(val) => {
                                handleRemoveEntities(val);
                              }}
                            />
                          </DisplayGrid>
                        </Grow>
                      ))}
                    </DisplayGrid>
                  </div>
                </PaperWrapper>
              </div>
            </div>
          }
        </div>
      </Grow>
      <div
        style={{
          position: "absolute",
          alignSelf: "flex-end",
          padding: "0px 10px 10px 0px",
          right: 0,
        }}
      >
        {buttonList.map(
          ({ handler, id, title, disableCondition = false }, i) => (
            <DisplayButton
              key={i}
              testid={id}
              onClick={handler}
              disabled={disableCondition}
            >
              {title}
            </DisplayButton>
          )
        )}
      </div>

      <DisplayModal open={openSaveModal} fullWidth={true} maxWidth="sm">
        <div style={{ height: "100%", width: "100%" }}>
          <PreSaveModal
            mode={mode}
            isDefault={isDefault}
            isActive={isActive}
            defaultValue={
              mode == "edit"
                ? get(data, "sys_entityAttributes.presetName")
                : null
            }
            successCallback={(
              presetValue,
              makeDefaultFlag = false,
              makeActiveFlag = false
            ) => {
              setSaveModalFlag(false);
              handleSave(presetValue, makeDefaultFlag, makeActiveFlag);
            }}
            rejectCallback={() => {
              setSaveModalFlag(false);
            }}
          />
        </div>
      </DisplayModal>
    </PaperWrapper>
  );
};

AppPanel.defaultProps = {
  mode: "new",
  limit: 15,
};
