import { entity } from "utils/services/api_services/entity_service";
import { entityTemplate } from "utils/services/api_services/template_service";
import { getInventoryColumns } from "./helper";

export const getInventoryTableDetails = async (fieldmeta, params) => {
  let { inventory, lineItems } = fieldmeta || {};

  let inventoryTemplateParams = {
    appname: inventory.appname,
    modulename: inventory.modulename,
    groupname: inventory.entityname,
  };

  let inventoryDataParams = {
    appname: inventory.appname,
    modulename: inventory.modulename,
    entityname: inventory.entityname,
    limit: 1000,
    skip: 0,
  };

  let [inventoryTemplate, inventoryRowData] = await Promise.all([
    entityTemplate.get(inventoryTemplateParams),
    entity.get(inventoryDataParams),
  ]);

  //adding docid and sys_guid inside the sys_entityAttributes to access them in the lineitems
  inventoryRowData = inventoryRowData?.map((el) => {
    return {
      ...el,
      sys_entityAttributes: {
        ...el?.sys_entityAttributes,
        _id: el?._id,
        sys_gUid: el?.sys_gUid,
      },
    };
  });

  let inventoryColumnDefs = getInventoryColumns(inventoryTemplate, inventory);

  return {
    inventoryColumnDefs,
    inventoryRowData,
    inventoryTemplate,
  };
};
