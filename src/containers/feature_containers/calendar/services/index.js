import { entity } from "utils/services/api_services/entity_service";
import { entityTemplate } from "utils/services/api_services/template_service";
import moment from "moment";

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

export const getEventTypeEntities = (userInfo) => {
  try {
    let { userData } = userInfo;
    let { appStructure } = userData;
    let entityList = appStructure
      .map((app, index) => {
        let app_entity = app.modules
          .map((module, mIndex) => {
            let entity = module.entities
              .map((entity, eIndex) => {
                if (entity.access.isCalendar && entity.access.write) {
                  let finalEntity = {
                    ...entity,
                    app: app.name,
                    module: module.name,
                  };
                  return finalEntity;
                } else return;
              })
              .filter((item) => item != undefined);
            if (entity.length) return entity;
            else return;
          })
          .filter((item) => item != undefined);
        if (app_entity.length) return app_entity;
        else return;
      })
      .filter((item) => item != undefined);
    return entityList.flat(Infinity);
  } catch (e) {
    return [];
  }
};

export const createEvent = async (params, data) => {
  return entity.create(params, data);
};

export const getAllData = async (params) => {
  try {
    return await entity.query(params);
  } catch (e) {
    throw e;
  }
};

export const getEventMetadata = async (params) => {
  try {
    return await entityTemplate.get(params);
  } catch (e) {
    throw e;
  }
};

export const dataParser = async (metadata, data) => {
  try {
    console.log(data);
    let response = await Promise.all(
      data.map(async (dataItem, index) => {
        let obj = {
          ...dataItem.sys_entityAttributes,
          ...dataItem.sys_auditHistory,
          ...{ uid: dataItem._id },
        };
        let keys = Object.keys(dataItem.sys_entityAttributes);
        keys.forEach((item) => {
          let itemIndex = metadata.sys_entityAttributes.sys_topLevel
            .map((attribute) => {
              return attribute.name;
            })
            .indexOf(item);
          try {
            switch (
              metadata.sys_entityAttributes.sys_topLevel[itemIndex].type
            ) {
              case "DATE":
                obj["start"] = new Date(dataItem.sys_entityAttributes[item]);
                break;
              case "DATERANGE": {
                obj["start"] = new Date(
                  dataItem.sys_entityAttributes[item].startDate
                );
                obj["end"] = new Date(
                  dataItem.sys_entityAttributes[item].endDate
                );
                break;
              }
            }
          } catch (e) {}
        });
        return obj;
      })
    );

    return response;
  } catch (e) {
    return [];
  }
};

export const dataTaskParser = async (metadata, data) => {
  try {
    let response = await Promise.all(
      data.map(async (dataItem, index) => {
        let obj = {
          ...dataItem.sys_entityAttributes,
          ...dataItem.sys_auditHistory,
          ...{ uid: dataItem._id },
          title: dataItem.sys_entityAttributes.name,
        };
        let keys = Object.keys(dataItem.sys_entityAttributes);
        keys.forEach((item) => {
          try {
            switch (item) {
              case "taskDateAndTime":
                obj["start"] = new Date(dataItem.sys_entityAttributes[item]);
                break;
              case "taskTime": {
                obj["start"] = new Date(
                  dataItem.sys_entityAttributes[item].startDate
                );
                obj["end"] = new Date(
                  dataItem.sys_entityAttributes[item].endDate
                );
                break;
              }
            }
          } catch (e) {}
        });

        return obj;
      })
    );

    return response;
  } catch (e) {
    return [];
  }
};

export const configKeys = {
  appname: "Features",
  modulename: "Calendar",
};
