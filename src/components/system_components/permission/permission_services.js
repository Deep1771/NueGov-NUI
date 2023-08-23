import { entity } from "utils/services/api_services/entity_service";
import { agencyTemplate } from "utils/services/api_services/template_service";

// CONSTANTS
export const READ = { read: true };
export const WRITE = { write: true };
export const DELETE = { delete: true };
export const READ_WRITE = { ...READ, ...WRITE };
export const READ_WRITE_DELETE = { ...READ, ...WRITE, ...DELETE };

//API SERVICES
//Declarative
const getEntityData = async (params) => await entity.get(params);

//Functional
const getAll = async () => {
  let [systemApps, modules] = await Promise.all([
    getAllApps(),
    getAllModules(),
  ]);

  modules = modules.map((em) => {
    let { entityList } = em.sys_entityAttributes;
    if (entityList)
      entityList = entityList.filter((ee) => Object.keys(ee).length);

    let moduleObj = {
      name: em.sys_entityAttributes.sys_moduleName,
      friendlyName: em.sys_entityAttributes.sys_friendlyName,
      isNotAccessible: em.sys_entityAttributes.isNotAccessible,
      entities:
        entityList && entityList.length
          ? entityList.map((ee) => ({
              friendlyName: ee.sys_friendlyName,
              groupName: ee.sys_groupName,
            }))
          : [],
    };

    return moduleObj;
  });
  return [systemApps, modules];
};

const getAllApps = () =>
  getEntityData({
    appname: "NJAdmin",
    modulename: "NJ-System",
    entityname: "AppTemplate",
    displayFields: "sys_appName,sys_friendlyName,modules",
    limit: 50,
    skip: 0,
  });

const getAllFeatures = (type) => {
  let params = {
    appname: "NJAdmin",
    modulename: "NJ-System",
    entityname: "Feature",
    displayFields: "featureName,featureType,relatedEntities",
    limit: 50,
    skip: 0,
  };
  if (type) params.featureType = type;

  return getEntityData(params);
};

const getAllModules = () =>
  getEntityData({
    appname: "NJAdmin",
    modulename: "NJ-System",
    entityname: "ModuleTemplate",
    displayFields:
      "sys_moduleName,sys_friendlyName,sys_moduleEntities,isNotAccessible,entityList",
    limit: 75,
    skip: 0,
  });

const getEntityTemplate = async (sys_templateName) =>
  await entity.get({
    appname: "NJAdmin",
    modulename: "NJ-System",
    entityname: "EntityTemplate",
    limit: 1,
    skip: 0,
    sys_templateName,
  });

const getRoleTemplate = async (params) => await agencyTemplate.get(params);
//API SERVICES END

//HELPER SERVICES
//Declarative
const addAccessToAll = (tree, level, sections, access, allowSelection) =>
  sections &&
  sections.map((es) => ({
    ...es,
    fields: addAccessToFields(tree, level, es.fields, access, allowSelection),
  }));
const addSharedAccessToAll = (
  tree,
  level,
  sections,
  access,
  allowSelection,
  tname
) =>
  sections &&
  sections.map((es) => ({
    ...es,
    fields: addSharedAccessToFields(
      tree,
      level,
      es.fields,
      access,
      allowSelection,
      tname
    ),
  }));

const isAppSelected = (tree, appInfo) =>
  isAllAppFeatureSelected(tree, appInfo.name, appInfo.features);

const checkEntityAccess = (tree, access) =>
  !!(tree && tree.access && tree.access[access]);
const checkSharedEntityAccess = (tree, tname, shared) =>
  !!(tree && tree[tname] && tree[tname][shared]);

const checkEntityFlag = (tree, flag, skip) =>
  !!(skip && !tree.hasOwnProperty(flag)) || tree[flag];

const checkGlobalFeatureModification = (app, featureName) => {
  let module = app && app.modules.find((em) => em.name === featureName);
  if (module)
    return !!(module && module.flags && module.flags["allowModification"]);
  return false;
};

const isAllAppFeatureSelected = (tree, appName, features) =>
  !features ||
  (features &&
    features.every((ef) => isAppFeatureSelected(tree, appName, ef.name)));

const isAllEntitiesSelected = (tree, appName, modules) =>
  modules &&
  modules.every(
    (em) =>
      em.entities &&
      em.entities.every((ee) =>
        getEntityInfo(tree, appName, em.name, ee.groupName)
      )
  );

const isAllSectionFieldsSelected = (
  secArray,
  sections,
  access,
  allowSelection
) =>
  sections &&
  sections.every((es) =>
    isSectionFieldsSelected(secArray, es, access, allowSelection)
  );

