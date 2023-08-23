import { entity } from "utils/services/api_services/entity_service";
import { entityTemplate } from "utils/services/api_services/template_service";

export const getEntityMetadata = async (params) => {
  try {
    return await entityTemplate.get(params);
  } catch (e) {
    throw e;
  }
};

export const getAllData = async (params) => {
  try {
    return await entity.query(params);
  } catch (e) {
    throw e;
  }
};

export const getUserCreds = (userInfo) => {
  try {
    let { userData } = userInfo;
    let roleIds = [];

    if (userData.sys_entityAttributes.roleName) {
      roleIds.push(userData.sys_entityAttributes.roleName.sys_gUid);
    }
    return { ids: roleIds.flat(), sys_gUid: userData.sys_gUid };
  } catch (e) {
    return { ids: [], sys_gUid: "" };
    // console.log('error', e)
  }
};
