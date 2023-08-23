import resource from "../resource_config/resource";
import request from "../resource_config/livestream_config";

//create ,get ,query ,remove & update
export const livestream = resource(
  "/:appname/:modulename/:entityname/:id",
  request
); //takes either groupname or templatename as query params