const isAllGlobalFeatureSelected = (tree, features) =>
  !!features.every((ef) => isGlobalFeatureSelected(tree, ef.name));

const isEntityFeatureSelected = (tree, featureName) =>
  !!(tree.featureAccess && tree.featureAccess[featureName]);

const isGlobalFeatureSelected = (app, featureName) =>
  !!(app && app.modules.find((em) => em.name === featureName));

const isSectionFieldsSelected = (secArray, secInfo, access, allowSelection) =>
  secInfo &&
  secInfo.fields.every((ef) =>
    isFieldSelected(secArray, secInfo, ef, access, allowSelection)
  );

//Functional
const addAccessToFields = (entityTree, level, fields, access, allowSelection) =>
  fields.map((ef) => {
    let path = level === "TOP" ? "topSectionArray" : "componentArray";
    let accessObj = {};
    if (allowSelection) {
      Object.keys(access)
        .filter((ek) => Object.keys(ef.access).includes(ek))
        .map((ea) => {
          accessObj[ea] = access[ea];
        });
    } else accessObj = access;
    if (
      entityTree[path] &&
      entityTree[path][0] &&
      entityTree[path][0].fields.find((el) => el.name == ef.name)
    ) {
      let existField = entityTree[path][0].fields.find(
        (el) => el.name == ef.name
      );
      return Object.keys(accessObj).length
        ? { ...ef, ...existField, access: { ...accessObj } }
        : ef;
    } else {
      return Object.keys(accessObj).length
        ? { ...ef, access: { ...accessObj } }
        : ef;
    }
  });

const addSharedAccessToFields = (
  entityTree,
  level,
  fields,
  access,
  allowSelection,
  tname
) =>
  fields.map((ef) => {
    let path = level === "TOP" ? "topSectionArray" : "componentArray";
    let accessObj = {};
    if (allowSelection) {
      Object.keys(access)
        .filter((ek) => Object.keys(ef.access).includes(ek))
        .map((ea) => {
          accessObj[ea] = access[ea];
        });
    } else accessObj = access;

    if (
      entityTree[path] &&
      entityTree[path][0] &&
      entityTree[path][0].fields.find((el) => el.name == ef.name)
    ) {
      let existField = entityTree[path][0].fields.find(
        (el) => el.name == ef.name
      );
      return Object.keys(accessObj).length
        ? {
            ...ef,
            ...existField,
            shared: {
              ...entityTree[path][0].fields.find((el) => el.name == ef.name)
                .shared,
              [tname]: { ...accessObj },
            },
          }
        : ef;
    } else {
      return Object.keys(accessObj).length
        ? { ...ef, shared: { [tname]: { ...accessObj } } }
        : ef;
    }
  });

const checkFeatureModification = (tree, appName, featureName) => {
  let app = tree.apps.length && tree.apps.find((ea) => ea.name === appName);
  return !!(
    app &&
    app.features &&
    app.features.find((ef) => ef.name === featureName) &&
    app.features.find((ef) => ef.name === featureName).allowModification
  );
};

const checkForEntities = (tree, appName, moduleName) => {
  let app = tree.apps.length && tree.apps.find((ea) => ea.name === appName);
  if (app && app.modules) {
    let module = app.modules.find((em) => em.name === moduleName);
    return module && module.entities && module.entities.length;
  }
  return false;
};

const checkModuleFlag = (tree, appName, moduleName, flag) => {
  let app = tree.apps.length && tree.apps.find((ea) => ea.name === appName);
  if (app && app.modules) {
    let module = app.modules.find((em) => em.name === moduleName);
    return module && module.flags && module.flags[flag];
  }
  return false;
};

const generateAppTree = (appData, modules) => {
  let apps = appData.map((ad) => ({
    name: ad.sys_entityAttributes.sys_appName,
    friendlyName: ad.sys_entityAttributes.sys_friendlyName,
    modules: ad.sys_entityAttributes.modules.reduce((mods, em) => {
      let mInfo = modules.find((mi) => mi.name === em.sys_moduleName);
      if (mInfo)
        mods.push({
          name: em.sys_moduleName,
          isNotAccessible: em.isNotAccessible,
          friendlyName: em.sys_friendlyName,
          entities: mInfo ? mInfo.entities : [],
        });
      return mods;
    }, []),
  }));
  return apps;
};

