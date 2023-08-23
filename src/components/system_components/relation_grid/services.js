import { entityTemplate } from "utils/services/api_services/template_service";
import {
  entity,
  entityCount,
} from "utils/services/api_services/entity_service";

let getEntityData = async (params) => await entity.get(params);
let getEntityTemplate = async (params) => await entityTemplate.get(params);
let getEntityCount = async (params) => await entityCount.get(params);

export { getEntityData, getEntityTemplate, getEntityCount };
