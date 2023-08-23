import { entityTemplate } from "utils/services/api_services/template_service";
import {
  entity,
  entityCount,
} from "utils/services/api_services/entity_service";

export const getData = (params) => {
  return entity.get(params);
};

export const getTemplate = (params) => {
  return entityTemplate.get(params);
};

export const getCount = (params) => {
  return entityCount.get(params);
};