const generateEntityTree = (template, features, featureAccess = null) => {
  let {
    sys_friendlyName,
    sys_templateName,
    sys_topLevel,
    sys_components,
    sys_entityType,
  } = template.sys_entityAttributes;
  let entityTree = {
    name: sys_templateName,
    friendlyName: sys_friendlyName,
    access: READ_WRITE_DELETE,
    featureAccess: featureAccess
      ? featureAccess
      : features.reduce((fo, ef) => {
          fo[ef.sys_entityAttributes.featureName] = true;
          return fo;
        }, {}),
    topSectionArray: generateTopSectionArray(sys_topLevel),
  };
  if (sys_components && sys_components.length)
    entityTree.componentArray = generateComponentTree(sys_components);
  if (sys_entityType == "Approval") entityTree.approval = true;

  return entityTree;
};

const generateComponentTree = (components) =>
  components[0].componentList.map((ec) => ({
    name: ec.name,
    title: ec.componentTitle,
    fields: ec.sys_entityAttributes
      .filter((ef) => !["SECTION", "SUBSECTION", "EMPTY"].includes(ef.type))
      .map((ef) => ({
        name: ef.name,
        title: ef.title || ef.label || ef.info,
      })),
  }));

const generateTopSectionArray = (topLevelArray) =>
  topLevelArray.reduce((tree, ef) => {
    let fieldObj = {
      name: ef.name,
      title: ef.title || ef.label || ef.info,
    };
    if (ef.type === "SECTION" && ef.marker === "start") {
      tree.push({ ...fieldObj, fields: [] });
    } else if (
      ef.type !== "SECTION" &&
      ef.type !== "SUBSECTION" &&
      ef.type !== "EMPTY" &&
      ef.type !== "DIVIDER" &&
      !ef.marker
    ) {
      tree[tree.length - 1].fields.push(fieldObj);
    }
    return tree;
  }, []);

const getEntityInfo = (tree, appName, moduleName, groupName) => {
  let app = tree.apps.length && tree.apps.find((ea) => ea.name === appName);
  if (app && app.modules && app.modules.length) {
    let module = app.modules.find((em) => em.name === moduleName);
    if (module && module.entities && module.entities.length) {
      return module.entities.find((ee) => ee.groupName === groupName);
    }
  }
  return false;
};

const isAppFeatureSelected = (tree, appName, featureName) => {
  let app = tree.apps.length && tree.apps.find((ea) => ea.name === appName);
  return !!(
    app &&
    app.features &&
    app.features.find((ef) => ef.name === featureName)
  );
};

const isFieldSelected = (
  secArray,
  secInfo,
  fieldInfo,
  access,
  allowSelection
) => {
  let sec = secArray.find((es) => es.name === secInfo.name);
  if (sec && sec.fields) {
    let field = sec.fields.find((ef) => ef.name === fieldInfo.name);

    if (!allowSelection)
      return !!(field && field.access && field.access[access]);
    else
      return !!(
        field &&
        field.access &&
        (!fieldInfo.access.hasOwnProperty(access) || field.access[access])
      );
  }
  return false;
};

const isFieldSharedSelected = (
  secArray,
  tname,
  sharedSecInfo,
  fieldInfo,
  access,
  allowSelection
) => {
  let sec = secArray.find((es) => es.name === sharedSecInfo.name);
  if (sec && sec.fields) {
    let field = sec.fields.find((ef) => ef.name === fieldInfo.name);
    if (!allowSelection)
      return !!(
        field &&
        field.shared &&
        field.shared[tname] &&
        field.shared[tname][access]
      );
    else
      return !!(
        field &&
        field.shared &&
        (!fieldInfo.access.hasOwnProperty(access) ||
          field.shared[tname][access])
      );
  }
  return false;
};
//HELPER SERVICES END

export {
  //API SERVICES
  getAll,
  getEntityData,
  getEntityTemplate,
  getAllFeatures,
  getRoleTemplate,
  //HELPER SERVICES
  addAccessToAll,
  addSharedAccessToAll,
  addAccessToFields,
  addSharedAccessToFields,
  checkEntityAccess,
  checkSharedEntityAccess,
  checkEntityFlag,
  checkFeatureModification,
  checkForEntities,
  checkModuleFlag,
  checkGlobalFeatureModification,
  generateAppTree,
  generateEntityTree,
  getEntityInfo,
  isAllAppFeatureSelected,
  isAllEntitiesSelected,
  isAllGlobalFeatureSelected,
  isAllSectionFieldsSelected,
  isAppSelected,
  isAppFeatureSelected,
  isEntityFeatureSelected,
  isFieldSelected,
  isFieldSharedSelected,
  isGlobalFeatureSelected,
  isSectionFieldsSelected,
};
