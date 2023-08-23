import resource from "../resource_config/resource";
import request from "../resource_config/cluster_config";

const isPublicUser = sessionStorage.getItem("public-user");

const publicPath = isPublicUser ? "/public-access" : "";

export const clusterer = resource(
  `${publicPath}/:appname/:modulename/:entityname`,
  request
);
