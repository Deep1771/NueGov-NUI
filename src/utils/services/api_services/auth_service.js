import resource from "../resource_config/resource";

import authrequest from "../resource_config/auth_config";
import request from "../resource_config/config";

const isPublicUser = sessionStorage.getItem("public-user");

const publicPath = isPublicUser ? "/public-access" : "";

//create ,get ,query ,remove & update
export const landing = resource("/home/landing", request);
export const signin = resource("/signin", authrequest);
export const signout = resource("/signout", authrequest);
export const user = resource(`${publicPath}/user`, authrequest);
export const loginas = resource("/masquerade/:id", authrequest);
export const publicAPI = resource("/public-access/:uniqueId", authrequest);

export const resetPwd = resource("/user/reset-password", request);
export const forgotPwd = resource("/user/forgot-password", request);
export const resetViaMail = resource("/reset-via-mail", request);
export const entity = resource(
  "/api/entities/:appname/:modulename/:entityname/",
  request
);
