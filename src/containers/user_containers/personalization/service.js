import { UserFactory } from "utils/services/factory_services";

export const getConstructedPresetObj = (app, mod, entity) => {
  const { getAppStructure } = UserFactory();
  let appInfo = getAppStructure.find((a) => a.name === app);
  let moduleInfo = appInfo.modules.find((a) => a.name === mod);
  let entityInfo = moduleInfo.entities.find((a) => a.groupName === entity);
  let { name, groupName, friendlyName } = entityInfo;
  return {
    appName: appInfo.name,
    moduleName: moduleInfo.name,
    ...{ name, groupName, friendlyName },
  };
};

export const getPresetRefObj = (presetVal, responseObj) => {
  let { id, sys_gUid } = responseObj;
  return {
    presetName: presetVal,
    id,
    sys_gUid,
  };
};

export const PRESET_QUERY = {
  appname: "NJAdmin",
  modulename: "NJ-Personalization",
  entityname: "Preset",
};

export const THEME_QUERY = {
  appname: "NJAdmin",
  modulename: "NJ-Personalization",
  entityname: "Theme",
  limit: 50,
  skip: 0,
};

export const USER_DEFAULT_QUERY = {
  appname: "NJAdmin",
  modulename: "NJ-Personalization",
  entityname: "UserDefault",
};
