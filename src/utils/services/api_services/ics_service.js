import resource from "../resource_config/resource";
import request from "../resource_config/config";

export const icsFile = resource(
  "/api/ics/:appname/:modulename/:entityname/:id",
  request
);
