import resource from "../resource_config/resource";
import request from "../resource_config/config";

export const IOT = resource(
  "/api/iot/:appname/:modulename/:entityname/:id",
  request
);
