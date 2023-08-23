import React, { lazy, Suspense, useMemo, useState, useEffect } from "react";
import { Divider } from "@material-ui/core";
//Services
import {
  checkGlobalFeatureModification,
  getAll,
  getEntityData,
  generateAppTree,
  isAppSelected,
  isAllEntitiesSelected,
  isGlobalFeatureSelected,
} from "../permission_services";
import { UserFactory } from "utils/services/factory_services";
//Inline Components
import { imMutate, usePermissionState } from "../permission_reducer";
import { FeaturePanel } from "../feature_panel";
//Custom Components
import {
  DisplayCheckbox,
  DisplayGrid,
  DisplaySwitch,
  DisplayText,
  DisplayIconButton,
} from "../../../display_components/";
import { SystemReference } from "components/system_components/reference";
import { ContextMenuWrapper } from "components/wrapper_components/context_menu";
import { BubbleLoader } from "components/helper_components";
//Icons
import { SystemIcons } from "utils/icons";
import { PresetMetaData, RolePresetMeta } from "./preset_reference";
import { get } from "utils/services/helper_services/object_methods";

//Inline Components
const EntityPanel = lazy(() => import("../entity_panel/"));

//GLobal Constants
const FEATURE_APP = "Features";

const AppPanel = (props) => {
  const { data, callbackValue, formData, stateParams, fieldmeta, testid } =
    props;

  //Custom Hooks
  const [{ permissionTree }, dispatch] = usePermissionState();
  const {
    getPermissions,
    getAgencyId,
    isNJAdmin,
    isSubAgency,
    getRole,
    getPublicEntityCount,
  } = UserFactory();
  //Local Variables
  const { disable, canUpdate, sectionVisible } = fieldmeta;
  const { agencyuser } =
    formData && formData.sys_entityAttributes
      ? formData.sys_entityAttributes
      : {};
  const publicEntityCount = getPublicEntityCount || 4;
  const currentEntity = stateParams.groupname.toUpperCase();
  const panelDisabled = stateParams.mode === "READ" || disable || !canUpdate;
  const allowSelection =
    currentEntity === "ROLE" || (!isNJAdmin() && currentEntity !== "ROLE");
  const allowDefault = currentEntity === "ROLE" ? true : false;
  PresetMetaData.dynamicFilters[0].filterPath =
    stateParams.mode != "NEW" && "sys_entityAttributes.parentAgency.id";
  const isPublicRole =
    formData?.sys_entityAttributes?.isPublicRole === "Yes" ? true : false;

  //Icons
  const { Edit } = SystemIcons;
  //Local State
  const [selectedApp, setSelectedApp] = useState();
  const [appTree, setAppTree] = useState([]);
  const [agencyTree, setAgencyTree] = useState([]);
  const [subAgencyData, setSubAgencyData] = useState(
    (data && data.preset && data.preset.subAgencyActive) ||
      (!isNJAdmin() &&
        getPermissions.preset &&
        getPermissions.preset.subAgencyActive)
      ? true
      : null
  );
  const [subAgencyMeta, setSubAgencyMeta] = useState(PresetMetaData);
  const [clearAction, setClearAction] = useState(false);
  const [globalFeatures, setGlobalFeatures] = useState([]);
  const [globalFeature, setGlobalFeature] = useState();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(false);
  const [appsArray, setAppsArray] = useState();

  //Declarative
  const filterApp = (apps) => apps.filter((ea) => ea.name !== FEATURE_APP);

  const handleFeatureCheck = (checked, featInfo) => {
    let fInfo = imMutate(featInfo);
    if (fInfo.relatedEntities) {
      if (checked) {
        if (!allowSelection || fInfo.allowModification)
          setGlobalFeature(fInfo.name);
        else {
          fInfo.relatedEntities.map((ee) => {
            let { appname, modulename, entityname } = ee;
            const appInfo = appTree.find((ea) => ea.name === appname);
            if (appInfo) {
              const moduleInfo = appInfo.modules.find(
                (em) => em.name === modulename
              );
              if (moduleInfo) {
                const entityInfo = moduleInfo.entities.find(
                  (ee) => ee.groupName == entityname
                );
                if (entityInfo)
                  dispatch({
                    type: "ENTITY_SELECT",
                    payload: {
                      appInfo,
                      moduleInfo,
                      entityInfo,
                    },
                  });
              }
            }
          });
        }
      } else {
        fInfo.relatedEntities.map((ee) => {
          dispatch({
            type: "ENTITY_DESELECT",
            payload: {
              appInfo: { name: ee.appname },
              moduleInfo: { name: ee.modulename },
              entityInfo: { groupName: ee.entityname },
            },
          });
        });
      }
    } else delete fInfo.relatedEntities;

    let appInfo = agencyTree.find((ea) => ea.name === FEATURE_APP);
    let moduleInfo = imMutate(
      appInfo.modules.find((em) => em.name === fInfo.name)
    );

    if (allowSelection && moduleInfo.flags) {
      delete moduleInfo.flags.allowModification;
      if (!Object.keys(moduleInfo.flags).length) delete moduleInfo.flags;
    }
    if (!allowSelection) delete moduleInfo.entities;

    dispatch({
      type: checked ? "MODULE_SELECT" : "MODULE_DESELECT",
      payload: {
        appInfo,
        moduleInfo,
        fInfo,
      },
    });
  };

  const init = async () => {
    setMessage(false);
    setLoading(true);
    if (currentEntity === "ROLE") {
      if (isNJAdmin()) {
        let agencyPerm = (
          await getEntityData({
            appname: "NueGov",
            modulename: "Admin",
            entityname: "Agency",
            id: agencyuser.id,
          })
        ).sys_entityAttributes.agencyPermission;
        let { apps } = agencyPerm;
        if (agencyPerm.preset)
          setSubAgencyData(agencyPerm.preset.subAgencyActive);
        if (apps.length) initStates(apps);
        else setMessage(true);
      } else {
        if (isSubAgency(agencyuser.id)) {
          let agencyPerm = (
            await getEntityData({
              appname: "NueGov",
              modulename: "Admin",
              entityname: "Agency",
              id: agencyuser.id,
            })
          ).sys_entityAttributes.agencyPermission;
          let { apps } = agencyPerm;
          if (apps.length) initStates(apps);
          else setMessage(true);
        } else {
          let { apps } = getPermissions;
          if (apps.length) initStates(apps);
          else setMessage(true);
        }
      }
    } else {
      if (isNJAdmin()) {
        let [apps, modules] = await getAll();
        let appData = generateAppTree(apps, modules);
        if (appData.length) initStates(appData);
        else setMessage(true);
      } else {
        let { apps } = getPermissions;
        if (apps.length) initStates(apps);
        else setMessage(true);
      }
    }
    setLoading(false);
  };
  console.log("app panel", allowDefault);
  const selectPreset = async (value) => {
    setClearAction(true);
    let Preset = await getEntityData({
      appname: "NueGov",
      modulename: "Admin",
      entityname: "SubAgencyPreset",
      id: value.id,
    });
    if (Array.isArray(Preset) && Preset.length) Preset = Preset[0];
    if (Preset) {
      dispatch({
        type: "INIT_DATA",
        payload: Preset.sys_entityAttributes.agencyPermission,
      });
      dispatch({
        type: "SET_PRESET_DATA",
        payload: {
          id: Preset._id,
          sys_gUid: Preset.sys_gUid,
          name: Preset.sys_entityAttributes.name,
          subAgencyActive: true,
          subAgencyPreset: true,
        },
      });
    }
  };

  const clearPreset = () => {
    dispatch({
      type: "INIT_DATA",
      payload: { apps: [] },
    });
  };

  const presetReference = (value) => {
    if (stateParams.mode !== "NEW") {
      if (value == null && Object.values(value).length) {
        dispatch({
          type: "INIT_DATA",
          payload: data ? data : { apps: [] },
        });
      } else if (value != null && Object.values(value).length) {
        ((data.preset && data.preset.name != value.name) || !data.preset) &&
          selectPreset(value);
      }
    } else if (stateParams.mode === "NEW") {
      value != null && Object.values(value).length && selectPreset(value);
      clearAction && value == null && clearPreset();
    }
  };

  const selectRolePreset = async (value) => {
    setClearAction(true);
    let Preset = await getEntityData({
      appname: "NueGov",
      modulename: "Admin",
      entityname: "RolePreset",
      id: value.id,
    });
    if (Preset && !Array.isArray(Preset)) {
      dispatch({
        type: "INIT_DATA",
        payload: Preset?.sys_entityAttributes?.rolePresetPermission,
      });
      dispatch({
        type: "SET_ROLE_PRESET_DATA",
        payload: value,
      });
    }
  };

  const onRolePresetSelect = async (value) => {
    if (value == null) {
      dispatch({
        type: "INIT_DATA",
        payload: data ? data : { apps: [] },
      });
    } else if (value != null) {
      (data?.rolePreset?.presetName != value.presetName || !data?.rolePreset) &&
        selectRolePreset(value);
    }
  };

  const initStates = (apps) => {
    setAgencyTree(apps);
    initGlobalFeatures(apps);
    setSelectedApp(filterApp(apps)[0]);
    setAppsArray(filterApp(apps));
    setAppTree(apps);
  };

  const initGlobalFeatures = (apps) => {
    let app = apps.find((ea) => ea.name === FEATURE_APP);
    if (app && app.modules) {
      let globalFeatures = app.modules.map((em) => {
        let fInfo = {
          name: em.name,
        };
        if (em.entities && em.entities.length) {
          fInfo = {
            ...fInfo,
            relatedEntities: em.entities.map((ee) => ({
              appname: FEATURE_APP,
              modulename: em.name,
              entityname: ee.groupName,
            })),
          };
        }
        if (em.flags && em.flags.hasOwnProperty("allowModification"))
          fInfo = {
            ...fInfo,
            allowModification: em.flags.allowModification,
          };
        return fInfo;
      });
      setGlobalFeatures(globalFeatures);
    }
  };

  //Effects
  useEffect(() => {
    if (currentEntity !== "ROLE") init();
  }, []);

  useEffect(() => {
    if (subAgencyData) {
      dispatch({
        type: "SET_PRESET_DATA",
        payload: {
          subAgencyActive: true,
        },
      });
      setSubAgencyMeta({
        ...PresetMetaData,
        disable: panelDisabled ? true : false,
      });
    } else {
      setSubAgencyMeta(PresetMetaData);
      stateParams.mode == "NEW" && clearPreset();
      dispatch({
        type: "SET_PRESET_DATA",
        payload: {
          subAgencyActive: false,
          subAgencyPreset: false,
        },
      });
    }
  }, [(subAgencyData && panelDisabled) || subAgencyData]);

  useEffect(() => {
    dispatch({
      type: "INIT_DATA",
      payload: data ? data : { apps: [] },
    });
    dispatch({
      type: "SET_PRESET_DATA",
      payload: {
        subAgencyActive: subAgencyData,
      },
    });
  }, [(data && subAgencyData) || data]);

  useEffect(() => {
    if (currentEntity === "ROLE") agencyuser ? init() : setMessage(true);
  }, [agencyuser]); // listens on agency and app change for ROLE CREATION

  useEffect(() => {
    callbackValue(permissionTree, props);
  }, [permissionTree]);

  //Render methods
  const renderAddOns = () => {
    return (
      <>
        <ContextMenuWrapper
          testid={`feature-context`}
          visible={!!globalFeature}
          onClose={() => setGlobalFeature()}
          options={{ hideTitlebar: true }}
        >
          <FeaturePanel
            testid={`feature-panel`}
            allowSelection={allowSelection}
            agencyTree={agencyTree}
            featureInfo={globalFeatures.find((ef) => ef.name === globalFeature)}
            onClose={() => setGlobalFeature()}
            panelDisabled={panelDisabled}
            subAgencyAccess={subAgencyData}
            stateParams={stateParams}
            formData={formData}
          />
        </ContextMenuWrapper>
      </>
    );
  };

  const renderFeatures = ({
    type,
    title,
    features,
    isFeatureSelected,
    isFeatModSelected,
    onFeatureSelect,
    onModSelect,
  }) => {
    return (
      <DisplayGrid
        container
        direction="row"
        alignItems="center"
        style={{ marginBottom: "15px" }}
        testid={`features`}
      >
        <DisplayGrid item xs={12} style={{ marginBottom: "10px" }} container>
          <DisplayGrid
            item
            xs={10}
            container
            direction="row"
            alignItems="center"
            testid={"agency-features"}
          >
            <DisplayText variant="h6">{title}</DisplayText>
          </DisplayGrid>
        </DisplayGrid>

        <DisplayGrid item xs={12}>
          <DisplayGrid container>
            {features.map((ef) => {
              let enableAccess =
                ["Lifecycle", "Imports", "Feature"].includes(ef?.name) &&
                isPublicRole
                  ? false
                  : true;
              return (
                <DisplayGrid
                  key={ef.name}
                  item
                  style={{ width: "325px", padding: "0 85px 15px 0" }}
                  fluid
                  container
                  direction="row"
                  alignItems="flex-start"
                >
                  <DisplayGrid container alignItems="center">
                    <DisplayGrid item xs={8}>
                      <DisplayText variant="body1">{ef.name}</DisplayText>
                    </DisplayGrid>
                    <DisplayGrid item xs={4} container justify="flex-end">
                      {isFeatureSelected(ef.name) &&
                        ef.relatedEntities &&
                        (!allowSelection || ef.allowModification) && (
                          <DisplayGrid item xs={5} container>
                            <DisplayIconButton
                              testid={`${ef.name}-edit`}
                              systemVariant="primary"
                              size="small"
                              onClick={() => {
                                setGlobalFeature(ef.name);
                              }}
                            >
                              <Edit />
                            </DisplayIconButton>
                          </DisplayGrid>
                        )}
                      <DisplayGrid item xs={7} container>
                        <DisplaySwitch
                          testid={`${ef.name}-activate`}
                          disabled={panelDisabled || !enableAccess}
                          onChange={(e, checked) =>
                            onFeatureSelect(e, checked, ef)
                          }
                          checked={isFeatureSelected(ef.name)}
                          hideLabel={true}
                        />
                      </DisplayGrid>
                    </DisplayGrid>
                  </DisplayGrid>
                  {ef.relatedEntities &&
                    (!allowSelection || ef.allowModification) && (
                      <DisplayGrid container>
                        <DisplayGrid container alignItems="center">
                          <DisplayGrid item xs={8}>
                            <DisplayText
                              variant="caption"
                              style={{ color: "red" }}
                            >
                              allow feature modification
                            </DisplayText>
                          </DisplayGrid>
                          <DisplayGrid container item xs={4} justify="flex-end">
                            <DisplayCheckbox
                              testid={`${ef.name}-allow-modification`}
                              disabled={
                                !isFeatureSelected(ef.name) || panelDisabled
                              }
                              hideLabel={true}
                              onChange={(checked) => {
                                let fInfo = {
                                  ...ef,
                                  allowModification: checked,
                                };
                                onModSelect(checked, fInfo);
                              }}
                              size="small"
                              checked={isFeatModSelected(ef.name)}
                            />
                          </DisplayGrid>
                        </DisplayGrid>
                      </DisplayGrid>
                    )}
                </DisplayGrid>
              );
            })}
          </DisplayGrid>
        </DisplayGrid>
        <Divider style={{ width: "100%" }} />
      </DisplayGrid>
    );
  };

  const renderGlobalFeatures = () => {
    if (globalFeatures && globalFeatures.length)
      return renderFeatures({
        type: "global",
        title: "Features",
        features: globalFeatures,
        onFeatureSelect: (e, checked, ef) => handleFeatureCheck(checked, ef),
        onModSelect: (checked, fInfo) =>
          dispatch({
            type: "GLOBAL_FEATURE_MOD_SET",
            payload: {
              featureInfo: { fInfo, checked, featureApp: FEATURE_APP },
            },
          }),
        isFeatureSelected: (fname) =>
          isGlobalFeatureSelected(
            permissionTree?.apps?.find((ea) => ea?.name === FEATURE_APP),
            fname
          ),
        isFeatModSelected: (fname) =>
          checkGlobalFeatureModification(
            permissionTree?.apps?.find((ea) => ea?.name === FEATURE_APP),
            fname
          ),
      });
  };

  const renderSubAgency = () => {
    return (
      <DisplayGrid
        container
        testid={"sub-agency"}
        direction="row"
        alignItems="center"
        style={{ marginBottom: "15px" }}
      >
        <DisplayGrid item xs={12} style={{ marginBottom: "10px" }} container>
          <DisplayGrid
            item
            xs={10}
            container
            direction="row"
            alignItems="center"
          >
            <DisplayText variant="h6">{"Sub Agency"}</DisplayText>
          </DisplayGrid>
        </DisplayGrid>

        <DisplayGrid
          item
          xs={12}
          style={{ width: "325px", padding: "0 85px 15px 0" }}
          fluid
          container
          direction="row"
          alignItems="flex-start"
        >
          <DisplayGrid
            item
            style={{ width: "325px", padding: "0 85px 15px 0" }}
            fluid
            container
          >
            <DisplayGrid container alignItems="center">
              <DisplayGrid item xs={8}>
                <DisplayText variant="body1">{"Active"}</DisplayText>
              </DisplayGrid>
              <DisplayGrid item xs={4} container justify="flex-end">
                <DisplayGrid item xs={7} container>
                  <DisplaySwitch
                    testid={`subagency-activate`}
                    disabled={panelDisabled}
                    onChange={(e, checked) => setSubAgencyData(checked)}
                    checked={subAgencyData}
                    hideLabel={true}
                  />
                </DisplayGrid>
              </DisplayGrid>
            </DisplayGrid>
          </DisplayGrid>
          {currentEntity !== "SUBAGENCYPRESET" && (
            <DisplayGrid
              item
              style={{ width: "450px", padding: "0 85px 15px 0" }}
              fluid
              container
            >
              <DisplayGrid container alignItems="center">
                <DisplayGrid item xs={12} container justify="flex-end">
                  <DisplayGrid item xs={12} container>
                    <SystemReference
                      stateParams="NEW"
                      callbackError={() => {}}
                      fieldError={() => {}}
                      callbackValue={(value) => presetReference(value)}
                      data={
                        data && data.preset && subAgencyData && data.preset.name
                          ? data.preset
                          : null
                      }
                      fieldmeta={subAgencyMeta}
                    />
                  </DisplayGrid>
                </DisplayGrid>
              </DisplayGrid>
            </DisplayGrid>
          )}
        </DisplayGrid>
        <Divider style={{ width: "100%" }} />
      </DisplayGrid>
    );
  };

  const renderRolePreset = () => {
    return (
      <DisplayGrid
        item
        style={{ width: "450px", padding: "0 85px 15px 0" }}
        fluid
        container
      >
        <DisplayGrid container alignItems="center">
          <DisplayGrid item xs={12} container justify="flex-end">
            <DisplayGrid item xs={12} container>
              <SystemReference
                stateParams="NEW"
                callbackError={() => {}}
                fieldError={() => {}}
                callbackValue={onRolePresetSelect}
                data={
                  data && data.rolePreset && data.rolePreset.presetName
                    ? data.rolePreset
                    : null
                }
                fieldmeta={RolePresetMeta}
              />
            </DisplayGrid>
          </DisplayGrid>
        </DisplayGrid>
      </DisplayGrid>
    );
  };

  const sectionHide = (value) => {
    if (sectionVisible) {
      return sectionVisible[value];
    } else return true;
  };
  return (
    <>
      {message && (
        <DisplayGrid container justify="center">
          <DisplayText variant="h6" component="div">
            You have to select the Agency
          </DisplayText>
        </DisplayGrid>
      )}
      {loading && <BubbleLoader />}
      {useMemo(() => {
        return (
          <DisplayGrid container testid={testid}>
            {renderAddOns()}
            {selectedApp &&
              sectionHide("subAgency") &&
              currentEntity !== "ROLE" && (
                <DisplayGrid container>{renderSubAgency()}</DisplayGrid>
              )}
            {selectedApp && currentEntity == "ROLE" && isNJAdmin() && (
              <DisplayGrid container>{renderRolePreset()}</DisplayGrid>
            )}
            {sectionHide("features") && (
              <DisplayGrid container>{renderGlobalFeatures()}</DisplayGrid>
            )}
            {selectedApp && (
              <DisplayGrid container>
                <DisplayGrid container style={{ margin: "10px 0px 20px 0px" }}>
                  <Suspense fallback={<BubbleLoader />}>
                    <EntityPanel
                      appsArray={appsArray}
                      allowSelection={allowSelection}
                      panelDisabled={panelDisabled}
                      subAgencyAccess={subAgencyData}
                      stateParams={stateParams}
                      formData={formData}
                      allowDefault={allowDefault}
                      publicEntityCount={publicEntityCount}
                    />
                  </Suspense>
                </DisplayGrid>
              </DisplayGrid>
            )}
          </DisplayGrid>
        );
      }, [
        permissionTree,
        appsArray,
        agencyTree,
        appTree,
        globalFeatures,
        globalFeature,
        panelDisabled,
        subAgencyMeta,
        subAgencyData,
      ])}
    </>
  );
};

export default AppPanel;
