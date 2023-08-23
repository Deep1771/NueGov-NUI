import { fieldmeta } from "components/system_components/text_area/__test__/utils_data";
import { getColumnsDefs } from "./index";
import { entity } from "utils/services/api_services/entity_service";
import { entityTemplate } from "utils/services/api_services/template_service";

export const getTableDetails = async (fieldmeta, formData) => {
  let { name, inventory, lineItems, originField, title } = fieldmeta || {};
  let { displayFields } = lineItems || [];

  let inventoryObject = formData["sys_entityAttributes"][name];
  let existingFormData = formData["sys_entityAttributes"][name];
  let existingLineitems = inventoryObject?.hasOwnProperty("lineItems")
    ? existingFormData["lineItems"]
    : [];

  //adding action column to lineItems;
  let actions = { type: "actions" };
  let tableDisplayFields = [actions, ...displayFields];

  let tableDataParams = {
    appname: lineItems.appname,
    modulename: lineItems.modulename,
    entityname: lineItems.entityname,
    limit: 1000,
    skip: 0,
    //adding the specific inventory type to fetch the data
    inventoryType: inventory?.title,
  };

  //adding origin field details
  let idPath = originField?.name
    ? `${originField?.name}.id`
    : "SYS_ENTITYATTRIBUTES.ID";
  tableDataParams[idPath] = formData ? formData["_id"] : "";

  let savedLineItems = await entity.get(tableDataParams);

  //preserving the form data on tab switch
  // savedLineItems = [...savedLineItems, ...existingLineitems];
  savedLineItems = [...savedLineItems];

  let columnDefs = getColumnsDefs(tableDisplayFields, fieldmeta);

  return {
    columnDefs,
    savedLineItems,
  };
};

export const getSavedTableItems = async (fieldmeta, formData) => {
  let { name, inventory, lineItems, originField, title } = fieldmeta || {};

  let tableDataParams = {
    appname: lineItems.appname,
    modulename: lineItems.modulename,
    entityname: lineItems.entityname,
    limit: 1000,
    skip: 0,
    //adding the specific inventory type to fetch the data
    inventoryType: inventory?.title,
  };

  //adding origin field details
  let idPath = originField?.name
    ? `${originField?.name}.id`
    : "SYS_ENTITYATTRIBUTES.ID";
  tableDataParams[idPath] = formData ? formData["_id"] : "";

  let savedLineItems = await entity.get(tableDataParams);
  return savedLineItems;
};

export const getTableHeaders = (fieldmeta) => {
  let { lineItems } = fieldmeta || {};
  let { displayFields } = lineItems || [];

  //adding action column to lineItems;
  let actions = { type: "actions" };

  let tableDisplayFields = [actions, ...displayFields];
  let columnDefs = getColumnsDefs(tableDisplayFields, fieldmeta);
  return columnDefs;
};
