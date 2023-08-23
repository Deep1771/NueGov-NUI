import resource from "../resource_config/resource";
import request from "../resource_config/config";

//create ,get ,query ,remove & update
export const aws = resource(
  "/api/uploadUrls/:appname/:modulename/:entityname/:id",
  request
);
export const awsDel = resource("/api/aws", request);
