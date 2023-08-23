import resource from "../resource_config/resource";
import request from "../resource_config/import_config";

export const CSV = resource("/:appname/:modulename/:entityname", request);
export const downloadTemplate = resource(
  "/downloadtemplate/:appname/:modulename/:entityname",
  request
);
export const rollback = resource(
  "/rollback/:appname/:modulename/:entityname",
  request
);
