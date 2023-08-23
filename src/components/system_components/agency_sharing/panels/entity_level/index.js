import React, { useEffect, useState, useMemo } from "react";
import { makeStyles } from "@material-ui/core";
import PropTypes from "prop-types";
import { useAgencySharingValue } from "../../agency_sharing_reducer";
import {
  checkAllEntityPermission,
  checkEntityPermission,
  checkEntityHeader,
  getEntityData,
} from "../../agency_sharing_services";
import { BubbleLoader } from "../../../../helper_components/";
import { TopLevel } from "../top_level";
import {
  DisplayButton,
  DisplayCheckbox,
  DisplayGrid,
  DisplayIconButton,
  DisplaySwitch,
  DisplayText,
} from "../../../../display_components";
import { ContextMenuWrapper } from "../../../../wrapper_components/context_menu";
import { styles } from "../../styles";
import { SystemIcons } from "./../../../../../utils/icons";

const useStyles = makeStyles(styles);

const READOBJ = { read: true },
  WRITEOBJ = { ...READOBJ, write: true };

export const EntityLevel = (props) => {
  const {
    mode,
    onClose,
    onSave,
    shareeAgencyPermission,
    sharedAgencyPermission,
  } = props;
  const [{ permission, transitive }, dispatch] = useAgencySharingValue();
  const classes = useStyles();

  const { MoreHorizontal } = SystemIcons;

  const [dataFetched, setDataFetched] = useState(false);
  const [entitiesByModule, setEntitiesByModule] = useState([]);
  const [localTransitive, setLocalTransitive] = useState(transitive);
  const [selectedEntity, setSelectedEntity] = useState();
  const [showContext, setShowContext] = useState();

  //local variables
  let commonEntities = [],
    sharedAgencyEntities = [],
    shareeAgencyEntities = [],
    groupEntities;

  //getters
  const getCommonEntities = (entity1, entity2) => {
    let array = entity1.filter((object1) =>
      entity2.some((object2) => object1.groupName === object2.groupName)
    );
    let uniqueArray = removeDuplicateEntities(array, "groupName");
    return uniqueArray;
  };

  const getEntities = (agency) => {
    let array = [];
    agency.apps.map((eachApp) => {
      eachApp.modules &&
        eachApp.modules.map((eachmodule) => {
          eachmodule.entities &&
            eachmodule.entities.map((eachentity) => {
              let newObject = {
                ...eachentity,
                appName: eachApp.friendlyName,
                moduleName: eachmodule.friendlyName,
              };
              array.push(newObject);
            });
        });
    });
    return array;
  };

  const getEntitiesByModule = (commonEntities) => {
    return commonEntities.reduce((accumulator, eachObj) => {
      if (!accumulator.length) {
        let entity = [];
        entity.push(eachObj);
        let newObject = {
          name: eachObj.moduleName,
          entities: entity,
        };
        accumulator.push(newObject);
      } else {
        let index = accumulator.findIndex(
          (eachObject) => eachObject.name === eachObj.moduleName
        );
        if (index === -1) {
          let entity = [];
          entity.push(eachObj);
          let newObject = {
            name: eachObj.moduleName,
            entities: entity,
          };
          accumulator.push(newObject);
        } else {
          accumulator[index] = {
            ...accumulator[index],
            entities: accumulator[index].entities.concat(eachObj),
          };
        }
      }
      return accumulator;
    }, []);
  };

  //custom functions
  const closeHandler = () => {
    setSelectedEntity(undefined);
    setShowContext(false);
  };

  const moreHandler = (eachEntity) => {
    setShowContext(true);
    setSelectedEntity(eachEntity);
    dispatch({
      type: "SET_TO_LOCAL_REDUCER",
      payload: {
        selectEntity: eachEntity.name,
      },
    });
  };

  const removeDuplicateEntities = (originalArray, prop) => {
    let newArray = [];
    let newObject = {};
    for (let i in originalArray) {
      newObject[originalArray[i][prop]] = originalArray[i];
    }
    for (let i in newObject) {
      newArray.push(newObject[i]);
    }
    return newArray;
  };

  const saveHandler = (topLevel, componentLevel) => {
    setSelectedEntity(undefined);
    dispatch({
      type: "SET_TO_MAIN_REDUCER",
      payload: {
        selectedEntity: selectedEntity.name,
        topLevelPermission: topLevel,
        componentLevelPermission: componentLevel,
      },
    });
  };

  const init = async () => {
    let agencyPermission = (
      await getEntityData({
        appname: "NueGov",
        modulename: "Admin",
        entityname: "Agency",
        id: sharedAgencyPermission.id,
      })
    ).sys_entityAttributes.agencyPermission;

    setDataFetched(true);
    sharedAgencyEntities = await getEntities(agencyPermission);
    shareeAgencyEntities = await getEntities(shareeAgencyPermission);
    commonEntities = await getCommonEntities(
      sharedAgencyEntities,
      shareeAgencyEntities
    );
    groupEntities = await getEntitiesByModule(commonEntities);
    setEntitiesByModule(groupEntities);
  };

  //useEffect
  useEffect(() => {
    init();
    return () => {
      setDataFetched(false);
    };
  }, [sharedAgencyPermission]);

  return useMemo(
    () => (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {selectedEntity && (
          <ContextMenuWrapper
            options={{
              hideTitlebar: true,
            }}
            visible={showContext}
            width="70%"
          >
            <TopLevel
              selectedEntity={selectedEntity}
              mode={mode}
              onSave={saveHandler}
              onClose={closeHandler}
              style={{ height: "100%" }}
            />
          </ContextMenuWrapper>
        )}
        {dataFetched ? (
          <div
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <div style={{ display: "flex", flex: 11, overflowY: "scroll" }}>
              {entitiesByModule.length === 0 ? (
                <DisplayGrid
                  container
                  item
                  xs={12}
                  alignItems="center"
                  justify="center"
                >
                  <DisplayText variant="h6">
                    No common entities between sharee agency and shared agency.
                    Try switching shared / sharee agency
                  </DisplayText>
                </DisplayGrid>
              ) : (
                <DisplayGrid
                  container
                  className={classes.mainContainer}
                  alignContent="flex-start"
                >
                  <DisplayGrid container item xs={12} sm={12} md={12} lg={6}>
                    <DisplayGrid item xs={12} className={classes.eachItem}>
                      <DisplayText className={classes.agencyName} variant="h3">
                        {" "}
                        {sharedAgencyPermission.name}{" "}
                      </DisplayText>
                    </DisplayGrid>
                    <DisplayGrid
                      container
                      item
                      xs={12}
                      className={classes.eachItem}
                    >
                      <DisplayGrid container item xs={4} alignItems="center">
                        <DisplayText>Transitive</DisplayText>
                      </DisplayGrid>
                      <DisplayGrid container item xs={2} justify="center">
                        <DisplaySwitch
                          testid={"agency-sharing-transitive"}
                          checked={localTransitive}
                          disabled={mode === "READ" ? true : false}
                          onChange={(event, checked) => {
                            checked
                              ? setLocalTransitive(true)
                              : setLocalTransitive(false);
                          }}
                        />
                      </DisplayGrid>
                    </DisplayGrid>
                    <DisplayGrid
                      container
                      item
                      xs={12}
                      className={classes.eachItem}
                      direction="row-reverse"
                    >
                      <DisplayGrid
                        container
                        item
                        xs={5}
                        style={{ padding: "0% 0% 0% 1%" }}
                      >
                        <DisplayText> W </DisplayText>
                      </DisplayGrid>
                      <DisplayGrid
                        container
                        item
                        xs={2}
                        style={{ padding: "0% 0% 0% 1%" }}
                      >
                        <DisplayText> R </DisplayText>
                      </DisplayGrid>
                    </DisplayGrid>
                    <DisplayGrid
                      container
                      item
                      xs={12}
                      className={classes.eachItem}
                    >
                      <DisplayGrid container item xs={5}>
                        <DisplayText>ALL</DisplayText>
                      </DisplayGrid>
                      <DisplayGrid container item xs={2}>
                        <DisplayCheckbox
                          testid={"agency-sharing-allmodule-read"}
                          checked={checkAllEntityPermission(
                            permission,
                            entitiesByModule,
                            "read"
                          )}
                          disabled={mode === "READ" ? true : false}
                          onChange={(checked) => {
                            let allReadPermission = entitiesByModule.reduce(
                              (accumulator, eachObj) => {
                                let allFields = eachObj.entities.map(
                                  (eachEntity) => ({
                                    name: eachEntity.name,
                                    groupName: eachEntity.groupName,
                                    friendlyName: eachEntity.friendlyName,
                                    appName: eachEntity.appName,
                                    moduleName: eachEntity.moduleName,
                                    access: READOBJ,
                                    topSectionArray: [],
                                    componentArray: [],
                                  })
                                );
                                let newaccumulator =
                                  accumulator.concat(allFields);
                                return newaccumulator;
                              },
                              []
                            );
                            dispatch({
                              type: checked
                                ? "SET_ALL_ENTITY_ACCESS"
                                : "RESET_ALL_ENTITY_ACCESS",
                              payload: allReadPermission,
                            });
                          }}
                        />
                      </DisplayGrid>
                      <DisplayGrid container item xs={2}>
                        <DisplayCheckbox
                          testid={"agency-sharing-allmodule-write"}
                          checked={checkAllEntityPermission(
                            permission,
                            entitiesByModule,
                            "write"
                          )}
                          disabled={mode === "READ" ? true : false}
                          onChange={(checked) => {
                            let allWritePermission = entitiesByModule.reduce(
                              (accumulator, eachObj) => {
                                let allFields = eachObj.entities.map(
                                  (eachEntity) => ({
                                    name: eachEntity.name,
                                    groupName: eachEntity.groupName,
                                    friendlyName: eachEntity.friendlyName,
                                    appName: eachEntity.appName,
                                    moduleName: eachEntity.moduleName,
                                    access: checked ? WRITEOBJ : READOBJ,
                                    topSectionArray: [],
                                    componentArray: [],
                                  })
                                );
                                let newaccumulator =
                                  accumulator.concat(allFields);
                                return newaccumulator;
                              },
                              []
                            );
                            dispatch({
                              type: "SET_ALL_ENTITY_ACCESS",
                              payload: allWritePermission,
                            });
                          }}
                        />
                      </DisplayGrid>
                      <DisplayGrid container item xs={3}></DisplayGrid>
                    </DisplayGrid>
                  </DisplayGrid>

                  {/* entity container */}
                  {entitiesByModule.map((eachModule, i) => {
                    return (
                      <>
                        <DisplayGrid container item xs={12} key={i}>
                          <DisplayGrid
                            container
                            item
                            xs={12}
                            sm={12}
                            md={12}
                            lg={6}
                            className={classes.eachHeading}
                            key={i + 1}
                          >
                            <DisplayGrid
                              container
                              item
                              xs={5}
                              alignItems="center"
                            >
                              <DisplayText style={{ fontWeight: 800 }}>
                                {" "}
                                {eachModule.name}{" "}
                              </DisplayText>
                            </DisplayGrid>
                            <DisplayGrid container item xs={2}>
                              <DisplayCheckbox
                                testid={`agency-sharing-${eachModule.name}-read`}
                                checked={checkEntityHeader(
                                  permission,
                                  eachModule,
                                  "read"
                                )}
                                disabled={mode === "READ" ? true : false}
                                onChange={(checked) => {
                                  const allReadPermission =
                                    eachModule.entities.map((eachEntity) => {
                                      return {
                                        name: eachEntity.name,
                                        groupName: eachEntity.groupName,
                                        friendlyName: eachEntity.friendlyName,
                                        appName: eachEntity.appName,
                                        moduleName: eachEntity.moduleName,
                                        access: READOBJ,
                                        topSectionArray: [],
                                        componentArray: [],
                                      };
                                    });
                                  dispatch({
                                    type: checked
                                      ? "SET_APP_ENTITY_ACCESS"
                                      : "RESET_APP_ENTITY_ACCESS",
                                    payload: allReadPermission,
                                  });
                                }}
                              />
                            </DisplayGrid>
                            <DisplayGrid container item xs={2}>
                              <DisplayCheckbox
                                testid={`agency-sharing-${eachModule.name}-write`}
                                checked={checkEntityHeader(
                                  permission,
                                  eachModule,
                                  "write"
                                )}
                                disabled={mode === "READ" ? true : false}
                                onChange={(checked) => {
                                  const allReadPermission =
                                    eachModule.entities.map((eachEntity) => {
                                      return {
                                        name: eachEntity.name,
                                        groupName: eachEntity.groupName,
                                        friendlyName: eachEntity.friendlyName,
                                        appName: eachEntity.appName,
                                        moduleName: eachEntity.moduleName,
                                        access: checked ? WRITEOBJ : READOBJ,
                                        topSectionArray: [],
                                        componentArray: [],
                                      };
                                    });
                                  dispatch({
                                    type: "SET_APP_ENTITY_ACCESS",
                                    payload: allReadPermission,
                                  });
                                }}
                              />
                            </DisplayGrid>
                          </DisplayGrid>
                        </DisplayGrid>
                        {eachModule.entities.map((eachEntity, i) => {
                          return (
                            <>
                              <DisplayGrid
                                container
                                item
                                xs={12}
                                sm={12}
                                md={12}
                                lg={6}
                                className={classes.eachItem}
                                key={i}
                              >
                                <DisplayGrid
                                  container
                                  item
                                  xs={5}
                                  alignItems="center"
                                >
                                  <DisplayText>
                                    {" "}
                                    {eachEntity.friendlyName}
                                  </DisplayText>
                                </DisplayGrid>
                                <DisplayGrid container item xs={2}>
                                  <DisplayCheckbox
                                    testid={`agency-sharing-${eachModule.name}-${eachEntity.groupName}-read`}
                                    checked={checkEntityPermission(
                                      permission,
                                      eachEntity.groupName,
                                      "read"
                                    )}
                                    disabled={mode === "READ" ? true : false}
                                    onChange={(checked) => {
                                      let payload = {
                                        name: eachEntity.name,
                                        groupName: eachEntity.groupName,
                                        friendlyName: eachEntity.friendlyName,
                                        appName: eachEntity.appName,
                                        moduleName: eachEntity.moduleName,
                                        access: READOBJ,
                                        topSectionArray: [],
                                        componentArray: [],
                                      };
                                      dispatch({
                                        type: checked
                                          ? "SET_ENTITY_ACCESS"
                                          : "RESET_ENTITY_ACCESS",
                                        payload: payload,
                                      });
                                      if (!checked) {
                                        dispatch({
                                          type: "RESET_ALL_READ_ACCESS",
                                          payload: eachEntity.name,
                                        });
                                      }
                                    }}
                                  />
                                </DisplayGrid>
                                <DisplayGrid container item xs={2}>
                                  <DisplayCheckbox
                                    testid={`agency-sharing-${eachModule.name}-${eachEntity.groupName}-write`}
                                    checked={checkEntityPermission(
                                      permission,
                                      eachEntity.groupName,
                                      "write"
                                    )}
                                    disabled={mode === "READ" ? true : false}
                                    onChange={(checked) => {
                                      let payload = {
                                        name: eachEntity.name,
                                        groupName: eachEntity.groupName,
                                        friendlyName: eachEntity.friendlyName,
                                        appName: eachEntity.appName,
                                        moduleName: eachEntity.moduleName,
                                        access: checked ? WRITEOBJ : READOBJ,
                                        topSectionArray: [],
                                        componentArray: [],
                                      };
                                      dispatch({
                                        type: "SET_ENTITY_ACCESS",
                                        payload: payload,
                                      });
                                      if (!checked) {
                                        dispatch({
                                          type: "RESET_ALL_WRITE_ACCESS",
                                          payload: eachEntity.name,
                                        });
                                      }
                                    }}
                                  />
                                </DisplayGrid>

                                <DisplayGrid container item xs={3}>
                                  <DisplayIconButton
                                    testid={`agency-sharing-${eachModule}-${eachEntity.groupName}-more`}
                                    disabled={
                                      permission.find(
                                        (each_Entity) =>
                                          each_Entity.name === eachEntity.name
                                      )
                                        ? false
                                        : true
                                    }
                                    onClick={() => moreHandler(eachEntity)}
                                    systemVariant={
                                      selectedEntity ? "default" : "primary"
                                    }
                                  >
                                    {" "}
                                    <MoreHorizontal />
                                  </DisplayIconButton>
                                </DisplayGrid>
                              </DisplayGrid>
                            </>
                          );
                        })}
                      </>
                    );
                  })}
                </DisplayGrid>
              )}
            </div>

            <div style={{ display: "flex", flex: 1, alignItems: "center" }}>
              <DisplayGrid
                container
                item
                xs={12}
                direction="row-reverse"
                justify="flex-start"
              >
                <DisplayGrid item xs={1}>
                  <DisplayButton
                    testid={"agency-sharing-entitylevel-save"}
                    onClick={() =>
                      onSave(
                        permission,
                        localTransitive,
                        sharedAgencyPermission
                      )
                    }
                    disabled={
                      mode === "READ" ||
                      (dataFetched && entitiesByModule.length === 0)
                        ? true
                        : false
                    }
                  >
                    {" "}
                    Save
                  </DisplayButton>
                </DisplayGrid>
                <DisplayGrid item xs={1}>
                  <DisplayButton
                    testid={"agency-sharing-entitylevel-close"}
                    onClick={() => onClose()}
                  >
                    {" "}
                    CLOSE
                  </DisplayButton>
                </DisplayGrid>
              </DisplayGrid>
            </div>
          </div>
        ) : (
          <BubbleLoader />
        )}
      </div>
    ),
    [
      dataFetched,
      entitiesByModule,
      localTransitive,
      permission,
      selectedEntity,
      sharedAgencyPermission,
      showContext,
    ]
  );
};

EntityLevel.propTypes = {
  shareeAgencyPermission: PropTypes.object.isRequired,
  sharedAgencyPermission: PropTypes.shape({
    name: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    sys_gUid: PropTypes.string.isRequired,
  }),
  onSave: PropTypes.func.isRequired,
};
