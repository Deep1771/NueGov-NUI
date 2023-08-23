import resource from "../resource_config/resource";
import request from "../resource_config/config";

export const eventTracker = resource("/api/handleEventLogs", request);
