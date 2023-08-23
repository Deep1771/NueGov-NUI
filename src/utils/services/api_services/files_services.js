import resource from "../resource_config/resource";
import request from "../resource_config/config";

export const getAllFiles = resource(
  "/api/getFiles/:appname/:modulename/:entityname",
  request
);
export const checkFileAccess = resource(
  "/api/checkFileAccess/:fileId/:userId",
  request
);
