import { entityTemplate } from "utils/services/api_services/template_service";
import {
  entity,
  entityCount,
  childEntity,
} from "utils/services/api_services/entity_service";

export const getData = (params) => {
  return entity.get(params);
};

export const getTemplate = (params) => {
  return entityTemplate.get(params);
};
export const getChildData = (params) => {
  return childEntity.get(params);
};
export const getCount = (params) => {
  return entityCount.get(params);
};
