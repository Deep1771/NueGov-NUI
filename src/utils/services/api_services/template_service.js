import resource from "../resource_config/resource";
import request from "../resource_config/config";

const isPublicUser = sessionStorage.getItem("public-user");

const publicPath = isPublicUser ? "/public-access" : "";

//create ,get ,query ,remove & update
export const entityTemplate = resource(
  `/api${publicPath}/metadata/:appname/:modulename`,
  request
); //takes either groupname or templatename as query params
export const presetTemplate = resource(`/api${publicPath}/metadata`, request);
export const agencyTemplate = resource(
  `/api${publicPath}/agencytemplates`,
  request
);
export const moduleMetadata = resource(
  `/api${publicPath}/modules/:mod`,
  request
);
