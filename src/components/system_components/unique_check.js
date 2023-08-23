import { entityCount } from "utils/services/api_services/entity_service";

export const checkAvailability = async (fieldmeta, stateParams, data) => {
  const { appname, modulename, groupname, metadata, entityname } = stateParams;
  const { name } = fieldmeta;
  const key = `uc_${name}`;
  const filterInfo = metadata.sys_entityAttributes.sys_filterFields.find(
    (ef) => ef.name == key
  );
  const params = {
    appname,
    modulename,
    entityname: groupname || entityname,
    skip: 0,
    limit: 2,
    [key]: data,
    u_c: "yes",
  };
  if (filterInfo) {
    if (filterInfo.system_filter) params.system_filter = "yes";
    let res = await entityCount.get(params);
    return res.data === 0;
  } else return true;
};
