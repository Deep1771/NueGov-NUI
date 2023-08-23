import { entityCount } from "utils/services/api_services/entity_service";
export const onCheckExist = (params) => {
  let { appname, modulename, entityname, uniqueCheck, name, value } = params;
  if (uniqueCheck.length) {
    return Promise.all(
      uniqueCheck.map(async (field) => {
        let params = {
          appname: appname,
          modulename: modulename,
          entityname: entityname,
          unique: name,
          [name]: value,
        };

        if (field.name == name && field.type == "STANDALONE") {
          return await entityCount.get(params);
        }
      })
    );
  }
};
