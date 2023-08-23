import resource from "../resource_config/resource";
import request from "../resource_config/config";

export const selfService = resource("/api/custom/:id", request);
