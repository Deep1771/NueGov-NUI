import resource from "../resource_config/resource";
import request from "../resource_config/report_config";

const isPublicUser = sessionStorage.getItem("public-user");

const publicPath = isPublicUser ? "/public-access" : "/private";

export const reportGenerator = resource(
  `${publicPath}/:appname/:modulename/:entityname/:id`,
  request
);
