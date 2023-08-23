import resource from "../resource_config/resource";
import request from "../resource_config/bulkactions_config";

export const bulkActions = resource("/", request);
