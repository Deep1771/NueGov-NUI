import resource from "../resource_config/resource";
import request from "../resource_config/export_config";

export const csv = resource("/:appname/:modulename/:entityname", request);
