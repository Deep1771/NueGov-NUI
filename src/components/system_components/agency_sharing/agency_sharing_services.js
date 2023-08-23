// API SERVICES

import { entity } from "utils/services/api_services/entity_service";

export const getEntityData = async (params) => {
  return await entity.get(params);
};

// HELPER SERVICES

// ENTITY LEVEL PERMISSION HELPERS
const checkAllEntityPermission = (permission, commonEntities, readWrite) =>
  commonEntities.every((eachApp) =>
    checkEntityHeader(permission, eachApp, readWrite)
  );

const checkEntityHeader = (permission, entityHeader, readWrite) =>
  entityHeader.entities.every((eachEntity) =>
    checkEntityPermission(permission, eachEntity.groupName, readWrite)
  );

const checkEntityPermission = (permission, entityGroupName, readWrite) => {
  let entityPresent =
    permission.length &&
    permission.find((eachEntity) => eachEntity.groupName === entityGroupName);
  return !!(entityPresent && entityPresent.access[readWrite] === true);
};

// TOP LEVEL PERMISSION HELPERS
const checkAllTopFields = (topSectionPermission, entitySelected, readWrite) =>
  entitySelected.every((eachObj) =>
    eachObj.topSectionArray.every((eachHeading) =>
      checkTopHeader(topSectionPermission, eachHeading, readWrite)
    )
  );

const checkTopHeader = (topSectionPermission, topHeading, readWrite) =>
  topHeading.fields.every((eachField) =>
    checkTopField(topSectionPermission, eachField, readWrite)
  );

const checkTopField = (topSectionPermission, topField, readWrite) => {
  let topFieldPresent =
    topSectionPermission.length &&
    topSectionPermission.find((eachField) => eachField.name === topField.name);
  return !!(topFieldPresent && topFieldPresent.access[readWrite] === true);
};

// COMPONENT LEVEL PERMISSION HELPERS
const checkAllComponentFields = (
  topSectionPermission,
  entitySelected,
  readWrite
) =>
  entitySelected.every((eachObj) =>
    eachObj.componentArray.every((eachHeading) =>
      checkComponentHeader(topSectionPermission, eachHeading, readWrite)
    )
  );

const checkComponentHeader = (
  componentSectionPermission,
  eachSection,
  readWrite
) =>
  eachSection.fields.every((eachField) =>
    checkComponentField(
      componentSectionPermission,
      eachSection,
      eachField,
      readWrite
    )
  );

const checkComponentField = (
  componentSectionPermission,
  eachSection,
  componentField,
  readWrite
) => {
  let componentSectionPresent =
    componentSectionPermission.length &&
    componentSectionPermission.find(
      (eachObject) => eachObject.name === eachSection.name
    );
  let componentFieldPresent =
    componentSectionPresent &&
    componentSectionPresent.fields.find(
      (eachField) => eachField.name === componentField.name
    );
  return !!(
    componentSectionPresent &&
    componentFieldPresent &&
    componentFieldPresent.access[readWrite] === true
  );
};

export {
  checkAllComponentFields,
  checkAllEntityPermission,
  checkAllTopFields,
  checkComponentField,
  checkComponentHeader,
  checkEntityHeader,
  checkEntityPermission,
  checkTopField,
  checkTopHeader,
};
