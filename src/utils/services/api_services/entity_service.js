import resource from "../resource_config/resource";
import request from "../resource_config/config";

import deleteRequest from "../resource_config/delete_config";

const isPublicUser = sessionStorage.getItem("public-user");

const publicPath = isPublicUser ? "/public-access" : "";

//create ,get ,query ,remove & update
export const childEntity = resource(
  `/api${publicPath}/childentities/:appname/:modulename/:entityname/:childentity/:id`,
  request
);
export const entity = resource(
  `/api${publicPath}/entities/:appname/:modulename/:entityname/:id`,
  request
);
export const entityTemplate = resource(
  `/api${publicPath}/downloadtemplate/:appname/:modulename/:entityname/:id`,
  request
);
export const entityCount = resource(
  `/api${publicPath}/entities-count/:appname/:modulename/:entityname`,
  request
);
export const runTimeService = resource(
  "/api/runtime-module/:appname/:modulename/:entityname",
  request
);
export const entityConvertion = resource(
  "/api/quickflow/:appname/:modulename/:entityname/:id",
  request
);
export const deleteEntity = resource(
  "/:appname/:modulename/:entityname/:id",
  deleteRequest
);
