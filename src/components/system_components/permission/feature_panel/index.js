import React, { useEffect, useMemo, useState, useRef } from "react";
//Custom Hooks
import { imMutate, usePermissionState } from "../permission_reducer";
//services
import { getEntityInfo } from "../permission_services";
//Custom Components
import { ContextSummary } from "containers/composite_containers/summary_container/components/context_summary";
import { DetailPanel } from "../detail_panel/";
import { DisplayButton, DisplayTabs } from "components/display_components/";
import { removeModificationAccess } from "../helper";

export const FeaturePanel = (props) => {
  const {
    formData,
    agencyTree,
    featureInfo,
    onClose,
    allowSelection,
    panelDisabled,
    stateParams,
    subAgencyAccess,
    testid,
  } = props;
  //Custom Hook
  const [{ permissionTree }, dispatch] = usePermissionState();
  //Local Variables
  const { relatedEntities: RELATED_ENTITIES } = imMutate(featureInfo);
  //Local state
  const [panel, setPanel] = useState();
  const [entityInfo, setEntityInfo] = useState();
  const [relatedEntities, setRelatedEntities] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState(
    RELATED_ENTITIES[0].entityname
  );
  const { isPublicRole = "" } = formData?.sys_entityAttributes || {};
  const publicRole = isPublicRole === "Yes" ? true : false;
  const mode = stateParams?.mode?.toLowerCase() || "";
  const previousApps = useRef([]);

  //Declarative methods
  const handleTabSelect = (entity) => setSelectedEntity(entity);
  const handleChange = (entityInfo, tree) => setTree(entityInfo, tree);

  //Custom methods
  const handleSave = () => {
    relatedEntities.map((ee) => {
      const { appname, modulename } = ee;
      const appInfo = agencyTree.find((ea) => ea.name === appname);
      const moduleInfo = appInfo.modules.find((em) => em.name === modulename);
      if (ee.modifiedTree)
        dispatch({
          type: "ENTITY_SELECT",
          payload: {
            appInfo,
            moduleInfo,
            entityInfo: ee.modifiedTree,
          },
        });
    });
    onClose();
  };

  const onTemplateSelect = ({ data }) => {
    if (data.length) {
      let metadata = data[0];
      const entitydata = {
        groupName: selectedEntity,
        name: metadata.sys_entityAttributes.sys_templateName,
        friendlyName: metadata.sys_entityAttributes.sys_templateName,
      };
      setTree(entityInfo, entitydata);
      dispatch({
        type: "SET_ENTITY_TREE",
        payload: {
          ...imMutate(entitydata),
          topSectionArray: [],
          componentArray: [],
        },
      });
      entitydata.tree = metadata.sys_entityAttributes.sys_templateName;
      setEntityInfo(entitydata);
      setPanel("DETAIL");
    }
  };

  const setTree = (eInfo, tree) => {
    let { appname, modulename, entityname } = relatedEntities.find(
      (ee) => ee.entityname == selectedEntity
    );
    const etyTree = relatedEntities.map((ee) => {
      if (
        ee.appname == appname &&
        ee.modulename == modulename &&
        ee.entityname == entityname
      )
        ee.modifiedTree = tree;

      return ee;
    });
    setRelatedEntities(etyTree);
  };

  //Effects
  useEffect(() => {
    if (mode !== "new" && isPublicRole) {
      let apps = JSON.parse(JSON.stringify(permissionTree?.apps)) || [];
      previousApps.current = apps;
    }
    const relatedItems = RELATED_ENTITIES.map((ee) => {
      let { appname, modulename, entityname } = ee;
      if (!allowSelection) {
        let entity = getEntityInfo(
          permissionTree,
          appname,
          modulename,
          entityname
        );
        if (entity) {
          if (publicRole) {
            let { topSectionArray, access } = removeModificationAccess({
              entity,
              mode,
              previousApps: previousApps.current,
            });
            entity = {
              ...entity,
              access,
              topSectionArray,
            };
          }
          ee.modifiedTree = imMutate(entity);
        }
      } else {
        let entity = getEntityInfo(
          permissionTree,
          appname,
          modulename,
          entityname
        );

        if (entity) {
          if (publicRole) {
            let { topSectionArray, access } = removeModificationAccess({
              entity,
              mode,
              previousApps: previousApps.current,
            });
            entity = {
              ...entity,
              access,
              topSectionArray,
            };
          }
          ee.modifiedTree = imMutate(entity);
        } else
          ee.modifiedTree = imMutate(
            getEntityInfo(
              { apps: [agencyTree.find((ea) => ea.name === appname)] },
              appname,
              modulename,
              entityname
            )
          );
      }

      return ee;
    });
    setRelatedEntities(relatedItems);
  }, []);

  useEffect(() => {
    if (selectedEntity && relatedEntities.length) {
      let { appname, modulename, entityname, modifiedTree } =
        relatedEntities.find((ee) => ee.entityname == selectedEntity);
      let actualTree = getEntityInfo(
        allowSelection
          ? { apps: [agencyTree.find((ea) => ea.name === appname)] }
          : permissionTree,
        appname,
        modulename,
        entityname
      );
      if (modifiedTree) {
        dispatch({
          type: "SET_ENTITY_TREE",
          payload: {
            ...imMutate(modifiedTree),
            topSectionArray: modifiedTree.topSectionArray || [],
            componentArray: modifiedTree.componentArray || [],
          },
        });
        let templateNameOrTree = allowSelection
          ? actualTree
          : modifiedTree.name;
        setEntityInfo({
          appname,
          modulename,
          entityname,
          tree: templateNameOrTree,
        });
        setPanel("DETAIL");
      } else {
        setEntityInfo({ appname, modulename, entityname });
        setPanel("SUMMARY");
      }
    }
  }, [selectedEntity, relatedEntities.length]);

  //Render methods
  const renderFooter = () => {
    return (
      <div
        style={{
          display: "flex",
          flexShrink: 1,
          marginTop: "10px",
          justifyContent: "flex-end",
        }}
      >
        <DisplayButton testid={`close`} onClick={onClose}>
          CLOSE
        </DisplayButton>
        &nbsp;&nbsp;
        <DisplayButton testid={`save`} onClick={handleSave}>
          Save
        </DisplayButton>
      </div>
    );
  };

  const renderSection = () => {
    return (
      <div style={{ display: "flex", flex: 10 }}>
        {panel == "SUMMARY" ? (
          <ContextSummary
            appName="NJAdmin"
            moduleName="NJ-System"
            entityName="EntityTemplate"
            summaryMode="context_summary"
            handleCancel={onTemplateSelect}
            filters={{
              "sys_templateGroupName.sys_groupName": selectedEntity,
            }}
          />
        ) : panel == "DETAIL" ? (
          <DetailPanel
            entityDetails={imMutate(entityInfo)}
            selectedEntity={selectedEntity}
            changeHandler={handleChange}
            saveHandler={setTree}
            templateTree={entityInfo.tree}
            allowSelection={allowSelection}
            panelDisabled={panelDisabled}
            subAgencyAccess={subAgencyAccess}
            stateParams={stateParams}
            formData={formData}
          />
        ) : null}
      </div>
    );
  };

  const renderTabs = () => {
    return (
      <div style={{ flexShrink: 1 }}>
        {featureInfo.relatedEntities.length > 1 && (
          <DisplayTabs
            testid={featureInfo.name}
            tabs={featureInfo.relatedEntities}
            defaultSelect={selectedEntity}
            titleKey="entityname"
            valueKey="entityname"
            onChange={handleTabSelect}
            variant="scrollable"
          />
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        width: "100%",
        height: "100%",
      }}
    >
      {useMemo(() => {
        return renderTabs();
      }, [panel, selectedEntity, relatedEntities.length])}
      {useMemo(() => {
        return renderSection();
      }, [panel, entityInfo, relatedEntities.length])}
      {renderFooter()}
    </div>
  );
};
